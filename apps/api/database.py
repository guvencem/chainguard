"""
ChainGuard — PostgreSQL Veritabanı Katmanı

Sprint 2 — Analiz geçmişi, trending tokenlar, API logları.
asyncpg ile async bağlantı havuzu kullanır.
"""

import logging
import os
import json
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

# asyncpg opsiyonel — yoksa DB devre dışı
try:
    import asyncpg
    HAS_ASYNCPG = True
except ImportError:
    HAS_ASYNCPG = False
    logger.warning("asyncpg bulunamadı — veritabanı devre dışı")


class Database:
    """PostgreSQL bağlantı havuzu ve sorgu yöneticisi."""

    def __init__(self, database_url: str = ""):
        self.database_url = database_url or os.getenv("DATABASE_URL", "")
        self.pool: Optional[asyncpg.Pool] = None
        self.enabled = bool(self.database_url) and HAS_ASYNCPG

    async def connect(self):
        """Bağlantı havuzunu oluşturur."""
        if not self.enabled:
            logger.info("PostgreSQL devre dışı (DATABASE_URL yok veya asyncpg yüklü değil)")
            return

        try:
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=2,
                max_size=10,
                command_timeout=30,
            )
            logger.info("PostgreSQL bağlantı havuzu oluşturuldu")

            # Tabloları oluştur (init.sql yoksa inline)
            await self._ensure_tables()
        except Exception as e:
            logger.error(f"PostgreSQL bağlantı hatası: {e}")
            self.enabled = False

    async def disconnect(self):
        """Bağlantı havuzunu kapatır."""
        if self.pool:
            await self.pool.close()
            logger.info("PostgreSQL bağlantı havuzu kapatıldı")

    async def _ensure_tables(self):
        """Temel tabloları oluşturur (varsa atlar)."""
        if not self.pool:
            return

        try:
            # init.sql dosyasını bul ve çalıştır
            init_sql_path = os.path.join(
                os.path.dirname(__file__), "..", "..", "db", "init.sql"
            )
            if os.path.exists(init_sql_path):
                with open(init_sql_path, "r", encoding="utf-8") as f:
                    sql = f.read()
                async with self.pool.acquire() as conn:
                    await conn.execute(sql)
                logger.info("Veritabanı tabloları oluşturuldu (init.sql)")
            else:
                logger.warning("init.sql bulunamadı — tablolar manuel oluşturulmalı")
        except Exception as e:
            logger.error(f"Tablo oluşturma hatası: {e}")

    # ─── Token CRUD ────────────────────────────────────────

    async def upsert_token(self, token_data: dict) -> Optional[str]:
        """Token metadata'yı kaydet veya güncelle."""
        if not self.pool:
            return None

        try:
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO tokens (address, name, symbol, supply, decimals, creator_wallet, platform, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT (address) DO UPDATE SET
                        name = EXCLUDED.name,
                        symbol = EXCLUDED.symbol,
                        supply = EXCLUDED.supply,
                        creator_wallet = EXCLUDED.creator_wallet,
                        platform = EXCLUDED.platform,
                        updated_at = NOW()
                """,
                    token_data.get("address", ""),
                    token_data.get("name"),
                    token_data.get("symbol"),
                    token_data.get("supply", 0),
                    token_data.get("decimals", 0),
                    token_data.get("creator_wallet"),
                    token_data.get("platform", "unknown"),
                    token_data.get("created_at"),
                )
            return token_data.get("address")
        except Exception as e:
            logger.error(f"Token kaydetme hatası: {e}")
            return None

    # ─── Analiz Kayıt ──────────────────────────────────────

    async def save_analysis(self, analysis_dict: dict) -> Optional[str]:
        """Analiz sonucunu veritabanına kaydeder."""
        if not self.pool:
            return None

        try:
            token = analysis_dict.get("token", {})
            score = analysis_dict.get("score", {})
            metrics = analysis_dict.get("metrics", {})
            warnings = analysis_dict.get("warnings_tr", [])

            # Önce token'ı kaydet
            await self.upsert_token(token)

            vlr = metrics.get("vlr", {})
            rls = metrics.get("rls", {})
            holders = metrics.get("holders", {})
            cluster = metrics.get("cluster", {})
            wash = metrics.get("wash", {})
            sybil = metrics.get("sybil", {})
            bundler = metrics.get("bundler", {})
            exit_m = metrics.get("exit", {})
            curve = metrics.get("curve", {})

            async with self.pool.acquire() as conn:
                row = await conn.fetchrow("""
                    INSERT INTO analyses (
                        token_address, total_score, risk_level, scoring_version,
                        vlr_value, vlr_score, rls_value, rls_score,
                        holder_count, holder_score, top10_pct,
                        cluster_score, wash_score, sybil_score,
                        bundler_score, exit_score, curve_score,
                        price_usd, volume_24h_usd, liquidity_usd, mcap_usd,
                        dex_source, warnings
                    ) VALUES (
                        $1, $2, $3, $4,
                        $5, $6, $7, $8,
                        $9, $10, $11,
                        $12, $13, $14,
                        $15, $16, $17,
                        $18, $19, $20, $21,
                        $22, $23
                    ) RETURNING id
                """,
                    token.get("address", ""),
                    score.get("total", 0),
                    score.get("level", "SAFE"),
                    "v2",
                    vlr.get("value", 0),
                    vlr.get("score", 0),
                    rls.get("value", 0),
                    rls.get("score", 0),
                    holders.get("count", 0),
                    holders.get("score", 0),
                    holders.get("top10_concentration", 0),
                    cluster.get("score", 0),
                    wash.get("score", 0),
                    sybil.get("score", 0),
                    bundler.get("score", 0),
                    exit_m.get("score", 0),
                    curve.get("score", 0),
                    vlr.get("liquidity", 0) and rls.get("mcap", 0) and 0,  # price from market
                    vlr.get("volume_24h", 0),
                    vlr.get("liquidity", 0),
                    rls.get("mcap", 0),
                    None,
                    json.dumps(warnings, ensure_ascii=False),
                )

                analysis_id = str(row["id"]) if row else None

            # Trending güncelle
            await self._update_trending(analysis_dict)

            logger.info(f"Analiz kaydedildi: {token.get('address')} → {analysis_id}")
            return analysis_id

        except Exception as e:
            logger.error(f"Analiz kaydetme hatası: {e}")
            return None

    # ─── Trending ──────────────────────────────────────────

    async def _update_trending(self, analysis_dict: dict):
        """Trending tablosunu günceller."""
        if not self.pool:
            return

        try:
            token = analysis_dict.get("token", {})
            score = analysis_dict.get("score", {})
            metrics = analysis_dict.get("metrics", {})
            vlr = metrics.get("vlr", {})
            rls = metrics.get("rls", {})

            async with self.pool.acquire() as conn:
                await conn.execute("""
                    SELECT upsert_trending($1, $2, $3, $4, $5, $6, $7)
                """,
                    token.get("address", ""),
                    token.get("name"),
                    token.get("symbol"),
                    score.get("total", 0),
                    score.get("level", "SAFE"),
                    vlr.get("volume_24h", 0),
                    rls.get("mcap", 0),
                )
        except Exception as e:
            logger.error(f"Trending güncelleme hatası: {e}")

    # ─── Geçmiş Sorgulama ──────────────────────────────────

    async def get_analysis_history(
        self, token_address: str, limit: int = 10
    ) -> list[dict]:
        """Token'ın analiz geçmişini döner."""
        if not self.pool:
            return []

        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT total_score, risk_level, scoring_version,
                           vlr_score, rls_score, holder_count, holder_score,
                           cluster_score, wash_score, sybil_score,
                           bundler_score, exit_score, curve_score,
                           volume_24h_usd, liquidity_usd, mcap_usd,
                           analyzed_at
                    FROM analyses
                    WHERE token_address = $1 AND is_deleted = FALSE
                    ORDER BY analyzed_at DESC
                    LIMIT $2
                """, token_address, limit)

            return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"Geçmiş sorgulama hatası: {e}")
            return []

    async def get_trending(self, limit: int = 20) -> list[dict]:
        """En çok sorgulanan tokenları döner."""
        if not self.pool:
            return []

        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT token_address, name, symbol, total_score, risk_level,
                           volume_24h_usd, mcap_usd, query_count, last_queried_at
                    FROM trending_tokens
                    ORDER BY query_count DESC
                    LIMIT $1
                """, limit)

            return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"Trending sorgulama hatası: {e}")
            return []

    # ─── Creator Profiling (Sprint 4) ──────────────────────

    async def get_creator_history(self, creator_wallet: str) -> list[dict]:
        """
        Bir creator wallet'ın geçmiş token analizlerini döner.
        tokens tablosu + analyses tablosunu join eder.
        """
        if not self.pool or not creator_wallet:
            return []
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT
                        t.address,
                        t.name,
                        t.symbol,
                        a.total_score,
                        a.risk_level,
                        a.analyzed_at
                    FROM tokens t
                    JOIN analyses a ON a.token_address = t.address
                    WHERE t.creator_wallet = $1
                    ORDER BY a.analyzed_at DESC
                    LIMIT 50
                """, creator_wallet)
            return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"Creator history hatası: {e}")
            return []

    # ─── API Log ───────────────────────────────────────────

    async def log_request(
        self,
        endpoint: str,
        token_address: str = None,
        ip_address: str = None,
        user_agent: str = None,
        response_ms: int = 0,
        status_code: int = 200,
    ):
        """API isteğini loglar."""
        if not self.pool:
            return

        try:
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO api_logs (endpoint, token_address, ip_address, user_agent, response_ms, status_code)
                    VALUES ($1, $2, $3, $4, $5, $6)
                """, endpoint, token_address, ip_address, user_agent, response_ms, status_code)
        except Exception as e:
            # Log hatası sessizce geçilir — ana akışı bozmamalı
            pass

    # ─── Referral Sistemi ──────────────────────────────────

    async def get_or_create_ref_code(self, telegram_id: int) -> Optional[str]:
        """Kullanıcının referral kodunu döner, yoksa oluşturur."""
        if not self.pool:
            return None
        import secrets, string
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT ref_code FROM users WHERE telegram_id = $1", telegram_id
                )
                if not row:
                    return None
                if row["ref_code"]:
                    return row["ref_code"]
                # Oluştur
                alphabet = string.ascii_uppercase + string.digits
                for _ in range(10):
                    code = "CG" + "".join(secrets.choice(alphabet) for _ in range(6))
                    existing = await conn.fetchrow("SELECT 1 FROM users WHERE ref_code = $1", code)
                    if not existing:
                        await conn.execute(
                            "UPDATE users SET ref_code = $1 WHERE telegram_id = $2",
                            code, telegram_id
                        )
                        return code
            return None
        except Exception as e:
            logger.error(f"Ref code oluşturma hatası: {e}")
            return None

    async def use_referral_code(self, ref_code: str, new_telegram_id: int) -> dict:
        """
        Referral kodu kullan.
        Döner: {'ok': bool, 'referrer_telegram_id': int | None, 'error': str}
        """
        if not self.pool:
            return {"ok": False, "error": "DB bağlantısı yok"}
        try:
            async with self.pool.acquire() as conn:
                # Kodu sahibini bul
                referrer = await conn.fetchrow(
                    "SELECT id, telegram_id FROM users WHERE ref_code = $1", ref_code
                )
                if not referrer:
                    return {"ok": False, "error": "Geçersiz referral kodu"}

                # Yeni kullanıcı zaten referred mı?
                new_user = await conn.fetchrow(
                    "SELECT id, referred_by FROM users WHERE telegram_id = $1", new_telegram_id
                )
                if not new_user:
                    return {"ok": False, "error": "Kullanıcı bulunamadı"}
                if new_user["referred_by"]:
                    return {"ok": False, "error": "Zaten bir referral kodu kullanmış"}
                if referrer["telegram_id"] == new_telegram_id:
                    return {"ok": False, "error": "Kendi referral kodunu kullanamazsın"}

                from datetime import date, timedelta
                today = date.today()
                bonus_7 = today + timedelta(days=7)
                bonus_3 = today + timedelta(days=3)

                # Referral kaydı oluştur
                await conn.execute("""
                    INSERT INTO referrals (referrer_id, referred_id, ref_code, converted, reward_given)
                    VALUES ($1, $2, $3, TRUE, TRUE)
                """, referrer["id"], new_user["id"], ref_code)

                # Referrer'a 7 gün bonus + referral sayısını artır
                await conn.execute("""
                    UPDATE users
                    SET bonus_until = GREATEST(COALESCE(bonus_until, $1), $1),
                        total_referrals = total_referrals + 1
                    WHERE id = $2
                """, bonus_7, referrer["id"])

                # Yeni kullanıcıya 3 gün bonus + referred_by kaydet
                await conn.execute("""
                    UPDATE users
                    SET bonus_until = $1, referred_by = $2
                    WHERE id = $3
                """, bonus_3, ref_code, new_user["id"])

            logger.info(f"Referral kullanıldı: {ref_code} → {new_telegram_id}")
            return {"ok": True, "referrer_telegram_id": referrer["telegram_id"]}
        except Exception as e:
            logger.error(f"Referral kullanma hatası: {e}")
            return {"ok": False, "error": str(e)}

    async def get_referral_stats(self, telegram_id: int) -> Optional[dict]:
        """Kullanıcının referral istatistiklerini döner."""
        if not self.pool:
            return None
        try:
            async with self.pool.acquire() as conn:
                user = await conn.fetchrow("""
                    SELECT ref_code, total_referrals, bonus_until, tier
                    FROM users WHERE telegram_id = $1
                """, telegram_id)
                if not user:
                    return None

                # Kaç kişiyi davet etti
                count = await conn.fetchval(
                    "SELECT COUNT(*) FROM referrals WHERE referrer_id = (SELECT id FROM users WHERE telegram_id = $1)",
                    telegram_id
                )
                return {
                    "ref_code": user["ref_code"],
                    "total_referrals": int(count or 0),
                    "bonus_until": user["bonus_until"].isoformat() if user["bonus_until"] else None,
                    "tier": user["tier"],
                }
        except Exception as e:
            logger.error(f"Referral stats hatası: {e}")
            return None

    def is_bonus_active(self, bonus_until_str: Optional[str]) -> bool:
        """bonus_until tarihi bugünden sonra mı?"""
        if not bonus_until_str:
            return False
        from datetime import date
        try:
            bonus_until = date.fromisoformat(bonus_until_str)
            return bonus_until >= date.today()
        except Exception:
            return False

    # ─── API Key Yönetimi ──────────────────────────────────

    async def create_api_key(self, telegram_id: int, name: str, key_id: str, tier: str = "free") -> bool:
        """Yeni API anahtarı oluşturur."""
        if not self.pool:
            return False
        daily_limit = {"free": 100, "pro": 1000, "trader": 10000}.get(tier, 100)
        try:
            async with self.pool.acquire() as conn:
                # Kullanıcı id'sini al
                user_row = await conn.fetchrow("SELECT id, tier FROM users WHERE telegram_id = $1", telegram_id)
                user_id = user_row["id"] if user_row else None
                user_tier = user_row["tier"] if user_row else tier

                await conn.execute("""
                    INSERT INTO api_keys (key_id, user_id, telegram_id, name, tier, daily_limit)
                    VALUES ($1, $2, $3, $4, $5, $6)
                """, key_id, user_id, telegram_id, name, user_tier, daily_limit)
            return True
        except Exception as e:
            logger.error(f"API key oluşturma hatası: {e}")
            return False

    async def list_api_keys(self, telegram_id: int) -> list[dict]:
        """Kullanıcının API anahtarlarını listeler (masked)."""
        if not self.pool:
            return []
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT key_id, name, tier, daily_limit, daily_used,
                           last_used_at, is_active, created_at
                    FROM api_keys
                    WHERE telegram_id = $1
                    ORDER BY created_at DESC
                """, telegram_id)
            return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"API key listeleme hatası: {e}")
            return []

    async def delete_api_key(self, key_id: str, telegram_id: int) -> bool:
        """API anahtarını siler (sahiplik kontrolü ile)."""
        if not self.pool:
            return False
        try:
            async with self.pool.acquire() as conn:
                result = await conn.execute(
                    "DELETE FROM api_keys WHERE key_id = $1 AND telegram_id = $2",
                    key_id, telegram_id
                )
            return result == "DELETE 1"
        except Exception as e:
            logger.error(f"API key silme hatası: {e}")
            return False

    async def validate_api_key(self, key_id: str) -> Optional[dict]:
        """API anahtarını doğrular ve kullanım sayacını artırır."""
        if not self.pool:
            return None
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT key_id, telegram_id, tier, daily_limit, daily_used,
                           last_reset, is_active
                    FROM api_keys WHERE key_id = $1
                """, key_id)

                if not row or not row["is_active"]:
                    return None

                today = datetime.now(timezone.utc).date()

                # Günlük sayacı sıfırla
                if row["last_reset"] != today:
                    await conn.execute(
                        "UPDATE api_keys SET daily_used = 0, last_reset = $1 WHERE key_id = $2",
                        today, key_id
                    )
                    daily_used = 0
                else:
                    daily_used = row["daily_used"]

                if daily_used >= row["daily_limit"]:
                    return None  # Limit doldu

                await conn.execute("""
                    UPDATE api_keys
                    SET daily_used = daily_used + 1, last_used_at = NOW()
                    WHERE key_id = $1
                """, key_id)

                return {
                    "telegram_id": row["telegram_id"],
                    "tier": row["tier"],
                    "daily_limit": row["daily_limit"],
                    "daily_used": daily_used + 1,
                }
        except Exception as e:
            logger.error(f"API key doğrulama hatası: {e}")
            return None

    # ─── Affiliate Tracking ────────────────────────────────

    async def log_affiliate_click(
        self,
        exchange: str,
        token_address: str = "",
        click_source: str = "web",
        ip_address: str = "",
        user_agent: str = "",
    ):
        """Affiliate tıklamasını kaydeder."""
        if not self.pool:
            return

        try:
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO affiliate_events (exchange, ref_code, click_source, token_address, ip_address, user_agent)
                    VALUES ($1, $2, $3, $4, $5, $6)
                """,
                    exchange,
                    f"CHAINGUARD_{exchange.upper()}",
                    click_source,
                    token_address or None,
                    ip_address,
                    user_agent,
                )
        except Exception as e:
            logger.error(f"Affiliate log hatası: {e}")
