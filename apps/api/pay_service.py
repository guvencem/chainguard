import os
import json
import logging
import httpx
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

TREASURY_WALLET = os.getenv("TREASURY_WALLET", "TBA")
HELIUS_API_KEY = os.getenv("HELIUS_API_KEY", "")

async def get_sol_price_usd() -> float:
    """DexScreener API'den güncel SOL fiyatını al."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get("https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112")
            data = resp.json()
            pairs = data.get("pairs", [])
            if pairs:
                return float(pairs[0].get("priceUsd", 0) or 0)
    except Exception as e:
        logger.error(f"SOL fiyatı çekme hatası: {e}")
    return 0.0

def generate_reference() -> str:
    """Solana Pay uyumlu rastgele reference adresi (Ed25519 PubKey base58) oluştur."""
    try:
        import nacl.signing
        import base58
        seed = os.urandom(32)
        signing_key = nacl.signing.SigningKey(seed)
        return base58.b58encode(signing_key.verify_key.encode()).decode("utf-8")
    except Exception as e:
        logger.error(f"Referans üretme hatası: {e}")
        return ""

async def verify_transaction(reference: str, expected_sol: float) -> bool:
    """Helius API'si ile Treasury adresine beklenen referansla ödeme geldi mi kontrol et."""
    if TREASURY_WALLET == "TBA" or not HELIUS_API_KEY:
        logger.warning("Treasure wallet veya Helius API key yok!")
        return False
        
    try:
        # Helius parsed transaction history
        url = f"https://api.helius.xyz/v0/addresses/{TREASURY_WALLET}/transactions?api-key={HELIUS_API_KEY}"
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                logger.error(f"Helius API hata verdi: {resp.status_code}")
                return False
                
            txs = resp.json()
            for tx in txs:
                # Zaman kısıtlaması (sadece son 60 dakikadaki işlemler)
                timestamp = tx.get("timestamp", 0)
                if datetime.now(timezone.utc).timestamp() - timestamp > 3600:
                    continue
                
                # Referans adresi (Solana Pay spec) account keys içinde dahil olur
                account_data = tx.get("accountData", [])
                has_ref = False
                for acc in account_data:
                    if acc.get("account") == reference:
                        has_ref = True
                        break
                        
                if not has_ref:
                    continue
                    
                # Native SOL transferlerine bak
                native_transfers = tx.get("nativeTransfers", [])
                for transfer in native_transfers:
                    if transfer.get("toUserAccount") == TREASURY_WALLET:
                        lamports = float(transfer.get("amount", 0))
                        sol_amount = lamports / 1_000_000_000
                        # Küçük (%5) miktar toleransı tanıyalım kur kaymaları için
                        if sol_amount >= expected_sol * 0.95:
                            return True
                            
    except Exception as e:
        logger.error(f"İşlem doğrulama hatası: {e}")
        
    return False

