"""
Taranoid — Wash Trading Tespit Motoru

Sprint 2 — Metrik 5

Pipeline'dan gelen transaction verilerinden:
  1. Döngüsel işlemleri tespit eder (A→B→C→A)
  2. Aynı miktarda ileri-geri transferleri bulur
  3. Hızlı bot-like aktiviteyi algılar
  4. wash_trading_score() fonksiyonuna beslenecek veri üretir
"""

import logging
from collections import defaultdict
from typing import Optional

logger = logging.getLogger(__name__)


class WashDetector:
    """Wash trading tespit motoru."""

    AMOUNT_TOLERANCE = 0.05
    RAPID_WINDOW_SEC = 30
    MIN_CYCLE_LENGTH = 2
    MAX_CYCLE_LENGTH = 5

    def analyze(
        self,
        transactions: list[dict],
        token_address: str,
    ) -> dict:
        """
        Wash trading analizi yapar.

        Returns:
            wash_trading_score() fonksiyonuna beslenecek dict
        """
        if not transactions:
            return self._empty_result()

        transfers = self._extract_token_transfers(transactions, token_address)

        if len(transfers) < 3:
            return self._empty_result()

        total_volume = sum(t["amount"] for t in transfers)
        all_wallets = set()
        for t in transfers:
            all_wallets.add(t["from"])
            all_wallets.add(t["to"])
        all_wallets.discard("")

        cycles = self._detect_cycles(transfers)
        cycle_volume = sum(c["volume"] for c in cycles)

        same_amount = self._detect_same_amount_pairs(transfers)
        rapid = self._detect_rapid_pairs(transfers)

        result = {
            "cycles_found": len(cycles),
            "cycle_volume_usd": cycle_volume,
            "total_volume_usd": total_volume,
            "same_amount_pairs": same_amount,
            "rapid_pairs": rapid,
            "unique_wallets": len(all_wallets),
            "total_tx_count": len(transfers),
            "cycle_details": cycles[:10],
        }

        logger.info(
            f"Wash analizi: {len(cycles)} döngü, "
            f"{same_amount} aynı miktar çifti, "
            f"{rapid} hızlı çift, "
            f"unique wallet oranı: {len(all_wallets)}/{len(transfers)}"
        )

        return result

    def _extract_token_transfers(
        self, transactions: list[dict], token_address: str
    ) -> list[dict]:
        """Transaction listesinden token transferlerini çıkarır."""
        transfers = []

        for tx in transactions:
            ts = tx.get("timestamp", 0)
            sig = tx.get("signature", "")

            for tt in tx.get("token_transfers", []):
                mint = tt.get("mint", "")
                if mint != token_address:
                    continue

                from_w = tt.get("fromUserAccount", "")
                to_w = tt.get("toUserAccount", "")
                amount = float(tt.get("tokenAmount", 0))

                if from_w and to_w and amount > 0:
                    transfers.append({
                        "from": from_w,
                        "to": to_w,
                        "amount": amount,
                        "timestamp": ts,
                        "signature": sig,
                    })

        transfers.sort(key=lambda t: t["timestamp"])
        return transfers

    def _detect_cycles(self, transfers: list[dict]) -> list[dict]:
        """Döngüsel işlemleri tespit eder (A→B→C→A)."""
        graph: dict[str, list[dict]] = defaultdict(list)
        for t in transfers:
            graph[t["from"]].append({"to": t["to"], "amount": t["amount"], "ts": t["timestamp"]})

        cycles = []
        visited_cycles = set()

        nodes = list(graph.keys())[:100]

        for start in nodes:
            self._dfs_cycles(
                graph, start, start, [start], 0,
                cycles, visited_cycles,
                max_depth=self.MAX_CYCLE_LENGTH,
            )

            if len(cycles) >= 50:
                break

        return cycles

    def _dfs_cycles(
        self, graph, start, current, path, total_volume,
        cycles, visited, max_depth,
    ):
        """DFS ile döngü arama."""
        if len(path) > max_depth + 1:
            return

        for edge in graph.get(current, [])[:20]:
            next_node = edge["to"]
            amount = edge["amount"]

            if next_node == start and len(path) >= self.MIN_CYCLE_LENGTH + 1:
                cycle_key = tuple(sorted(path))
                if cycle_key not in visited:
                    visited.add(cycle_key)
                    cycles.append({
                        "wallets": list(path),
                        "length": len(path),
                        "volume": total_volume + amount,
                    })
                continue

            if next_node not in path:
                path.append(next_node)
                self._dfs_cycles(
                    graph, start, next_node, path,
                    total_volume + amount,
                    cycles, visited, max_depth,
                )
                path.pop()

    def _detect_same_amount_pairs(self, transfers: list[dict]) -> int:
        """Aynı miktarda (±%5) ileri-geri transfer yapan çiftleri sayar."""
        pair_transfers: dict[tuple, list[dict]] = defaultdict(list)

        for t in transfers:
            pair_key = tuple(sorted([t["from"], t["to"]]))
            pair_transfers[pair_key].append(t)

        same_count = 0
        for pair_key, txs in pair_transfers.items():
            if len(txs) < 2:
                continue

            amounts = [t["amount"] for t in txs]
            for i in range(len(amounts)):
                for j in range(i + 1, len(amounts)):
                    if amounts[i] == 0 or amounts[j] == 0:
                        continue
                    ratio = min(amounts[i], amounts[j]) / max(amounts[i], amounts[j])
                    if ratio >= (1.0 - self.AMOUNT_TOLERANCE):
                        same_count += 1
                        break

        return same_count

    def _detect_rapid_pairs(self, transfers: list[dict]) -> int:
        """30 saniye içinde aynı cüzdan çifti arasında 2+ işlem yapan çiftleri sayar."""
        pair_times: dict[tuple, list[int]] = defaultdict(list)

        for t in transfers:
            pair_key = tuple(sorted([t["from"], t["to"]]))
            pair_times[pair_key].append(t["timestamp"])

        rapid_count = 0
        for pair_key, times in pair_times.items():
            if len(times) < 2:
                continue

            times.sort()
            for i in range(len(times) - 1):
                if times[i + 1] - times[i] <= self.RAPID_WINDOW_SEC:
                    rapid_count += 1
                    break

        return rapid_count

    def _empty_result(self) -> dict:
        return {
            "cycles_found": 0,
            "cycle_volume_usd": 0,
            "total_volume_usd": 0,
            "same_amount_pairs": 0,
            "rapid_pairs": 0,
            "unique_wallets": 0,
            "total_tx_count": 0,
        }
