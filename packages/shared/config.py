"""
ChainGuard — Ortak yapılandırma modülü.
Tüm servisler bu modül üzerinden ortam değişkenlerini okur.
"""

import os
from dataclasses import dataclass, field
from dotenv import load_dotenv

load_dotenv()


@dataclass
class HeliusConfig:
    api_key: str = field(default_factory=lambda: os.getenv("HELIUS_API_KEY", ""))
    rpc_url: str = field(default_factory=lambda: os.getenv("HELIUS_RPC_URL", ""))
    base_url: str = "https://api.helius.xyz/v0"
    das_url: str = "https://mainnet.helius-rpc.com/?api-key="
    rate_limit: int = 100  # istek/saniye (free tier)

    @property
    def das_endpoint(self) -> str:
        return f"{self.das_url}{self.api_key}"


@dataclass
class DatabaseConfig:
    url: str = field(default_factory=lambda: os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/chainguard"))


@dataclass
class RedisConfig:
    url: str = field(default_factory=lambda: os.getenv("REDIS_URL", "redis://localhost:6379"))
    token: str = field(default_factory=lambda: os.getenv("REDIS_TOKEN", ""))
    # Cache TTL değerleri (saniye)
    token_metadata_ttl: int = 86400   # 24 saat
    risk_score_ttl: int = 30          # 30 saniye
    holder_list_ttl: int = 60         # 60 saniye
    trending_ttl: int = 300           # 5 dakika


@dataclass
class AppConfig:
    environment: str = field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    log_level: str = field(default_factory=lambda: os.getenv("LOG_LEVEL", "DEBUG"))
    api_url: str = field(default_factory=lambda: os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000"))
    sentry_dsn: str = field(default_factory=lambda: os.getenv("SENTRY_DSN", ""))


@dataclass
class Settings:
    helius: HeliusConfig = field(default_factory=HeliusConfig)
    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    redis: RedisConfig = field(default_factory=RedisConfig)
    app: AppConfig = field(default_factory=AppConfig)


# Singleton ayar nesnesi
settings = Settings()
