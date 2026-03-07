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
    TokenInfo, TokenAnalysis, ScoreResult, MetricsResultV2,
    VLRMetric, RLSMetric, HolderMetric,
    ClusterMetric, WashMetric, SybilMetric, BundlerMetric, ExitMetric, CurveMetric,
    get_risk_level, RISK_LABELS,
)
from analyzer.scoring import (
    calculate_vlr, vlr_to_score, get_vlr_label,
    rls_to_score, get_rls_label, real_exit_value,
    holder_score as calc_holder_score, get_holder_label,
    cluster_score as calc_cluster_score, get_cluster_label,
    wash_trading_score as calc_wash_score, get_wash_label,
    sybil_score as calc_sybil_score, get_sybil_label,
    bundler_score as calc_bundler_score, get_bundler_label,
    exit_score as calc_exit_score, get_exit_label,
    curve_score as calc_curve_score, get_curve_label,
    total_score_sprint2, generate_warnings, score_to_level,
)
from data_collector.helius_client import HeliusClient
from data_collector.pipeline import DataCollector
from cache import CacheService
from database import Database
from report_generator import generate_report

logger = logging.getLogger(__name__)


class AnalysisService:
    """Token analizi yapan ana servis."""

    def __init__(
        self,
        helius_api_key: str,
        redis_url: str = "redis://localhost:6379",
        solscan_api_key: str = "",
        database_url: str = "",
    ):
        self.helius = HeliusClient(
            api_key=helius_api_key,
            solscan_api_key=solscan_api_key,
        )
        self.collector = DataCollector(self.helius)
        self.cache = CacheService(redis_url=redis_url)
        self.db = Database(database_url=database_url)

    async def startup(self):
        """Servisi başlat."""
        await self.cache.connect()
        await self.db.connect()
        logger.info("AnalysisService başlatıldı")

    async def shutdown(self):
        """Servisi kapat."""
        await self.helius.close()
        await self.cache.disconnect()
        await self.db.disconnect()
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
        analysis_data = analysis.model_dump()
        await self.cache.set_score(address, analysis_data)
        await self.cache.set_metadata(address, raw_data.get("token_info", {}))
        await self.cache.set_holders(address, raw_data.get("holders", []))
        # Raw cluster verisi (cüzdan listeleriyle) ayrıca cache'le
        raw_clusters = raw_data.get("clusters", [])
        if raw_clusters:
            await self.cache.set_clusters(address, raw_clusters)

        # 5. DB'ye kaydet (async, hata olsa bile analiz döner)
        try:
            await self.db.save_analysis(analysis_data)
        except Exception as e:
            logger.error(f"DB kayıt hatası (analiz yine döner): {e}")

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

        # ── Sprint 2 Yeni Metrikler ─────────────────
        # Pipeline'dan gelen ham veriler (henüz yoksa boş dict)
        cluster_data = raw_data.get("clusters", [])
        wash_data = raw_data.get("wash_trading", {})
        sybil_data = raw_data.get("sybil", {})
        bundler_data = raw_data.get("bundler", {})
        exit_data = raw_data.get("exit", {})
        curve_data = raw_data.get("curve", {})

        # Cluster
        cluster_s = calc_cluster_score(cluster_data, supply)
        cluster_metric = ClusterMetric(
            cluster_count=len(cluster_data),
            total_wallets=sum(c.get("wallet_count", 0) for c in cluster_data),
            largest_pct=max((c.get("pct_supply", 0) for c in cluster_data), default=0),
            score=round(cluster_s, 2),
            label_tr=get_cluster_label(cluster_data),
        )

        # Wash Trading
        wash_s = calc_wash_score(wash_data)
        wash_metric = WashMetric(
            cycles_found=wash_data.get("cycles_found", 0),
            cycle_volume_usd=wash_data.get("cycle_volume_usd", 0),
            fake_volume_pct=(
                wash_data.get("cycle_volume_usd", 0) / max(wash_data.get("total_volume_usd", 1), 1) * 100
            ) if wash_data else 0,
            score=round(wash_s, 2),
            label_tr=get_wash_label(wash_data),
        )

        # Sybil
        sybil_s = calc_sybil_score(sybil_data)
        sybil_metric = SybilMetric(
            young_wallet_pct=sybil_data.get("young_wallet_pct", 0),
            single_token_pct=sybil_data.get("single_token_pct", 0),
            score=round(sybil_s, 2),
            label_tr=get_sybil_label(sybil_data),
        )

        # Bundler
        bundler_s = calc_bundler_score(bundler_data)
        bundler_metric = BundlerMetric(
            detected=bundler_data.get("detected", False),
            bundle_count=bundler_data.get("bundle_count", 0),
            max_recipients=bundler_data.get("max_recipients_in_slot", 0),
            score=round(bundler_s, 2),
            label_tr=get_bundler_label(bundler_data),
        )

        # Exit
        exit_s = calc_exit_score(exit_data)
        exit_metric = ExitMetric(
            detected=exit_data.get("detected", False),
            stages=exit_data.get("stages", 0),
            seller_is_creator=exit_data.get("seller_is_creator", False),
            score=round(exit_s, 2),
            label_tr=get_exit_label(exit_data),
        )

        # Curve
        curve_s = calc_curve_score(curve_data)
        curve_metric = CurveMetric(
            platform=curve_data.get("platform", ""),
            graduation_time_min=curve_data.get("graduation_time_minutes", 0),
            score=round(curve_s, 2),
            label_tr=get_curve_label(curve_data),
        )

        # ── Birleşik Skor (Sprint 2) ──────────────────
        total = total_score_sprint2(
            vlr_score_val=vlr_s,
            rls_score_val=rls_s,
            holder_score_val=holder_s,
            cluster_score_val=cluster_s,
            wash_score_val=wash_s,
            sybil_score_val=sybil_s,
            bundler_score_val=bundler_s,
            exit_score_val=exit_s,
            curve_score_val=curve_s,
            mcap_usd=mcap_usd,
        )
        level_info = score_to_level(total)

        score = ScoreResult(
            total=round(total, 1),
            level=level_info["level"],
            label_tr=level_info["label_tr"],
            label_en=level_info["label_en"],
            color=level_info["color"],
        )

        # ── Uyarılar (Sprint 2 genişletilmiş) ─────────
        warnings = generate_warnings(
            vlr=vlr_raw,
            vlr_score_val=vlr_s,
            liquidity_usd=liquidity_usd,
            holder_count=holder_count,
            top10_pct=top10_pct,
            mcap=mcap_usd,
            cluster_data=cluster_data,
            wash_data=wash_data,
            sybil_data=sybil_data,
            bundler_data=bundler_data,
            exit_data=exit_data,
            curve_data=curve_data,
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

        metrics_v2 = MetricsResultV2(
            vlr=vlr_metric,
            rls=rls_metric,
            holders=holder_metric,
            cluster=cluster_metric,
            wash=wash_metric,
            sybil=sybil_metric,
            bundler=bundler_metric,
            exit=exit_metric,
            curve=curve_metric,
        )

        # ── AI Türkçe Rapor (Sprint 4) ────────────────
        report = generate_report(
            token_name=info.get("name"),
            token_symbol=info.get("symbol"),
            score_total=total,
            metrics=metrics_v2.model_dump(),
        )

        return TokenAnalysis(
            token=token_info,
            score=score,
            metrics=metrics_v2,
            warnings_tr=warnings,
            report_tr=report,
            cached=False,
            analyzed_at=datetime.now(timezone.utc),
        )

    async def get_clusters(self, address: str) -> Optional[list]:
        """Token küme verisini döner (cache'li, cüzdan listeleriyle)."""
        return await self.cache.get_clusters(address)

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
