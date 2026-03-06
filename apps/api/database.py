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
