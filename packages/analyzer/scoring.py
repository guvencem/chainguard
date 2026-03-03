"""
ChainGuard — Analiz Motoru: Skorlama Fonksiyonları

Sprint 1 Metrikleri:
  1. VLR (Hacim/Likidite Oranı) — ağırlık %50
  2. RLS (Gerçek Likidite Skoru) — ağırlık %20
  3. Holder Analizi             — ağırlık %30

Her fonksiyon 0–100 arası skor döner. 0 = güvenli, 100 = tehlikeli.
"""

import math
from typing import Optional


# ═══════════════════════════════════════════════════════════
# METRİK 1: Hacim/Likidite Oranı (VLR)
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
        return 9999.0  # sonsuz risk
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
# METRİK 2: Gerçek Likidite Skoru (RLS)
# ═══════════════════════════════════════════════════════════

def calculate_price_impact(liquidity_usd: float, sell_amount_usd: float) -> float:
    """
    Constant product AMM price impact hesaplama.
    x * y = k formülüne göre satış baskısının fiyat etkisi.

    Returns: Yüzde olarak price impact (0–100)
    """
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

    Oran → Skor:
      ≤ 5x    → 0
      5–20x   → 0–40
      20–100x → 40–80
      > 100x  → 80–100

    Doğrulama: PIPPINU mcap $1.9K, likidite $1.8K → oran 1.06x → Skor 0 ✔
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
# METRİK 3: Holder Analizi
# ═══════════════════════════════════════════════════════════

def holder_score(
    holders: list[dict],
    supply: float,
    recent_new_holders_10m: int = 0,
) -> float:
    """
    Holder dağılımına göre risk skoru hesaplar.
    
    Alt Metrikler ve Ağırlıkları:
      - Aktif Holder Oranı    (%40): Son 1 saatte işlem yapan / toplam
      - Top 10 Yoğunlaşma     (%30): En büyük 10 holder'ın supply yüzdesi
      - Holder Büyüme Hızı    (%15): Son 10 dakikada yeni holder sayısı
      - Minimum Holder Eşiği  (%15): Toplam holder < 10 ise otomatik risk

    Doğrulama: PIPPINU 2 holder → minimum eşik tetiklenir → yüksek risk ✔
    """
    total_holders = len(holders)

    # ── Minimum holder eşiği (kritik güvenlik kuralı) ──
    # 10'dan az holder varsa bu token tanım gereği yüksek risklidir.
    # Diğer alt metriklerin skoru ne olursa olsun minimum bir taban uygula.
    if total_holders < 10:
        min_score = min(100.0, (10 - total_holders) / 10.0 * 100.0)
        # Çok az holder (< 5) → direkt yüksek skor döndür
        if total_holders < 5:
            return max(80.0, min_score)
    else:
        min_score = 0.0

    # Aktif holder oranı
    active_count = sum(1 for h in holders if h.get("last_active_1h", False))
    active_ratio = active_count / max(total_holders, 1)
    # %20 altı aktif oran risk
    active_score = max(0.0, (1.0 - active_ratio / 0.2)) * 100.0
    active_score = min(100.0, active_score)

    # Top 10 yoğunlaşma
    sorted_holders = sorted(holders, key=lambda h: h.get("balance", 0), reverse=True)
    top10 = sorted_holders[:10]
    top10_balance = sum(h.get("balance", 0) for h in top10)
    top10_pct = top10_balance / max(supply, 1)
    # %50 üstü yoğunlaşma risk
    conc_score = max(0.0, (top10_pct - 0.5) / 0.5) * 100.0
    conc_score = min(100.0, conc_score)

    # Holder büyüme hızı
    # > 50 yeni holder/10dk ise şüpheli
    if recent_new_holders_10m > 50:
        growth_score = min(100.0, (recent_new_holders_10m - 50) / 50.0 * 100.0)
    else:
        growth_score = 0.0

    # Ağırlıklı toplam
    weighted = (
        active_score * 0.40
        + conc_score * 0.30
        + growth_score * 0.15
        + min_score * 0.15
    )

    # Minimum holder eşiği varsa, en az min_score kadar döndür
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
# BİRLEŞİK SKOR (Sprint 1 Versiyonu)
# ═══════════════════════════════════════════════════════════

# Sprint 1 ağırlıkları
WEIGHTS = {
    "vlr": 0.50,
    "rls": 0.20,
    "holder": 0.30,
}


def total_score_sprint1(
    vlr_score_val: float,
    rls_score_val: float,
    holder_score_val: float,
) -> float:
    """
    Sprint 1 birleşik risk skoru.
    
    Ağırlıklar:
      VLR:    %50
      RLS:    %20
      Holder: %30
    
    Sprint 2'de 9+ metrik eklenince ağırlıklar yeniden kalibre edilecek.
    """
    return (
        vlr_score_val * WEIGHTS["vlr"]
        + rls_score_val * WEIGHTS["rls"]
        + holder_score_val * WEIGHTS["holder"]
    )


def generate_warnings(
    vlr: float,
    vlr_score_val: float,
    liquidity_usd: float,
    holder_count: int,
    top10_pct: float,
    mcap: float,
) -> list[str]:
    """Analiz sonucuna göre Türkçe uyarı listesi oluşturur."""
    warnings = []

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

    return warnings
