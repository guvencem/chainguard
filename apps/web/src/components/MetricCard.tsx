"use client";

/**
 * MetricCard — Tek metrik gösterim kartı
 *
 * VLR, RLS veya Holder metriği için kullanılır.
 * Skor rengine göre glassmorphism efektli arka plan.
 */

interface MetricCardProps {
    title: string;
    value: string;
    score: number;
    label: string;
    icon: React.ReactNode;
    details?: { label: string; value: string }[];
}

function getScoreColor(score: number): string {
    if (score < 20) return "#22C55E";
    if (score < 40) return "#84CC16";
    if (score < 60) return "#F59E0B";
    if (score < 80) return "#F97316";
    return "#EF4444";
}

function getScoreTag(score: number): string {
    if (score < 20) return "Güvenli";
    if (score < 40) return "Düşük Risk";
    if (score < 60) return "Orta Risk";
    if (score < 80) return "Yüksek Risk";
    return "Kritik";
}

export default function MetricCard({
    title,
    value,
    score,
    label,
    icon,
    details,
}: MetricCardProps) {
    const color = getScoreColor(score);

    return (
        <div
            className="glass-card p-5 transition-all duration-300 hover:scale-[1.02]"
            style={{
                borderColor: `${color}30`,
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        style={{ background: `${color}20`, color }}
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
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{
                        background: `${color}20`,
                        color,
                    }}
                >
                    {getScoreTag(score)}
                </span>
            </div>

            {/* Score */}
            <div className="flex items-baseline gap-2 mb-2">
                <span
                    className="text-3xl font-bold tabular-nums"
                    style={{ color }}
                >
                    {value}
                </span>
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--cg-text-dim)" }}
                >
                    skor: {Math.round(score)}
                </span>
            </div>

            {/* Label */}
            <p
                className="text-sm mb-4"
                style={{ color: "var(--cg-text-muted)" }}
            >
                {label}
            </p>

            {/* Details */}
            {details && details.length > 0 && (
                <div
                    className="pt-3 space-y-2"
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
                                className="font-mono font-medium"
                                style={{ color: "var(--cg-text-muted)" }}
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
