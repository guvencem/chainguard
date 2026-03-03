"use client";

/**
 * HolderChart — Donut Chart (Holder dağılımı)
 * 
 * Pure SVG donut chart — Recharts bağımlılığı olmadan.
 * Top holder'ları ve "diğerleri" dilimini gösterir.
 */

interface HolderSlice {
    label: string;
    value: number;
    color: string;
}

interface HolderChartProps {
    top10Concentration: number; // 0-1 arası
    holderCount: number;
}

const COLORS = [
    "#E84142", "#14F195", "#F59E0B", "#8B5CF6",
    "#EC4899", "#06B6D4", "#F97316", "#84CC16",
    "#6366F1", "#10B981",
];

export default function HolderChart({
    top10Concentration,
    holderCount,
}: HolderChartProps) {
    const top10Pct = Math.round(top10Concentration * 100);
    const otherPct = 100 - top10Pct;

    const slices: HolderSlice[] = [
        { label: `Top 10 Holder`, value: top10Pct, color: "#E84142" },
        { label: "Diğerleri", value: otherPct, color: "#14F195" },
    ];

    // SVG donut hesaplamaları
    const size = 180;
    const strokeWidth = 32;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let currentOffset = 0;
    const segments = slices.map((s) => {
        const dashLength = (s.value / 100) * circumference;
        const offset = currentOffset;
        currentOffset += dashLength;
        return { ...s, dashLength, gapLength: circumference - dashLength, offset };
    });

    return (
        <div className="glass-card p-5">
            <h3
                className="text-sm font-semibold mb-4"
                style={{ color: "var(--cg-text)" }}
            >
                📊 Holder Dağılımı
            </h3>

            <div className="flex items-center gap-6">
                {/* Donut Chart */}
                <div className="relative" style={{ width: size, height: size }}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        {/* Background */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="var(--cg-surface)"
                            strokeWidth={strokeWidth}
                        />
                        {/* Segments */}
                        {segments.map((seg, i) => (
                            <circle
                                key={i}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${seg.dashLength} ${seg.gapLength}`}
                                strokeDashoffset={-seg.offset}
                                strokeLinecap="butt"
                                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                                style={{
                                    transition: "stroke-dasharray 1s ease-out",
                                    filter: `drop-shadow(0 0 4px ${seg.color}40)`,
                                }}
                            />
                        ))}
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold" style={{ color: "var(--cg-text)" }}>
                            {holderCount}
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--cg-text-dim)" }}>
                            holder
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3">
                    {slices.map((s) => (
                        <div key={s.label} className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ background: s.color }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span
                                        className="text-xs truncate"
                                        style={{ color: "var(--cg-text-muted)" }}
                                    >
                                        {s.label}
                                    </span>
                                    <span
                                        className="text-sm font-bold ml-2"
                                        style={{ color: s.color }}
                                    >
                                        %{s.value}
                                    </span>
                                </div>
                                {/* Progress bar */}
                                <div
                                    className="h-1.5 rounded-full mt-1 overflow-hidden"
                                    style={{ background: "var(--cg-surface)" }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${s.value}%`,
                                            background: s.color,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
