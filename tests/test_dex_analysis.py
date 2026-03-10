"""
Taranoid — Gerçek DEX Veri Analiz Testi

DexScreener + Helius API ile gerçek zamanlı token analizi.
Yaklaşık/sabit değerler yerine canlı piyasa verisi kullanır.
"""

import asyncio
import sys
import os
import json
from datetime import datetime

# Encoding fix
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "packages"))

from data_collector.dex_provider import DexDataProvider
from data_collector.helius_client import HeliusClient
from analyzer.scoring import (
    calculate_vlr, vlr_to_score, get_vlr_label,
    rls_to_score, get_rls_label, real_exit_value,
    holder_score as calc_holder_score, get_holder_label,
    total_score_sprint1, generate_warnings,
)
from shared.models import get_risk_level, RISK_LABELS

import httpx

HELIUS_KEY = os.getenv("HELIUS_API_KEY", "")
RPC_URL = f"https://mainnet.helius-rpc.com/?api-key={HELIUS_KEY}" if HELIUS_KEY else "https://api.mainnet-beta.solana.com"

# Test token listesi
TEST_TOKENS = [
    {"name": "BONK",  "address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", "expected_max": 30},
    {"name": "WIF",   "address": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", "expected_max": 30},
    {"name": "JUP",   "address": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",  "expected_max": 30},
    {"name": "POPCAT","address": "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", "expected_max": 40},
    {"name": "TRUMP", "address": "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN", "expected_max": 50},
]


async def rpc_call(client, method, params):
    payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
    resp = await client.post(RPC_URL, json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    if "error" in data:
        raise Exception(f"RPC Error: {data['error']}")
    return data.get("result", {})


async def analyze_token(client, dex, token):
    addr = token["address"]
    name = token["name"]
    
    print(f"\n{'='*65}")
    print(f"  {name} ({addr[:8]}...{addr[-4:]})")
    print(f"{'='*65}")

    # 1. Supply
    supply_data = await rpc_call(client, "getTokenSupply", [addr])
    sv = supply_data.get("value", {})
    total_supply = float(sv.get("amount", 0))
    decimals = int(sv.get("decimals", 0))
    ui_supply = float(sv.get("uiAmountString", "0"))

    # 2. Holders
    accounts_result = await rpc_call(client, "getTokenLargestAccounts", [addr])
    accounts = accounts_result.get("value", [])
    holders = []
    for acc in accounts:
        amount = float(acc.get("amount", 0))
        pct = (amount / total_supply * 100) if total_supply > 0 else 0
        holders.append({
            "address": acc.get("address", ""),
            "balance": amount,
            "pct_supply": pct,
            "last_active_1h": True,
        })
    holder_count = len(holders)
    sorted_h = sorted(holders, key=lambda h: h["balance"], reverse=True)
    top10_pct = sum(h["pct_supply"] for h in sorted_h[:10]) / 100.0

    # 3. DEX Piyasa Verisi (GERCEK)
    market = await dex.get_market_data(addr)
    
    volume_24h = market.volume_24h_usd
    liquidity = market.liquidity_usd
    mcap = market.mcap_usd
    price = market.price_usd

    print(f"  Fiyat:     ${price:.8f}")
    print(f"  Hacim 24s: ${volume_24h:>15,.0f}")
    print(f"  Likidite:  ${liquidity:>15,.0f}")
    print(f"  Market Cap:${mcap:>15,.0f}")
    print(f"  DEX:       {market.dex_name} ({market.source})")
    print(f"  Txn 24s:   {market.tx_count_24h:,} (Buy:{market.buys_24h:,} Sell:{market.sells_24h:,})")
    print(f"  Supply:    {ui_supply:>15,.0f} ({decimals} dec)")
    print(f"  Holders:   {holder_count} (top accounts)")
    print(f"  Top10:     {top10_pct*100:.1f}%")

    # 4. Skorlama
    vlr_raw = calculate_vlr(volume_24h, liquidity) if liquidity > 0 else 0
    vlr_s = vlr_to_score(vlr_raw)
    
    rls_ratio = mcap / liquidity if liquidity > 0 else 0
    rls_s = rls_to_score(mcap, liquidity)
    
    holders_for_scoring = [
        {"balance": h["balance"], "last_active_1h": h.get("last_active_1h", False)}
        for h in holders
    ]
    holder_s = calc_holder_score(holders_for_scoring, total_supply)
    
    total = total_score_sprint1(vlr_s, rls_s, holder_s)
    level = get_risk_level(total)
    labels = RISK_LABELS[level]

    warnings = generate_warnings(
        vlr=vlr_raw, vlr_score_val=vlr_s, liquidity_usd=liquidity,
        holder_count=holder_count, top10_pct=top10_pct, mcap=mcap,
    )

    print(f"\n  --- SKORLAMA ---")
    print(f"  VLR:    {vlr_raw:>8.1f}x  ->  skor {vlr_s:>5.1f}")
    print(f"  RLS:    {rls_ratio:>8.1f}x  ->  skor {rls_s:>5.1f}")
    print(f"  Holder: {holder_count:>8}   ->  skor {holder_s:>5.1f}")
    print(f"  --------------------------------")
    print(f"  TOPLAM:              skor {total:>5.1f}  [{level}] {labels['tr']}")
    
    if warnings:
        print(f"\n  Uyarilar:")
        for w in warnings:
            print(f"    {w}")

    return {
        "name": name, "address": addr,
        "price_usd": price,
        "volume_24h_usd": volume_24h,
        "liquidity_usd": liquidity,
        "mcap_usd": mcap,
        "dex": market.dex_name,
        "holder_count": holder_count,
        "top10_pct": top10_pct,
        "vlr": {"raw": round(vlr_raw, 2), "score": round(vlr_s, 1)},
        "rls": {"ratio": round(rls_ratio, 2), "score": round(rls_s, 1)},
        "holder_score": round(holder_s, 1),
        "total_score": round(total, 1),
        "level": level,
        "label_tr": labels["tr"],
        "warnings": warnings,
        "txn_24h": market.tx_count_24h,
        "expected_max": token["expected_max"],
    }


async def main():
    print("=" * 65)
    print("  Taranoid - Gercek DEX Veri Analizi")
    print(f"  Tarih: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Helius: {'AKTIF' if HELIUS_KEY else 'YOK'}")
    print(f"  Veri Kaynagi: DexScreener + Jupiter + Solana RPC")
    print("=" * 65)

    dex = DexDataProvider()
    
    async with httpx.AsyncClient() as client:
        results = []
        for token in TEST_TOKENS:
            try:
                r = await analyze_token(client, dex, token)
                results.append(r)
                await asyncio.sleep(0.5)  # Rate limit dostu
            except Exception as e:
                print(f"\n  HATA: {token['name']} - {e}")
                results.append({"name": token["name"], "error": str(e)})

        # Ozet
        print(f"\n\n{'='*65}")
        print(f"  OZET TABLO")
        print(f"{'='*65}")
        print(f"  {'Token':<8} {'Skor':>5} {'Seviye':<14} {'VLR':>7} {'RLS':>7} {'Hold':>5} {'Hacim':>14} {'Likidite':>14}")
        print(f"  {'-'*62}")
        
        for r in results:
            if "error" in r:
                print(f"  {r['name']:<8} HATA")
                continue
            print(
                f"  {r['name']:<8} "
                f"{r['total_score']:>5.1f} "
                f"{r['label_tr']:<14} "
                f"{r['vlr']['score']:>6.1f} "
                f"{r['rls']['score']:>6.1f} "
                f"{r['holder_score']:>5.1f} "
                f"${r['volume_24h_usd']:>12,.0f} "
                f"${r['liquidity_usd']:>12,.0f}"
            )

        # Dogrulama
        print(f"\n  DOGRULAMA:")
        all_pass = True
        for r in results:
            if "error" in r:
                all_pass = False
                continue
            ok = r["total_score"] <= r["expected_max"]
            status = "OK" if ok else "BEKLENMEDIK"
            if not ok:
                all_pass = False
            print(f"  {'[OK]' if ok else '[!!]'} {r['name']}: {r['total_score']:.1f} (beklenen <{r['expected_max']})")

        print(f"\n  {'TUMU GECTI!' if all_pass else 'Bazi testler beklenen aralikta degil'}")

        # JSON kaydet
        out = os.path.join(os.path.dirname(__file__), "..", "test_results_dex.json")
        with open(out, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False, default=str)
        print(f"  Sonuclar: {out}")

    await dex.close()


if __name__ == "__main__":
    asyncio.run(main())
