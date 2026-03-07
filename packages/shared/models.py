"""
ChainGuard — Ortak veri modelleri.
Pydantic ile tip güvenli veri yapıları.

Sprint 2: 9 metrikli genişletilmiş model.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ── Token Modelleri ─────────────────────────────────────────

class TokenInfo(BaseModel):
    address: str
    name: Optional[str] = None
    symbol: Optional[str] = None
    supply: Optional[float] = None
    decimals: Optional[int] = None
    creator_wallet: Optional[str] = None
    platform: Optional[str] = None  # pump_fun, raydium, orca
    created_at: Optional[datetime] = None


# ── Sprint 1 Metrik Modelleri ──────────────────────────────

class VLRMetric(BaseModel):
    """Hacim/Likidite Oranı (Volume-to-Liquidity Ratio)"""
    value: float = Field(description="Ham VLR değeri (örn: 361.7)")
    score: float = Field(ge=0, le=100, description="Normalize edilmiş skor")
    label_tr: str = ""
    volume_24h: float = 0
    liquidity: float = 0


class RLSMetric(BaseModel):
    """Gerçek Likidite Skoru (Real Liquidity Score)"""
    value: float = Field(description="Market cap / Likidite oranı")
    score: float = Field(ge=0, le=100)
    label_tr: str = ""
    mcap: float = 0
    real_exit_value: float = 0


class HolderMetric(BaseModel):
    """Holder Analizi"""
    count: int = 0
    active_1h: int = 0
    active_ratio: float = 0.0
    top10_concentration: float = 0.0
    score: float = Field(ge=0, le=100, default=0)
    label_tr: str = ""


# ── Sprint 2 Yeni Metrik Modelleri ─────────────────────────

class ClusterMetric(BaseModel):
    """Cüzdan Kümeleme Analizi"""
    cluster_count: int = 0
    total_wallets: int = 0
    largest_pct: float = 0.0
    score: float = Field(ge=0, le=100, default=0)
    label_tr: str = ""


class WashMetric(BaseModel):
    """Wash Trading Pattern Tespiti"""
    cycles_found: int = 0
    cycle_volume_usd: float = 0.0
    fake_volume_pct: float = 0.0
    score: float = Field(ge=0, le=100, default=0)
    label_tr: str = ""


class SybilMetric(BaseModel):
    """Sybil Attack Tespiti"""
    young_wallet_pct: float = 0.0
    single_token_pct: float = 0.0
    score: float = Field(ge=0, le=100, default=0)
    label_tr: str = ""


class BundlerMetric(BaseModel):
    """Bundler Tespiti"""
    detected: bool = False
    bundle_count: int = 0
    max_recipients: int = 0
    score: float = Field(ge=0, le=100, default=0)
    label_tr: str = ""


class ExitMetric(BaseModel):
    """Kademeli Çıkış Tespiti"""
    detected: bool = False
    stages: int = 0
    seller_is_creator: bool = False
    score: float = Field(ge=0, le=100, default=0)
    label_tr: str = ""


class CurveMetric(BaseModel):
    """Bonding Curve Anomali Analizi"""
    platform: str = ""
    graduation_time_min: float = 0.0
    score: float = Field(ge=0, le=100, default=0)
    label_tr: str = ""


# ── Birleşik Metrikler ──────────────────────────────────────

class MetricsResult(BaseModel):
    """Sprint 1 temel metrikler (geriye uyumluluk)"""
    vlr: VLRMetric
    rls: RLSMetric
    holders: HolderMetric


class MetricsResultV2(MetricsResult):
    """Sprint 2 genişletilmiş metrikler (9 metrik)"""
    cluster: ClusterMetric = Field(default_factory=ClusterMetric)
    wash: WashMetric = Field(default_factory=WashMetric)
    sybil: SybilMetric = Field(default_factory=SybilMetric)
    bundler: BundlerMetric = Field(default_factory=BundlerMetric)
    exit: ExitMetric = Field(default_factory=ExitMetric)
    curve: CurveMetric = Field(default_factory=CurveMetric)


# ── Skor Modelleri ──────────────────────────────────────────

class RiskLevel:
    SAFE = "SAFE"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


RISK_LABELS = {
    "SAFE": {"tr": "GÜVENLİ", "en": "SAFE", "color": "#22C55E"},
    "LOW": {"tr": "DÜŞÜK RİSK", "en": "LOW RISK", "color": "#84CC16"},
    "MEDIUM": {"tr": "ORTA RİSK", "en": "MEDIUM RISK", "color": "#F59E0B"},
    "HIGH": {"tr": "YÜKSEK RİSK", "en": "HIGH RISK", "color": "#F97316"},
    "CRITICAL": {"tr": "DOLANDIRICILIK", "en": "SCAM DETECTED", "color": "#EF4444"},
}


def get_risk_level(score: float) -> str:
    if score < 20:
        return RiskLevel.SAFE
    elif score < 40:
        return RiskLevel.LOW
    elif score < 60:
        return RiskLevel.MEDIUM
    elif score < 80:
        return RiskLevel.HIGH
    else:
        return RiskLevel.CRITICAL


class ScoreResult(BaseModel):
    total: float = Field(ge=0, le=100)
    level: str
    label_tr: str
    label_en: str
    color: str


class TokenAnalysis(BaseModel):
    """Ana API response modeli — /api/v1/token/{address}"""
    token: TokenInfo
    score: ScoreResult
    metrics: MetricsResultV2
    warnings_tr: list[str] = []
    report_tr: str = ""
    cached: bool = False
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
