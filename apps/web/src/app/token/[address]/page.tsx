"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RiskGauge from "@/components/RiskGauge";
import MetricCard from "@/components/MetricCard";
import HolderChart from "@/components/HolderChart";
import { api, TokenAnalysis, APIError } from "@/lib/api";

/**
 * Token Analiz Sayfası — /token/[address]
 *
 * 6 UI bileşeni:
 *  1. Risk Skoru Gauge
 *  2. Metrik Kartları (VLR, RLS, Holder)
 *  3. Token Bilgi Panosu
 *  4. Uyarı Listesi
 *  5. Holder Dağılım Grafiği
 *  6. Affiliate CTA (placeholder)
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

    // ── Loading State ──────────────────────────────────
    if (loading) {
        return (
            <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
                <nav className="mb-8">
                    <button
                        onClick={() => router.push("/")}
                        className="text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
                        style={{ color: "var(--cg-text-muted)" }}
                    >
                        ← Ana Sayfa
                    </button>
                </nav>

                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative w-24 h-24 mb-6">
                        <div
                            className="absolute inset-0 rounded-full animate-spin"
                            style={{
                                border: "3px solid var(--cg-surface)",
                                borderTopColor: "var(--cg-accent)",
                            }}
                        />
                    </div>
                    <p className="text-lg font-medium" style={{ color: "var(--cg-text)" }}>
                        Token analiz ediliyor...
                    </p>
                    <p className="text-sm mt-2" style={{ color: "var(--cg-text-dim)" }}>
                        Blockchain verisi toplanıyor, lütfen bekleyin.
                    </p>
                </div>
            </main>
        );
    }

    // ── Error State ────────────────────────────────────
    if (error || !data) {
        return (
            <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
                <nav className="mb-8">
                    <button
                        onClick={() => router.push("/")}
                        className="text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
                        style={{ color: "var(--cg-text-muted)" }}
                    >
                        ← Ana Sayfa
                    </button>
                </nav>

                <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-5xl mb-4">⚠️</div>
                    <p className="text-lg font-medium" style={{ color: "var(--cg-text)" }}>
                        {error || "Token bulunamadı."}
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-6 px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105"
                        style={{
                            background: "linear-gradient(135deg, var(--cg-accent), #C62828)",
                        }}
                    >
                        Yeni Arama Yap
                    </button>
                </div>
            </main>
        );
    }

    const { token, score, metrics, warnings_tr } = data;

    return (
        <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
            {/* ── Navbar ── */}
            <nav className="flex items-center justify-between mb-8">
                <button
                    onClick={() => router.push("/")}
                    className="text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
                    style={{ color: "var(--cg-text-muted)" }}
                >
                    ← Ana Sayfa
                </button>
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{
                            background: "linear-gradient(135deg, var(--cg-accent), var(--cg-green))",
                        }}
                    >
                        <span className="text-white font-bold text-[10px]">CG</span>
                    </div>
                    <span className="font-bold text-sm" style={{ color: "var(--cg-text)" }}>
                        ChainGuard
                    </span>
                </div>
            </nav>

            {/* ── Token Header ── */}
            <div className="glass-card p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold" style={{ color: "var(--cg-text)" }}>
                                {token.name || "Unknown Token"}
                            </h1>
                            {token.symbol && (
                                <span
                                    className="px-2 py-1 rounded-md text-xs font-mono font-bold"
                                    style={{
                                        background: "var(--cg-surface)",
                                        color: "var(--cg-text-muted)",
                                    }}
                                >
                                    ${token.symbol}
                                </span>
                            )}
                            {token.platform && (
                                <span
                                    className="px-2 py-1 rounded-md text-xs"
                                    style={{
                                        background: "var(--cg-surface)",
                                        color: "var(--cg-text-dim)",
                                    }}
                                >
                                    {token.platform}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
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
                                className="text-xs hover:underline"
                                style={{ color: "var(--cg-accent)" }}
                            >
                                Solscan ↗
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--cg-text-dim)" }}>
                        {data.cached && (
                            <span className="px-2 py-1 rounded-full" style={{ background: "var(--cg-surface)" }}>
                                📦 Cache
                            </span>
                        )}
                        <span>
                            {new Date(data.analyzed_at).toLocaleString("tr-TR")}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Risk Gauge + Warnings ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Gauge */}
                <div className="glass-card p-8 flex items-center justify-center lg:col-span-1">
                    <RiskGauge
                        score={score.total}
                        label={score.label_tr}
                        color={score.color}
                    />
                </div>

                {/* Warnings + Token Info */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Warnings */}
                    {warnings_tr.length > 0 && (
                        <div className="space-y-2">
                            {warnings_tr.map((w, i) => (
                                <div key={i} className="warning-banner">
                                    {w}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Token Info Grid */}
                    <div className="glass-card p-5">
                        <h3
                            className="text-sm font-semibold mb-3"
                            style={{ color: "var(--cg-text)" }}
                        >
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
                                    <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--cg-text-dim)" }}>
                                        {item.label}
                                    </div>
                                    <div className="text-sm font-medium font-mono" style={{ color: "var(--cg-text-muted)" }}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Metric Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* VLR */}
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

                {/* RLS */}
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

                {/* Holder */}
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
                        { label: "Top 10 Yoğunlaşma", value: `%${(metrics.holders.top10_concentration * 100).toFixed(1)}` },
                    ]}
                />
            </div>

            {/* ── Holder Chart ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <HolderChart
                    top10Concentration={metrics.holders.top10_concentration}
                    holderCount={metrics.holders.count}
                />

                {/* Score Breakdown */}
                <div className="glass-card p-5">
                    <h3
                        className="text-sm font-semibold mb-4"
                        style={{ color: "var(--cg-text)" }}
                    >
                        ⚖️ Skor Dağılımı (Sprint 1 Ağırlıkları)
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: "VLR (Hacim/Likidite)", weight: 50, score: metrics.vlr.score, color: "#E84142" },
                            { label: "Holder Analizi", weight: 30, score: metrics.holders.score, color: "#F59E0B" },
                            { label: "RLS (Gerçek Likidite)", weight: 20, score: metrics.rls.score, color: "#14F195" },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span style={{ color: "var(--cg-text-muted)" }}>
                                        {item.label}
                                        <span style={{ color: "var(--cg-text-dim)" }}> (%{item.weight})</span>
                                    </span>
                                    <span className="font-mono font-bold" style={{ color: item.color }}>
                                        {Math.round(item.score)}
                                    </span>
                                </div>
                                <div
                                    className="h-2 rounded-full overflow-hidden"
                                    style={{ background: "var(--cg-surface)" }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${item.score}%`,
                                            background: item.color,
                                            boxShadow: `0 0 8px ${item.color}40`,
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

            {/* ── Affiliate CTA (placeholder) ── */}
            {score.total > 50 && (
                <div
                    className="glass-card p-5 text-center mb-6"
                    style={{ borderColor: "var(--cg-green)" + "40" }}
                >
                    <p className="text-sm mb-3" style={{ color: "var(--cg-text-muted)" }}>
                        🛡️ Güvenli işlem için tanınmış borsaları tercih edin:
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        {["Binance", "OKX", "Bybit"].map((exchange) => (
                            <span
                                key={exchange}
                                className="px-4 py-2 rounded-lg text-sm font-medium cursor-default"
                                style={{
                                    background: "var(--cg-surface)",
                                    color: "var(--cg-text-dim)",
                                    border: "1px solid var(--cg-border)",
                                }}
                            >
                                {exchange}
                            </span>
                        ))}
                    </div>
                    <p className="text-[10px] mt-2" style={{ color: "var(--cg-text-dim)" }}>
                        Affiliate linkleri Sprint 2'de aktifleştirilecek
                    </p>
                </div>
            )}

            {/* ── Footer ── */}
            <footer className="text-center py-8">
                <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
                    ChainGuard analiz sonuçları yatırım tavsiyesi değildir.
                    Kendi araştırmanızı yapın (DYOR).
                </p>
            </footer>
        </main>
    );
}
