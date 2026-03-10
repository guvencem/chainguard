"""
Taranoid — Gerçek Veri Analiz Testi

Bu script gerçek Solana tokenlarını analiz eder.
Helius API key varsa zengin veri, yoksa public RPC ile temel veri çeker.

Kullanım:
  python tests/test_real_data.py
  HELIUS_API_KEY=xxx python tests/test_real_data.py
"""

import asyncio
import sys
import os
import json
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "packages"))

from analyzer.scoring import (
    calculate_vlr, vlr_to_score, get_vlr_label,
    rls_to_score, get_rls_label, real_exit_value, calculate_price_impact,
    holder_score as calc_holder_score, get_holder_label,
    total_score_sprint1, generate_warnings,
)
from shared.models import get_risk_level, RISK_LABELS

# ── Doğrudan Solana RPC ile veri çekme (API key gerektirmez) ──

import httpx

# Helius veya public RPC
HELIUS_KEY = os.getenv("HELIUS_API_KEY", "")
if HELIUS_KEY:
    RPC_URL = f"https://mainnet.helius-rpc.com/?api-key={HELIUS_KEY}"
    HELIUS_BASE = f"https://api.helius.xyz/v0"
    print(f"✅ Helius API key bulundu, zengin veri modu aktif")
else:
    RPC_URL = "https://api.mainnet-beta.solana.com"
    HELIUS_BASE = None
    print(f"⚠️  Helius API key yok, public RPC ile temel veri çekilecek")
    print(f"   Zengin veri için: HELIUS_API_KEY=xxx python {__file__}")
    print()


# ── Test edilecek tokenlar ──

TEST_TOKENS = [
    {
        "name": "BONK",
        "address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        "expected": "< 30 (güvenli)",
    },
    {
        "name": "WIF",
        "address": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        "expected": "< 30 (güvenli)",
    },
    {
        "name": "JUP",
        "address": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        "expected": "< 30 (güvenli)",
    },
]


async def rpc_call(client: httpx.AsyncClient, method: str, params: list) -> dict:
    """Solana JSON-RPC çağrısı."""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params,
    }
    resp = await client.post(RPC_URL, json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    if "error" in data:
        raise Exception(f"RPC Error: {data['error']}")
    return data.get("result", {})


async def helius_das_call(client: httpx.AsyncClient, method: str, params: dict) -> dict:
    """Helius DAS API çağrısı."""
    payload = {
        "jsonrpc": "2.0",
        "id": "taranoid-test",
        "method": method,
        "params": params,
    }
    resp = await client.post(RPC_URL, json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    if "error" in data:
        raise Exception(f"DAS Error: {data['error']}")
    return data.get("result", {})


async def get_token_supply(client: httpx.AsyncClient, mint: str) -> dict:
    """Token supply bilgisi çeker."""
    return await rpc_call(client, "getTokenSupply", [mint])


async def get_largest_accounts(client: httpx.AsyncClient, mint: str) -> list:
    """Token'ın en büyük holder'larını çeker."""
    result = await rpc_call(client, "getTokenLargestAccounts", [mint])
    return result.get("value", [])


async def get_asset_helius(client: httpx.AsyncClient, asset_id: str) -> dict:
    """Helius DAS API ile token metadata çeker."""
    return await helius_das_call(client, "getAsset", {"id": asset_id})


async def analyze_token(client: httpx.AsyncClient, token: dict) -> dict:
    """Tek bir token'ı analiz eder."""
    address = token["address"]
    name = token["name"]
    
    print(f"\n{'='*60}")
    print(f"📊 {name} Analizi Başlıyor...")
    print(f"   Adres: {address}")
    print(f"{'='*60}")

    # ── 1. Supply Bilgisi ───────────────────────────────
    print(f"   ⏳ Supply çekiliyor...")
    supply_data = await get_token_supply(client, address)
    supply_value = supply_data.get("value", {})
    total_supply = float(supply_value.get("amount", 0))
    decimals = int(supply_value.get("decimals", 0))
    ui_supply = float(supply_value.get("uiAmountString", "0"))
    print(f"   ✅ Supply: {ui_supply:,.0f} ({decimals} decimals)")

    # ── 2. Holder Listesi ───────────────────────────────
    print(f"   ⏳ Holder'lar çekiliyor...")
    accounts = await get_largest_accounts(client, address)
    holders = []
    for acc in accounts:
        amount = float(acc.get("amount", 0))
        ui_amount = float(acc.get("uiAmount", 0)) if acc.get("uiAmount") else 0
        pct = (amount / total_supply * 100) if total_supply > 0 else 0
        holders.append({
            "address": acc.get("address", ""),
            "balance": amount,
            "ui_amount": ui_amount,
            "pct_supply": pct,
            "last_active_1h": True,  # Basitleştirme
        })
    
    holder_count = len(holders)
    print(f"   ✅ {holder_count} holder bulundu (top accounts)")

    # Top 10 yoğunlaşma
    sorted_h = sorted(holders, key=lambda h: h["balance"], reverse=True)
    top10 = sorted_h[:10]
    top10_pct = sum(h["pct_supply"] for h in top10) / 100.0

    print(f"   📋 Top 10 holder yoğunlaşması: %{top10_pct*100:.1f}")
    for i, h in enumerate(top10[:5]):
        print(f"      #{i+1}: {h['address'][:8]}...{h['address'][-4:]} → %{h['pct_supply']:.2f}")

    # ── 3. Helius Metadata (varsa) ──────────────────────
    token_name = name
    token_symbol = name
    platform = "unknown"
    
    if HELIUS_KEY:
        print(f"   ⏳ Helius metadata çekiliyor...")
        try:
            asset = await get_asset_helius(client, address)
            content = asset.get("content", {})
            metadata = content.get("metadata", {})
            token_name = metadata.get("name", name)
            token_symbol = metadata.get("symbol", name)
            
            # Platform tespiti
            authorities = asset.get("authorities", [])
            for auth in authorities:
                if "TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM" in auth.get("address", ""):
                    platform = "pump_fun"
                    break
            
            print(f"   ✅ Token: {token_name} (${token_symbol}), Platform: {platform}")
        except Exception as e:
            print(f"   ⚠️  Metadata çekme hatası: {e}")

    # ── 4. Piyasa Verisi (simüle) ───────────────────────
    # Not: Gerçek hacim/likidite için Birdeye veya Jupiter API gerekli
    # Şimdilik bilinen tokenlar için yaklaşık değerler kullanıyoruz
    market_data = get_approximate_market_data(name)
    volume_24h = market_data["volume_24h"]
    liquidity = market_data["liquidity"]
    mcap = market_data["mcap"]
    
    print(f"\n   💰 Piyasa Verileri (yaklaşık):")
    print(f"      24s Hacim:  ${volume_24h:,.0f}")
    print(f"      Likidite:   ${liquidity:,.0f}")
    print(f"      Market Cap: ${mcap:,.0f}")

    # ── 5. Skorlama ─────────────────────────────────────
    print(f"\n   🧮 Skorlama...")

    # VLR
    vlr_raw = calculate_vlr(volume_24h, liquidity)
    vlr_s = vlr_to_score(vlr_raw)
    vlr_label = get_vlr_label(vlr_raw)
    print(f"   📊 VLR: {vlr_raw:.1f}x → Skor: {vlr_s:.1f} — {vlr_label}")

    # RLS
    rls_ratio = mcap / liquidity if liquidity > 0 else 9999
    rls_s = rls_to_score(mcap, liquidity)
    rls_label = get_rls_label(rls_ratio, liquidity)
    exit_val = real_exit_value(liquidity, mcap * 0.01)
    print(f"   💧 RLS: {rls_ratio:.1f}x → Skor: {rls_s:.1f} — {rls_label}")
    print(f"      Gerçek çıkış (%1 mcap satışı): ${exit_val:,.0f}")

    # Holder
    holders_for_scoring = [
        {"balance": h["balance"], "last_active_1h": h.get("last_active_1h", False)}
        for h in holders
    ]
    holder_s = calc_holder_score(holders_for_scoring, total_supply)
    holder_label = get_holder_label(holder_count, top10_pct)
    print(f"   👥 Holder: {holder_count} holder → Skor: {holder_s:.1f} — {holder_label}")

    # Birleşik Skor
    total = total_score_sprint1(vlr_s, rls_s, holder_s)
    level = get_risk_level(total)
    labels = RISK_LABELS[level]

    # Uyarılar
    warnings = generate_warnings(
        vlr=vlr_raw, vlr_score_val=vlr_s,
        liquidity_usd=liquidity, holder_count=holder_count,
        top10_pct=top10_pct, mcap=mcap,
    )

    # ── 6. Sonuç ────────────────────────────────────────
    print(f"\n   {'─'*50}")
    color_map = {"SAFE": "🟢", "LOW": "🟡", "MEDIUM": "🟠", "HIGH": "🔴", "CRITICAL": "🔴💀"}
    icon = color_map.get(level, "⚪")
    
    print(f"   {icon} SONUÇ: {labels['tr']} — Skor: {total:.1f}/100")
    print(f"   Seviye: {level} | Beklenen: {token['expected']}")
    
    if warnings:
        print(f"\n   ⚠️  Uyarılar:")
        for w in warnings:
            print(f"      {w}")
    else:
        print(f"\n   ✅ Uyarı yok — token güvenli görünüyor")

    return {
        "name": token_name,
        "symbol": token_symbol,
        "address": address,
        "holder_count": holder_count,
        "top10_pct": top10_pct,
        "vlr": {"raw": vlr_raw, "score": vlr_s},
        "rls": {"ratio": rls_ratio, "score": rls_s},
        "holder_score": holder_s,
        "total_score": total,
        "level": level,
        "label_tr": labels["tr"],
        "warnings": warnings,
        "market_data": market_data,
    }


def get_approximate_market_data(name: str) -> dict:
    """
    Bilinen tokenlar için yaklaşık piyasa verisi.
    
    NOT: Gerçek uygulamada bu veri Birdeye, Jupiter veya DEX API'lerinden çekilecek.
    Sprint 1'de yaklaşık değerler kullanıyoruz.
    """
    data = {
        "BONK": {"volume_24h": 80_000_000, "liquidity": 25_000_000, "mcap": 1_500_000_000},
        "WIF": {"volume_24h": 150_000_000, "liquidity": 40_000_000, "mcap": 2_000_000_000},
        "JUP": {"volume_24h": 60_000_000, "liquidity": 30_000_000, "mcap": 1_200_000_000},
        # Scam tokenlar (test için)
        "PIPPINU": {"volume_24h": 651_000, "liquidity": 1_800, "mcap": 1_900},
    }
    return data.get(name, {"volume_24h": 10_000, "liquidity": 5_000, "mcap": 50_000})


async def main():
    print("🛡️  Taranoid — Gerçek Veri Analiz Testi")
    print(f"   Tarih: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   RPC: {RPC_URL[:50]}...")
    print()

    async with httpx.AsyncClient() as client:
        results = []
        
        for token in TEST_TOKENS:
            try:
                result = await analyze_token(client, token)
                results.append(result)
            except Exception as e:
                print(f"\n   ❌ {token['name']} analizi başarısız: {e}")
                results.append({"name": token["name"], "error": str(e)})

        # ── Özet Tablo ──────────────────────────────────
        print(f"\n\n{'='*70}")
        print(f"📋 ÖZET TABLO")
        print(f"{'='*70}")
        print(f"{'Token':<10} {'Skor':>6} {'Seviye':<12} {'VLR':>8} {'RLS':>8} {'Holder':>8} {'Holders':>8}")
        print(f"{'─'*70}")
        
        for r in results:
            if "error" in r:
                print(f"{r['name']:<10} {'HATA':>6}")
                continue
            print(
                f"{r['name']:<10} "
                f"{r['total_score']:>5.1f} "
                f"{r['label_tr']:<12} "
                f"{r['vlr']['score']:>7.1f} "
                f"{r['rls']['score']:>7.1f} "
                f"{r['holder_score']:>7.1f} "
                f"{r['holder_count']:>7}"
            )
        
        print(f"{'─'*70}")
        
        # Doğrulama
        print(f"\n🔍 DOĞRULAMA:")
        all_pass = True
        for r in results:
            if "error" in r:
                print(f"   ❌ {r['name']}: Analiz başarısız")
                all_pass = False
                continue
            
            expected_safe = r["name"] in ["BONK", "WIF", "JUP"]
            if expected_safe and r["total_score"] < 30:
                print(f"   ✅ {r['name']}: skor {r['total_score']:.1f} < 30 — Güvenli token doğru tespit edildi")
            elif expected_safe:
                print(f"   ⚠️  {r['name']}: skor {r['total_score']:.1f} (beklenen < 30) — İncelenmeli")
                all_pass = False
            else:
                print(f"   📊 {r['name']}: skor {r['total_score']:.1f}")
        
        if all_pass:
            print(f"\n   🎉 TÜM DOĞRULAMALAR GEÇTİ!")
        else:
            print(f"\n   ⚠️  Bazı doğrulamalar beklenen aralıkta değil — kalibrasyon gerekebilir")

        # JSON çıktı
        output_path = os.path.join(os.path.dirname(__file__), "..", "test_results.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False, default=str)
        print(f"\n   📁 Sonuçlar kaydedildi: {output_path}")


if __name__ == "__main__":
    asyncio.run(main())
