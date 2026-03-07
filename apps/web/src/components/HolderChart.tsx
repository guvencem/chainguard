"use client";

interface HolderChartProps {
  top10Concentration: number;
  holderCount: number;
}

function getConcentrationColor(pct: number): string {
  if (pct < 30) return "#10B981";
  if (pct < 50) return "#F59E0B";
  if (pct < 70) return "#F97316";
  return "#EF4444";
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default function HolderChart({
  top10Concentration,
  holderCount,
}: HolderChartProps) {
  const top10Pct = Math.round(top10Concentration * 100);
  const otherPct = 100 - top10Pct;
  const color = getConcentrationColor(top10Pct);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (top10Pct / 100) * circumference;

  return (
    <div className="card-flat p-6 animate-slide-up">
      <h3
        className="text-xs font-semibold mb-5 uppercase tracking-widest"
        style={{ color: "var(--cg-text-dim)" }}
      >
        Holder Dağılımı
      </h3>

      <div className="flex items-center gap-8">
        {/* Donut chart */}
        <div
          className="relative flex-shrink-0"
          style={{ width: 160, height: 160 }}
        >
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            className="transform -rotate-90"
          >
            {/* Glow halo */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={`${color}15`}
              strokeWidth="28"
            />
            {/* Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="18"
            />
            {/* Progress */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="animate-gauge"
              style={{
                filter: `drop-shadow(0 0 10px ${color}60)`,
                transition: "stroke-dashoffset 1.6s ease-out",
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums" style={{ color }}>
              %{top10Pct}
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-widest mt-0.5"
              style={{ color: "var(--cg-text-dim)" }}
            >
              Top 10
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span
                className="text-xs font-medium"
                style={{ color: "var(--cg-text-muted)" }}
              >
                Top 10 Holder
              </span>
              <span className="text-xs font-bold font-mono" style={{ color }}>
                %{top10Pct}
              </span>
            </div>
            <div className="score-bar">
              <div
                className="score-bar-fill animate-score-fill"
                style={{
                  width: `${top10Pct}%`,
                  background: color,
                  boxShadow: `0 0 8px ${color}50`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span
                className="text-xs font-medium"
                style={{ color: "var(--cg-text-muted)" }}
              >
                Diğer
              </span>
              <span
                className="text-xs font-bold font-mono"
                style={{ color: "var(--cg-text-dim)" }}
              >
                %{otherPct}
              </span>
            </div>
            <div className="score-bar">
              <div
                className="score-bar-fill animate-score-fill"
                style={{
                  width: `${otherPct}%`,
                  background: "rgba(255,255,255,0.08)",
                }}
              />
            </div>
          </div>

          <div
            className="pt-3 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--cg-border)" }}
          >
            <span
              className="text-xs uppercase tracking-widest font-semibold"
              style={{ color: "var(--cg-text-dim)" }}
            >
              Toplam Holder
            </span>
            <span
              className="text-sm font-bold font-mono"
              style={{ color: "var(--cg-text)" }}
            >
              {formatCount(holderCount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
