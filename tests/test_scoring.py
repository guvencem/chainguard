"""
Taranoid — Skorlama Motoru Birim Testleri

9 metrik + birleşik skor + Sprint 4 özellikleri (EVM chain detection, report generator).
"""

import sys, os, pytest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "packages"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "api"))

from analyzer.scoring import (
    calculate_vlr, vlr_to_score, get_vlr_label,
    rls_to_score, get_rls_label, real_exit_value,
    holder_score, get_holder_label,
    cluster_score, get_cluster_label,
    wash_trading_score, get_wash_label,
    sybil_score, get_sybil_label,
    bundler_score, get_bundler_label,
    exit_score, get_exit_label,
    curve_score, get_curve_label,
    total_score_sprint2, generate_warnings, score_to_level,
)


# ── Yardımcı ────────────────────────────────────────────

def _holder(balance, active=False):
    return {"balance": balance, "last_active_1h": active}


# ═══════════════════════════════════════════════════════════
# METRİK 1: VLR
# ═══════════════════════════════════════════════════════════

class TestVLR:
    def test_safe(self):
        assert vlr_to_score(2.0) < 10

    def test_suspicious(self):
        assert 10 <= vlr_to_score(15.0) <= 50

    def test_high_risk(self):
        assert vlr_to_score(60.0) >= 60

    def test_pippinu(self):
        vlr = calculate_vlr(volume_24h_usd=3_617_000, liquidity_usd=10_000)
        assert vlr_to_score(vlr) >= 90

    def test_zero_liquidity(self):
        assert calculate_vlr(100_000, 0) == 9999.0

    def test_label_not_empty(self):
        assert get_vlr_label(400) != ""


# ═══════════════════════════════════════════════════════════
# METRİK 2: RLS
# ═══════════════════════════════════════════════════════════

class TestRLS:
    def test_good_liquidity(self):
        assert rls_to_score(mcap=1_000_000, liquidity=500_000) < 30

    def test_poor_liquidity(self):
        assert rls_to_score(mcap=10_000_000, liquidity=1_000) > 70

    def test_exit_value(self):
        val = real_exit_value(liquidity_usd=100_000, position_usd=10_000)
        assert 0 < val < 10_000


# ═══════════════════════════════════════════════════════════
# METRİK 3: Holder
# ═══════════════════════════════════════════════════════════

class TestHolder:
    def test_healthy(self):
        # 5000 holder, çoğu aktif, dengeli dağılım
        holders = [_holder(100, active=True) for _ in range(5000)]
        assert holder_score(holders, supply=500_000) < 40

    def test_few_holders(self):
        holders = [_holder(1000) for _ in range(2)]
        assert holder_score(holders, supply=2000) >= 70

    def test_label_not_empty(self):
        assert get_holder_label(count=10, top10_pct=0.9) != ""


# ═══════════════════════════════════════════════════════════
# METRİK 4: Cüzdan Kümeleme
# ═══════════════════════════════════════════════════════════

class TestCluster:
    def _c(self, n, pct, conf=0.9):
        return {"wallet_count": n, "pct_supply": pct, "confidence": conf,
                "avg_wallet_age_hrs": 1.0, "behavioral_similarity": 0.85}

    def test_no_clusters(self):
        assert cluster_score([], total_supply=1_000_000) == 0.0

    def test_cluster_increases_score(self):
        with_cluster = cluster_score([self._c(50, 0.35)], 1_000_000)
        assert with_cluster > 0

    def test_massive_cluster(self):
        assert cluster_score([self._c(380, 0.82)], 1_000_000) >= 50


# ═══════════════════════════════════════════════════════════
# METRİK 5: Wash Trading
# ═══════════════════════════════════════════════════════════

class TestWashTrading:
    def _safe(self):
        return {"cycles_found": 0, "cycle_volume_usd": 0, "total_volume_usd": 100_000,
                "same_amount_pairs": 0, "rapid_pairs": 0,
                "unique_wallets": 500, "total_tx_count": 600}

    def test_no_wash(self):
        assert wash_trading_score(self._safe()) == 0.0

    def test_cycles_increase_score(self):
        data = self._safe()
        data.update({"cycles_found": 5, "cycle_volume_usd": 70_000,
                     "same_amount_pairs": 5, "rapid_pairs": 3})
        assert wash_trading_score(data) > 0

    def test_empty_data(self):
        assert wash_trading_score({}) == 0.0


# ═══════════════════════════════════════════════════════════
# METRİK 6: Sybil
# ═══════════════════════════════════════════════════════════

class TestSybil:
    def test_no_sybil(self):
        data = {"young_wallet_pct": 0.1, "single_token_pct": 0.2,
                "similar_balance_pct": 0.1, "holder_drop_pct": 0.0}
        assert sybil_score(data) == 0.0

    def test_sybil_signals(self):
        data = {"young_wallet_pct": 0.85, "single_token_pct": 0.75,
                "similar_balance_pct": 0.80, "holder_drop_pct": 0.65}
        assert sybil_score(data) > 0


# ═══════════════════════════════════════════════════════════
# METRİK 7: Bundler
# ═══════════════════════════════════════════════════════════

class TestBundler:
    def test_not_detected(self):
        assert bundler_score({"detected": False}) == 0.0

    def test_detected(self):
        data = {"detected": True, "max_recipients_in_slot": 50,
                "young_recipient_pct": 0.9, "pct_supply_distributed": 0.4,
                "bundle_count": 3}
        assert bundler_score(data) > 0


# ═══════════════════════════════════════════════════════════
# METRİK 8: Exit (bug fix: stages list)
# ═══════════════════════════════════════════════════════════

class TestExit:
    def test_no_exit(self):
        assert exit_score({"detected": False}) == 0.0

    def test_creator_exit(self):
        data = {"detected": True, "stages": [1, 2, 3],
                "total_sold_pct": 0.5, "avg_price_drop_pct": 0.2,
                "seller_is_creator": True}
        assert exit_score(data) >= 30

    def test_stages_as_list(self):
        """Regression: stages list hatası düzeltildi."""
        data = {"detected": True,
                "stages": [{"drop": 0.15}, {"drop": 0.18}, {"drop": 0.20}],
                "total_sold_pct": 0.45, "avg_price_drop_pct": 0.18,
                "seller_is_creator": False}
        score = exit_score(data)
        assert isinstance(score, float)


# ═══════════════════════════════════════════════════════════
# METRİK 9: Curve (pump.fun spesifik)
# ═══════════════════════════════════════════════════════════

class TestCurve:
    def test_non_pump_fun(self):
        # platform pump_fun değilse 0 döner
        assert curve_score({"platform": "raydium"}) == 0.0

    def test_no_graduation(self):
        data = {"platform": "pump_fun", "graduated_to_raydium": False,
                "graduation_time_minutes": 9999,
                "early_buyers_same_source_pct": 0.1, "creator_bought_pct": 0.05}
        assert curve_score(data) == 0.0

    def test_fast_graduation(self):
        data = {"platform": "pump_fun", "graduated_to_raydium": True,
                "graduation_time_minutes": 3,
                "early_buyers_same_source_pct": 0.7, "creator_bought_pct": 0.3}
        assert curve_score(data) > 0


# ═══════════════════════════════════════════════════════════
# BİRLEŞİK SKOR
# ═══════════════════════════════════════════════════════════

class TestTotalScore:
    def test_all_zero(self):
        assert total_score_sprint2(0, 0, 0) == 0.0

    def test_all_max(self):
        assert total_score_sprint2(100, 100, 100, 100, 100, 100, 100, 100, 100) == 100.0

    def test_in_range(self):
        score = total_score_sprint2(50, 50, 50, 50, 50, 50, 50, 50, 50)
        assert 0 <= score <= 100

    def test_higher_vlr_higher_score(self):
        low  = total_score_sprint2(10, 10, 10)
        high = total_score_sprint2(90, 10, 10)
        assert high > low


# ═══════════════════════════════════════════════════════════
# SCORE_TO_LEVEL
# ═══════════════════════════════════════════════════════════

@pytest.mark.parametrize("score", [5, 25, 50, 70, 90])
def test_score_to_level(score):
    assert isinstance(score_to_level(score), dict)


# ═══════════════════════════════════════════════════════════
# WARNINGS
# ═══════════════════════════════════════════════════════════

class TestWarnings:
    def test_no_warnings_safe(self):
        w = generate_warnings(
            vlr=2.0, vlr_score_val=5, liquidity_usd=500_000,
            holder_count=5000, top10_pct=0.20, mcap=1_000_000,
        )
        assert len(w) == 0

    def test_warnings_risky(self):
        w = generate_warnings(
            vlr=300.0, vlr_score_val=95, liquidity_usd=1_000,
            holder_count=5, top10_pct=0.95, mcap=10_000_000,
        )
        assert len(w) >= 1


# ═══════════════════════════════════════════════════════════
# SPRINT 4: EVM Chain Detection
# ═══════════════════════════════════════════════════════════

class TestEVMChainDetection:
    def test_evm_address(self):
        from data_collector.evm_pipeline import detect_chain_from_address
        assert detect_chain_from_address("0xdAC17F958D2ee523a2206206994597C13D831ec7") != "solana"

    def test_solana_address(self):
        from data_collector.evm_pipeline import detect_chain_from_address
        assert detect_chain_from_address("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263") == "solana"

    def test_evm_regex(self):
        import re
        EVM_RE = re.compile(r"^0x[0-9a-fA-F]{40}$")
        assert EVM_RE.match("0xdAC17F958D2ee523a2206206994597C13D831ec7")
        assert not EVM_RE.match("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263")


# ═══════════════════════════════════════════════════════════
# SPRINT 4: Report Generator
# ═══════════════════════════════════════════════════════════

class TestReportGenerator:
    def _metrics(self, score=80):
        m = {k: {"score": score} for k in
             ["vlr", "rls", "holders", "cluster", "wash", "sybil", "bundler", "exit", "curve"]}
        m["vlr"]["value"] = 200.0
        m["holders"]["count"] = 50
        return m

    def test_risky_report(self):
        from report_generator import generate_report
        report = generate_report("TESTTOKEN", "TEST", 85, self._metrics(80))
        assert isinstance(report, str) and len(report) > 50

    def test_safe_report(self):
        from report_generator import generate_report
        m = self._metrics(5)
        m["vlr"]["value"] = 2.0
        m["holders"]["count"] = 5000
        report = generate_report("BONK", "BONK", 8, m)
        assert isinstance(report, str) and len(report) > 20
