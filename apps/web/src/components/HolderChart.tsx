"use client";

/**
 * HolderChart — Holder dağılım grafiği (Light Theme / Sprint 2)
 * Pasta grafik + detay tablosu
 */

interface HolderChartProps {
    top10Concentration: number;
    holderCount: number;
}

export default function HolderChart({
    top10Concentration,
    holderCount,
}: HolderChartProps) {
    const top10Pct = Math.round(top10Concentration * 100);
    const otherPct = 100 - top10Pct;

    // Risk rengi
    const getConcentrationColor = () => {
        if (top10Pct < 30) return "#06D6A0";
        if (top10Pct < 50) return "#FFB703";
        if (top10Pct < 70) return "#F97316";
        return "#FF6B6B";
    };

    const color = getConcentrationColor();
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (top10Pct / 100) * circumference;

    const formatCount = (n: number) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
        return n.toString();
    };

    return (
        <div className="glass-card p-6 animate-slide-up">
            <h3
                className="text-sm font-semibold mb-5"
                style={{ color: "var(--cg-text)" }}
            >
                📊 Holder Dağılımı
            </h3>

            <div className="flex items-center gap-8">
                {/* Donut Chart */}
                <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
                    <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
                        {/* Background */}
                        <circle
                            cx="80" cy="80" r={radius}
                            fill="none"
                            stroke="#E8EAF3"
                            strokeWidth="20"
                        />
                        {/* Top 10 */}
                        <circle
                            cx="80" cy="80" r={radius}
                            fill="none"
                            stroke={color}
                            strokeWidth="20"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            className="animate-gauge"
                            style={{
                                transition: "stroke-dashoffset 1.5s ease-out",
                                filter: `drop-shadow(0 0 6px ${color}40)`,
                            }}
                        />
                    </svg>
                    {/* Center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold" style={{ color }}>
                            %{top10Pct}
                        </span>
                        <span className="text-[10px] font-medium" style={{ color: "var(--cg-text-dim)" }}>
                            Top 10
                        </span>
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <span className="text-xs font-medium" style={{ color: "var(--cg-text)" }}>
                                    Top 10 Holder
                                </span>
                                <span className="text-xs font-bold font-mono" style={{ color }}>
                                    %{top10Pct}
                                </span>
                            </div>
                            <div className="score-bar mt-1">
                                <div
                                    className="score-bar-fill animate-score-fill"
                                    style={{
                                        width: `${top10Pct}%`,
                                        background: color,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: "#E8EAF3" }} />
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <span className="text-xs font-medium" style={{ color: "var(--cg-text)" }}>
                                    Diğer Holder'lar
                                </span>
                                <span className="text-xs font-bold font-mono" style={{ color: "var(--cg-text-muted)" }}>
                                    %{otherPct}
                                </span>
                            </div>
                            <div className="score-bar mt-1">
                                <div
                                    className="score-bar-fill animate-score-fill"
                                    style={{
                                        width: `${otherPct}%`,
                                        background: "#B8BDD6",
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div
                        className="pt-3 flex items-center justify-between"
                        style={{ borderTop: "1px solid var(--cg-border)" }}
                    >
                        <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
                            Toplam Holder
                        </span>
                        <span className="text-sm font-bold font-mono" style={{ color: "var(--cg-text)" }}>
                            {formatCount(holderCount)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
