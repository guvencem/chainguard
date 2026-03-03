"""
ChainGuard — Ortak veri modelleri.
Pydantic ile tip güvenli veri yapıları.
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


# ── Metrik Modelleri ────────────────────────────────────────

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


class MetricsResult(BaseModel):
    vlr: VLRMetric
    rls: RLSMetric
    holders: HolderMetric


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
    metrics: MetricsResult
    warnings_tr: list[str] = []
    cached: bool = False
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
