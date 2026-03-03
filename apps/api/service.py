"""
ChainGuard — Token Analiz Servisi

Veri toplama, skorlama ve cache katmanlarını birleştiren
ana iş mantığı servisi.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

import sys
import os

# packages klasörünü path'e ekle
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "packages"))

from shared.models import (
    TokenInfo, TokenAnalysis, ScoreResult, MetricsResult,
    VLRMetric, RLSMetric, HolderMetric,
    get_risk_level, RISK_LABELS,
)
from analyzer.scoring import (
    calculate_vlr, vlr_to_score, get_vlr_label,
    rls_to_score, get_rls_label, real_exit_value,
    holder_score as calc_holder_score, get_holder_label,
    total_score_sprint1, generate_warnings,
)
from data_collector.helius_client import HeliusClient
from data_collector.pipeline import DataCollector
from cache import CacheService

logger = logging.getLogger(__name__)


class AnalysisService:
    """Token analizi yapan ana servis."""

    def __init__(
        self,
        helius_api_key: str,
        redis_url: str = "redis://localhost:6379",
    ):
        self.helius = HeliusClient(api_key=helius_api_key)
        self.collector = DataCollector(self.helius)
        self.cache = CacheService(redis_url=redis_url)

    async def startup(self):
        """Servisi başlat."""
        await self.cache.connect()
        logger.info("AnalysisService başlatıldı")

    async def shutdown(self):
        """Servisi kapat."""
        await self.helius.close()
        await self.cache.disconnect()
        logger.info("AnalysisService kapatıldı")

    async def analyze_token(self, address: str) -> TokenAnalysis:
        """
        Token risk analizi yapar.
        
        Akış:
          1. Cache kontrol → varsa dön
          2. Veri toplama pipeline
          3. Skorlama
          4. Cache'e yaz
          5. Sonuç dön
        """
        # 1. Cache kontrol
        cached = await self.cache.get_score(address)
        if cached:
            return TokenAnalysis(**cached, cached=True)

        # 2. Veri topla
        logger.info(f"Analiz başlıyor: {address}")
        raw_data = await self.collector.collect_full(address)

        # 3. Skorla
        analysis = self._compute_analysis(address, raw_data)

        # 4. Cache'e yaz
        await self.cache.set_score(address, analysis.model_dump())
        await self.cache.set_metadata(address, raw_data.get("token_info", {}))
        await self.cache.set_holders(address, raw_data.get("holders", []))

        logger.info(f"Analiz tamamlandı: {address} → skor={analysis.score.total:.1f}")
        return analysis

    def _compute_analysis(self, address: str, raw_data: dict) -> TokenAnalysis:
        """Ham verileri alıp analiz sonuci oluşturur."""
        info = raw_data.get("token_info", {})
        holders_data = raw_data.get("holders", [])
        stats = raw_data.get("stats", {})

        supply = float(info.get("supply", 0))
        holder_count = stats.get("holder_count", len(holders_data))

        # ── Gerçek DEX piyasa verisi (DexScreener/Jupiter) ──
        volume_24h_usd = stats.get("volume_24h_usd", 0)
        liquidity_usd = stats.get("liquidity_usd", 0)
        mcap_usd = stats.get("mcap_usd", 0)

        # ── VLR Hesaplama ───────────────────────────────
        vlr_raw = calculate_vlr(volume_24h_usd, liquidity_usd)
        vlr_s = vlr_to_score(vlr_raw)
        vlr_label = get_vlr_label(vlr_raw)

        vlr_metric = VLRMetric(
            value=round(vlr_raw, 2),
            score=round(vlr_s, 2),
            label_tr=vlr_label,
            volume_24h=round(volume_24h_usd, 2),
            liquidity=round(liquidity_usd, 2),
        )

        # ── RLS Hesaplama ───────────────────────────────
        rls_ratio = mcap_usd / liquidity_usd if liquidity_usd > 0 else 9999
        rls_s = rls_to_score(mcap_usd, liquidity_usd)
        rls_label = get_rls_label(rls_ratio, liquidity_usd)
        exit_val = real_exit_value(liquidity_usd, mcap_usd * 0.1)

        rls_metric = RLSMetric(
            value=round(rls_ratio, 2),
            score=round(rls_s, 2),
            label_tr=rls_label,
            mcap=round(mcap_usd, 2),
            real_exit_value=round(exit_val, 2),
        )

        # ── Holder Hesaplama ────────────────────────────
        top10_pct = stats.get("top10_concentration", 1.0)
        holders_for_scoring = [
            {"balance": h.get("balance", 0), "last_active_1h": h.get("last_active_1h", False)}
            for h in holders_data
        ]
        holder_s = calc_holder_score(holders_for_scoring, supply)
        holder_label = get_holder_label(holder_count, top10_pct)
        
        active_count = sum(1 for h in holders_data if h.get("last_active_1h", False))

        holder_metric = HolderMetric(
            count=holder_count,
            active_1h=active_count,
            active_ratio=active_count / max(holder_count, 1),
            top10_concentration=round(top10_pct, 4),
            score=round(holder_s, 2),
            label_tr=holder_label,
        )

        # ── Birleşik Skor ──────────────────────────────
        total = total_score_sprint1(vlr_s, rls_s, holder_s)
        level = get_risk_level(total)
        labels = RISK_LABELS[level]

        score = ScoreResult(
            total=round(total, 1),
            level=level,
            label_tr=labels["tr"],
            label_en=labels["en"],
            color=labels["color"],
        )

        # ── Uyarılar ───────────────────────────────────
        warnings = generate_warnings(
            vlr=vlr_raw,
            vlr_score_val=vlr_s,
            liquidity_usd=liquidity_usd,
            holder_count=holder_count,
            top10_pct=top10_pct,
            mcap=mcap_usd,
        )

        # ── Token bilgisi ──────────────────────────────
        token_info = TokenInfo(
            address=address,
            name=info.get("name"),
            symbol=info.get("symbol"),
            supply=supply,
            decimals=info.get("decimals"),
            creator_wallet=info.get("creator_wallet"),
            platform=info.get("platform"),
            created_at=info.get("created_at"),
        )

        return TokenAnalysis(
            token=token_info,
            score=score,
            metrics=MetricsResult(vlr=vlr_metric, rls=rls_metric, holders=holder_metric),
            warnings_tr=warnings,
            cached=False,
            analyzed_at=datetime.now(timezone.utc),
        )

    async def get_holders(self, address: str) -> Optional[list]:
        """Token holder listesini döner (cache'li)."""
        cached = await self.cache.get_holders(address)
        if cached:
            return cached
        
        try:
            accounts = await self.helius.get_token_largest_accounts(address)
            holders = []
            for acc in accounts:
                holders.append({
                    "address": acc.get("address", ""),
                    "balance": float(acc.get("amount", 0)),
                    "ui_amount": acc.get("uiAmount", 0),
                })
            await self.cache.set_holders(address, holders)
            return holders
        except Exception as e:
            logger.error(f"Holder çekme hatası: {e}")
            return None
