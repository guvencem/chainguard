"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RiskGauge from "@/components/RiskGauge";
import MetricCard from "@/components/MetricCard";
import HolderChart from "@/components/HolderChart";
import { api, TokenAnalysis, APIError } from "@/lib/api";

/**
 * Token Analiz Sayfası — /token/[address]
 * Sprint 2: 9 metrik, açık tema, canlı renkler
 */

export default function TokenPage() {
    const params = useParams();
    const router = useRouter();
    const address = params.address as string;

    const [data, setData] = useState<TokenAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!address) return;

        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const result = await api.analyzeToken(address);
                setData(result);
            } catch (err) {
                if (err instanceof APIError) {
                    setError(err.message);
                } else {
                    setError("Analiz sırasında beklenmeyen bir hata oluştu.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [address]);

    // ── Loading ──
    if (loading) {
        return (
            <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
                <nav className="mb-8">
                    <button
                        onClick={() => router.push("/")}
                        className="text-sm flex items-center gap-2 hover:opacity-80 transition-opacity font-medium"
                        style={{ color: "var(--cg-accent)" }}
                    >
                        ← Ana Sayfa
                    </button>
                </nav>

                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative w-20 h-20 mb-6">
                        <div
                            className="absolute inset-0 rounded-full animate-spin-slow"
                            style={{
                                border: "3px solid var(--cg-surface)",
                                borderTopColor: "var(--cg-accent)",
                            }}
                        />
                        <div
                            className="absolute inset-2 rounded-full animate-spin-slow"
                            style={{
                                border: "3px solid var(--cg-surface)",
                                borderBottomColor: "var(--cg-coral)",
                                animationDirection: "reverse",
                                animationDuration: "2s",
                            }}
                        />
                    </div>
                    <p className="text-lg font-semibold" style={{ color: "var(--cg-text)" }}>
                        Token analiz ediliyor...
                    </p>
                    <p className="text-sm mt-2" style={{ color: "var(--cg-text-dim)" }}>
                        9 metrik hesaplanıyor, lütfen bekleyin ⚡
                    </p>
                </div>
            </main>
        );
    }

    // ── Error ──
    if (error || !data) {
        return (
            <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
                <nav className="mb-8">
                    <button
                        onClick={() => router.push("/")}
                        className="text-sm flex items-center gap-2 hover:opacity-80 transition-opacity font-medium"
                        style={{ color: "var(--cg-accent)" }}
                    >
                        ← Ana Sayfa
                    </button>
                </nav>
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-5xl mb-4">😔</div>
                    <p className="text-lg font-medium" style={{ color: "var(--cg-text)" }}>
                        {error || "Token bulunamadı."}
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="cta-button mt-6 px-6 py-3 text-sm"
                    >
                        Yeni Arama Yap
                    </button>
                </div>
            </main>
        );
    }

    const { token, score, metrics, warnings_tr } = data;

    // Sprint 2 metrik ağırlıkları
    const scoreBreakdown = [
        { label: "VLR (Hacim/Likidite)", weight: 25, score: metrics.vlr.score, color: "#7C3AED" },
        { label: "Cüzdan Kümeleme", weight: 20, score: metrics.cluster?.score ?? 0, color: "#EC4899" },
        { label: "Wash Trading", weight: 15, score: metrics.wash?.score ?? 0, color: "#FF6B6B" },
        { label: "Sybil Attack", weight: 12, score: metrics.sybil?.score ?? 0, color: "#F97316" },
        { label: "Bundler", weight: 10, score: metrics.bundler?.score ?? 0, color: "#FFB703" },
        { label: "Kademeli Çıkış", weight: 8, score: metrics.exit?.score ?? 0, color: "#06D6A0" },
        { label: "Holder Analizi", weight: 5, score: metrics.holders.score, color: "#3B82F6" },
        { label: "RLS (Gerçek Likidite)", weight: 5, score: metrics.rls.score, color: "#8B5CF6" },
    ];

    return (
        <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
            {/* Navbar */}
            <nav className="flex items-center justify-between mb-8">
                <button
                    onClick={() => router.push("/")}
                    className="text-sm flex items-center gap-2 hover:opacity-80 transition-opacity font-medium"
                    style={{ color: "var(--cg-accent)" }}
                >
                    ← Ana Sayfa
                </button>
                <div className="flex items-center gap-2">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--cg-gradient-cta)" }}
                    >
                        <span className="text-white font-bold text-[10px]">CG</span>
                    </div>
                    <span className="font-bold text-sm" style={{ color: "var(--cg-text)" }}>
                        ChainGuard
                    </span>
                </div>
            </nav>

            {/* Token Header */}
            <div className="glass-card p-6 mb-6 animate-slide-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold" style={{ color: "var(--cg-text)" }}>
                                {token.name || "Unknown Token"}
                            </h1>
                            {token.symbol && (
                                <span
                                    className="px-3 py-1 rounded-lg text-xs font-mono font-bold"
                                    style={{
                                        background: "var(--cg-accent-light)",
                                        color: "var(--cg-accent)",
                                    }}
                                >
                                    ${token.symbol}
                                </span>
                            )}
                            {token.platform && (
                                <span
                                    className="px-2 py-1 rounded-lg text-xs font-medium"
                                    style={{
                                        background: "var(--cg-surface)",
                                        color: "var(--cg-text-dim)",
                                    }}
                                >
                                    {token.platform}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <span
                                className="text-xs font-mono"
                                style={{ color: "var(--cg-text-dim)" }}
                            >
                                {address.slice(0, 8)}...{address.slice(-6)}
                            </span>
                            <a
                                href={`https://solscan.io/token/${address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium hover:underline"
                                style={{ color: "var(--cg-accent)" }}
                            >
                                Solscan ↗
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--cg-text-dim)" }}>
                        {data.cached && (
                            <span
                                className="px-2 py-1 rounded-full font-medium"
                                style={{ background: "var(--cg-surface)" }}
                            >
                                📦 Cache
                            </span>
                        )}
                        <span>{new Date(data.analyzed_at).toLocaleString("tr-TR")}</span>
                    </div>
                </div>
            </div>

            {/* Risk Gauge + Warnings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="glass-card p-8 flex items-center justify-center lg:col-span-1 animate-bounce-in">
                    <RiskGauge
                        score={score.total}
                        label={score.label_tr}
                        color={score.color}
                    />
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {/* Warnings */}
                    {warnings_tr.length > 0 && (
                        <div className="space-y-2">
                            {warnings_tr.map((w, i) => (
                                <div key={i} className="warning-banner animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                    ⚠️ {w}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Token Info */}
                    <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--cg-text)" }}>
                            📋 Token Bilgileri
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { label: "Supply", value: token.supply ? Number(token.supply).toLocaleString("tr-TR") : "—" },
                                { label: "Decimals", value: token.decimals?.toString() || "—" },
                                { label: "Platform", value: token.platform || "—" },
                                {
                                    label: "Yaratıcı",
                                    value: token.creator_wallet
                                        ? `${token.creator_wallet.slice(0, 6)}...${token.creator_wallet.slice(-4)}`
                                        : "—"
                                },
                                {
                                    label: "Oluşturma",
                                    value: token.created_at
                                        ? new Date(token.created_at).toLocaleDateString("tr-TR")
                                        : "—"
                                },
                                { label: "Risk Seviyesi", value: score.level },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="text-[10px] uppercase tracking-wider mb-1 font-semibold" style={{ color: "var(--cg-text-dim)" }}>
                                        {item.label}
                                    </div>
                                    <div className="text-sm font-medium font-mono" style={{ color: "var(--cg-text)" }}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Sprint 1 Metric Cards (3) ── */}
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--cg-text)" }}>
                📈 Temel Metrikler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <MetricCard
                    title="Hacim/Likidite (VLR)"
                    value={`${metrics.vlr.value}x`}
                    score={metrics.vlr.score}
                    label={metrics.vlr.label_tr}
                    icon={<span>📊</span>}
                    details={[
                        { label: "24s Hacim", value: `$${metrics.vlr.volume_24h.toLocaleString("tr-TR")}` },
                        { label: "Likidite", value: `$${metrics.vlr.liquidity.toLocaleString("tr-TR")}` },
                    ]}
                />
                <MetricCard
                    title="Gerçek Likidite (RLS)"
                    value={`${metrics.rls.value}x`}
                    score={metrics.rls.score}
                    label={metrics.rls.label_tr}
                    icon={<span>💧</span>}
                    details={[
                        { label: "Market Cap", value: `$${metrics.rls.mcap.toLocaleString("tr-TR")}` },
                        { label: "Gerçek Çıkış", value: `$${metrics.rls.real_exit_value.toLocaleString("tr-TR")}` },
                    ]}
                />
                <MetricCard
                    title="Holder Analizi"
                    value={
                        metrics.holders.count >= 1000000
                            ? `${(metrics.holders.count / 1000000).toFixed(1)}M`
                            : metrics.holders.count >= 1000
                                ? `${(metrics.holders.count / 1000).toFixed(0)}K+`
                                : metrics.holders.count.toString()
                    }
                    score={metrics.holders.score}
                    label={metrics.holders.label_tr}
                    icon={<span>👥</span>}
                    details={[
                        { label: "Aktif (1s)", value: metrics.holders.active_1h.toString() },
                        { label: "Top 10", value: `%${(metrics.holders.top10_concentration * 100).toFixed(1)}` },
                    ]}
                />
            </div>

            {/* ── Sprint 2 Metric Cards (6 new) ── */}
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--cg-text)" }}>
                🔬 Gelişmiş Analiz <span className="text-xs font-normal ml-2 px-2 py-1 rounded-full" style={{ background: "var(--cg-accent-light)", color: "var(--cg-accent)" }}>Sprint 2</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <MetricCard
                    title="Cüzdan Kümeleme"
                    value={`${metrics.cluster?.cluster_count ?? 0}`}
                    score={metrics.cluster?.score ?? 0}
                    label={metrics.cluster?.label_tr ?? "Veri bekleniyor"}
                    icon={<span>🔗</span>}
                    details={[
                        { label: "En Büyük Küme", value: `%${((metrics.cluster?.largest_pct ?? 0) * 100).toFixed(1)}` },
                        { label: "Bağlantılı Cüzdan", value: (metrics.cluster?.total_wallets ?? 0).toString() },
                    ]}
                />
                <MetricCard
                    title="Wash Trading"
                    value={`${metrics.wash?.cycles_found ?? 0}`}
                    score={metrics.wash?.score ?? 0}
                    label={metrics.wash?.label_tr ?? "Veri bekleniyor"}
                    icon={<span>🔄</span>}
                    details={[
                        { label: "Sahte Hacim", value: `%${((metrics.wash?.wash_volume_pct ?? 0) * 100).toFixed(1)}` },
                        { label: "Eş Miktar Çifti", value: (metrics.wash?.same_amount_pairs ?? 0).toString() },
                    ]}
                />
                <MetricCard
                    title="Sybil Attack"
                    value={`%${((metrics.sybil?.young_wallet_pct ?? 0) * 100).toFixed(0)}`}
                    score={metrics.sybil?.score ?? 0}
                    label={metrics.sybil?.label_tr ?? "Veri bekleniyor"}
                    icon={<span>🤖</span>}
                    details={[
                        { label: "Tek Token", value: `%${((metrics.sybil?.single_token_pct ?? 0) * 100).toFixed(0)}` },
                        { label: "Benzer Bakiye", value: `%${((metrics.sybil?.similar_balance_pct ?? 0) * 100).toFixed(0)}` },
                    ]}
                />
                <MetricCard
                    title="Bundler Tespiti"
                    value={metrics.bundler?.detected ? "EVET" : "Hayır"}
                    score={metrics.bundler?.score ?? 0}
                    label={metrics.bundler?.label_tr ?? "Veri bekleniyor"}
                    icon={<span>📦</span>}
                    details={[
                        { label: "Bundle Sayısı", value: (metrics.bundler?.bundle_count ?? 0).toString() },
                        { label: "Max Alıcı/Slot", value: (metrics.bundler?.max_recipients ?? 0).toString() },
                    ]}
                />
                <MetricCard
                    title="Kademeli Çıkış"
                    value={`${metrics.exit?.stages_detected ?? 0}`}
                    score={metrics.exit?.score ?? 0}
                    label={metrics.exit?.label_tr ?? "Pipeline verisi bekleniyor"}
                    icon={<span>📉</span>}
                    details={[
                        { label: "Çıkış Oranı", value: `%${((metrics.exit?.total_exit_pct ?? 0) * 100).toFixed(1)}` },
                    ]}
                />
                <MetricCard
                    title="Bonding Curve"
                    value={metrics.curve?.pump_speed_minutes ? `${metrics.curve.pump_speed_minutes}dk` : "—"}
                    score={metrics.curve?.score ?? 0}
                    label={metrics.curve?.label_tr ?? "Pump.fun verisi bekleniyor"}
                    icon={<span>📐</span>}
                    details={[
                        { label: "Insider Oranı", value: `%${((metrics.curve?.insider_pct ?? 0) * 100).toFixed(0)}` },
                    ]}
                />
            </div>

            {/* Holder Chart + Score Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <HolderChart
                    top10Concentration={metrics.holders.top10_concentration}
                    holderCount={metrics.holders.count}
                />

                {/* Score Breakdown */}
                <div className="glass-card p-5 animate-slide-up">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--cg-text)" }}>
                        ⚖️ Skor Dağılımı (Sprint 2 Ağırlıkları)
                    </h3>
                    <div className="space-y-3">
                        {scoreBreakdown.map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span style={{ color: "var(--cg-text-muted)" }}>
                                        {item.label}
                                        <span className="ml-1 font-mono" style={{ color: "var(--cg-text-dim)" }}>
                                            %{item.weight}
                                        </span>
                                    </span>
                                    <span className="font-mono font-bold" style={{ color: item.color }}>
                                        {Math.round(item.score)}
                                    </span>
                                </div>
                                <div className="score-bar">
                                    <div
                                        className="score-bar-fill animate-score-fill"
                                        style={{
                                            width: `${item.score}%`,
                                            background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
                                            boxShadow: `0 0 6px ${item.color}25`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        <div
                            className="pt-3 flex justify-between items-center"
                            style={{ borderTop: "1px solid var(--cg-border)" }}
                        >
                            <span className="text-sm font-semibold" style={{ color: "var(--cg-text)" }}>
                                Toplam Skor
                            </span>
                            <span
                                className="text-2xl font-bold"
                                style={{ color: score.color }}
                            >
                                {Math.round(score.total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Affiliate CTA */}
            {score.total > 50 && (
                <div
                    className="glass-card p-6 text-center mb-6 animate-slide-up"
                    style={{ borderColor: "var(--cg-teal)", borderWidth: "1px" }}
                >
                    <p className="text-sm mb-3 font-medium" style={{ color: "var(--cg-text-muted)" }}>
                        🛡️ Güvenli işlem için tanınmış borsaları tercih edin:
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        {["Binance", "OKX", "Bybit"].map((exchange) => (
                            <span
                                key={exchange}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:scale-105 hover:shadow-md"
                                style={{
                                    background: "var(--cg-bg-card-solid)",
                                    color: "var(--cg-accent)",
                                    border: "1px solid var(--cg-border)",
                                    boxShadow: "var(--cg-shadow-sm)",
                                }}
                            >
                                {exchange}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="text-center py-8">
                <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
                    ChainGuard analiz sonuçları yatırım tavsiyesi değildir. Kendi araştırmanızı yapın (DYOR).
                </p>
            </footer>
        </main>
    );
}
