"""
ChainGuard — Cüzdan Kümeleme Analiz Motoru (Wallet Cluster Analyzer)

Sprint 2 — Metrik 4

Pipeline'dan gelen transaction ve holder verilerini alarak:
  1. Funding graph oluşturur (kim kimi fonladı)
  2. Timing analizi yapar (aynı anda oluşturulan cüzdanlar)
  3. Davranış benzerliği hesaplar
  4. Connected components bulur → kümeler
  5. cluster_score() fonksiyonuna beslenecek veri üretir

Bağımlılık: networkx (pip install networkx)
Fallback: networkx yoksa basit union-find ile çalışır
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from collections import defaultdict

logger = logging.getLogger(__name__)

# networkx opsiyonel — yoksa basit fallback
try:
    import networkx as nx
    HAS_NETWORKX = True
except ImportError:
    HAS_NETWORKX = False
    logger.warning("networkx bulunamadı — basit kümeleme kullanılacak")


class ClusterAnalyzer:
    """
    Cüzdan kümeleme motoru.

    Pipeline'dan gelen veriyi analiz ederek aynı kişiye ait
    cüzdan gruplarını tespit eder.
    """

    def __init__(self):
        pass

    def analyze(
        self,
        holders: list[dict],
        transactions: list[dict],
        token_address: str,
        creator_wallet: str = "",
    ) -> list[dict]:
        """
        Ana analiz fonksiyonu.

        Args:
            holders: Pipeline'dan gelen holder listesi
            transactions: Pipeline'dan gelen parsed transaction listesi
            token_address: Analiz edilen token adresi
            creator_wallet: Token yaratıcısının cüzdan adresi

        Returns:
            cluster_score() fonksiyonuna beslenecek cluster listesi
        """
        if not transactions and not holders:
            return []

        # Adım 1: Cüzdan ve transfer verisi çıkar
        wallet_data = self._extract_wallet_data(holders, transactions, token_address)

        if len(wallet_data) < 3:
            return []

        # Adım 2: Funding graph oluştur
        funding_edges = self._build_funding_graph(transactions)

        # Adım 3: Timing grupları oluştur
        timing_edges = self._build_timing_edges(wallet_data)

        # Adım 4: Davranış benzerliği
        behavior_edges = self._build_behavior_edges(wallet_data, transactions, token_address)

        # Adım 5: Tüm edge'leri birleştir ve kümeleri bul
        all_edges = funding_edges + timing_edges + behavior_edges

        if not all_edges:
            return []

        clusters = self._find_clusters(all_edges, wallet_data, creator_wallet)

        logger.info(
            f"Cluster analizi: {len(clusters)} küme bulundu, "
            f"toplam {sum(c['wallet_count'] for c in clusters)} bağlantılı cüzdan"
        )

        return clusters

    def _extract_wallet_data(
        self,
        holders: list[dict],
        transactions: list[dict],
        token_address: str,
    ) -> dict[str, dict]:
        """Holder ve transaction verilerinden cüzdan profilleri çıkarır."""
        wallets: dict[str, dict] = {}

        # Holder verilerinden başla
        for h in holders:
            if h.get("_placeholder"):
                continue
            addr = h.get("address", "")
            if not addr:
                continue
            wallets[addr] = {
                "balance": h.get("balance", 0),
                "pct_supply": h.get("pct_supply", 0) / 100.0,
                "first_seen": None,
                "tx_count": 0,
                "tx_amounts": [],
                "tx_timestamps": [],
                "funded_by": None,
            }

        # Transaction verilerinden zenginleştir
        for tx in transactions:
            ts = tx.get("timestamp", 0)

            for nt in tx.get("native_transfers", []):
                from_w = nt.get("fromUserAccount", "")
                to_w = nt.get("toUserAccount", "")
                amount = nt.get("amount", 0)

                for w in [from_w, to_w]:
                    if w and w not in wallets:
                        wallets[w] = {
                            "balance": 0, "pct_supply": 0,
                            "first_seen": ts, "tx_count": 0,
                            "tx_amounts": [], "tx_timestamps": [],
                            "funded_by": None,
                        }

                if from_w and to_w:
                    wallets[to_w]["tx_count"] += 1
                    wallets[to_w]["tx_amounts"].append(amount)
                    wallets[to_w]["tx_timestamps"].append(ts)

                    if wallets[to_w]["funded_by"] is None and amount > 0:
                        wallets[to_w]["funded_by"] = from_w

                    if wallets[to_w]["first_seen"] is None or (ts and ts < wallets[to_w]["first_seen"]):
                        wallets[to_w]["first_seen"] = ts

            for tt in tx.get("token_transfers", []):
                if tt.get("mint", "") != token_address:
                    continue
                from_w = tt.get("fromUserAccount", "")
                to_w = tt.get("toUserAccount", "")

                for w in [from_w, to_w]:
                    if w and w not in wallets:
                        wallets[w] = {
                            "balance": 0, "pct_supply": 0,
                            "first_seen": ts, "tx_count": 0,
                            "tx_amounts": [], "tx_timestamps": [],
                            "funded_by": None,
                        }
                    if w:
                        wallets[w]["tx_count"] += 1
                        wallets[w]["tx_timestamps"].append(ts)

        return wallets

    def _build_funding_graph(self, transactions: list[dict]) -> list[tuple[str, str, float]]:
        """Aynı cüzdandan fonlanan cüzdanları birbirine bağlar."""
        funding_map: dict[str, list[str]] = defaultdict(list)

        for tx in transactions:
            for nt in tx.get("native_transfers", []):
                from_w = nt.get("fromUserAccount", "")
                to_w = nt.get("toUserAccount", "")
                amount = nt.get("amount", 0)

                if from_w and to_w and 0 < amount < 50_000_000:
                    funding_map[from_w].append(to_w)

        edges = []
        for source, targets in funding_map.items():
            if len(targets) >= 2:
                for i in range(len(targets)):
                    for j in range(i + 1, len(targets)):
                        edges.append((targets[i], targets[j], 0.8))

        return edges

    def _build_timing_edges(self, wallet_data: dict[str, dict]) -> list[tuple[str, str, float]]:
        """Aynı zaman diliminde (5 dakika) oluşturulan cüzdanları bağlar."""
        edges = []
        wallets_with_time = [
            (addr, data["first_seen"])
            for addr, data in wallet_data.items()
            if data.get("first_seen") and data["first_seen"] > 0
        ]

        if len(wallets_with_time) < 2:
            return edges

        wallets_with_time.sort(key=lambda x: x[1])

        WINDOW = 300
        i = 0
        while i < len(wallets_with_time):
            group = [wallets_with_time[i]]
            j = i + 1
            while j < len(wallets_with_time) and (wallets_with_time[j][1] - wallets_with_time[i][1]) <= WINDOW:
                group.append(wallets_with_time[j])
                j += 1

            if len(group) >= 5:
                addrs = [g[0] for g in group]
                for a in range(len(addrs)):
                    for b in range(a + 1, min(a + 10, len(addrs))):
                        edges.append((addrs[a], addrs[b], 0.6))

            i = j if j > i + 1 else i + 1

        return edges

    def _build_behavior_edges(
        self,
        wallet_data: dict[str, dict],
        transactions: list[dict],
        token_address: str,
    ) -> list[tuple[str, str, float]]:
        """Benzer davranış gösteren cüzdanları bağlar."""
        edges = []

        wallet_token_amounts: dict[str, list[float]] = defaultdict(list)
        for tx in transactions:
            for tt in tx.get("token_transfers", []):
                if tt.get("mint", "") != token_address:
                    continue
                to_w = tt.get("toUserAccount", "")
                amount = float(tt.get("tokenAmount", 0))
                if to_w and amount > 0:
                    wallet_token_amounts[to_w].append(amount)

        wallets_list = list(wallet_token_amounts.items())
        for i in range(len(wallets_list)):
            for j in range(i + 1, min(i + 50, len(wallets_list))):
                addr_a, amounts_a = wallets_list[i]
                addr_b, amounts_b = wallets_list[j]

                if not amounts_a or not amounts_b:
                    continue

                avg_a = sum(amounts_a) / len(amounts_a)
                avg_b = sum(amounts_b) / len(amounts_b)

                if avg_a == 0 or avg_b == 0:
                    continue

                similarity = min(avg_a, avg_b) / max(avg_a, avg_b)

                if similarity > 0.95:
                    edges.append((addr_a, addr_b, similarity))

        return edges

    def _find_clusters(
        self,
        edges: list[tuple[str, str, float]],
        wallet_data: dict[str, dict],
        creator_wallet: str = "",
    ) -> list[dict]:
        """Edge'lerden connected components bulur."""
        if HAS_NETWORKX:
            return self._find_clusters_nx(edges, wallet_data, creator_wallet)
        else:
            return self._find_clusters_simple(edges, wallet_data, creator_wallet)

    def _find_clusters_nx(self, edges, wallet_data, creator_wallet) -> list[dict]:
        """networkx ile kümeleme."""
        G = nx.Graph()
        for a, b, w in edges:
            if G.has_edge(a, b):
                G[a][b]["weight"] = max(G[a][b]["weight"], w)
            else:
                G.add_edge(a, b, weight=w)

        clusters = []
        for i, component in enumerate(nx.connected_components(G)):
            if len(component) < 3:
                continue

            wallets = list(component)
            cluster = self._build_cluster_data(
                cluster_id=f"cluster_{i}",
                wallets=wallets,
                wallet_data=wallet_data,
                edges=[(a, b, w) for a, b, w in edges if a in component and b in component],
                creator_wallet=creator_wallet,
            )
            clusters.append(cluster)

        clusters.sort(key=lambda c: c["pct_supply"], reverse=True)
        return clusters

    def _find_clusters_simple(self, edges, wallet_data, creator_wallet) -> list[dict]:
        """Union-find ile basit kümeleme (networkx yoksa)."""
        parent: dict[str, str] = {}

        def find(x):
            if x not in parent:
                parent[x] = x
            if parent[x] != x:
                parent[x] = find(parent[x])
            return parent[x]

        def union(x, y):
            px, py = find(x), find(y)
            if px != py:
                parent[px] = py

        for a, b, _ in edges:
            union(a, b)

        groups: dict[str, list[str]] = defaultdict(list)
        for node in parent:
            root = find(node)
            groups[root].append(node)

        clusters = []
        for i, (root, wallets) in enumerate(groups.items()):
            if len(wallets) < 3:
                continue

            cluster = self._build_cluster_data(
                cluster_id=f"cluster_{i}",
                wallets=wallets,
                wallet_data=wallet_data,
                edges=[(a, b, w) for a, b, w in edges if a in wallets and b in wallets],
                creator_wallet=creator_wallet,
            )
            clusters.append(cluster)

        clusters.sort(key=lambda c: c["pct_supply"], reverse=True)
        return clusters

    def _build_cluster_data(self, cluster_id, wallets, wallet_data, edges, creator_wallet) -> dict:
        """Tek bir küme için detaylı veri üretir."""
        total_supply_pct = 0.0
        ages_hrs = []
        funding_sources = set()
        similarities = []

        now_ts = int(datetime.now(timezone.utc).timestamp())

        for w in wallets:
            wd = wallet_data.get(w, {})
            total_supply_pct += wd.get("pct_supply", 0)

            first_seen = wd.get("first_seen")
            if first_seen and first_seen > 0:
                age_hrs = (now_ts - first_seen) / 3600.0
                ages_hrs.append(age_hrs)

            funded_by = wd.get("funded_by")
            if funded_by:
                funding_sources.add(funded_by)

        for _, _, w in edges:
            similarities.append(w)

        avg_age = sum(ages_hrs) / len(ages_hrs) if ages_hrs else 9999
        avg_similarity = sum(similarities) / len(similarities) if similarities else 0
        funding_count = len(funding_sources)

        root = wallets[0]
        if creator_wallet and creator_wallet in wallets:
            root = creator_wallet
        elif ages_hrs:
            oldest_idx = ages_hrs.index(max(ages_hrs))
            if oldest_idx < len(wallets):
                root = wallets[oldest_idx]

        return {
            "cluster_id": cluster_id,
            "wallet_count": len(wallets),
            "wallets": wallets[:50],
            "pct_supply": min(total_supply_pct, 1.0),
            "root_wallet": root,
            "funding_source_count": max(funding_count, 1),
            "avg_wallet_age_hrs": avg_age,
            "behavioral_similarity": min(avg_similarity, 1.0),
        }
