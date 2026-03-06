"""
ChainGuard — Veri Toplama Pipeline

Token adresi verildiğinde 5 adımlı veri toplama süreci:
  1. Token Metadata    → getAsset
  2. Likidite Havuzu   → AMM hesapları
  3. İşlem Geçmişi     → getSignaturesForAsset + Enhanced Transactions
  4. Holder Listesi    → getTokenLargestAccounts
  5. Cache             → Redis'e yaz (TTL: 30s)
"""

import logging
from datetime import datetime, timezone
from typing import Optional, Any

from .helius_client import HeliusClient
from .dex_provider import DexDataProvider, DexMarketData

# Sprint 2 Analyzer'lar
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from analyzer.cluster_analyzer import ClusterAnalyzer
from analyzer.wash_detector import WashDetector
from analyzer.sybil_bundler_detector import SybilDetector, BundlerDetector

logger = logging.getLogger(__name__)


# Bilinen AMM program ID'leri
RAYDIUM_AMM_V4 = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
ORCA_WHIRLPOOL = "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"


class DataCollector:
    """Token verisi toplama pipeline'ı."""

    def __init__(self, helius: HeliusClient, dex_provider: DexDataProvider = None):
        self.helius = helius
        self.dex = dex_provider or DexDataProvider()
        # Sprint 2 Analyzer'lar
        self.cluster_analyzer = ClusterAnalyzer()
        self.wash_detector = WashDetector()
        self.sybil_detector = SybilDetector()
        self.bundler_detector = BundlerDetector()

    async def collect_full(self, token_address: str) -> dict:
        """
        Tam veri toplama pipeline'ı çalıştırır.
        
        Returns:
            {
                "token_info": {...},
                "liquidity": {...},
                "transactions": [...],
                "holders": [...],
                "stats": {...}
            }
        """
        logger.info(f"Pipeline başlatılıyor: {token_address}")
        result = {}

        # Adım 1: Token Metadata
        result["token_info"] = await self._collect_metadata(token_address)

        # Adım 2: Holder Listesi
        result["holders"] = await self._collect_holders(token_address)

        # Adım 3: İşlem Geçmişi
        result["transactions"] = await self._collect_transactions(token_address)

        # Adım 4: DEX Piyasa Verisi (DexScreener + Jupiter)
        result["market_data"] = await self._collect_market_data(token_address)

        # Adım 5: İstatistik hesaplama
        result["stats"] = self._compute_stats(result)

        # ── Sprint 2: Gelişmiş Analiz ──────────────────
        creator = result["token_info"].get("creator_wallet", "")
        supply = float(result["token_info"].get("supply", 0))

        try:
            result["clusters"] = self.cluster_analyzer.analyze(
                holders=result["holders"],
                transactions=result["transactions"],
                token_address=token_address,
                creator_wallet=creator,
            )
        except Exception as e:
            logger.error(f"Cluster analiz hatası: {e}")
            result["clusters"] = []

        try:
            result["wash_trading"] = self.wash_detector.analyze(
                transactions=result["transactions"],
                token_address=token_address,
            )
        except Exception as e:
            logger.error(f"Wash trading analiz hatası: {e}")
            result["wash_trading"] = {}

        try:
            result["sybil"] = self.sybil_detector.analyze(
                holders=result["holders"],
                transactions=result["transactions"],
                token_address=token_address,
            )
        except Exception as e:
            logger.error(f"Sybil analiz hatası: {e}")
            result["sybil"] = {}

        try:
            result["bundler"] = self.bundler_detector.analyze(
                transactions=result["transactions"],
                token_address=token_address,
                total_supply=supply,
            )
        except Exception as e:
            logger.error(f"Bundler analiz hatası: {e}")
            result["bundler"] = {}

        logger.info(f"Pipeline tamamlandı: {token_address}")
        return result

    async def _collect_metadata(self, token_address: str) -> dict:
        """Adım 1: Token metadata çeker ve normalize eder."""
        try:
            asset = await self.helius.get_asset(token_address)
            
            # Token bilgilerini çıkar
            content = asset.get("content", {})
            metadata = content.get("metadata", {})
            token_info = asset.get("token_info", {})
            authorities = asset.get("authorities", [])
            
            creator = ""
            if authorities:
                creator = authorities[0].get("address", "")

            supply_data = token_info.get("supply", 0)
            decimals = token_info.get("decimals", 0)
            
            # Platfrom tespiti
            platform = self._detect_platform(asset)

            return {
                "address": token_address,
                "name": metadata.get("name", "Unknown"),
                "symbol": metadata.get("symbol", "???"),
                "supply": supply_data,
                "decimals": decimals,
                "creator_wallet": creator,
                "platform": platform,
                "created_at": asset.get("created_at", None),
                "raw": asset,
            }
        except Exception as e:
            logger.error(f"Metadata çekme hatası: {e}")
            return {
                "address": token_address,
                "name": "Unknown",
                "symbol": "???",
                "supply": 0,
                "decimals": 0,
                "creator_wallet": "",
                "platform": "unknown",
                "error": str(e),
            }

    async def _collect_holders(self, token_address: str) -> list[dict]:
        """Adım 2: Holder listesi ve gerçek holder sayısını çeker."""
        try:
            # Top 20 en büyük hesabı çek (yoğunlaşma analizi için)
            accounts = await self.helius.get_token_largest_accounts(token_address)
            supply_info = await self.helius.get_token_supply(token_address)
            
            # Gerçek toplam holder sayısını çek (Helius DAS API)
            real_holder_count = await self.helius.get_holder_count(token_address)
            
            total_supply = float(supply_info.get("amount", 0))
            decimals = int(supply_info.get("decimals", 0))
            
            holders = []
            for acc in accounts:
                amount = float(acc.get("amount", 0))
                ui_amount = acc.get("uiAmount", amount / (10 ** decimals) if decimals else amount)
                pct = (amount / total_supply * 100) if total_supply > 0 else 0
                
                holders.append({
                    "address": acc.get("address", ""),
                    "balance": amount,
                    "ui_amount": ui_amount,
                    "pct_supply": pct,
                    "last_active_1h": True,
                })
            
            # Gerçek holder sayısını metadata olarak ekle
            # (top 20 hesap listesinin uzunluğu DEĞİL, gerçek toplam)
            for h in holders:
                h["_total_holders"] = real_holder_count or len(holders)
            
            # İlk eleman yoksa bile sayıyı taşıyabilmek için
            if not holders:
                holders = [{"_total_holders": real_holder_count, "_placeholder": True}]
            
            logger.info(
                f"Holder: {len(accounts)} top hesap, "
                f"toplam {real_holder_count:,} holder"
            )
            return holders
        except Exception as e:
            logger.error(f"Holder çekme hatası: {e}", exc_info=True)
            return []

    async def _collect_transactions(
        self, token_address: str, limit: int = 200
    ) -> list[dict]:
        """Adım 3: İşlem geçmişi çeker ve parse eder."""
        try:
            # İmzaları çek
            sigs_result = await self.helius.get_signatures_for_asset(
                token_address, limit=limit
            )
            
            if not sigs_result:
                return []

            # İmzaları ayıkla
            signatures = []
            for item in sigs_result:
                if isinstance(item, str):
                    signatures.append(item)
                elif isinstance(item, dict):
                    signatures.append(item.get("signature", ""))
            
            signatures = [s for s in signatures if s][:limit]

            if not signatures:
                return []

            # Enhanced transactions ile parse et
            parsed = await self.helius.get_parsed_transactions(signatures)
            
            # Normalize et
            transactions = []
            for tx in parsed:
                transactions.append({
                    "signature": tx.get("signature", ""),
                    "type": tx.get("type", "UNKNOWN"),
                    "timestamp": tx.get("timestamp", 0),
                    "fee": tx.get("fee", 0),
                    "native_transfers": tx.get("nativeTransfers", []),
                    "token_transfers": tx.get("tokenTransfers", []),
                    "description": tx.get("description", ""),
                })
            
            return transactions
        except Exception as e:
            logger.error(f"Transaction çekme hatası: {e}")
            return []

    async def _collect_market_data(self, token_address: str) -> dict:
        """Adım 4: DEX piyasa verisi çeker (DexScreener + Jupiter)."""
        try:
            data = await self.dex.get_market_data(token_address)
            logger.info(
                f"DEX veri: {data.base_symbol} "
                f"fiyat=${data.price_usd:.8f} "
                f"hacim=${data.volume_24h_usd:,.0f} "
                f"liq=${data.liquidity_usd:,.0f} "
                f"mcap=${data.mcap_usd:,.0f} "
                f"kaynak={data.source}"
            )
            return {
                "price_usd": data.price_usd,
                "volume_24h_usd": data.volume_24h_usd,
                "liquidity_usd": data.liquidity_usd,
                "mcap_usd": data.mcap_usd,
                "fdv_usd": data.fdv_usd,
                "price_change_24h": data.price_change_24h,
                "dex_name": data.dex_name,
                "pair_address": data.pair_address,
                "tx_count_24h": data.tx_count_24h,
                "buys_24h": data.buys_24h,
                "sells_24h": data.sells_24h,
                "source": data.source,
            }
        except Exception as e:
            logger.error(f"DEX veri çekme hatası: {e}")
            return {
                "price_usd": 0, "volume_24h_usd": 0,
                "liquidity_usd": 0, "mcap_usd": 0,
                "source": "error",
            }

    def _compute_stats(self, data: dict) -> dict:
        """Toplanan verilerden istatistikler hesaplar."""
        holders = data.get("holders", [])
        transactions = data.get("transactions", [])
        market = data.get("market_data", {})

        # Gerçek holder sayısı — pipeline'dan gelen metadata
        # _total_holders alanı varsa onu kullan, yoksa liste uzunluğu
        real_holders = [h for h in holders if not h.get("_placeholder")]
        total_holders = 0
        if real_holders and "_total_holders" in real_holders[0]:
            total_holders = real_holders[0]["_total_holders"]
        if total_holders == 0:
            total_holders = len(real_holders)
        
        # Top 10 yoğunlaşma (top 20 hesaptan ilk 10'u)
        sorted_h = sorted(real_holders, key=lambda h: h.get("balance", 0), reverse=True)
        top10 = sorted_h[:10]
        top10_pct = sum(h.get("pct_supply", 0) for h in top10) / 100.0

        # İşlem istatistikleri — önce DEX verisini kullan
        buy_count = market.get("buys_24h", 0)
        sell_count = market.get("sells_24h", 0)
        tx_count = market.get("tx_count_24h", 0) or len(transactions)

        # Hacim ve likidite — DEX'ten gerçek veri
        volume_24h_usd = market.get("volume_24h_usd", 0)
        liquidity_usd = market.get("liquidity_usd", 0)
        mcap_usd = market.get("mcap_usd", 0)

        # DEX verisi yoksa transaction'lardan tahmin et
        if volume_24h_usd == 0:
            volume_estimate_sol = 0.0
            for tx in transactions:
                for nt in tx.get("native_transfers", []):
                    volume_estimate_sol += nt.get("amount", 0) / 1e9
            volume_24h_usd = volume_estimate_sol * 150  # yaklaşık SOL fiyatı

        return {
            "holder_count": total_holders,
            "top10_concentration": top10_pct,
            "tx_count": tx_count,
            "buy_count": buy_count,
            "sell_count": sell_count,
            "volume_24h_usd": volume_24h_usd,
            "liquidity_usd": liquidity_usd,
            "mcap_usd": mcap_usd,
            "price_usd": market.get("price_usd", 0),
            "dex_source": market.get("source", "none"),
        }

    def _detect_platform(self, asset: dict) -> str:
        """Token'ın hangi platformda oluşturulduğunu tespit eder."""
        # Basit heuristik — authorities ve metadata'dan çıkarım
        authorities = asset.get("authorities", [])
        for auth in authorities:
            addr = auth.get("address", "")
            if "TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM" in addr:
                return "pump_fun"

        # Grup kontrolü
        grouping = asset.get("grouping", [])
        for group in grouping:
            if group.get("group_key") == "collection":
                return "nft_collection"

        return "unknown"
