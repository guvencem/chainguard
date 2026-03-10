"""
Taranoid — EVM Zincir Pipeline (Sprint 4)

Base, BSC, Ethereum ve diğer EVM zincirleri için
DexScreener tabanlı hafif veri toplama pipeline'ı.

Helius gerektirmez — sadece DexScreener API kullanır.
Cluster/Wash/Sybil/Bundler analizleri EVM için mevcut değil (Solana-specific).
"""

import logging
from .dex_provider import DexDataProvider

logger = logging.getLogger(__name__)

# Zincir adları
CHAIN_DISPLAY = {
    "base": "Base",
    "bsc": "BSC",
    "ethereum": "Ethereum",
    "polygon": "Polygon",
    "arbitrum": "Arbitrum",
    "optimism": "Optimism",
    "avalanche": "Avalanche",
    "solana": "Solana",
}


def detect_chain_from_address(address: str) -> str:
    """Adres formatından zinciri tespit et."""
    if address.startswith("0x") and len(address) == 42:
        return "evm"  # Hangi EVM zinciri olduğunu DexScreener'dan öğreneceğiz
    return "solana"


class EVMDataCollector:
    """EVM zincirleri için veri toplama pipeline'ı."""

    def __init__(self, dex_provider: DexDataProvider = None):
        self.dex = dex_provider or DexDataProvider()

    async def collect_full(self, token_address: str) -> dict:
        """
        EVM token için tam veri toplama.

        Returns:
            Solana pipeline ile uyumlu dict formatı.
            Eksik alanlar (cluster, wash vb.) boş döner.
        """
        logger.info(f"EVM Pipeline başlatılıyor: {token_address}")

        # DexScreener'dan tüm zincirdeki veriyi çek
        market_raw, chain_id, token_meta = await self._fetch_dexscreener_evm(token_address)

        stats = {
            "holder_count": token_meta.get("holder_count", 0),
            "top10_concentration": 0.0,   # EVM'de DexScreener'dan gelmiyor
            "tx_count": market_raw.get("tx_count_24h", 0),
            "buy_count": market_raw.get("buys_24h", 0),
            "sell_count": market_raw.get("sells_24h", 0),
            "volume_24h_usd": market_raw.get("volume_24h_usd", 0),
            "liquidity_usd": market_raw.get("liquidity_usd", 0),
            "mcap_usd": market_raw.get("mcap_usd", 0),
            "price_usd": market_raw.get("price_usd", 0),
            "dex_source": "dexscreener_evm",
        }

        token_info = {
            "address": token_address,
            "name": token_meta.get("name", "Unknown"),
            "symbol": token_meta.get("symbol", "???"),
            "supply": token_meta.get("total_supply", 0),
            "decimals": token_meta.get("decimals", 18),
            "creator_wallet": "",          # EVM'de DexScreener'dan gelmiyor
            "platform": f"{CHAIN_DISPLAY.get(chain_id, chain_id)}_dex",
            "chain": chain_id,
            "created_at": None,
        }

        logger.info(
            f"EVM Pipeline tamamlandı: {token_info['symbol']} "
            f"zincir={chain_id} vol=${stats['volume_24h_usd']:,.0f} "
            f"liq=${stats['liquidity_usd']:,.0f}"
        )

        return {
            "token_info": token_info,
            "holders": [],
            "transactions": [],
            "market_data": market_raw,
            "stats": stats,
            # EVM için derin analiz mevcut değil
            "clusters": [],
            "wash_trading": {},
            "sybil": {},
            "bundler": {},
            "exit": {},
            "curve": {},
            "chain": chain_id,
        }

    async def _fetch_dexscreener_evm(self, token_address: str) -> tuple[dict, str, dict]:
        """
        DexScreener'dan EVM token verisi çeker.

        Returns:
            (market_dict, chain_id, token_meta)
        """
        try:
            client = await self.dex._get_client()
            url = f"https://api.dexscreener.com/latest/dex/tokens/{token_address}"
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

            pairs = data.get("pairs") or []
            if not pairs:
                logger.warning(f"DexScreener EVM: {token_address} için pair bulunamadı")
                return {}, "unknown", {}

            # Solana hariç EVM pair'lerini filtrele
            evm_pairs = [p for p in pairs if p.get("chainId") != "solana"]
            if not evm_pairs:
                evm_pairs = pairs  # Hepsi solana ise genel liste kullan

            # En yüksek likiditeye sahip pair
            best = max(evm_pairs, key=lambda p: p.get("liquidity", {}).get("usd", 0))
            chain_id = best.get("chainId", "unknown")

            liquidity = best.get("liquidity", {}).get("usd", 0) or 0
            volume_24h = best.get("volume", {}).get("h24", 0) or 0
            mcap = best.get("marketCap", 0) or 0
            price = float(best.get("priceUsd", 0) or 0)
            txns = best.get("txns", {}).get("h24", {})
            buys = txns.get("buys", 0) or 0
            sells = txns.get("sells", 0) or 0

            base_token = best.get("baseToken", {})
            info_extra = best.get("info", {})

            market_dict = {
                "price_usd": price,
                "volume_24h_usd": volume_24h,
                "liquidity_usd": liquidity,
                "mcap_usd": mcap,
                "fdv_usd": best.get("fdv", 0) or 0,
                "price_change_24h": best.get("priceChange", {}).get("h24", 0) or 0,
                "dex_name": best.get("dexId", "unknown"),
                "pair_address": best.get("pairAddress", ""),
                "tx_count_24h": buys + sells,
                "buys_24h": buys,
                "sells_24h": sells,
                "source": "dexscreener_evm",
            }

            token_meta = {
                "name": base_token.get("name", "Unknown"),
                "symbol": base_token.get("symbol", "???"),
                "total_supply": 0,
                "decimals": 18,
                "holder_count": info_extra.get("holders", 0) or 0,
            }

            return market_dict, chain_id, token_meta

        except Exception as e:
            logger.error(f"DexScreener EVM hatası: {e}")
            return {}, "unknown", {}
