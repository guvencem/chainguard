"""
Taranoid — DEX Veri Sağlayıcı

Gerçek zamanlı piyasa verisi çeker:
  - Jupiter Price API v2  → Fiyat (ücretsiz, key gerektirmez)
  - DexScreener API       → Hacim, likidite, mcap, pair bilgisi (ücretsiz)

Her iki API de rate limit dostu ve ücretsiz.
"""

import asyncio
import logging
from typing import Optional
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)


@dataclass
class DexMarketData:
    """DEX piyasa verisi."""
    price_usd: float = 0.0
    volume_24h_usd: float = 0.0
    liquidity_usd: float = 0.0
    mcap_usd: float = 0.0
    fdv_usd: float = 0.0
    price_change_24h: float = 0.0
    pair_address: str = ""
    dex_name: str = ""
    base_symbol: str = ""
    quote_symbol: str = ""
    tx_count_24h: int = 0
    buys_24h: int = 0
    sells_24h: int = 0
    source: str = ""


class DexDataProvider:
    """
    DEX verisi çeken sağlayıcı.
    
    Öncelik sırası:
      1. DexScreener (zengin veri — hacim, likidite, txn count)
      2. Jupiter Price API (yedek fiyat kaynağı)
    """

    DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex"
    JUPITER_PRICE_BASE = "https://api.jup.ag/price/v2"

    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(15.0),
                headers={"User-Agent": "Taranoid/1.0"},
            )
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    # ═══════════════════════════════════════════════════════
    # ANA FONKSİYON
    # ═══════════════════════════════════════════════════════

    async def get_market_data(self, token_address: str) -> DexMarketData:
        """
        Token için piyasa verisini çeker.
        DexScreener'dan başlar, başarısız olursa Jupiter'a düşer.
        """
        # Önce DexScreener
        data = await self._fetch_dexscreener(token_address)
        if data and data.liquidity_usd > 0:
            return data

        # Yedek: Jupiter fiyat
        jupiter_data = await self._fetch_jupiter_price(token_address)
        if jupiter_data:
            return jupiter_data

        logger.warning(f"Piyasa verisi çekilemedi: {token_address}")
        return DexMarketData()

    # ═══════════════════════════════════════════════════════
    # DEXSCREENER API
    # ═══════════════════════════════════════════════════════

    async def _fetch_dexscreener(self, token_address: str) -> Optional[DexMarketData]:
        """
        DexScreener API ile piyasa verisi çeker.
        
        Endpoint: GET /tokens/{address}
        Dönen veri: pairs listesi (her DEX pair'i ayrı)
        En yüksek likiditeye sahip pair seçilir.
        
        Rate limit: ~300 istek/dk (寛大)
        """
        try:
            client = await self._get_client()
            url = f"{self.DEXSCREENER_BASE}/tokens/{token_address}"
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

            pairs = data.get("pairs") or []
            if not pairs:
                logger.debug(f"DexScreener: {token_address} için pair bulunamadı")
                return None

            # En yüksek likiditeye sahip Solana pair'ini seç
            solana_pairs = [p for p in pairs if p.get("chainId") == "solana"]
            if not solana_pairs:
                solana_pairs = pairs

            # Likiditeye göre sırala
            best = max(solana_pairs, key=lambda p: p.get("liquidity", {}).get("usd", 0))

            liquidity = best.get("liquidity", {}).get("usd", 0) or 0
            volume_24h = best.get("volume", {}).get("h24", 0) or 0
            mcap = best.get("marketCap", 0) or 0
            fdv = best.get("fdv", 0) or 0
            price = float(best.get("priceUsd", 0) or 0)
            price_change = best.get("priceChange", {}).get("h24", 0) or 0

            # Transaction istatistikleri
            txns = best.get("txns", {}).get("h24", {})
            buys = txns.get("buys", 0) or 0
            sells = txns.get("sells", 0) or 0

            base_token = best.get("baseToken", {})
            quote_token = best.get("quoteToken", {})

            result = DexMarketData(
                price_usd=price,
                volume_24h_usd=volume_24h,
                liquidity_usd=liquidity,
                mcap_usd=mcap,
                fdv_usd=fdv,
                price_change_24h=price_change,
                pair_address=best.get("pairAddress", ""),
                dex_name=best.get("dexId", "unknown"),
                base_symbol=base_token.get("symbol", ""),
                quote_symbol=quote_token.get("symbol", ""),
                tx_count_24h=buys + sells,
                buys_24h=buys,
                sells_24h=sells,
                source="dexscreener",
            )

            logger.info(
                f"DexScreener: {base_token.get('symbol', '?')} "
                f"price=${price:.6f} vol=${volume_24h:,.0f} liq=${liquidity:,.0f}"
            )
            return result

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                logger.warning("DexScreener rate limit aşıldı, 2s bekleniyor...")
                await asyncio.sleep(2)
            else:
                logger.error(f"DexScreener HTTP hatası: {e}")
            return None
        except Exception as e:
            logger.error(f"DexScreener hatası: {e}")
            return None

    # ═══════════════════════════════════════════════════════
    # JUPITER PRICE API
    # ═══════════════════════════════════════════════════════

    async def _fetch_jupiter_price(self, token_address: str) -> Optional[DexMarketData]:
        """
        Jupiter Price API v2 ile fiyat çeker.
        
        Endpoint: GET /price?ids={address}
        Sadece fiyat döner (hacim/likidite yok).
        
        Rate limit: liberal
        """
        try:
            client = await self._get_client()
            url = f"{self.JUPITER_PRICE_BASE}?ids={token_address}&showExtraInfo=true"
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

            token_data = data.get("data", {}).get(token_address)
            if not token_data:
                return None

            price = float(token_data.get("price", 0) or 0)

            result = DexMarketData(
                price_usd=price,
                source="jupiter",
            )

            logger.info(f"Jupiter: {token_address[:8]}... price=${price:.6f}")
            return result

        except Exception as e:
            logger.error(f"Jupiter Price hatası: {e}")
            return None

    # ═══════════════════════════════════════════════════════
    # ÇOKLU TOKEN
    # ═══════════════════════════════════════════════════════

    async def get_multiple(self, addresses: list[str]) -> dict[str, DexMarketData]:
        """Birden fazla token için piyasa verisini paralel çeker."""
        tasks = [self.get_market_data(addr) for addr in addresses]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        output = {}
        for addr, result in zip(addresses, results):
            if isinstance(result, Exception):
                logger.error(f"Çoklu çekme hatası ({addr}): {result}")
                output[addr] = DexMarketData()
            else:
                output[addr] = result

        return output
