"""
ChainGuard — FastAPI Backend

Sprint 2 API Endpointleri:
  GET /api/v1/health                    → Sistem sağlık kontrolü
  GET /api/v1/token/{address}           → Token risk analizi (9 metrik)
  GET /api/v1/token/{address}/holders   → Holder dağılımı
  GET /api/v1/token/{address}/history   → Analiz geçmişi
  GET /api/v1/trending                  → En çok sorgulanan tokenlar
  GET /api/v1/trending/risky            → En riskli trend tokenlar
"""

import os
import sys
import re
import time
import asyncio
import secrets
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Header, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# .env yükle ve path ayarla
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "packages"))

from service import AnalysisService

# ── Logging ─────────────────────────────────────────────
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("chainguard.api")

# ── Servis Singleton ────────────────────────────────────
analysis_service: AnalysisService = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Uygulama yaşam döngüsü — başlat/kapat."""
    global analysis_service
    
    helius_key = os.getenv("HELIUS_API_KEY", "")
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    solscan_key = os.getenv("SOLSCAN_API_KEY", "")
    database_url = os.getenv("DATABASE_URL", "")
    
    analysis_service = AnalysisService(
        helius_api_key=helius_key,
        redis_url=redis_url,
        solscan_api_key=solscan_key,
        database_url=database_url,
    )
    await analysis_service.startup()
    logger.info("🛡️ ChainGuard API başlatıldı")
    
    yield
    
    await analysis_service.shutdown()
    logger.info("ChainGuard API kapatıldı")


# ── FastAPI Uygulaması ──────────────────────────────────
app = FastAPI(
    title="ChainGuard API",
    description="Solana Token Risk Analiz Platformu",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — deploy'da CORS_ORIGINS env ile ayarlanır
_default_origins = "http://localhost:3000,https://chainguard.app"
_cors_origins = os.getenv("CORS_ORIGINS", _default_origins).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Sentry (opsiyonel) ─────────────────────────────────
sentry_dsn = os.getenv("SENTRY_DSN", "")
if sentry_dsn:
    try:
        import sentry_sdk
        sentry_sdk.init(dsn=sentry_dsn, traces_sample_rate=0.1)
        logger.info("Sentry aktif")
    except ImportError:
        pass


# ── Rate Limiting ───────────────────────────────────────
_rate_limits: dict[str, list[float]] = {}
RATE_LIMIT_FREE = 10   # 10 istek/dakika
RATE_WINDOW = 60        # 60 saniye


async def check_rate_limit(client_ip: str) -> bool:
    """Redis varsa Redis sliding window, yoksa in-memory."""
    # Redis ile dene
    cache = analysis_service.cache if analysis_service else None
    if cache and cache._available and cache._redis:
        try:
            now = time.time()
            key = f"chainguard:rl:{client_ip}"
            window_start = now - RATE_WINDOW
            pipe = cache._redis.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zcard(key)
            pipe.zadd(key, {str(now): now})
            pipe.expire(key, int(RATE_WINDOW) + 5)
            results = await pipe.execute()
            count = results[1]
            return count < RATE_LIMIT_FREE
        except Exception:
            pass  # Redis hata — in-memory'ye düş

    # In-memory fallback
    now = time.time()
    if client_ip not in _rate_limits:
        _rate_limits[client_ip] = []
    _rate_limits[client_ip] = [t for t in _rate_limits[client_ip] if now - t < RATE_WINDOW]
    if len(_rate_limits[client_ip]) >= RATE_LIMIT_FREE:
        return False
    _rate_limits[client_ip].append(now)
    return True


# ── WebSocket Bağlantı Yöneticisi ───────────────────────

class ConnectionManager:
    """Token bazlı WebSocket abone yönetimi."""

    def __init__(self):
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, ws: WebSocket, token_address: str):
        await ws.accept()
        self._connections.setdefault(token_address, []).append(ws)
        logger.info(f"WS bağlandı: {token_address} (toplam: {len(self._connections[token_address])})")

    def disconnect(self, ws: WebSocket, token_address: str):
        conns = self._connections.get(token_address, [])
        if ws in conns:
            conns.remove(ws)
        if not conns:
            self._connections.pop(token_address, None)

    async def broadcast(self, token_address: str, data: dict):
        """Token adresine abone olan tüm WS istemcilerine mesaj gönder."""
        conns = self._connections.get(token_address, [])
        if not conns:
            return
        dead = []
        for ws in conns:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, token_address)

    def subscriber_count(self, token_address: str) -> int:
        return len(self._connections.get(token_address, []))


ws_manager = ConnectionManager()


# ── Adres doğrulama (Solana + EVM) ─────────────────────
SOLANA_ADDRESS_RE = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$")
EVM_ADDRESS_RE = re.compile(r"^0x[0-9a-fA-F]{40}$")


def validate_address(address: str) -> bool:
    """Solana (base58) veya EVM (0x...) adresini doğrular."""
    return bool(SOLANA_ADDRESS_RE.match(address)) or bool(EVM_ADDRESS_RE.match(address))


# ═══════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════

@app.get("/api/v1/health")
async def health():
    """Sistem sağlık kontrolü."""
    redis_ok = await analysis_service.cache.health_check()
    db_ok = analysis_service.db.enabled
    return {
        "status": "ok",
        "version": "2.0.0",
        "scoring": "v2",
        "metrics_count": 9,
        "services": {
            "api": True,
            "redis": redis_ok,
            "postgresql": db_ok,
        },
    }


@app.get("/api/v1/token/{address}")
async def analyze_token(address: str, request: Request):
    """
    Token risk analizi.
    
    Dönen veri:
      - token: Token bilgileri
      - score: Toplam risk skoru ve seviye
      - metrics: VLR, RLS, Holder detayları
      - warnings_tr: Türkçe uyarı listesi
    """
    # Rate limit kontrolü
    client_ip = request.client.host if request.client else "unknown"
    if not await check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Çok fazla istek. Lütfen 1 dakika bekleyin. (Free: 10 istek/dk)",
        )

    # Adres doğrulama
    if not validate_address(address):
        raise HTTPException(
            status_code=400,
            detail="Geçersiz Solana token adresi.",
        )

    try:
        result = await analysis_service.analyze_token(address)
        data = result.model_dump()

        # WebSocket abonelerine yayınla
        if ws_manager.subscriber_count(address) > 0:
            score = data.get("score", {})
            token = data.get("token", {})
            await ws_manager.broadcast(address, {
                "type": "score_update",
                "token_address": address,
                "score": score.get("total", 0),
                "label_tr": score.get("label_tr", ""),
                "name": token.get("name", ""),
                "symbol": token.get("symbol", ""),
            })

        return data
    except Exception as e:
        logger.error(f"Analiz hatası ({address}): {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Token analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        )


@app.get("/api/v1/token/{address}/clusters")
async def get_clusters(address: str, request: Request):
    """
    Token küme verisi — cüzdan listeleriyle birlikte.
    Önce analiz yapılmış olmalı (cache'de veri yoksa 404 döner).
    """
    if not validate_address(address):
        raise HTTPException(status_code=400, detail="Geçersiz Solana token adresi.")

    clusters = await analysis_service.get_clusters(address)
    if clusters is None:
        raise HTTPException(
            status_code=404,
            detail="Küme verisi bulunamadı. Önce token analizi yapın.",
        )

    return {
        "token_address": address,
        "cluster_count": len(clusters),
        "total_wallets": sum(c.get("wallet_count", 0) for c in clusters),
        "clusters": [
            {
                "cluster_id": c.get("cluster_id"),
                "wallet_count": c.get("wallet_count", 0),
                "pct_supply": round(c.get("pct_supply", 0), 4),
                "root_wallet": c.get("root_wallet", ""),
                "avg_wallet_age_hrs": round(c.get("avg_wallet_age_hrs", 0), 1),
                "behavioral_similarity": round(c.get("behavioral_similarity", 0), 3),
                "funding_source_count": c.get("funding_source_count", 0),
                "wallets": c.get("wallets", [])[:20],  # ilk 20 cüzdan
            }
            for c in clusters
        ],
    }


@app.get("/api/v1/token/{address}/holders")
async def get_holders(address: str, request: Request):
    """Token holder dağılımı."""
    client_ip = request.client.host if request.client else "unknown"
    if not await check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit aşıldı.")

    if not validate_address(address):
        raise HTTPException(status_code=400, detail="Geçersiz Solana token adresi.")

    holders = await analysis_service.get_holders(address)
    if holders is None:
        raise HTTPException(status_code=404, detail="Token bulunamadı veya holder verisi çekilemedi.")
    
    return {
        "token_address": address,
        "holder_count": len(holders),
        "holders": holders,
    }


@app.get("/api/v1/trending/risky")
async def trending_risky():
    """En riskli trend tokenlar (Top 20)."""
    # Önce DB'den dene
    db_trending = await analysis_service.db.get_trending(limit=20)
    if db_trending:
        return {"tokens": db_trending, "source": "database"}

    # Fallback: Redis cache
    cached = await analysis_service.cache.get_trending()
    if cached:
        return {"tokens": cached, "source": "cache"}
    
    return {
        "tokens": [],
        "message": "Henüz yeterli veri toplanmadı. Token analiz ettikçe trend listesi oluşacak.",
    }


@app.get("/api/v1/trending")
async def trending():
    """En çok sorgulanan tokenlar (Top 20)."""
    db_trending = await analysis_service.db.get_trending(limit=20)
    if db_trending:
        return {"tokens": db_trending, "source": "database"}
    return {"tokens": [], "message": "Henüz veri yok."}


@app.get("/api/v1/token/{address}/history")
async def token_history(address: str, request: Request):
    """Token analiz geçmişi (son 10 analiz)."""
    if not validate_address(address):
        raise HTTPException(status_code=400, detail="Geçersiz Solana token adresi.")

    history = await analysis_service.db.get_analysis_history(address, limit=10)
    return {
        "token_address": address,
        "history_count": len(history),
        "history": history,
    }


# ── Affiliate Linkleri ─────────────────────────────────
AFFILIATE_LINKS = {
    "binance": "https://www.binance.com/tr/register?ref=CHAINGUARD",
    "okx": "https://www.okx.com/join/CHAINGUARD",
    "bybit": "https://www.bybit.com/register?affiliate_id=CHAINGUARD",
    "gate": "https://www.gate.io/signup?ref=CHAINGUARD",
}


@app.get("/api/v1/affiliate/click")
async def affiliate_click(exchange: str, request: Request, token_address: str = "", source: str = "web"):
    """Affiliate tıklama kaydı ve yönlendirme."""
    exchange_lower = exchange.lower()
    if exchange_lower not in AFFILIATE_LINKS:
        raise HTTPException(status_code=400, detail="Geçersiz borsa.")

    # DB'ye kaydet (hata olsa bile link döner)
    try:
        await analysis_service.db.log_affiliate_click(
            exchange=exchange_lower,
            token_address=token_address,
            click_source=source,
            ip_address=request.client.host if request.client else "",
            user_agent=request.headers.get("user-agent", ""),
        )
    except Exception as e:
        logger.error(f"Affiliate log hatası: {e}")

    return {
        "exchange": exchange_lower,
        "url": AFFILIATE_LINKS[exchange_lower],
        "tracked": True,
    }


@app.get("/api/v1/affiliate/links")
async def affiliate_links():
    """Mevcut affiliate linkleri."""
    return {"links": AFFILIATE_LINKS}


# ── Referral Sistemi ───────────────────────────────────

WEB_URL = os.getenv("WEB_URL", "https://chainguard-beryl.vercel.app")
BOT_USERNAME = os.getenv("BOT_USERNAME", "chainguardbot")


@app.get("/api/v1/referral/{telegram_id}")
async def get_referral(telegram_id: int):
    """Kullanıcının referral kodunu ve istatistiklerini döner. Kod yoksa oluşturur."""
    ref_code = await analysis_service.db.get_or_create_ref_code(telegram_id)
    if not ref_code:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı. Önce botta /start yazın.")

    stats = await analysis_service.db.get_referral_stats(telegram_id)
    return {
        "ref_code": ref_code,
        "web_link": f"{WEB_URL}/?ref={ref_code}",
        "bot_link": f"https://t.me/{BOT_USERNAME}?start={ref_code}",
        "total_referrals": stats.get("total_referrals", 0) if stats else 0,
        "bonus_until": stats.get("bonus_until") if stats else None,
        "bonus_active": analysis_service.db.is_bonus_active(stats.get("bonus_until") if stats else None),
        "reward": {
            "referrer": "7 gün artırılmış sorgu limiti",
            "referred": "3 gün artırılmış sorgu limiti",
        },
    }


class UseReferralRequest(BaseModel):
    ref_code: str
    telegram_id: int


@app.post("/api/v1/referral/use")
async def use_referral(body: UseReferralRequest):
    """Referral kodu kullan."""
    result = await analysis_service.db.use_referral_code(
        ref_code=body.ref_code.strip().upper(),
        new_telegram_id=body.telegram_id,
    )
    if not result["ok"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"success": True, "bonus_days": 3}


# ── API Key Yönetimi ───────────────────────────────────

class CreateKeyRequest(BaseModel):
    telegram_id: int
    name: str = "API Key"


def _generate_api_key() -> str:
    return f"cg_live_{secrets.token_hex(24)}"


def _mask_key(key: str) -> str:
    """İlk 12 ve son 4 karakteri göster, ortayı maskele."""
    if len(key) <= 16:
        return key
    return f"{key[:12]}...{key[-4:]}"


@app.post("/api/v1/keys")
async def create_api_key(body: CreateKeyRequest):
    """Yeni API anahtarı oluştur. Anahtar sadece bir kez tam gösterilir."""
    if not body.telegram_id:
        raise HTTPException(status_code=400, detail="telegram_id gerekli.")
    if not body.name or len(body.name) > 50:
        raise HTTPException(status_code=400, detail="İsim 1-50 karakter olmalı.")

    # Mevcut anahtar sayısını kontrol et (maks 5)
    existing = await analysis_service.db.list_api_keys(body.telegram_id)
    if len(existing) >= 5:
        raise HTTPException(status_code=400, detail="Maksimum 5 API anahtarı oluşturabilirsiniz.")

    key = _generate_api_key()
    success = await analysis_service.db.create_api_key(
        telegram_id=body.telegram_id,
        name=body.name,
        key_id=key,
    )
    if not success:
        raise HTTPException(status_code=500, detail="Anahtar oluşturulamadı.")

    return {
        "key": key,  # TAM anahtar — sadece bir kez gösterilir
        "name": body.name,
        "tier": "free",
        "daily_limit": 100,
        "warning": "Bu anahtarı güvenli bir yerde saklayın. Tekrar gösterilmeyecek.",
    }


@app.get("/api/v1/keys")
async def list_api_keys(telegram_id: int):
    """Kullanıcının API anahtarlarını listele (maskeli)."""
    if not telegram_id:
        raise HTTPException(status_code=400, detail="telegram_id gerekli.")

    keys = await analysis_service.db.list_api_keys(telegram_id)
    return {
        "keys": [
            {
                **{k: v for k, v in key.items() if k != "key_id"},
                "key_id": _mask_key(key["key_id"]),
                "key_prefix": key["key_id"][:16],  # ilk 16 karakter — tanımlama için
                "last_used_at": key["last_used_at"].isoformat() if key.get("last_used_at") else None,
                "created_at": key["created_at"].isoformat() if key.get("created_at") else None,
            }
            for key in keys
        ],
        "count": len(keys),
        "max": 5,
    }


@app.delete("/api/v1/keys/{key_prefix}")
async def delete_api_key(key_prefix: str, telegram_id: int):
    """API anahtarını sil. key_prefix = ilk 16 karakter."""
    if not telegram_id:
        raise HTTPException(status_code=400, detail="telegram_id gerekli.")

    # Prefix ile gerçek key_id'yi bul
    keys = await analysis_service.db.list_api_keys(telegram_id)
    target = next((k for k in keys if k["key_id"].startswith(key_prefix)), None)
    if not target:
        raise HTTPException(status_code=404, detail="Anahtar bulunamadı.")

    success = await analysis_service.db.delete_api_key(target["key_id"], telegram_id)
    if not success:
        raise HTTPException(status_code=500, detail="Anahtar silinemedi.")

    return {"deleted": True, "name": target["name"]}


@app.get("/api/v1/keys/validate")
async def validate_api_key(x_cg_api_key: str = Header(None, alias="X-CG-API-Key")):
    """API anahtarını doğrula (harici servisler için)."""
    if not x_cg_api_key:
        raise HTTPException(status_code=401, detail="X-CG-API-Key header gerekli.")

    info = await analysis_service.db.validate_api_key(x_cg_api_key)
    if not info:
        raise HTTPException(status_code=401, detail="Geçersiz veya limitini doldurmuş API anahtarı.")

    return {"valid": True, **info}


@app.websocket("/ws/v1/alerts")
async def ws_alerts(websocket: WebSocket, token: str = ""):
    """
    Gerçek zamanlı token skor uyarı kanalı.

    Bağlanmak için:
      ws://<host>/ws/v1/alerts?token=<token_address>

    Mesaj formatı:
      { "type": "score_update", "token_address": "...", "score": 72, "label_tr": "Yüksek Risk", ... }
      { "type": "ping" }  — 30s'de bir keepalive
    """
    if not token or not validate_address(token):
        await websocket.close(code=1008, reason="Geçersiz token adresi.")
        return

    await ws_manager.connect(websocket, token)
    try:
        while True:
            # Keepalive: client mesaj gönderirse devam et, yoksa ping-pong ile canlı tut
            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=30)
                if msg == "ping":
                    await websocket.send_json({"type": "pong"})
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "ping"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, token)
        logger.info(f"WS ayrıldı: {token}")
    except Exception as e:
        ws_manager.disconnect(websocket, token)
        logger.warning(f"WS hata ({token}): {e}")


@app.exception_handler(404)
async def not_found(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={"detail": "İstenen kaynak bulunamadı."},
    )


@app.exception_handler(500)
async def server_error(request: Request, exc: Exception):
    logger.error(f"Sunucu hatası: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Sunucu hatası oluştu. Lütfen tekrar deneyin."},
    )


# ── Direct run (Railway için) ──────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port)

