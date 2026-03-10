import asyncio, sys, os, json, traceback

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "packages"))

import httpx
from data_collector.dex_provider import DexDataProvider
from analyzer.scoring import (
    calculate_vlr, vlr_to_score, get_vlr_label,
    rls_to_score, get_rls_label, real_exit_value,
    holder_score as calc_holder_score, get_holder_label,
    total_score_sprint1, generate_warnings,
)
from shared.models import get_risk_level, RISK_LABELS

HELIUS_KEY = os.getenv("HELIUS_API_KEY", "")
RPC_URL = f"https://mainnet.helius-rpc.com/?api-key={HELIUS_KEY}" if HELIUS_KEY else "https://api.mainnet-beta.solana.com"
TOKEN = "8opvqaWysX1oYbXuTL8PHaoaTiXD69VFYAX4smPebonk"

async def rpc_call(client, method, params):
    payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
    resp = await client.post(RPC_URL, json=payload, timeout=30)
    data = resp.json()
    if "error" in data:
        return {"_error": data["error"]}
    return data.get("result", {})

async def main():
    print("Taranoid - Token Analizi")
    print(f"Adres: {TOKEN}")
    print(f"Uzunluk: {len(TOKEN)}")
    print()
    
    dex = DexDataProvider()
    async with httpx.AsyncClient() as client:
        
        # 1. Metadata (Helius DAS)
        print("[1] Helius DAS metadata...")
        das_payload = {
            "jsonrpc": "2.0", "id": "cg",
            "method": "getAsset", "params": {"id": TOKEN}
        }
        try:
            resp = await client.post(RPC_URL, json=das_payload, timeout=30)
            das_data = resp.json()
            if "error" in das_data:
                print(f"  DAS Hata: {das_data['error']}")
                asset = {}
            else:
                asset = das_data.get("result", {})
                content = asset.get("content", {})
                meta = content.get("metadata", {})
                tinfo = asset.get("token_info", {})
                name = meta.get("name", "Bilinmiyor")
                symbol = meta.get("symbol", "???")
                print(f"  Isim: {name}")
                print(f"  Sembol: ${symbol}")
                print(f"  Decimals: {tinfo.get('decimals', '?')}")
                print(f"  Supply: {tinfo.get('supply', '?')}")
                
                auths = asset.get("authorities", [])
                for a in auths:
                    print(f"  Authority: {a.get('address', '?')[:12]}...")
        except Exception as e:
            print(f"  Hata: {e}")
            asset = {}
            name = "?"
            symbol = "?"
        
        # 2. Supply
        print("\n[2] Token supply...")
        supply_result = await rpc_call(client, "getTokenSupply", [TOKEN])
        if "_error" in supply_result:
            print(f"  Hata: {supply_result['_error']}")
            total_supply = 0
            ui_supply = 0
        else:
            sv = supply_result.get("value", {})
            total_supply = float(sv.get("amount", 0))
            ui_supply = float(sv.get("uiAmountString", "0"))
            print(f"  Supply: {ui_supply:,.0f}")
        
        # 3. Holders
        print("\n[3] Holder listesi...")
        acc_result = await rpc_call(client, "getTokenLargestAccounts", [TOKEN])
        if "_error" in acc_result:
            print(f"  Hata: {acc_result['_error']}")
            holders = []
        else:
            accounts = acc_result.get("value", [])
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
            print(f"  Holder sayisi: {len(holders)}")
            sorted_h = sorted(holders, key=lambda h: h["balance"], reverse=True)
            for i, h in enumerate(sorted_h[:5]):
                print(f"    #{i+1}: {h['address'][:8]}...{h['address'][-4:]}  %{h['pct_supply']:.2f}")
        
        holder_count = len(holders)
        sorted_h = sorted(holders, key=lambda h: h["balance"], reverse=True) if holders else []
        top10_pct = sum(h["pct_supply"] for h in sorted_h[:10]) / 100.0 if holders else 1.0
        
        # 4. DEX verisi
        print("\n[4] DexScreener piyasa verisi...")
        try:
            market = await dex.get_market_data(TOKEN)
            print(f"  Fiyat:     ${market.price_usd:.10f}")
            print(f"  Hacim 24s: ${market.volume_24h_usd:,.2f}")
            print(f"  Likidite:  ${market.liquidity_usd:,.2f}")
            print(f"  Market Cap:${market.mcap_usd:,.2f}")
            print(f"  FDV:       ${market.fdv_usd:,.2f}")
            print(f"  DEX:       {market.dex_name} ({market.source})")
            print(f"  Txn 24s:   {market.tx_count_24h} (B:{market.buys_24h} S:{market.sells_24h})")
            print(f"  Degisim:   {market.price_change_24h:+.2f}%")
        except Exception as e:
            print(f"  Hata: {e}")
            market = type('M', (), {
                'price_usd': 0, 'volume_24h_usd': 0, 'liquidity_usd': 0,
                'mcap_usd': 0, 'fdv_usd': 0, 'dex_name': '', 'source': 'error',
                'tx_count_24h': 0, 'buys_24h': 0, 'sells_24h': 0,
                'price_change_24h': 0
            })()
        
        volume = market.volume_24h_usd
        liquidity = market.liquidity_usd
        mcap = market.mcap_usd
        
        # 5. Skorlama
        print("\n" + "=" * 55)
        print("  RISK SKORLAMA")
        print("=" * 55)
        
        vlr_raw = calculate_vlr(volume, liquidity) if liquidity > 0 else 9999
        vlr_s = vlr_to_score(vlr_raw)
        
        rls_ratio = mcap / liquidity if liquidity > 0 else 9999
        rls_s = rls_to_score(mcap, liquidity)
        
        h_list = [{"balance": h["balance"], "last_active_1h": True} for h in holders]
        holder_s = calc_holder_score(h_list, total_supply) if holders else 100
        
        total = total_score_sprint1(vlr_s, rls_s, holder_s)
        level = get_risk_level(total)
        labels = RISK_LABELS[level]
        
        warnings = generate_warnings(
            vlr=vlr_raw, vlr_score_val=vlr_s, liquidity_usd=liquidity,
            holder_count=holder_count, top10_pct=top10_pct, mcap=mcap,
        )
        
        print(f"\n  VLR:    {vlr_raw:>10.2f}x  -> skor {vlr_s:>6.1f}")
        print(f"  RLS:    {rls_ratio:>10.2f}x  -> skor {rls_s:>6.1f}")
        print(f"  Holder: {holder_count:>10}   -> skor {holder_s:>6.1f}")
        print(f"  {'─' * 40}")
        print(f"  VLR  x0.50 = {vlr_s * 0.50:>6.1f}")
        print(f"  RLS  x0.20 = {rls_s * 0.20:>6.1f}")
        print(f"  Hold x0.30 = {holder_s * 0.30:>6.1f}")
        print(f"  {'=' * 40}")
        print(f"  TOPLAM SKOR:  {total:.1f} / 100")
        print(f"  SEVIYE:       {level}")
        print(f"  ETIKET:       {labels['tr']}")
        print(f"  {'=' * 40}")
        
        if warnings:
            print(f"\n  UYARILAR:")
            for w in warnings:
                print(f"    {w}")
        
        if liquidity > 0 and mcap > 0:
            ev = real_exit_value(liquidity, mcap * 0.01)
            print(f"\n  Gercek cikis (%1 mcap): ${ev:,.2f}")
        
        # JSON kaydet
        result = {
            "name": name if asset else "?", 
            "symbol": symbol if asset else "?",
            "address": TOKEN,
            "price_usd": market.price_usd,
            "volume_24h_usd": volume,
            "liquidity_usd": liquidity,
            "mcap_usd": mcap,
            "dex": market.dex_name,
            "holder_count": holder_count,
            "top10_pct": round(top10_pct, 4),
            "vlr": {"raw": round(vlr_raw, 2), "score": round(vlr_s, 1)},
            "rls": {"ratio": round(rls_ratio, 2), "score": round(rls_s, 1)},
            "holder_score": round(holder_s, 1),
            "total_score": round(total, 1),
            "level": level,
            "label_tr": labels["tr"],
            "warnings": warnings,
        }
        with open("d:/taranoid/analysis_result.json", "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False, default=str)
        print(f"\n  Sonuc kaydedildi: analysis_result.json")
    
    await dex.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"KRITIK HATA: {e}")
        traceback.print_exc()
