"""
ChainGuard — Redis Cache Katmanı (Opsiyonel)

Redis varsa kullanır, yoksa graceful degradation ile devam eder.
Cache TTL değerleri:
  - Token metadata:  24 saat
  - Risk skoru:      30 saniye
  - Holder listesi:  60 saniye
  - Trending:        5 dakika
"""

import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Redis opsiyonel
try:
    import redis.asyncio as aioredis
    HAS_REDIS = True
except ImportError:
    HAS_REDIS = False
    logger.warning("redis paketi bulunamadı — cache devre dışı")


class CacheService:
    """Redis tabanlı cache servisi (opsiyonel)."""

    TTL_METADATA = 86400
    TTL_SCORE = 30
    TTL_HOLDERS = 60
    TTL_TRENDING = 300

    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self._redis = None
        self._available = False

    async def connect(self):
        """Redis bağlantısını başlat. Başarısız olursa sessizce devam et."""
        if not HAS_REDIS:
            logger.info("Redis paketi yok — cache devre dışı")
            return

        try:
            self._redis = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
            )
            await self._redis.ping()
            self._available = True
            logger.info("Redis bağlantısı kuruldu — cache aktif")
        except Exception as e:
            logger.warning(f"Redis bağlantısı kurulamadı — cache devre dışı: {e}")
            self._redis = None
            self._available = False

    async def disconnect(self):
        if self._redis:
            await self._redis.close()
            self._redis = None
            self._available = False

    # ── Token Skoru Cache ────────────────────────────

    def _score_key(self, address: str) -> str:
        return f"chainguard:score:{address}"

    async def get_score(self, address: str) -> Optional[dict]:
        if not self._available:
            return None
        try:
            data = await self._redis.get(self._score_key(address))
            if data:
                logger.debug(f"Cache HIT: score:{address}")
                return json.loads(data)
        except Exception:
            pass
        return None

    async def set_score(self, address: str, score_data: dict):
        if not self._available:
            return
        try:
            await self._redis.setex(
                self._score_key(address),
                self.TTL_SCORE,
                json.dumps(score_data, default=str),
            )
        except Exception:
            pass

    # ── Token Metadata Cache ─────────────────────────

    def _metadata_key(self, address: str) -> str:
        return f"chainguard:meta:{address}"

    async def get_metadata(self, address: str) -> Optional[dict]:
        if not self._available:
            return None
        try:
            data = await self._redis.get(self._metadata_key(address))
            if data:
                return json.loads(data)
        except Exception:
            pass
        return None

    async def set_metadata(self, address: str, metadata: dict):
        if not self._available:
            return
        try:
            await self._redis.setex(
                self._metadata_key(address),
                self.TTL_METADATA,
                json.dumps(metadata, default=str),
            )
        except Exception:
            pass

    # ── Holder Cache ─────────────────────────────────

    def _holders_key(self, address: str) -> str:
        return f"chainguard:holders:{address}"

    async def get_holders(self, address: str) -> Optional[list]:
        if not self._available:
            return None
        try:
            data = await self._redis.get(self._holders_key(address))
            if data:
                return json.loads(data)
        except Exception:
            pass
        return None

    async def set_holders(self, address: str, holders: list):
        if not self._available:
            return
        try:
            await self._redis.setex(
                self._holders_key(address),
                self.TTL_HOLDERS,
                json.dumps(holders, default=str),
            )
        except Exception:
            pass

    # ── Trending Cache ───────────────────────────────

    async def get_trending(self) -> Optional[list]:
        if not self._available:
            return None
        try:
            data = await self._redis.get("chainguard:trending")
            if data:
                return json.loads(data)
        except Exception:
            pass
        return None

    async def set_trending(self, tokens: list):
        if not self._available:
            return
        try:
            await self._redis.setex(
                "chainguard:trending",
                self.TTL_TRENDING,
                json.dumps(tokens, default=str),
            )
        except Exception:
            pass

    # ── Yardımcı ─────────────────────────────────────

    async def invalidate(self, address: str):
        if not self._available:
            return
        try:
            keys = [
                self._score_key(address),
                self._metadata_key(address),
                self._holders_key(address),
            ]
            await self._redis.delete(*keys)
        except Exception:
            pass

    async def health_check(self) -> bool:
        if not self._available:
            return False
        try:
            await self._redis.ping()
            return True
        except Exception:
            return False
