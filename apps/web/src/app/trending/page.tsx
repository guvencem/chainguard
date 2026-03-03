"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Trending Sayfası — En riskli tokenlar listesi
 * Sprint 1'de statik placeholder, ilerleyen sprintlerde API'den çekilecek.
 */

export default function TrendingPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");

    // Placeholder veri — API bağlandığında gerçek veriye geçecek
    const placeholderTokens = [
        { name: "PIPPINU", symbol: "PIPPINU", score: 94.2, level: "CRITICAL", color: "#EF4444", address: "placeholder1" },
        { name: "WHITEPIPP", symbol: "WHITEPIPP", score: 87.5, level: "CRITICAL", color: "#EF4444", address: "placeholder2" },
        { name: "RUGCOIN", symbol: "RUG", score: 78.3, level: "HIGH", color: "#F97316", address: "placeholder3" },
        { name: "FAKEMOON", symbol: "FMOON", score: 72.1, level: "HIGH", color: "#F97316", address: "placeholder4" },
        { name: "SCAMDOG", symbol: "SDOG", score: 65.8, level: "HIGH", color: "#F97316", address: "placeholder5" },
    ];

    return (
        <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
            {/* ── Navbar ── */}
            <nav className="flex items-center justify-between mb-10">
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

            {/* ── Header ── */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--cg-text)" }}>
                    🔥 Trending Riskli Tokenlar
                </h1>
                <p className="text-sm" style={{ color: "var(--cg-text-muted)" }}>
                    Son 24 saatte en yüksek risk skoru alan tokenlar. Liste otomatik güncellenir.
                </p>
            </div>

            {/* ── Info Banner ── */}
            <div
                className="glass-card p-4 mb-6 flex items-center gap-3"
                style={{ borderColor: "var(--cg-yellow)" + "40" }}
            >
                <span className="text-xl">🚧</span>
                <div>
                    <p className="text-sm font-medium" style={{ color: "var(--cg-text)" }}>
                        Sprint 1 — Örnek Veri
                    </p>
                    <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
                        Bu sayfa şu anda örnek verilerle çalışmaktadır. Token analiz ettikçe gerçek veriler burada listelenecek.
                    </p>
                </div>
            </div>

            {/* ── Token List ── */}
            <div className="space-y-3">
                {placeholderTokens.map((token, i) => (
                    <div
                        key={token.address}
                        className="glass-card p-4 flex items-center gap-4 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                        onClick={() => {
                            // Placeholder — gerçek adresle çalışınca aktifleşecek
                        }}
                    >
                        {/* Rank */}
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{
                                background: `${token.color}20`,
                                color: token.color,
                            }}
                        >
                            {i + 1}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm" style={{ color: "var(--cg-text)" }}>
                                    {token.name}
                                </span>
                                <span
                                    className="text-xs font-mono px-1.5 py-0.5 rounded"
                                    style={{
                                        background: "var(--cg-surface)",
                                        color: "var(--cg-text-dim)",
                                    }}
                                >
                                    ${token.symbol}
                                </span>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-3">
                            <span
                                className="text-xs font-medium px-2 py-1 rounded-full"
                                style={{
                                    background: `${token.color}20`,
                                    color: token.color,
                                }}
                            >
                                {token.level === "CRITICAL" ? "KRİTİK" : "YÜKSEK RİSK"}
                            </span>
                            <span
                                className="text-xl font-bold tabular-nums"
                                style={{ color: token.color }}
                            >
                                {token.score}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Footer ── */}
            <footer className="text-center py-10">
                <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
                    Risk skorları yatırım tavsiyesi değildir. Her zaman kendi araştırmanızı yapın.
                </p>
            </footer>
        </main>
    );
}
