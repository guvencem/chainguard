"""
Taranoid — Sybil Attack ve Bundler Tespit Motoru

Sprint 2 — Metrik 6 (Sybil) + Metrik 7 (Bundler)

Sybil: Kısa sürede toplu oluşturulan sahte holder cüzdanlarını tespit eder.
Bundler: Tek slot'ta çok sayıda cüzdana yapılan token dağıtımlarını tespit eder.
"""

import logging
from collections import defaultdict
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


class SybilDetector:
    """Sybil attack tespit motoru."""

    def analyze(
        self,
        holders: list[dict],
        transactions: list[dict],
        token_address: str,
    ) -> dict:
        """
        Sybil attack sinyallerini analiz eder.

        Returns:
            sybil_score() fonksiyonuna beslenecek dict
        """
        if not holders or not transactions:
            return self._empty_result()

        real_holders = [h for h in holders if not h.get("_placeholder")]
        if len(real_holders) < 2:
            return self._empty_result()

        wallet_first_seen = self._get_wallet_ages(transactions, token_address)
        young_pct = self._calc_young_wallet_pct(real_holders, wallet_first_seen)

        single_pct = self._estimate_single_token_pct(real_holders, transactions, token_address)
        similar_pct = self._calc_similar_balance_pct(real_holders)
        drop_pct = self._estimate_holder_drop(transactions, token_address)

        result = {
            "young_wallet_pct": young_pct,
            "single_token_pct": single_pct,
            "similar_balance_pct": similar_pct,
            "holder_drop_pct": drop_pct,
            "holder_spike_10m": 0,
        }

        logger.info(
            f"Sybil analizi: young={young_pct:.1%}, "
            f"single_token={single_pct:.1%}, "
            f"similar_balance={similar_pct:.1%}, "
            f"drop={drop_pct:.1%}"
        )

        return result

    def _get_wallet_ages(
        self, transactions: list[dict], token_address: str
    ) -> dict[str, int]:
        """Her cüzdanın ilk görülme zamanını bulur."""
        first_seen: dict[str, int] = {}

        for tx in transactions:
            ts = tx.get("timestamp", 0)
            if not ts:
                continue

            for tt in tx.get("token_transfers", []):
                if tt.get("mint", "") != token_address:
                    continue
                for key in ["fromUserAccount", "toUserAccount"]:
                    w = tt.get(key, "")
                    if w and (w not in first_seen or ts < first_seen[w]):
                        first_seen[w] = ts

        return first_seen

    def _calc_young_wallet_pct(
        self,
        holders: list[dict],
        wallet_first_seen: dict[str, int],
    ) -> float:
        """Holder cüzdanlarının kaçının yaşı < 24 saat."""
        if not holders:
            return 0.0

        now_ts = int(datetime.now(timezone.utc).timestamp())
        young_count = 0
        known_count = 0

        for h in holders:
            addr = h.get("address", "")
            if addr in wallet_first_seen:
                known_count += 1
                age_hrs = (now_ts - wallet_first_seen[addr]) / 3600
                if age_hrs < 24:
                    young_count += 1

        if known_count == 0:
            return 0.0

        return young_count / known_count

    def _estimate_single_token_pct(
        self,
        holders: list[dict],
        transactions: list[dict],
        token_address: str,
    ) -> float:
        """Sadece bu token'a sahip olan cüzdanların oranını tahmin eder."""
        wallet_tx_count: dict[str, int] = defaultdict(int)

        for tx in transactions:
            for tt in tx.get("token_transfers", []):
                if tt.get("mint", "") != token_address:
                    continue
                to_w = tt.get("toUserAccount", "")
                if to_w:
                    wallet_tx_count[to_w] += 1

        if not wallet_tx_count:
            return 0.0

        single_count = sum(1 for count in wallet_tx_count.values() if count <= 2)
        return single_count / len(wallet_tx_count)

    def _calc_similar_balance_pct(self, holders: list[dict]) -> float:
        """Benzer bakiyeye sahip holder oranını hesaplar."""
        balances = [h.get("balance", 0) for h in holders if h.get("balance", 0) > 0]
        if len(balances) < 5:
            return 0.0

        groups: dict[int, int] = defaultdict(int)
        for b in balances:
            if b > 0:
                bucket = round(b, -len(str(int(b))) + 2)
                groups[bucket] += 1

        if not groups:
            return 0.0

        max_group = max(groups.values())
        return max_group / len(balances) if max_group >= 3 else 0.0

    def _estimate_holder_drop(
        self,
        transactions: list[dict],
        token_address: str,
    ) -> float:
        """Son periyotta holder sayısının düşüp düşmediğini tahmin eder."""
        recent_txs = sorted(
            [tx for tx in transactions if tx.get("timestamp", 0) > 0],
            key=lambda t: t["timestamp"],
            reverse=True,
        )[:20]

        if len(recent_txs) < 5:
            return 0.0

        sell_count = 0
        total_count = 0

        for tx in recent_txs:
            tx_type = tx.get("type", "").upper()
            desc = tx.get("description", "").lower()

            total_count += 1
            if "sell" in desc or "swap" in desc or tx_type in ["SWAP", "SELL"]:
                sell_count += 1

        if total_count == 0:
            return 0.0

        sell_ratio = sell_count / total_count
        return max(0.0, (sell_ratio - 0.5) * 2)

    def _empty_result(self) -> dict:
        return {
            "young_wallet_pct": 0.0,
            "single_token_pct": 0.0,
            "similar_balance_pct": 0.0,
            "holder_drop_pct": 0.0,
            "holder_spike_10m": 0,
        }


class BundlerDetector:
    """Bundler (toplu dağıtım) tespit motoru."""

    def analyze(
        self,
        transactions: list[dict],
        token_address: str,
        total_supply: float = 0,
    ) -> dict:
        """
        Bundler kullanımını tespit eder.

        Returns:
            bundler_score() fonksiyonuna beslenecek dict
        """
        if not transactions:
            return self._empty_result()

        slot_transfers = self._group_by_slot(transactions, token_address)

        if not slot_transfers:
            slot_transfers = self._group_by_timestamp(transactions, token_address)

        bundles = []
        for slot_key, transfers in slot_transfers.items():
            unique_recipients = set(t["to"] for t in transfers)
            if len(unique_recipients) >= 10:
                total_amount = sum(t["amount"] for t in transfers)
                bundles.append({
                    "slot": slot_key,
                    "recipients": len(unique_recipients),
                    "total_amount": total_amount,
                    "transfers": transfers[:20],
                })

        if not bundles:
            return self._empty_result()

        biggest = max(bundles, key=lambda b: b["recipients"])
        total_distributed = sum(b["total_amount"] for b in bundles)
        pct_supply = total_distributed / total_supply if total_supply > 0 else 0

        result = {
            "detected": True,
            "bundle_count": len(bundles),
            "max_recipients_in_slot": biggest["recipients"],
            "young_recipient_pct": 0.8,
            "total_distributed": total_distributed,
            "pct_supply_distributed": min(pct_supply, 1.0),
        }

        logger.info(
            f"Bundler tespit: {len(bundles)} bundle, "
            f"max {biggest['recipients']} alıcı/slot, "
            f"supply %{pct_supply*100:.1f} dağıtıldı"
        )

        return result

    def _group_by_slot(
        self, transactions: list[dict], token_address: str
    ) -> dict[int, list[dict]]:
        """Slot numarasına göre grupla."""
        slot_map: dict[int, list[dict]] = defaultdict(list)

        for tx in transactions:
            slot = tx.get("slot")
            if not slot:
                continue

            for tt in tx.get("token_transfers", []):
                if tt.get("mint", "") != token_address:
                    continue
                to_w = tt.get("toUserAccount", "")
                amount = float(tt.get("tokenAmount", 0))
                if to_w and amount > 0:
                    slot_map[slot].append({"to": to_w, "amount": amount})

        return dict(slot_map)

    def _group_by_timestamp(
        self, transactions: list[dict], token_address: str
    ) -> dict[int, list[dict]]:
        """Slot yoksa 1 saniyelik pencerede grupla."""
        ts_map: dict[int, list[dict]] = defaultdict(list)

        for tx in transactions:
            ts = tx.get("timestamp", 0)
            if not ts:
                continue

            for tt in tx.get("token_transfers", []):
                if tt.get("mint", "") != token_address:
                    continue
                to_w = tt.get("toUserAccount", "")
                amount = float(tt.get("tokenAmount", 0))
                if to_w and amount > 0:
                    ts_map[ts].append({"to": to_w, "amount": amount})

        return dict(ts_map)

    def _empty_result(self) -> dict:
        return {
            "detected": False,
            "bundle_count": 0,
            "max_recipients_in_slot": 0,
            "young_recipient_pct": 0.0,
            "total_distributed": 0,
            "pct_supply_distributed": 0.0,
        }
