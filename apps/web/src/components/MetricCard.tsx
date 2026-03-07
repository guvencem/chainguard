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
  if (score < 20) return "#059669";
  if (score < 40) return "#10B981";
  if (score < 60) return "#D97706";
  if (score < 80) return "#EA580C";
  return "#DC2626";
}

function getScoreTag(score: number): string {
  if (score < 20) return "Güvenli";
  if (score < 40) return "Düşük";
  if (score < 60) return "Orta";
  if (score < 80) return "Yüksek";
  return "Kritik";
}

export default function MetricCard({ title, value, score, label, icon, details, compact = false }: MetricCardProps) {
  const color = getScoreColor(score);

  return (
    <div className="card-3d p-5 animate-slide-up" style={{ borderLeft: `3px solid ${color}` }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
          >
            {icon}
          </div>
          <span className="text-sm font-bold leading-tight" style={{ color: "var(--cg-text)" }}>
            {title}
          </span>
        </div>
        <span
          className="metric-badge flex-shrink-0"
          style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}
        >
          {getScoreTag(score)}
        </span>
      </div>

      {/* Value + score */}
      <div className="flex items-baseline gap-2 mb-2.5">
        <span className="text-2xl font-bold tabular-nums" style={{ color, textShadow: `0 1px 8px ${color}25` }}>
          {value}
        </span>
        <span className="text-xs font-mono font-semibold" style={{ color: "var(--cg-text-dim)" }}>
          skor {Math.round(score)}
        </span>
      </div>

      {/* Score bar */}
      <div className="score-bar mb-3">
        <div
          className="score-bar-fill animate-score-fill"
          style={{
            width: `${Math.min(score, 100)}%`,
            background: `linear-gradient(90deg, ${color}60, ${color})`,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>

      {/* Label */}
      <p className="text-xs leading-relaxed font-medium" style={{ color: "var(--cg-text-muted)" }}>
        {label}
      </p>

      {/* Details */}
      {details && details.length > 0 && !compact && (
        <div className="mt-4 pt-3 space-y-2.5" style={{ borderTop: "1px solid var(--cg-border)" }}>
          {details.map((d) => (
            <div key={d.label} className="flex justify-between items-center">
              <span className="text-xs font-medium" style={{ color: "var(--cg-text-dim)" }}>{d.label}</span>
              <span className="text-xs font-mono font-bold" style={{ color: "var(--cg-text-muted)" }}>{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
