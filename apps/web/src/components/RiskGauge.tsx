"use client";

/**
 * RiskGauge — Dairesel risk skoru göstergesi (Light Theme)
 * SVG tabanlı, animasyonlu, canlı renkler.
 */

interface RiskGaugeProps {
    score: number;
    label: string;
    color: string;
    size?: number;
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

    const getColor = () => {
        if (score < 20) return "#06D6A0";
        if (score < 40) return "#84CC16";
        if (score < 60) return "#FFB703";
        if (score < 80) return "#F97316";
        return "#FF6B6B";
    };

    const gaugeColor = color || getColor();

    const getBgGlow = () => {
        if (score < 40) return "rgba(6, 214, 160, 0.08)";
        if (score < 60) return "rgba(255, 183, 3, 0.08)";
        return "rgba(255, 107, 107, 0.08)";
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className="relative rounded-full p-3"
                style={{ width: size + 24, height: size + 24, background: getBgGlow() }}
            >
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
                        stroke="#E8EAF3"
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
                            filter: `drop-shadow(0 0 10px ${gaugeColor}50)`,
                            transition: "stroke-dashoffset 1.5s ease-out",
                        }}
                    />
                    {/* Outer glow */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius + 6}
                        fill="none"
                        stroke={gaugeColor}
                        strokeWidth="1"
                        strokeDasharray={circumference * 1.07}
                        strokeDashoffset={circumference * 1.07 - (progress / 100) * circumference * 1.07}
                        opacity="0.2"
                        style={{ filter: "blur(3px)" }}
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
                className="px-5 py-2.5 rounded-full text-sm font-bold tracking-wide"
                style={{
                    background: `${gaugeColor}15`,
                    color: gaugeColor,
                    border: `2px solid ${gaugeColor}30`,
                    boxShadow: `0 2px 10px ${gaugeColor}15`,
                }}
            >
                {label}
            </div>
        </div>
    );
}
