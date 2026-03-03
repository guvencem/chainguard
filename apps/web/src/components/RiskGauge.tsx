"use client";

/**
 * RiskGauge — Dairesel risk skoru göstergesi
 *
 * SVG tabanlı, animasyonlu, 0-100 arası skor gösterir.
 * Renk geçişi: yeşil → sarı → turuncu → kırmızı
 */

interface RiskGaugeProps {
    score: number;      // 0-100
    label: string;      // "DOLANDIRICILIK", "GÜVENLİ" vb.
    color: string;      // hex renk
    size?: number;      // piksel
}

export default function RiskGauge({
    score,
    label,
    color,
    size = 220,
}: RiskGaugeProps) {
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(score, 0), 100);
    const dashOffset = circumference - (progress / 100) * circumference;

    // Skora göre renk
    const getColor = () => {
        if (score < 20) return "#22C55E";
        if (score < 40) return "#84CC16";
        if (score < 60) return "#F59E0B";
        if (score < 80) return "#F97316";
        return "#EF4444";
    };

    const gaugeColor = color || getColor();

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 200 200"
                    className="transform -rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke="var(--cg-surface)"
                        strokeWidth="12"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={gaugeColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        className="animate-gauge"
                        style={{
                            filter: `drop-shadow(0 0 8px ${gaugeColor}60)`,
                            transition: "stroke-dashoffset 1.5s ease-out",
                        }}
                    />
                    {/* Glow effects */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={gaugeColor}
                        strokeWidth="2"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        opacity="0.3"
                        style={{
                            filter: `blur(4px)`,
                        }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="text-5xl font-bold tabular-nums"
                        style={{ color: gaugeColor }}
                    >
                        {Math.round(score)}
                    </span>
                    <span
                        className="text-xs font-medium mt-1"
                        style={{ color: "var(--cg-text-dim)" }}
                    >
                        / 100
                    </span>
                </div>
            </div>

            {/* Label */}
            <div
                className="px-4 py-2 rounded-full text-sm font-bold tracking-wide"
                style={{
                    background: `${gaugeColor}20`,
                    color: gaugeColor,
                    border: `1px solid ${gaugeColor}40`,
                }}
            >
                {label}
            </div>
        </div>
    );
}
