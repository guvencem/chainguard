"""
Bu scripti kendi bilgisayarinda calistir:
  python tests/test_solscan.py

Solscan API key'in .env dosyasinda SOLSCAN_API_KEY olarak tanimli olmali.
"""
import asyncio, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'packages'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

import httpx

async def main():
    key = os.getenv("SOLSCAN_API_KEY", "")
    if not key:
        print("HATA: SOLSCAN_API_KEY .env dosyasinda bulunamadi!")
        return
    
    tokens = {
        "BONK": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        "WIF": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        "JUP": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    }
    
    async with httpx.AsyncClient(timeout=15) as c:
        for name, addr in tokens.items():
            url = f"https://pro-api.solscan.io/v2.0/token/meta?address={addr}"
            try:
                r = await c.get(url, headers={
                    "Accept": "application/json",
                    "token": key,
                })
                if r.status_code == 200:
                    data = r.json()
                    holder = data.get("data", {}).get("holder", "N/A")
                    supply = data.get("data", {}).get("supply", "N/A")
                    print(f"  {name:>6}: holder={holder:>12,}  supply={supply}")
                else:
                    print(f"  {name:>6}: HTTP {r.status_code} - {r.text[:100]}")
            except Exception as e:
                print(f"  {name:>6}: HATA - {e}")

if __name__ == "__main__":
    print("=== Solscan API Holder Count Test ===\n")
    asyncio.run(main())
    print("\nTamamlandi!")
