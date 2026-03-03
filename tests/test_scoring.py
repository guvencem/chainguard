"""
ChainGuard — Analiz Motoru Birim Testleri

Sprint 1 doğrulama veri seti:
  - PIPPINU: VLR 362x → skor 90+
  - BONK/WIF gibi güvenli tokenlar: skor < 25
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "packages"))

from analyzer.scoring import (
    vlr_to_score, calculate_vlr, get_vlr_label,
    rls_to_score, calculate_price_impact, real_exit_value,
    holder_score, get_holder_label,
    total_score_sprint1, generate_warnings,
)


# ═══════════════════════════════════════════════════════════
# VLR TESTLERİ
# ═══════════════════════════════════════════════════════════

class TestVLR:
    """Hacim/Likidite Oranı testleri."""

    def test_zero_vlr(self):
        assert vlr_to_score(0) == 0.0

    def test_low_vlr_normal(self):
        """VLR < 5 → skor 0-10 (Normal)"""
        score = vlr_to_score(3)
        assert 0 <= score <= 10

    def test_medium_vlr_suspicious(self):
        """VLR 5-20 → skor 10-40 (Şüpheli)"""
        score = vlr_to_score(10)
        assert 10 <= score <= 40

    def test_high_vlr_risky(self):
        """VLR 20-50 → skor 40-70 (Yüksek Risk)"""
        score = vlr_to_score(35)
        assert 40 <= score <= 70

    def test_very_high_vlr_wash(self):
        """VLR 50-100 → skor 70-90 (Wash Trading)"""
        score = vlr_to_score(75)
        assert 70 <= score <= 90

    def test_extreme_vlr_manipulation(self):
        """VLR > 100 → skor 90-100 (Kesin Manipülasyon)"""
        score = vlr_to_score(150)
        assert 90 <= score <= 100

    def test_pippinu_vlr(self):
        """PIPPINU doğrulama: VLR = 361.7 → skor 90+ ✔"""
        vlr = calculate_vlr(651000, 1800)
        assert abs(vlr - 361.67) < 1  # ≈ 362x
        score = vlr_to_score(vlr)
        assert score >= 90  # Kesin manipülasyon

    def test_bonk_like_normal(self):
        """Güvenli token: VLR = 2x → düşük skor"""
        vlr = calculate_vlr(10_000_000, 5_000_000)  # 2x
        score = vlr_to_score(vlr)
        assert score < 10

    def test_vlr_label_normal(self):
        label = get_vlr_label(3)
        assert "Normal" in label

    def test_vlr_label_manipulation(self):
        label = get_vlr_label(150)
        assert "manipülasyon" in label.lower()

    def test_vlr_zero_liquidity(self):
        """Sıfır likidite → maksimum VLR"""
        vlr = calculate_vlr(1000, 0)
        assert vlr == 9999.0

    def test_vlr_monotonic(self):
        """Skor monoton artmalı."""
        prev = 0
        for v in [1, 5, 10, 20, 50, 100, 500]:
            s = vlr_to_score(v)
            assert s >= prev
            prev = s


# ═══════════════════════════════════════════════════════════
# RLS TESTLERİ
# ═══════════════════════════════════════════════════════════

class TestRLS:
    """Gerçek Likidite Skoru testleri."""

    def test_pippinu_rls(self):
        """PIPPINU: mcap $1.9K, likidite $1.8K → oran 1.06x → skor 0 ✔"""
        score = rls_to_score(1900, 1800)
        assert score == 0  # oran < 5

    def test_zero_liquidity(self):
        assert rls_to_score(1000, 0) == 100.0

    def test_healthy_ratio(self):
        """Sağlıklı oran: mcap/liq < 5"""
        score = rls_to_score(10000, 5000)  # 2x
        assert score == 0

    def test_medium_ratio(self):
        """Orta oran: mcap/liq = 10x"""
        score = rls_to_score(100000, 10000)  # 10x
        assert 0 < score < 40

    def test_high_ratio(self):
        """Yüksek oran: mcap/liq = 50x"""
        score = rls_to_score(500000, 10000)  # 50x
        assert 40 < score < 80

    def test_extreme_ratio(self):
        """Çok yüksek oran: mcap/liq = 200x"""
        score = rls_to_score(2000000, 10000)  # 200x
        assert score > 80

    def test_price_impact(self):
        """$10K likidite, $1K satış → %9.1 impact"""
        impact = calculate_price_impact(10000, 1000)
        assert abs(impact - 9.09) < 0.1

    def test_real_exit(self):
        """$10K likidite, $5K pozisyon → gerçek değer < $5K"""
        val = real_exit_value(10000, 5000)
        assert val < 5000
        assert val > 0


# ═══════════════════════════════════════════════════════════
# HOLDER TESTLERİ
# ═══════════════════════════════════════════════════════════

class TestHolderScore:
    """Holder analizi testleri."""

    def test_pippinu_2_holders(self):
        """PIPPINU: 2 holder → minimum eşik tetiklenir → yüksek risk ✔"""
        holders = [
            {"balance": 500_000_000, "last_active_1h": True},
            {"balance": 499_900_000, "last_active_1h": True},
        ]
        score = holder_score(holders, supply=999_900_000)
        assert score > 50  # Yüksek risk

    def test_healthy_distribution(self):
        """20 holder, iyi dağılım → düşük risk."""
        holders = [
            {"balance": 100, "last_active_1h": True}
            for _ in range(20)
        ]
        score = holder_score(holders, supply=2000)
        assert score < 40

    def test_concentrated_holders(self):
        """1 holder supply'ın %90'ına sahip → yüksek risk."""
        holders = [
            {"balance": 9000, "last_active_1h": True},
            {"balance": 100, "last_active_1h": True},
            {"balance": 100, "last_active_1h": True},
        ] + [{"balance": 10, "last_active_1h": False} for _ in range(17)]
        score = holder_score(holders, supply=10000)
        assert score > 30

    def test_no_active_holders(self):
        """Hiç aktif holder yok → risk yüksek."""
        holders = [
            {"balance": 100, "last_active_1h": False}
            for _ in range(15)
        ]
        score = holder_score(holders, supply=1500)
        assert score > 30

    def test_rapid_growth(self):
        """50+ yeni holder/10dk → şüpheli büyüme."""
        holders = [{"balance": 100, "last_active_1h": True} for _ in range(100)]
        score = holder_score(holders, supply=10000, recent_new_holders_10m=80)
        assert score > 0  # growth_score katkısı var


# ═══════════════════════════════════════════════════════════
# BİRLEŞİK SKOR TESTLERİ
# ═══════════════════════════════════════════════════════════

class TestTotalScore:
    """Birleşik skor testleri."""

    def test_all_safe(self):
        """Tüm metrikler güvenli → düşük skor."""
        total = total_score_sprint1(5, 0, 10)
        assert total < 25

    def test_all_dangerous(self):
        """Tüm metrikler tehlikeli → yüksek skor."""
        total = total_score_sprint1(95, 90, 85)
        assert total > 80

    def test_weights_sum(self):
        """Ağırlıklar toplamı %100."""
        total = total_score_sprint1(100, 100, 100)
        assert abs(total - 100) < 0.01

    def test_pippinu_combined(self):
        """PIPPINU: VLR=97.6, RLS=0, Holder=85 → toplam 90+ olmalı"""
        total = total_score_sprint1(97.6, 0, 85)
        # 97.6*0.5 + 0*0.2 + 85*0.3 = 48.8 + 0 + 25.5 = 74.3
        assert total > 70

    def test_mixed_signals(self):
        """Biri yüksek, diğerleri düşük → orta skor."""
        total = total_score_sprint1(90, 10, 15)
        assert 30 < total < 60


# ═══════════════════════════════════════════════════════════
# UYARI TESTLERİ
# ═══════════════════════════════════════════════════════════

class TestWarnings:
    """Uyarı oluşturma testleri."""

    def test_pippinu_warnings(self):
        """PIPPINU tüm uyarıları tetiklemeli."""
        warnings = generate_warnings(
            vlr=362, vlr_score_val=97.6,
            liquidity_usd=1800, holder_count=2,
            top10_pct=1.0, mcap=1900,
        )
        assert len(warnings) >= 2
        assert any("wash trading" in w.lower() for w in warnings)
        assert any("holder" in w.lower() for w in warnings)

    def test_safe_token_no_warnings(self):
        """Güvenli token → uyarı yok."""
        warnings = generate_warnings(
            vlr=2, vlr_score_val=4,
            liquidity_usd=5_000_000, holder_count=10000,
            top10_pct=0.15, mcap=50_000_000,
        )
        assert len(warnings) == 0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
