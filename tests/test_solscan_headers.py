import asyncio
import os
import sys
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

async def main():
    key = os.getenv("SOLSCAN_API_KEY", "")
    addr = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
    
    async with httpx.AsyncClient(timeout=15) as c:
        for url in [
            f"https://public-api.solscan.io/token/meta?tokenAddress={addr}",
            f"https://public-api.solscan.io/v2.0/token/meta?address={addr}"
        ]:
            print(f"\n=== testing {url} ===")
            try:
                r = await c.get(url, headers={
                    "token": key,
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                })
                print(f"Status: {r.status_code}")
                if r.status_code == 200:
                    data = r.json()
                    print(f"Content keys: {list(data.keys())}")
                    if 'data' in data:
                        print(f"Holder: {data['data'].get('holder', 'N/A')}")
                    else:
                        print(f"Holder field: {data.get('holder', 'N/A')}")
                else:
                    print(f"Content: {r.text[:200]}")
            except Exception as e:
                print(e)
            
if __name__ == "__main__":
    asyncio.run(main())
