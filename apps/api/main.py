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
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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


# ── Rate Limiting (basit in-memory) ────────────────────
_rate_limits: dict[str, list[float]] = {}
RATE_LIMIT_FREE = 10   # 10 istek/dakika
RATE_WINDOW = 60        # 60 saniye


def check_rate_limit(client_ip: str) -> bool:
    now = time.time()
    if client_ip not in _rate_limits:
        _rate_limits[client_ip] = []
    
    # Eski kayıtları temizle
    _rate_limits[client_ip] = [
        t for t in _rate_limits[client_ip] if now - t < RATE_WINDOW
    ]
    
    if len(_rate_limits[client_ip]) >= RATE_LIMIT_FREE:
        return False
    
    _rate_limits[client_ip].append(now)
    return True


# ── Solana adres doğrulama ──────────────────────────────
SOLANA_ADDRESS_RE = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$")


def validate_address(address: str) -> bool:
    return bool(SOLANA_ADDRESS_RE.match(address))


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
    if not check_rate_limit(client_ip):
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
        return result.model_dump()
    except Exception as e:
        logger.error(f"Analiz hatası ({address}): {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Token analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        )


@app.get("/api/v1/token/{address}/holders")
async def get_holders(address: str, request: Request):
    """Token holder dağılımı."""
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(client_ip):
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


# ── Hata yakalama ──────────────────────────────────────

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

