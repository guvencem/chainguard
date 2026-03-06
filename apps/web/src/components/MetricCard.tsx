"use client";

/**
 * MetricCard — Tek metrik gösterim kartı (Light Theme / Sprint 2)
 * VLR, RLS, Holder, Cluster, Wash, Sybil, Bundler, Exit, Curve
 */

interface MetricCardProps {
    title: string;
    value: string;
    score: number;
    label: string;
    icon: React.ReactNode;
    details?: { label: string; value: string }[];
    compact?: boolean;
}

function getScoreColor(score: number): string {
    if (score < 20) return "#06D6A0";
    if (score < 40) return "#84CC16";
    if (score < 60) return "#FFB703";
    if (score < 80) return "#F97316";
    return "#FF6B6B";
}

function getScoreTag(score: number): string {
    if (score < 20) return "Güvenli";
    if (score < 40) return "Düşük";
    if (score < 60) return "Orta";
    if (score < 80) return "Yüksek";
    return "Kritik";
}

function getScoreBg(score: number): string {
    if (score < 20) return "rgba(6, 214, 160, 0.1)";
    if (score < 40) return "rgba(132, 204, 22, 0.1)";
    if (score < 60) return "rgba(255, 183, 3, 0.1)";
    if (score < 80) return "rgba(249, 115, 22, 0.1)";
    return "rgba(255, 107, 107, 0.1)";
}

export default function MetricCard({
    title,
    value,
    score,
    label,
    icon,
    details,
    compact = false,
}: MetricCardProps) {
    const color = getScoreColor(score);

    return (
        <div
            className="glass-card p-5 transition-all duration-300 animate-slide-up"
            style={{
                borderColor: `${color}25`,
                borderLeftWidth: "3px",
                borderLeftColor: color,
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                        style={{
                            background: getScoreBg(score),
                            boxShadow: `0 2px 8px ${color}15`,
                        }}
                    >
                        {icon}
                    </div>
                    <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--cg-text)" }}
                    >
                        {title}
                    </span>
                </div>
                <span
                    className="metric-badge"
                    style={{
                        background: `${color}12`,
                        color,
                        border: `1px solid ${color}25`,
                    }}
                >
                    {getScoreTag(score)}
                </span>
            </div>

            {/* Score */}
            <div className="flex items-baseline gap-2 mb-1.5">
                <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color }}
                >
                    {value}
                </span>
                <span
                    className="text-xs font-medium"
                    style={{ color: "var(--cg-text-dim)" }}
                >
                    skor: {Math.round(score)}
                </span>
            </div>

            {/* Score bar */}
            <div className="score-bar mb-2">
                <div
                    className="score-bar-fill animate-score-fill"
                    style={{
                        width: `${Math.min(score, 100)}%`,
                        background: `linear-gradient(90deg, ${color}80, ${color})`,
                        boxShadow: `0 0 8px ${color}30`,
                    }}
                />
            </div>

            {/* Label */}
            <p
                className="text-xs mb-3"
                style={{ color: "var(--cg-text-muted)" }}
            >
                {label}
            </p>

            {/* Details */}
            {details && details.length > 0 && !compact && (
                <div
                    className="pt-3 space-y-1.5"
                    style={{ borderTop: "1px solid var(--cg-border)" }}
                >
                    {details.map((d) => (
                        <div
                            key={d.label}
                            className="flex justify-between text-xs"
                        >
                            <span style={{ color: "var(--cg-text-dim)" }}>
                                {d.label}
                            </span>
                            <span
                                className="font-mono font-semibold"
                                style={{ color: "var(--cg-text)" }}
                            >
                                {d.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
