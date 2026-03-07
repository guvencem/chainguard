"use client";

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
  if (score < 20) return "#10B981";
  if (score < 40) return "#34D399";
  if (score < 60) return "#F59E0B";
  if (score < 80) return "#F97316";
  return "#EF4444";
}

function getScoreTag(score: number): string {
  if (score < 20) return "Güvenli";
  if (score < 40) return "Düşük";
  if (score < 60) return "Orta";
  if (score < 80) return "Yüksek";
  return "Kritik";
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
      className="card-3d p-5 animate-slide-up"
      style={{
        borderLeft: `2px solid ${color}35`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: `${color}12`,
              color,
              border: `1px solid ${color}20`,
            }}
          >
            {icon}
          </div>
          <span
            className="text-sm font-semibold leading-tight"
            style={{ color: "var(--cg-text)" }}
          >
            {title}
          </span>
        </div>
        <span
          className="metric-badge flex-shrink-0"
          style={{
            background: `${color}12`,
            color,
            border: `1px solid ${color}20`,
          }}
        >
          {getScoreTag(score)}
        </span>
      </div>

      {/* Value + score */}
      <div className="flex items-baseline gap-2 mb-2.5">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color, textShadow: `0 0 20px ${color}30` }}
        >
          {value}
        </span>
        <span className="text-xs font-mono" style={{ color: "var(--cg-text-dim)" }}>
          skor {Math.round(score)}
        </span>
      </div>

      {/* Score bar */}
      <div className="score-bar mb-3">
        <div
          className="score-bar-fill animate-score-fill"
          style={{
            width: `${Math.min(score, 100)}%`,
            background: `linear-gradient(90deg, ${color}50, ${color})`,
            boxShadow: `0 0 8px ${color}50`,
          }}
        />
      </div>

      {/* Label */}
      <p className="text-xs leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
        {label}
      </p>

      {/* Details */}
      {details && details.length > 0 && !compact && (
        <div
          className="mt-4 pt-3 space-y-2.5"
          style={{ borderTop: "1px solid var(--cg-border)" }}
        >
          {details.map((d) => (
            <div key={d.label} className="flex justify-between items-center">
              <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
                {d.label}
              </span>
              <span
                className="text-xs font-mono font-semibold"
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
