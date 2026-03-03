"""
ChainGuard — Redis Cache Katmanı

Cache TTL değerleri:
  - Token metadata:  24 saat
  - Risk skoru:      30 saniye
  - Holder listesi:  60 saniye
  - Trending:        5 dakika
"""

import json
import logging
from typing import Optional, Any

import redis.asyncio as aioredis

logger = logging.getLogger(__name__)


class CacheService:
    """Redis tabanlı cache servisi."""

    # TTL sabitleri (saniye)
    TTL_METADATA = 86400    # 24 saat
    TTL_SCORE = 30          # 30 saniye
    TTL_HOLDERS = 60        # 60 saniye
    TTL_TRENDING = 300      # 5 dakika

    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self._redis: Optional[aioredis.Redis] = None

    async def connect(self):
        """Redis bağlantısını başlat."""
        if self._redis is None:
            self._redis = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
            )
            logger.info("Redis bağlantısı kuruldu")

    async def disconnect(self):
        """Redis bağlantısını kapat."""
        if self._redis:
            await self._redis.close()
            self._redis = None

    async def _get_redis(self) -> aioredis.Redis:
        if self._redis is None:
            await self.connect()
        return self._redis

    # ── Token Skoru Cache ───────────────────────────────

    def _score_key(self, address: str) -> str:
        return f"chainguard:score:{address}"

    async def get_score(self, address: str) -> Optional[dict]:
        """Cache'ten token skorunu oku."""
        r = await self._get_redis()
        data = await r.get(self._score_key(address))
        if data:
            logger.debug(f"Cache HIT: score:{address}")
            return json.loads(data)
        logger.debug(f"Cache MISS: score:{address}")
        return None

    async def set_score(self, address: str, score_data: dict):
        """Token skorunu cache'e yaz."""
        r = await self._get_redis()
        await r.setex(
            self._score_key(address),
            self.TTL_SCORE,
            json.dumps(score_data, default=str),
        )
        logger.debug(f"Cache SET: score:{address} (TTL={self.TTL_SCORE}s)")

    # ── Token Metadata Cache ────────────────────────────

    def _metadata_key(self, address: str) -> str:
        return f"chainguard:meta:{address}"

    async def get_metadata(self, address: str) -> Optional[dict]:
        r = await self._get_redis()
        data = await r.get(self._metadata_key(address))
        if data:
            return json.loads(data)
        return None

    async def set_metadata(self, address: str, metadata: dict):
        r = await self._get_redis()
        await r.setex(
            self._metadata_key(address),
            self.TTL_METADATA,
            json.dumps(metadata, default=str),
        )

    # ── Holder Cache ────────────────────────────────────

    def _holders_key(self, address: str) -> str:
        return f"chainguard:holders:{address}"

    async def get_holders(self, address: str) -> Optional[list]:
        r = await self._get_redis()
        data = await r.get(self._holders_key(address))
        if data:
            return json.loads(data)
        return None

    async def set_holders(self, address: str, holders: list):
        r = await self._get_redis()
        await r.setex(
            self._holders_key(address),
            self.TTL_HOLDERS,
            json.dumps(holders, default=str),
        )

    # ── Trending Cache ──────────────────────────────────

    async def get_trending(self) -> Optional[list]:
        r = await self._get_redis()
        data = await r.get("chainguard:trending")
        if data:
            return json.loads(data)
        return None

    async def set_trending(self, tokens: list):
        r = await self._get_redis()
        await r.setex(
            "chainguard:trending",
            self.TTL_TRENDING,
            json.dumps(tokens, default=str),
        )

    # ── Yardımcı ────────────────────────────────────────

    async def invalidate(self, address: str):
        """Bir token'ın tüm cache'ini temizle."""
        r = await self._get_redis()
        keys = [
            self._score_key(address),
            self._metadata_key(address),
            self._holders_key(address),
        ]
        await r.delete(*keys)
        logger.info(f"Cache invalidated: {address}")

    async def health_check(self) -> bool:
        """Redis sağlık kontrolü."""
        try:
            r = await self._get_redis()
            await r.ping()
            return True
        except Exception:
            return False
