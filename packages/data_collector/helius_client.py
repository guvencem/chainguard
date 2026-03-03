"""
ChainGuard — Helius API Client

Solana blockchain verilerini Helius API üzerinden toplar.
Kullanılan endpointler:
  - getAsset          → Token metadata
  - getAssetsByOwner  → Cüzdandaki tokenlar
  - getSignaturesForAsset → İşlem imzaları
  - Enhanced Transactions → Çözümlenmiş işlem verileri

Free Tier: 100K istek/gün
"""

import asyncio
import logging
from typing import Optional, Any

import httpx

logger = logging.getLogger(__name__)


class HeliusClient:
    """Helius API ile iletişim kuran async istemci."""

    def __init__(self, api_key: str, rpc_url: str = ""):
        self.api_key = api_key
        self.base_url = "https://api.helius.xyz/v0"
        self.rpc_url = rpc_url or f"https://mainnet.helius-rpc.com/?api-key={api_key}"
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0),
                limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
            )
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    # ── DAS API Çağrıları ───────────────────────────────

    async def _das_request(self, method: str, params: dict) -> dict:
        """DAS (Digital Asset Standard) API JSON-RPC çağrısı."""
        client = await self._get_client()
        payload = {
            "jsonrpc": "2.0",
            "id": "chainguard",
            "method": method,
            "params": params,
        }
        resp = await client.post(self.rpc_url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        if "error" in data:
            raise HeliusAPIError(data["error"].get("message", "Unknown DAS error"))
        return data.get("result", {})

    async def get_asset(self, asset_id: str) -> dict:
        """
        Token metadata çeker.
        Dönen veriler: ad, sembol, supply, yaratıcı cüzdan, oluşturma tarihi
        """
        logger.info(f"getAsset: {asset_id}")
        result = await self._das_request("getAsset", {"id": asset_id})
        return result

    async def get_asset_proof(self, asset_id: str) -> dict:
        """Token'ın Merkle proof'unu çeker."""
        return await self._das_request("getAssetProof", {"id": asset_id})

    async def get_assets_by_owner(
        self, owner: str, page: int = 1, limit: int = 100
    ) -> dict:
        """Bir cüzdandaki tüm tokenları listeler."""
        logger.info(f"getAssetsByOwner: {owner} (page={page})")
        return await self._das_request(
            "getAssetsByOwner",
            {"ownerAddress": owner, "page": page, "limit": limit},
        )

    async def get_signatures_for_asset(
        self, asset_id: str, limit: int = 200
    ) -> list[dict]:
        """Token için işlem imzalarını çeker."""
        logger.info(f"getSignaturesForAsset: {asset_id} (limit={limit})")
        result = await self._das_request(
            "getSignaturesForAsset",
            {"id": asset_id, "limit": limit},
        )
        return result if isinstance(result, list) else result.get("items", [])

    # ── Enhanced Transactions API ───────────────────────

    async def get_parsed_transactions(
        self, signatures: list[str]
    ) -> list[dict]:
        """
        İşlem imzalarını çözümlenmiş formata dönüştürür.
        Batch olarak maksimum 100 imza gönderilir.
        """
        client = await self._get_client()
        all_parsed = []

        # 100'lü batchler halinde gönder
        for i in range(0, len(signatures), 100):
            batch = signatures[i : i + 100]
            url = f"{self.base_url}/transactions?api-key={self.api_key}"
            resp = await client.post(url, json={"transactions": batch})
            resp.raise_for_status()
            parsed = resp.json()
            if isinstance(parsed, list):
                all_parsed.extend(parsed)
            logger.info(f"Parsed {len(batch)} transactions (batch {i // 100 + 1})")

        return all_parsed

    async def get_enhanced_transaction(self, signature: str) -> dict:
        """Tek bir işlemi zenginleştirilmiş formatta çeker."""
        client = await self._get_client()
        url = f"{self.base_url}/transactions?api-key={self.api_key}"
        resp = await client.post(url, json={"transactions": [signature]})
        resp.raise_for_status()
        data = resp.json()
        return data[0] if isinstance(data, list) and data else {}

    # ── Token Holders ───────────────────────────────────

    async def get_token_largest_accounts(self, mint: str) -> list[dict]:
        """
        Token'ın en büyük hesaplarını (holder'larını) çeker.
        Solana RPC getTokenLargestAccounts kullanır.
        NOT: Sadece top 20 hesap döner, toplam sayı için get_holder_count kullan.
        """
        client = await self._get_client()
        payload = {
            "jsonrpc": "2.0",
            "id": "chainguard",
            "method": "getTokenLargestAccounts",
            "params": [mint],
        }
        resp = await client.post(self.rpc_url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data.get("result", {}).get("value", [])

    async def get_holder_count(self, mint: str) -> int:
        """
        Token'ın gerçek toplam holder sayısını çeker.
        Kaynak 1: Solscan public API (hızlı, tek çağrı)
        Kaynak 2: Helius getTokenAccounts (fallback)
        """
        client = await self._get_client()

        # ── Kaynak 1: Solscan API ──
        try:
            url = f"https://pro-api.solscan.io/v2.0/token/meta?address={mint}"
            resp = await client.get(url, timeout=10, headers={
                "Accept": "application/json",
            })
            if resp.status_code == 200:
                data = resp.json()
                holder = data.get("data", {}).get("holder", 0)
                if holder and holder > 0:
                    logger.info(f"Holder count (Solscan): {mint[:8]}... = {holder:,}")
                    return holder
        except Exception as e:
            logger.debug(f"Solscan API erişilemedi: {e}")

        # ── Kaynak 1b: Solscan public (eski endpoint) ──
        try:
            url = f"https://public-api.solscan.io/token/meta?tokenAddress={mint}"
            resp = await client.get(url, timeout=10, headers={
                "Accept": "application/json",
            })
            if resp.status_code == 200:
                data = resp.json()
                holder = data.get("holder", 0)
                if holder and holder > 0:
                    logger.info(f"Holder count (Solscan public): {mint[:8]}... = {holder:,}")
                    return holder
        except Exception as e:
            logger.debug(f"Solscan public API erişilemedi: {e}")

        # ── Kaynak 2: Helius getTokenAccounts (fallback) ──
        try:
            payload = {
                "jsonrpc": "2.0",
                "id": "hc",
                "method": "getTokenAccounts",
                "params": {"mint": mint, "limit": 1000, "page": 1},
            }
            resp = await client.post(self.rpc_url, json=payload, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            accounts = data.get("result", {}).get("token_accounts", [])
            count = len(accounts)
            # 1000 ise daha fazla var ama kesin sayıyı bilemiyoruz
            if count == 1000:
                count = 1000  # minimum tahmin (arayüzde "1000+" gösterilecek)
                logger.info(f"Holder count (Helius fallback): {mint[:8]}... = {count}+ (minimum)")
            else:
                logger.info(f"Holder count (Helius fallback): {mint[:8]}... = {count}")
            return count
        except Exception as e:
            logger.warning(f"Holder count çekilemedi: {e}")
            return 0

    async def get_token_supply(self, mint: str) -> dict:
        """Token supply bilgisi çeker."""
        client = await self._get_client()
        payload = {
            "jsonrpc": "2.0",
            "id": "chainguard",
            "method": "getTokenSupply",
            "params": [mint],
        }
        resp = await client.post(self.rpc_url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data.get("result", {}).get("value", {})


class HeliusAPIError(Exception):
    """Helius API hata sınıfı."""
    pass
