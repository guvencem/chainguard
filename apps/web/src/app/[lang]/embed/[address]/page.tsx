"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, TokenAnalysis } from "@/lib/api";

function ShieldIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="text-white">
            <path d="M12 3L4 6.5v5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5v-5L12 3z" />
        </svg>
    );
}

export default function EmbedWidget() {
    const params = useParams();
    const address = params.address as string;
    const lang = params.lang as string;

    const [data, setData] = useState<TokenAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!address) return;
        const fetchData = async () => {
            try {
                const result = await api.analyzeToken(address);
                setData(result);
            } catch (err) {
                // Do nothing silently for embed
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [address]);

    if (loading) {
        return (
            <main className="w-full h-full min-h-[120px] bg-[#0A0A0B] rounded-2xl flex items-center justify-center border border-white/5 opacity-80 backdrop-blur-xl">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Loading Taranoid...</span>
                </div>
            </main>
        );
    }

    if (!data) {
        return (
            <main className="w-full h-full min-h-[120px] bg-[#0A0A0B] rounded-2xl flex items-center justify-center border border-red-500/20">
                <span className="text-xs font-medium text-red-400">Token Not Found</span>
            </main>
        );
    }

    const { token, score } = data;

    // Decide badge color
    const isSafe = score.total < 40;
    const isWarning = score.total >= 40 && score.total < 70;
    const badgeColors = isSafe
        ? { bg: "rgba(52,211,153,0.15)", border: "rgba(52,211,153,0.3)", text: "#34D399" }
        : isWarning
            ? { bg: "rgba(251,146,60,0.15)", border: "rgba(251,146,60,0.3)", text: "#FB923C" }
            : { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)", text: "#EF4444" };

    return (
        <main className="w-full h-full min-h-[140px] flex flex-col justify-between overflow-hidden relative group font-sans" style={{ background: "linear-gradient(135deg, #0f0f13 0%, #15151c 100%)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40" style={{ background: badgeColors.text }} />

            <a
                href={`https://taranoid.app/${lang}/token/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col p-4 no-underline hover:no-underline"
            >
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <div className="text-white font-black text-lg leading-none tracking-tight flex items-center gap-1.5">
                            ${token.symbol}
                        </div>
                        <div className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">
                            Risk Analizi
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-black tabular-nums leading-none tracking-tighter" style={{ color: score.color, textShadow: `0 0 15px ${score.color}60` }}>
                            {Math.round(score.total)}<span className="text-[10px] opacity-50 ml-0.5">/100</span>
                        </span>
                    </div>
                </div>

                <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: badgeColors.bg, border: `1px solid ${badgeColors.border}` }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: badgeColors.text }} />
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: badgeColors.text }}>
                            {isSafe ? "Düşük Risk" : isWarning ? "Orta Risk" : "Yüksek Risk"}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="w-4 h-4 rounded-md flex items-center justify-center bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                            <ShieldIcon />
                        </div>
                        <span className="text-[9px] font-bold text-white tracking-widest uppercase">Taranoid</span>
                    </div>
                </div>
            </a>
        </main>
    );
}
