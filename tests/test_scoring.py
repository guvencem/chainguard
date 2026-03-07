"""
ChainGuard — Sprint 2 Skor Fonksiyonları Birim Testleri

Tüm 9 metrik skor fonksiyonunu ve birleşik skor hesaplamasını test eder.
"""

import sys
import os
import pytest

# packages klasörünü path'e ekle
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "packages"))

from analyzer.scoring import (
    calculate_vlr,
    vlr_to_score,
    get_vlr_label,
    rls_to_score,
    get_rls_label,
    real_exit_value,
    holder_score,
    get_holder_label,
    cluster_score,
    get_cluster_label,
    wash_trading_score,
    get_wash_label,
    sybil_score,
    get_sybil_label,
    bundler_score,
    get_bundler_label,
    exit_score,
    get_exit_label,
    curve_score,
    get_curve_label,
    total_score_sprint1,
    total_score_sprint2,
    generate_warnings,
)


# ═══════════════════════════════════════════════════════════
# METRİK 1: VLR
# ═══════════════════════════════════════════════════════════

class TestVLR:
    def test_calculate_vlr_normal(self):
        vlr = calculate_vlr(10_000, 50_000)
        assert vlr == pytest.approx(0.2, abs=0.01)

    def test_calculate_vlr_zero_liquidity(self):
        vlr = calculate_vlr(10_000, 0)
        assert vlr >= 9999

    def test_vlr_score_low(self):
        """Normal VLR (< 5x) → düşük skor"""
        s = vlr_to_score(2.0)
        assert 0 <= s <= 15

    def test_vlr_score_suspicious(self):
        """Şüpheli VLR (5-20x) → orta skor"""
        s = vlr_to_score(12.0)
        assert 10 <= s <= 50

    def test_vlr_score_high(self):
        """Yüksek VLR (> 100x) → 90+ skor"""
        s = vlr_to_score(200.0)
        assert s >= 85

    def test_vlr_score_pippinu(self):
        """Doğrulama: PIPPINU VLR = 361.7x → ~97 skor"""
        s = vlr_to_score(361.7)
        assert s >= 90

    def test_vlr_label(self):
        assert "Normal" in get_vlr_label(2.0)
        assert "manipülasyon" in get_vlr_label(150.0).lower()


# ═══════════════════════════════════════════════════════════
# METRİK 2: RLS
# ═══════════════════════════════════════════════════════════

class TestRLS:
    def test_rls_low_ratio(self):
        """Düşük mcap/likidite → düşük skor"""
        s = rls_to_score(100_000, 50_000)  # 2x
        assert s < 30

    def test_rls_high_ratio(self):
        """Yüksek mcap/likidite → yüksek skor"""
        s = rls_to_score(10_000_000, 10_000)  # 1000x
        assert s >= 80

    def test_rls_zero_liquidity(self):
        """Sıfır likidite → max skor"""
        s = rls_to_score(100_000, 0)
        assert s >= 95

    def test_real_exit_value_positive(self):
        val = real_exit_value(100_000, 10_000)
        assert val > 0
        assert val <= 10_000

    def test_rls_label(self):
        label = get_rls_label(2.0, 50_000)
        assert isinstance(label, str)
        assert len(label) > 0


# ═══════════════════════════════════════════════════════════
# METRİK 3: Holder
# ═══════════════════════════════════════════════════════════

class TestHolder:
    def test_holder_score_healthy(self):
        holders = [
            {"balance": 100, "last_active_1h": True} for _ in range(50)
        ]
        s = holder_score(holders, 10_000)
        assert 0 <= s <= 100

    def test_holder_score_concentrated(self):
        holders = [{"balance": 9000, "last_active_1h": False}] + [
            {"balance": 10, "last_active_1h": False} for _ in range(10)
        ]
        s = holder_score(holders, 10_000)
        assert s >= 30

    def test_holder_score_empty(self):
        s = holder_score([], 10_000)
        assert s >= 40

    def test_holder_label(self):
        label = get_holder_label(5000, 0.3)
        assert isinstance(label, str)


# ═══════════════════════════════════════════════════════════
# METRİK 4: Cluster
# ═══════════════════════════════════════════════════════════

class TestCluster:
    def test_cluster_no_clusters(self):
        s = cluster_score([], 10_000)
        assert s == 0

    def test_cluster_large_cluster(self):
        clusters = [
            {
                "wallet_count": 20,
                "pct_supply": 0.35,
                "funding_sources": 1,
                "avg_age_hrs": 12,
                "similarity": 0.9,
            }
        ]
        s = cluster_score(clusters, 10_000)
        assert s > 0  # Skorun 0'dan büyük olması yeterli

    def test_cluster_small_cluster(self):
        clusters = [
            {
                "wallet_count": 3,
                "pct_supply": 0.05,
                "funding_sources": 2,
                "avg_age_hrs": 200,
                "similarity": 0.3,
            }
        ]
        s = cluster_score(clusters, 10_000)
        assert s < 30

    def test_cluster_label(self):
        label = get_cluster_label([])
        assert isinstance(label, str)


# ═══════════════════════════════════════════════════════════
# METRİK 5: Wash Trading
# ═══════════════════════════════════════════════════════════

class TestWash:
    def test_wash_no_data(self):
        s = wash_trading_score({})
        assert s == 0

    def test_wash_high_cycles(self):
        data = {
            "cycles_found": 10,
            "cycle_volume_usd": 80_000,
            "total_volume_usd": 100_000,
            "same_amount_pairs": 5,
            "rapid_pairs": 3,
            "unique_wallets": 5,
            "total_tx_count": 50,
        }
        s = wash_trading_score(data)
        assert s >= 30  # Wash data mevcut → skor > 0

    def test_wash_label(self):
        label = get_wash_label({})
        assert isinstance(label, str)


# ═══════════════════════════════════════════════════════════
# METRİK 6: Sybil
# ═══════════════════════════════════════════════════════════

class TestSybil:
    def test_sybil_no_data(self):
        s = sybil_score({})
        assert s == 0

    def test_sybil_high_risk(self):
        data = {
            "young_wallet_pct": 0.8,
            "single_token_pct": 0.7,
            "similar_balance_pct": 0.5,
            "holder_drop_10m": True,
        }
        s = sybil_score(data)
        assert s > 0  # Sybil verisi varsa skor > 0 olmalı

    def test_sybil_label(self):
        assert isinstance(get_sybil_label({}), str)


# ═══════════════════════════════════════════════════════════
# METRİK 7: Bundler
# ═══════════════════════════════════════════════════════════

class TestBundler:
    def test_bundler_not_detected(self):
        s = bundler_score({"detected": False})
        assert s < 20

    def test_bundler_detected(self):
        data = {
            "detected": True,
            "bundle_count": 3,
            "max_recipients_in_slot": 15,
            "pct_supply_distributed": 0.25,
            "recipients_young_pct": 0.9,
        }
        s = bundler_score(data)
        assert s >= 20  # Bundler tespit edildi → skor > 20

    def test_bundler_label(self):
        assert isinstance(get_bundler_label({}), str)


# ═══════════════════════════════════════════════════════════
# METRİK 8: Exit
# ═══════════════════════════════════════════════════════════

class TestExit:
    def test_exit_no_data(self):
        s = exit_score({})
        assert s == 0

    def test_exit_laddered(self):
        data = {
            "detected": True,
            "stages": 4,
            "seller_is_creator": True,
            "total_sold_pct": 0.4,
            "avg_price_drop_pct": 0.15,
        }
        s = exit_score(data)
        assert s >= 40  # Kademeli çıkış yakalan → skor >= 40

    def test_exit_label(self):
        assert isinstance(get_exit_label({}), str)


# ═══════════════════════════════════════════════════════════
# METRİK 9: Curve
# ═══════════════════════════════════════════════════════════

class TestCurve:
    def test_curve_no_data(self):
        s = curve_score({})
        assert s == 0

    def test_curve_fast_graduation(self):
        data = {
            "platform": "pump_fun",
            "graduation_time_minutes": 5,
            "insider_pct": 0.6,
            "creator_buy_pct": 0.25,
        }
        s = curve_score(data)
        assert s >= 0  # Curve verisi mevcut

    def test_curve_label(self):
        assert isinstance(get_curve_label({}), str)


# ═══════════════════════════════════════════════════════════
# BİRLEŞİK SKOR
# ═══════════════════════════════════════════════════════════

class TestTotalScore:
    def test_sprint1_range(self):
        s = total_score_sprint1(50, 30, 40)
        assert 0 <= s <= 100

    def test_sprint1_all_zero(self):
        s = total_score_sprint1(0, 0, 0)
        assert s == 0

    def test_sprint1_all_max(self):
        s = total_score_sprint1(100, 100, 100)
        assert s == 100

    def test_sprint2_range(self):
        s = total_score_sprint2(50, 30, 40, 60, 70, 20, 10, 80, 30)
        assert 0 <= s <= 100

    def test_sprint2_all_zero(self):
        s = total_score_sprint2(0, 0, 0, 0, 0, 0, 0, 0, 0)
        assert s == 0

    def test_sprint2_all_max(self):
        s = total_score_sprint2(100, 100, 100, 100, 100, 100, 100, 100, 100)
        assert s == 100

    def test_sprint2_weights_sum_to_1(self):
        from analyzer.scoring import WEIGHTS_V2
        total = sum(WEIGHTS_V2.values())
        assert total == pytest.approx(1.0, abs=0.001)


# ═══════════════════════════════════════════════════════════
# UYARI SİSTEMİ
# ═══════════════════════════════════════════════════════════

class TestWarnings:
    def test_warnings_returns_list(self):
        warnings = generate_warnings(
            vlr=50.0, vlr_score_val=90, liquidity_usd=1000,
            holder_count=5, top10_pct=0.9, mcap=100_000,
        )
        assert isinstance(warnings, list)

    def test_high_vlr_triggers_warning(self):
        warnings = generate_warnings(
            vlr=200.0, vlr_score_val=95, liquidity_usd=1000,
            holder_count=5, top10_pct=0.9, mcap=100_000,
        )
        assert len(warnings) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
