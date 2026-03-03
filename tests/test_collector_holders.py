import asyncio
import os
import sys
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'packages'))
from data_collector.helius_client import HeliusClient

async def main():
    helius_key = os.getenv("HELIUS_API_KEY", "")
    solscan_key = os.getenv("SOLSCAN_API_KEY", "")
    addr = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
    
    print(f"Helius Key (first 6 chars): {helius_key[:6]}")
    print(f"Solscan Key (first 6 chars): {solscan_key[:6]}")
    
    client = HeliusClient(api_key=helius_key, solscan_api_key=solscan_key)
    
    print("\n--- 1. get_token_largest_accounts ---")
    try:
        accounts = await client.get_token_largest_accounts(addr)
        print(f"Success, accounts count: {len(accounts)}")
    except Exception as e:
        print(f"FAILED: {e}")
        
    print("\n--- 2. get_token_supply ---")
    try:
        supply = await client.get_token_supply(addr)
        print(f"Success, supply: {supply.get('amount', 0)}")
    except Exception as e:
        print(f"FAILED: {e}")

    print("\n--- 3. get_holder_count ---")
    try:
        hc = await client.get_holder_count(addr)
        print(f"Success, get_holder_count: {hc}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(main())
