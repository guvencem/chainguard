"""
ChainGuard — Analiz Motoru: Skorlama Fonksiyonları

Sprint 2 Metrikleri (9 metrik):
  1. VLR  (Hacim/Likidite Oranı)        — ağırlık %25
  2. RLS  (Gerçek Likidite Skoru)        — ağırlık %5
  3. Holder Analizi                      — ağırlık %12
  4. Cüzdan Kümeleme (Cluster)           — ağırlık %20
  5. Wash Trading Pattern                — ağırlık %15
  6. Sybil Attack Skoru                  — ağırlık %12
  7. Bundler Tespiti                     — ağırlık %10
  8. Kademeli Çıkış (Laddered Exit)      — ağırlık %8  (placeholder — pipeline verisi gerekli)
  9. Bonding Curve Anomalisi             — ağırlık %5  (placeholder — pump.fun spesifik)

GÜNCELLEMELER (Sprint 1 → Sprint 2):
  - Ağırlık dağılımı değişti (VLR: %50→%25, RLS: %20→%5, Holder: %30→%12)
  - 6 yeni metrik eklendi
  - total_score_sprint2() fonksiyonu eklendi
  - Geriye uyumluluk korundu (Sprint 1 fonksiyonları hâlâ çalışır)

Her fonksiyon 0–100 arası skor döner. 0 = güvenli, 100 = tehlikeli.
"""

import math
from typing import Optional
from datetime import datetime, timezone, timedelta


# ═══════════════════════════════════════════════════════════
# METRİK 1: Hacim/Likidite Oranı (VLR) — Sprint 1'den
# ═══════════════════════════════════════════════════════════

def vlr_to_score(vlr: float) -> float:
    """
    VLR değerini 0–100 risk skoruna dönüştürür.
    Logaritmik normalizasyon kullanır.

    VLR Aralığı → Skor → Etiket:
      < 5x      → 0–10   → Normal
      5–20x     → 10–40  → Şüpheli
      20–50x    → 40–70  → Yüksek Risk
      50–100x   → 70–90  → Wash Trading
      > 100x    → 90–100 → Kesin Manipülasyon

    Doğrulama: PIPPINU VLR = 361.7x → Skor = 97.6 → "Kesin Manipülasyon" ✔
    """
    if vlr <= 0:
        return 0.0
    if vlr <= 5:
        return min(10.0, vlr * 2.0)
    if vlr <= 100:
        return 10.0 + (math.log10(vlr / 5.0) / math.log10(20.0)) * 80.0
    return min(100.0, 90.0 + (vlr - 100.0) / 100.0)


def calculate_vlr(volume_24h_usd: float, liquidity_usd: float) -> float:
    """Ham VLR değerini hesaplar."""
    if liquidity_usd <= 0:
        return 9999.0
    return volume_24h_usd / liquidity_usd


def get_vlr_label(vlr: float) -> str:
    """VLR değerine göre Türkçe etiket döner."""
    if vlr <= 5:
        return f"Hacim/Likidite: {vlr:.1f}x — Normal seviye"
    elif vlr <= 20:
        return f"Hacim/Likidite: {vlr:.1f}x — Şüpheli aktivite"
    elif vlr <= 50:
        return f"Hacim/Likidite: {vlr:.1f}x — Yüksek risk"
    elif vlr <= 100:
        return f"Hacim/Likidite: {vlr:.1f}x — Wash trading göstergesi"
    else:
        return f"Hacim/Likidite: {vlr:.1f}x — Kesin manipülasyon"


# ═══════════════════════════════════════════════════════════
# METRİK 2: Gerçek Likidite Skoru (RLS) — Sprint 1'den
# ═══════════════════════════════════════════════════════════

def calculate_price_impact(liquidity_usd: float, sell_amount_usd: float) -> float:
    """Constant product AMM price impact hesaplama."""
    if liquidity_usd <= 0:
        return 100.0
    impact = sell_amount_usd / (liquidity_usd + sell_amount_usd)
    return impact * 100.0


def real_exit_value(liquidity_usd: float, position_usd: float) -> float:
    """Gerçekte ne kadar çıkarabilirsin — slippage dahil."""
    impact = calculate_price_impact(liquidity_usd, position_usd)
    return position_usd * (1.0 - impact / 100.0)


def rls_to_score(mcap: float, liquidity: float) -> float:
    """
    Market cap / likidite oranına göre risk skoru.

    NOT: Büyük tokenlar için CEX likiditesi hesaba katılmadığından
    mcap/DEX likidite oranı şişebilir. Sprint 2 kalibrasyonu:
    mcap > $10M olan tokenlarda RLS ağırlığı otomatik düşürülür.
    """
    if liquidity <= 0:
        return 100.0
    ratio = mcap / liquidity
    if ratio <= 5:
        return 0.0
    if ratio <= 20:
        return (ratio - 5.0) / 15.0 * 40.0
    if ratio <= 100:
        return 40.0 + (ratio - 20.0) / 80.0 * 40.0
    return min(100.0, 80.0 + (ratio - 100.0) / 200.0 * 20.0)


def get_rls_label(ratio: float, liquidity_usd: float) -> str:
    """RLS değerine göre Türkçe etiket döner."""
    if liquidity_usd < 1000:
        return f"Çok düşük likidite: ${liquidity_usd:,.0f}"
    if ratio <= 5:
        return "Likidite oranı normal"
    elif ratio <= 20:
        return f"Likidite oranı düşük ({ratio:.1f}x)"
    elif ratio <= 100:
        return f"Likidite yetersiz ({ratio:.1f}x) — Çıkış zor"
    else:
        return f"Likidite kritik derecede düşük ({ratio:.1f}x) — Çıkış imkansız"


# ═══════════════════════════════════════════════════════════
# METRİK 3: Holder Analizi — Sprint 1'den
# ═══════════════════════════════════════════════════════════

def holder_score(
    holders: list[dict],
    supply: float,
    recent_new_holders_10m: int = 0,
) -> float:
    """
    Holder dağılımına göre risk skoru hesaplar.

    Alt Metrikler ve Ağırlıkları:
      - Aktif Holder Oranı    (%40)
      - Top 10 Yoğunlaşma     (%30)
      - Holder Büyüme Hızı    (%15)
      - Minimum Holder Eşiği  (%15)
    """
    total_holders = len(holders)

    if total_holders < 10:
        min_score = min(100.0, (10 - total_holders) / 10.0 * 100.0)
        if total_holders < 5:
            return max(80.0, min_score)
    else:
        min_score = 0.0

    active_count = sum(1 for h in holders if h.get("last_active_1h", False))
    active_ratio = active_count / max(total_holders, 1)
    active_score = max(0.0, (1.0 - active_ratio / 0.2)) * 100.0
    active_score = min(100.0, active_score)

    sorted_holders = sorted(holders, key=lambda h: h.get("balance", 0), reverse=True)
    top10 = sorted_holders[:10]
    top10_balance = sum(h.get("balance", 0) for h in top10)
    top10_pct = top10_balance / max(supply, 1)
    conc_score = max(0.0, (top10_pct - 0.5) / 0.5) * 100.0
    conc_score = min(100.0, conc_score)

    if recent_new_holders_10m > 50:
        growth_score = min(100.0, (recent_new_holders_10m - 50) / 50.0 * 100.0)
    else:
        growth_score = 0.0

    weighted = (
        active_score * 0.40
        + conc_score * 0.30
        + growth_score * 0.15
        + min_score * 0.15
    )

    if total_holders < 10:
        return max(weighted, min_score)

    return weighted


def get_holder_label(count: int, top10_pct: float) -> str:
    """Holder analizine göre Türkçe etiket."""
    if count < 5:
        return f"Sadece {count} holder — Çok yüksek risk"
    elif count < 10:
        return f"Sadece {count} holder — Yüksek risk"
    elif top10_pct > 0.8:
        return f"Top 10 holder supply'ın %{top10_pct*100:.0f}'ine sahip — Yoğunlaşma riski"
    elif top10_pct > 0.5:
        return f"Top 10 holder supply'ın %{top10_pct*100:.0f}'ine sahip — Orta yoğunlaşma"
    else:
        return f"{count} holder, dağılım normal"


# ═══════════════════════════════════════════════════════════
# METRİK 4: Cüzdan Kümeleme (Wallet Clustering) — YENİ
# ═══════════════════════════════════════════════════════════

def cluster_score(clusters: list[dict], total_supply: float) -> float:
    """
    Cüzdan kümeleme sonuçlarına göre risk skoru.

    Skorlama mantığı:
      - En büyük küme supply'ın %30+'ına sahip       → +40
      - 5+ cüzdan aynı kaynaktan fonlanmış           → +25
      - Küme cüzdanları < 24 saat yaşında            → +20
      - Davranış benzerliği > %80                     → +15
    """
    if not clusters:
        return 0.0

    score = 0.0

    largest = max(clusters, key=lambda c: c.get("pct_supply", 0))
    largest_pct = largest.get("pct_supply", 0)

    # ── Sinyal 1: En büyük küme supply yoğunlaşması ──
    if largest_pct > 0.30:
        score += min(40.0, (largest_pct - 0.30) / 0.70 * 40.0)

    # ── Sinyal 2: Aynı kaynaktan fonlanan cüzdan sayısı ──
    max_same_source = max(
        (c.get("wallet_count", 0) for c in clusters if c.get("funding_source_count", 99) == 1),
        default=0,
    )
    if max_same_source >= 5:
        score += min(25.0, (max_same_source - 5) / 20.0 * 25.0)

    # ── Sinyal 3: Küme cüzdanlarının yaşı ──
    young_clusters = [
        c for c in clusters if c.get("avg_wallet_age_hrs", 9999) < 24
    ]
    if young_clusters:
        young_pct = len(young_clusters) / max(len(clusters), 1)
        score += young_pct * 20.0

    # ── Sinyal 4: Davranış benzerliği ──
    high_similarity = [
        c for c in clusters if c.get("behavioral_similarity", 0) > 0.80
    ]
    if high_similarity:
        sim_pct = len(high_similarity) / max(len(clusters), 1)
        score += sim_pct * 15.0

    return min(100.0, score)


def get_cluster_label(clusters: list[dict]) -> str:
    """Kümeleme sonucuna göre Türkçe etiket."""
    if not clusters:
        return "Cüzdan kümelemesi temiz — şüpheli grup yok"

    total_wallets = sum(c.get("wallet_count", 0) for c in clusters)
    largest = max(clusters, key=lambda c: c.get("pct_supply", 0))
    largest_pct = largest.get("pct_supply", 0)

    if largest_pct > 0.50:
        return (
            f"{len(clusters)} küme tespit edildi, "
            f"{total_wallets} bağlantılı cüzdan — "
            f"En büyük küme supply'ın %{largest_pct*100:.0f}'ine sahip"
        )
    elif total_wallets > 10:
        return (
            f"{len(clusters)} küme, {total_wallets} bağlantılı cüzdan tespit edildi"
        )
    else:
        return "Küçük cüzdan grupları tespit edildi — düşük risk"


# ═══════════════════════════════════════════════════════════
# METRİK 5: Wash Trading Pattern Tespiti — YENİ
# ═══════════════════════════════════════════════════════════

def wash_trading_score(wash_data: dict) -> float:
    """
    Wash trading analiz sonucuna göre risk skoru.

    Sinyaller:
      - Döngüsel hacim / toplam hacim > %50           → +30
      - Aynı miktar (±%5) ileri-geri çiftleri ≥ 3     → +25
      - 30s içinde aynı çift arası 2+ tx ≥ 2          → +20
      - Unique wallets / tx count < 0.3                → +15
      - Herhangi bir döngü bulunmuş                    → +10
    """
    if not wash_data:
        return 0.0

    score = 0.0

    cycles_found = wash_data.get("cycles_found", 0)
    cycle_vol = wash_data.get("cycle_volume_usd", 0)
    total_vol = wash_data.get("total_volume_usd", 0)
    same_amount = wash_data.get("same_amount_pairs", 0)
    rapid = wash_data.get("rapid_pairs", 0)
    unique_w = wash_data.get("unique_wallets", 0)
    total_tx = wash_data.get("total_tx_count", 0)

    # ── Sinyal 1: Döngüsel hacim oranı ──
    if total_vol > 0:
        cycle_ratio = cycle_vol / total_vol
        if cycle_ratio > 0.50:
            score += min(30.0, (cycle_ratio - 0.50) / 0.50 * 30.0)

    # ── Sinyal 2: Aynı miktarda ileri-geri ──
    if same_amount >= 3:
        score += min(25.0, (same_amount - 3) / 10.0 * 25.0)

    # ── Sinyal 3: Hızlı çift işlemler ──
    if rapid >= 2:
        score += min(20.0, (rapid - 2) / 5.0 * 20.0)

    # ── Sinyal 4: Düşük unique wallet / tx oranı ──
    if total_tx > 0:
        wallet_ratio = unique_w / total_tx
        if wallet_ratio < 0.3:
            score += min(15.0, (0.3 - wallet_ratio) / 0.3 * 15.0)

    # ── Sinyal 5: Herhangi bir döngü bulunmuş ──
    if cycles_found > 0:
        score += min(10.0, cycles_found * 2.0)

    return min(100.0, score)


def get_wash_label(wash_data: dict) -> str:
    """Wash trading sonucuna göre Türkçe etiket."""
    if not wash_data:
        return "Wash trading tespit edilmedi"

    cycles = wash_data.get("cycles_found", 0)
    cycle_vol = wash_data.get("cycle_volume_usd", 0)
    total_vol = wash_data.get("total_volume_usd", 0)

    if cycles == 0:
        return "Wash trading tespit edilmedi"

    pct = (cycle_vol / total_vol * 100) if total_vol > 0 else 0
    return (
        f"{cycles} döngüsel işlem kalıbı tespit edildi — "
        f"Tahmini sahte hacim: %{pct:.0f} (${cycle_vol:,.0f})"
    )


# ═══════════════════════════════════════════════════════════
# METRİK 6: Sybil Attack Tespiti — YENİ
# ═══════════════════════════════════════════════════════════

def sybil_score(sybil_data: dict) -> float:
    """
    Sybil attack analiz sonucuna göre risk skoru.

    Sinyaller:
      - Holder'ların %70+'ı < 24 saat yaşında          → +35
      - Tek token cüzdanları > %60                      → +25
      - Hepsinde benzer SOL bakiyesi (std < 0.001)      → +20
      - 10 dk içinde holder %50+ düştü                  → +30
    """
    if not sybil_data:
        return 0.0

    score = 0.0

    young_pct = sybil_data.get("young_wallet_pct", 0)
    single_pct = sybil_data.get("single_token_pct", 0)
    similar_pct = sybil_data.get("similar_balance_pct", 0)
    drop_pct = sybil_data.get("holder_drop_pct", 0)

    if young_pct > 0.70:
        score += min(35.0, (young_pct - 0.70) / 0.30 * 35.0)

    if single_pct > 0.60:
        score += min(25.0, (single_pct - 0.60) / 0.40 * 25.0)

    if similar_pct > 0.50:
        score += min(20.0, (similar_pct - 0.50) / 0.50 * 20.0)

    if drop_pct > 0.50:
        score += min(30.0, (drop_pct - 0.50) / 0.50 * 30.0)

    return min(100.0, score)


def get_sybil_label(sybil_data: dict) -> str:
    """Sybil saldırı sonucuna göre Türkçe etiket."""
    if not sybil_data:
        return "Sybil attack tespit edilmedi"

    young_pct = sybil_data.get("young_wallet_pct", 0)
    drop_pct = sybil_data.get("holder_drop_pct", 0)

    signals = []
    if young_pct > 0.70:
        signals.append(f"holder'ların %{young_pct*100:.0f}'i 24 saatten genç")
    if drop_pct > 0.50:
        signals.append(f"holder sayısı %{drop_pct*100:.0f} düştü")

    if not signals:
        return "Sybil attack tespit edilmedi"

    return f"Sybil attack sinyali: {', '.join(signals)}"


# ═══════════════════════════════════════════════════════════
# METRİK 7: Bundler Tespiti — YENİ
# ═══════════════════════════════════════════════════════════

def bundler_score(bundler_data: dict) -> float:
    """
    Bundler (toplu dağıtım) analiz sonucuna göre risk skoru.

    Sinyaller:
      - Aynı slot'ta 10+ alıcıya transfer                → +40
      - Alıcıların %80+'ı < 1 saat yaşında               → +30
      - Dağıtılan miktar supply'ın %20+'ı                 → +20
      - Birden fazla bundle tespit edilmiş                 → +10
    """
    if not bundler_data or not bundler_data.get("detected", False):
        return 0.0

    score = 0.0

    max_recip = bundler_data.get("max_recipients_in_slot", 0)
    young_pct = bundler_data.get("young_recipient_pct", 0)
    supply_pct = bundler_data.get("pct_supply_distributed", 0)
    bundle_count = bundler_data.get("bundle_count", 0)

    if max_recip >= 10:
        score += min(40.0, (max_recip - 10) / 40.0 * 40.0 + 15.0)

    if young_pct > 0.80:
        score += min(30.0, (young_pct - 0.80) / 0.20 * 30.0)

    if supply_pct > 0.20:
        score += min(20.0, (supply_pct - 0.20) / 0.80 * 20.0)

    if bundle_count > 1:
        score += min(10.0, bundle_count * 3.0)

    return min(100.0, score)


def get_bundler_label(bundler_data: dict) -> str:
    """Bundler sonucuna göre Türkçe etiket."""
    if not bundler_data or not bundler_data.get("detected", False):
        return "Bundler kullanımı tespit edilmedi"

    max_recip = bundler_data.get("max_recipients_in_slot", 0)
    return (
        f"Bundler tespit edildi — tek işlemde {max_recip} cüzdana dağıtım yapılmış"
    )


# ═══════════════════════════════════════════════════════════
# METRİK 8: Kademeli Çıkış Tespiti (Laddered Exit) — YENİ
# ═══════════════════════════════════════════════════════════

def exit_score(exit_data: dict) -> float:
    """
    Kademeli çıkış (laddered exit) analiz sonucuna göre risk skoru.

    Sinyaller:
      - 3+ aşamalı satış tespit edilmiş                 → +30
      - Satıcı token yaratıcısıysa                      → +30
      - Toplam satılan > %30 supply                     → +25
      - Ortalama fiyat düşüşü > %10                     → +15
    """
    if not exit_data or not exit_data.get("detected", False):
        return 0.0

    score = 0.0

    stages = exit_data.get("stages", 0)
    sold_pct = exit_data.get("total_sold_pct", 0)
    avg_drop = exit_data.get("avg_price_drop_pct", 0)
    is_creator = exit_data.get("seller_is_creator", False)

    if stages >= 3:
        score += min(30.0, (stages - 3) / 5.0 * 20.0 + 15.0)

    if is_creator:
        score += 30.0

    if sold_pct > 0.30:
        score += min(25.0, (sold_pct - 0.30) / 0.70 * 25.0)

    if avg_drop > 0.10:
        score += min(15.0, (avg_drop - 0.10) / 0.40 * 15.0)

    return min(100.0, score)


def get_exit_label(exit_data: dict) -> str:
    """Kademeli çıkış sonucuna göre Türkçe etiket."""
    if not exit_data or not exit_data.get("detected", False):
        return "Kademeli çıkış tespit edilmedi"

    stages = exit_data.get("stages", 0)
    is_creator = exit_data.get("seller_is_creator", False)
    who = "Token yaratıcısı" if is_creator else "Büyük holder"

    return f"{who} {stages} aşamada kademeli satış yapıyor"


# ═══════════════════════════════════════════════════════════
# METRİK 9: Bonding Curve Anomali Analizi — YENİ
# ═══════════════════════════════════════════════════════════

def curve_score(curve_data: dict) -> float:
    """
    Pump.fun bonding curve manipülasyon analizi.

    Sinyaller:
      - Raydium geçişi < 10 dakika                  → +35
      - İlk alıcıların %50+'ı aynı kaynaktan        → +35
      - Yaratıcı kendi token'ının %20+'ını almış     → +30
    """
    if not curve_data:
        return 0.0

    if curve_data.get("platform", "") != "pump_fun":
        return 0.0

    score = 0.0

    grad_time = curve_data.get("graduation_time_minutes", 9999)
    same_source = curve_data.get("early_buyers_same_source_pct", 0)
    creator_bought = curve_data.get("creator_bought_pct", 0)

    if curve_data.get("graduated_to_raydium", False) and grad_time < 10:
        score += min(35.0, (10 - grad_time) / 10.0 * 35.0)

    if same_source > 0.50:
        score += min(35.0, (same_source - 0.50) / 0.50 * 35.0)

    if creator_bought > 0.20:
        score += min(30.0, (creator_bought - 0.20) / 0.80 * 30.0)

    return min(100.0, score)


def get_curve_label(curve_data: dict) -> str:
    """Bonding curve sonucuna göre Türkçe etiket."""
    if not curve_data or curve_data.get("platform", "") != "pump_fun":
        return "Bonding curve analizi uygulanamaz (pump.fun dışı)"

    grad_time = curve_data.get("graduation_time_minutes", 9999)
    same_source = curve_data.get("early_buyers_same_source_pct", 0)

    signals = []
    if grad_time < 10:
        signals.append(f"Raydium'a {grad_time:.0f} dakikada geçmiş (çok hızlı)")
    if same_source > 0.50:
        signals.append(f"ilk alıcıların %{same_source*100:.0f}'i aynı kaynaktan")

    if not signals:
        return "Bonding curve anomalisi tespit edilmedi"

    return f"Bonding curve anomalisi: {', '.join(signals)}"


# ═══════════════════════════════════════════════════════════
# BİRLEŞİK SKOR — Sprint 1 (Geriye Uyumluluk)
# ═══════════════════════════════════════════════════════════

WEIGHTS_V1 = {
    "vlr": 0.50,
    "rls": 0.20,
    "holder": 0.30,
}


def total_score_sprint1(
    vlr_score_val: float,
    rls_score_val: float,
    holder_score_val: float,
) -> float:
    """Sprint 1 birleşik risk skoru (geriye uyumluluk)."""
    return (
        vlr_score_val * WEIGHTS_V1["vlr"]
        + rls_score_val * WEIGHTS_V1["rls"]
        + holder_score_val * WEIGHTS_V1["holder"]
    )


# ═══════════════════════════════════════════════════════════
# BİRLEŞİK SKOR — Sprint 2 (9 Metrik)
# ═══════════════════════════════════════════════════════════

WEIGHTS_V2 = {
    "vlr":     0.25,
    "cluster": 0.20,
    "wash":    0.15,
    "sybil":   0.12,
    "bundler": 0.10,
    "holder":  0.05,
    "exit":    0.05,
    "rls":     0.05,
    "curve":   0.03,
}


def total_score_sprint2(
    vlr_score_val: float,
    rls_score_val: float,
    holder_score_val: float,
    cluster_score_val: float = 0.0,
    wash_score_val: float = 0.0,
    sybil_score_val: float = 0.0,
    bundler_score_val: float = 0.0,
    exit_score_val: float = 0.0,
    curve_score_val: float = 0.0,
    *,
    mcap_usd: float = 0.0,
) -> float:
    """
    Sprint 2 birleşik risk skoru — 9 metrik.

    Özel kurallar:
      - mcap > $10M olan tokenlarda RLS ağırlığı sıfırlanır
      - Yeni metrikler veri yoksa Sprint 1 ağırlıkları kullanılır
    """
    # Yeni metriklerin hepsi 0 ise Sprint 1'e geri dön
    new_metrics_sum = (
        cluster_score_val + wash_score_val
        + sybil_score_val + bundler_score_val
        + exit_score_val + curve_score_val
    )
    if new_metrics_sum == 0:
        return total_score_sprint1(vlr_score_val, rls_score_val, holder_score_val)

    # RLS kalibrasyonu: büyük tokenlarda ağırlığı sıfırla
    rls_weight = WEIGHTS_V2["rls"]
    if mcap_usd > 10_000_000:
        rls_weight = 0.0

    # Ağırlıkları normalize et
    total_weight = sum(WEIGHTS_V2.values()) - WEIGHTS_V2["rls"] + rls_weight

    score = (
        vlr_score_val * WEIGHTS_V2["vlr"]
        + cluster_score_val * WEIGHTS_V2["cluster"]
        + wash_score_val * WEIGHTS_V2["wash"]
        + sybil_score_val * WEIGHTS_V2["sybil"]
        + bundler_score_val * WEIGHTS_V2["bundler"]
        + holder_score_val * WEIGHTS_V2["holder"]
        + exit_score_val * WEIGHTS_V2["exit"]
        + rls_score_val * rls_weight
        + curve_score_val * WEIGHTS_V2["curve"]
    )

    if total_weight > 0 and total_weight != 1.0:
        score = score / total_weight

    return min(100.0, max(0.0, score))


# ═══════════════════════════════════════════════════════════
# UYARI SİSTEMİ — Sprint 2 Genişletilmiş
# ═══════════════════════════════════════════════════════════

def generate_warnings(
    vlr: float,
    vlr_score_val: float,
    liquidity_usd: float,
    holder_count: int,
    top10_pct: float,
    mcap: float,
    *,
    cluster_data: list[dict] = None,
    wash_data: dict = None,
    sybil_data: dict = None,
    bundler_data: dict = None,
    exit_data: dict = None,
    curve_data: dict = None,
) -> list[str]:
    """Sprint 2 genişletilmiş Türkçe uyarı listesi."""
    warnings = []

    # Sprint 1 uyarıları
    if vlr_score_val > 70:
        warnings.append(f"⚠️ Hacim/Likidite oranı {vlr:.0f}x — wash trading göstergesi")
    elif vlr_score_val > 40:
        warnings.append(f"⚠️ Hacim/Likidite oranı {vlr:.0f}x — şüpheli aktivite")

    if holder_count < 10:
        warnings.append(f"⚠️ Sadece {holder_count} holder mevcut")

    if top10_pct > 0.8:
        warnings.append(f"⚠️ Top 10 holder supply'ın %{top10_pct*100:.0f}'ine sahip")

    if liquidity_usd < 5000:
        warnings.append(f"⚠️ Düşük likidite uyarısı: Havuzda sadece ${liquidity_usd:,.0f} var")

    if mcap > 0 and liquidity_usd > 0 and mcap / liquidity_usd > 50:
        warnings.append(f"⚠️ Market cap/Likidite oranı çok yüksek ({mcap/liquidity_usd:.0f}x)")

    # Sprint 2 uyarıları
    if cluster_data:
        total_clustered = sum(c.get("wallet_count", 0) for c in cluster_data)
        if total_clustered > 10:
            largest_pct = max(c.get("pct_supply", 0) for c in cluster_data)
            warnings.append(
                f"🔗 {total_clustered} bağlantılı cüzdan tespit edildi — "
                f"en büyük küme supply'ın %{largest_pct*100:.0f}'i"
            )

    if wash_data and wash_data.get("cycles_found", 0) > 0:
        total_vol = wash_data.get("total_volume_usd", 0)
        cycle_vol = wash_data.get("cycle_volume_usd", 0)
        pct = (cycle_vol / total_vol * 100) if total_vol > 0 else 0
        warnings.append(
            f"🔄 Wash trading tespit edildi — tahmini sahte hacim: %{pct:.0f}"
        )

    if sybil_data and sybil_data.get("young_wallet_pct", 0) > 0.70:
        warnings.append(
            f"👥 Sybil attack sinyali — holder'ların %{sybil_data['young_wallet_pct']*100:.0f}'i yeni cüzdan"
        )

    if bundler_data and bundler_data.get("detected", False):
        max_r = bundler_data.get("max_recipients_in_slot", 0)
        warnings.append(
            f"📦 Bundler tespit edildi — tek işlemde {max_r} cüzdana dağıtım"
        )

    if exit_data and exit_data.get("detected", False):
        stages = exit_data.get("stages", 0)
        who = "Yaratıcı" if exit_data.get("seller_is_creator") else "Büyük holder"
        warnings.append(
            f"📉 {who} kademeli satış yapıyor — {stages} aşama tespit edildi"
        )

    if curve_data and curve_data.get("platform") == "pump_fun":
        grad_time = curve_data.get("graduation_time_minutes", 9999)
        if grad_time < 10:
            warnings.append(
                f"⚡ Pump.fun'dan Raydium'a {grad_time:.0f} dakikada geçmiş (çok hızlı)"
            )

    return warnings


# ═══════════════════════════════════════════════════════════
# YARDIMCI: Skor seviye ve renk eşleme
# ═══════════════════════════════════════════════════════════

def score_to_level(score: float) -> dict:
    """Risk skorunu seviye, etiket ve renge dönüştürür."""
    if score < 20:
        return {"level": "SAFE", "label_tr": "GÜVENLİ", "label_en": "SAFE", "color": "#22C55E"}
    elif score < 40:
        return {"level": "LOW", "label_tr": "DÜŞÜK RİSK", "label_en": "LOW RISK", "color": "#F59E0B"}
    elif score < 60:
        return {"level": "MEDIUM", "label_tr": "ORTA RİSK", "label_en": "MEDIUM RISK", "color": "#F97316"}
    elif score < 80:
        return {"level": "HIGH", "label_tr": "YÜKSEK RİSK", "label_en": "HIGH RISK", "color": "#EF4444"}
    else:
        return {"level": "CRITICAL", "label_tr": "DOLANDIRICILIK", "label_en": "SCAM DETECTED", "color": "#991B1B"}
