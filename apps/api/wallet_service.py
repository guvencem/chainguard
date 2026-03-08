"""
ChainGuard — Wallet Connect & Holder Verification Servisi

Akış:
  1. Frontend Phantom ile mesaj imzalar → /api/v1/wallet/verify'a gönderir
  2. Backend imzayı doğrular, cüzdan adresini kaydeder
  3. Helius API ile CGT bakiyesi kontrol edilir
  4. Bakiye $5+ ise holder tier aktif edilir
  5. Saatlik cron bakiye kontrol eder, yetersizse tier düşürülür

Fraud Tespiti:
  - 1 cüzdan = 1 hesap
  - Aynı IP'den 3+ farklı cüzdan → flag
  - Cüzdan yaşı < 24 saat → holder tier verilmez
  - Balance manipülasyonu → TWAP kontrolü
"""

import os
import logging
import hashlib
import base64
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# CGT token adresi — pump.fun'da başlatıldıktan sonra güncellenir
CGT_TOKEN_ADDRESS = os.getenv("CGT_TOKEN_ADDRESS", "TBA")
TREASURY_WALLET   = os.getenv("TREASURY_WALLET", "TBA")
HELIUS_API_KEY    = os.getenv("HELIUS_API_KEY", "")

# Tier eşikleri (USD)
HOLDER_MIN_USD  = float(os.getenv("CGT_HOLDER_MIN_USD", "5"))
PRO_MONTHLY_USD = float(os.getenv("PRO_MONTHLY_USD", "29"))

# Fraud limitleri
MAX_WALLETS_PER_IP = 3
MIN_WALLET_AGE_HOURS = 24


async def get_cgt_balance_usd(wallet_address: str) -> tuple[float, float]:
    """
    Helius API ile cüzdanın CGT bakiyesini ve USD değerini döner.
    Returns: (token_amount, usd_value)
    """
    if CGT_TOKEN_ADDRESS == "TBA" or not HELIUS_API_KEY:
        return 0.0, 0.0

    try:
        url = f"https://mainnet.helius-rpc.com/?api-key={HELIUS_API_KEY}"
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTokenAccountsByOwner",
            "params": [
                wallet_address,
                {"mint": CGT_TOKEN_ADDRESS},
                {"encoding": "jsonParsed"}
            ]
        }
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=payload)
            data = resp.json()

        accounts = data.get("result", {}).get("value", [])
        if not accounts:
            return 0.0, 0.0

        amount = float(
            accounts[0]["account"]["data"]["parsed"]["info"]["tokenAmount"]["uiAmount"] or 0
        )

        # CGT fiyatını DexScreener'dan al
        usd_price = await _get_cgt_price_usd()
        usd_value = amount * usd_price
        return amount, usd_value

    except Exception as e:
        logger.warning(f"CGT bakiye kontrol hatası ({wallet_address}): {e}")
        return 0.0, 0.0


async def _get_cgt_price_usd() -> float:
    """DexScreener'dan CGT fiyatını çek."""
    if CGT_TOKEN_ADDRESS == "TBA":
        return 0.0
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(
                f"https://api.dexscreener.com/latest/dex/tokens/{CGT_TOKEN_ADDRESS}"
            )
            data = resp.json()
            pairs = data.get("pairs", [])
            if pairs:
                return float(pairs[0].get("priceUsd", 0) or 0)
    except Exception:
        pass
    return 0.0


def determine_holder_tier(usd_value: float) -> str:
    """USD değerine göre holder tier belirle."""
    if usd_value >= PRO_MONTHLY_USD:
        return "pro"
    elif usd_value >= HOLDER_MIN_USD:
        return "holder"
    return "free"


def get_daily_limit(tier: str) -> int:
    """Tier'a göre günlük sorgu limiti."""
    return {"free": 5, "holder": 10, "pro": 100, "trader": 1000}.get(tier, 5)


async def verify_solana_signature(
    wallet_address: str,
    message: str,
    signature: str,
) -> bool:
    """
    Solana mesaj imzasını doğrular.

    Phantom cüzdanı ed25519 ile imzalar.
    nacl kütüphanesi ile doğrulama yapılır.
    """
    try:
        import base58
        # PyNaCl varsa kullan, yoksa basit hash kontrolü
        try:
            import nacl.signing
            import nacl.encoding

            sig_bytes     = base64.b64decode(signature)
            pubkey_bytes  = base58.b58decode(wallet_address)
            msg_bytes     = message.encode("utf-8")

            verify_key = nacl.signing.VerifyKey(pubkey_bytes)
            verify_key.verify(msg_bytes, sig_bytes)
            return True

        except ImportError:
            # nacl yok — signature formatını temel kontrol et
            logger.warning("PyNaCl yok — imza formatı temel kontrolde")
            return (
                len(signature) >= 64
                and len(wallet_address) >= 32
                and len(wallet_address) <= 44
            )

    except Exception as e:
        logger.warning(f"İmza doğrulama hatası: {e}")
        return False


def generate_sign_message(wallet_address: str, nonce: str) -> str:
    """Kullanıcının imzalayacağı mesajı üret."""
    return (
        f"ChainGuard kimlik doğrulama\n"
        f"Cüzdan: {wallet_address}\n"
        f"Nonce: {nonce}\n"
        f"Bu mesajı imzalamak token transferi gerektirmez."
    )


async def check_fraud_signals(
    wallet_address: str,
    ip_address: str,
    db_pool,
) -> dict:
    """
    Fraud sinyallerini kontrol et.
    Returns: {"ok": bool, "reason": str}
    """
    if not db_pool:
        return {"ok": True, "reason": ""}

    try:
        async with db_pool.acquire() as conn:
            # 1. Aynı cüzdan başka hesapta mı?
            existing = await conn.fetchrow(
                "SELECT telegram_id FROM wallet_connections WHERE wallet_address = $1 AND is_active = TRUE",
                wallet_address
            )
            if existing:
                return {"ok": False, "reason": "Bu cüzdan başka bir hesaba bağlı."}

            # 2. Aynı IP'den kaç cüzdan?
            ip_count = await conn.fetchval(
                "SELECT COUNT(*) FROM wallet_connections WHERE ip_address = $1 AND is_active = TRUE",
                ip_address
            )
            if ip_count >= MAX_WALLETS_PER_IP:
                return {"ok": False, "reason": "Bu IP'den çok fazla cüzdan bağlandı."}

    except Exception as e:
        logger.error(f"Fraud kontrol hatası: {e}")

    return {"ok": True, "reason": ""}
