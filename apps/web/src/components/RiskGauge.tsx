"use client";

interface RiskGaugeProps {
  score: number;
  label: string;
  color: string;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score < 20) return "#10B981";
  if (score < 40) return "#34D399";
  if (score < 60) return "#F59E0B";
  if (score < 80) return "#F97316";
  return "#EF4444";
}

export default function RiskGauge({
  score,
  label,
  color,
  size = 200,
}: RiskGaugeProps) {
  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const dashOffset = circumference - (progress / 100) * circumference;
  const gaugeColor = color || getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Ambient glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${gaugeColor}08 0%, transparent 70%)`,
            transform: "scale(1.15)",
          }}
        />

        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          className="transform -rotate-90"
        >
          {/* Outer decorative ring */}
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1"
          />

          {/* Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="14"
          />

          {/* Glow halo behind progress */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={`${gaugeColor}18`}
            strokeWidth="22"
          />

          {/* Main progress arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={gaugeColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="animate-gauge"
            style={{
              filter: `drop-shadow(0 0 14px ${gaugeColor}80)`,
              transition:
                "stroke-dashoffset 1.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />

          {/* Inner ring */}
          <circle
            cx="100"
            cy="100"
            r={radius - 12}
            fill="none"
            stroke="rgba(255,255,255,0.02)"
            strokeWidth="1"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-bold tabular-nums"
            style={{
              color: gaugeColor,
              textShadow: `0 0 32px ${gaugeColor}50`,
            }}
          >
            {Math.round(score)}
          </span>
          <span
            className="text-xs font-medium tracking-widest uppercase mt-1"
            style={{ color: "var(--cg-text-dim)" }}
          >
            / 100
          </span>
        </div>
      </div>

      {/* Label pill */}
      <div
        className="px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase"
        style={{
          background: `${gaugeColor}12`,
          color: gaugeColor,
          border: `1px solid ${gaugeColor}28`,
          boxShadow: `0 2px 12px ${gaugeColor}15`,
        }}
      >
        {label}
      </div>
    </div>
  );
}
