"use client";

import ExplainModal from "./ExplainModal";

interface MetricCardProps {
  title: string;
  value: string;
  score: number;
  label: string;
  icon: React.ReactNode;
  details?: { label: string; value: string }[];
  compact?: boolean;
  metricKey?: string;
}

function getScoreColor(score: number): string {
  if (score < 20) return "#34D399";
  if (score < 40) return "#34D399";
  if (score < 60) return "#FBBF24";
  if (score < 80) return "#FB923C";
  return "#F87171";
}

function getScoreTag(score: number): string {
  if (score < 20) return "Güvenli";
  if (score < 40) return "Düşük";
  if (score < 60) return "Orta";
  if (score < 80) return "Yüksek";
  return "Kritik";
}

export default function MetricCard({ title, value, score, label, icon, details, compact = false, metricKey }: MetricCardProps) {
  const color = getScoreColor(score);

  return (
    <div className="card-3d p-5 animate-slide-up" style={{ borderLeft: `3px solid ${color}60` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}
          >
            {icon}
          </div>
          <span className="text-sm font-bold leading-tight" style={{ color: "var(--cg-text)" }}>{title}</span>
        </div>
        <span className="metric-badge flex-shrink-0" style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>
          {getScoreTag(score)}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-black tabular-nums" style={{ color, textShadow: `0 0 20px ${color}30` }}>{value}</span>
        <span className="text-xs font-mono font-semibold" style={{ color: "var(--cg-text-dim)" }}>skor {Math.round(score)}</span>
      </div>

      <div className="score-bar mb-3.5">
        <div
          className="score-bar-fill animate-score-fill"
          style={{ width: `${Math.min(score, 100)}%`, background: `linear-gradient(90deg, ${color}60, ${color})`, boxShadow: `0 0 8px ${color}50` }}
        />
      </div>

      <p className="text-xs leading-relaxed font-medium" style={{ color: "var(--cg-text-muted)" }}>{label}</p>

      {metricKey && (
        <div className="mt-2">
          <ExplainModal metricKey={metricKey} score={score} />
        </div>
      )}

      {details && details.length > 0 && !compact && (
        <div className="mt-4 pt-3.5 space-y-2.5" style={{ borderTop: "1px solid var(--cg-border)" }}>
          {details.map(d => (
            <div key={d.label} className="flex justify-between items-center">
              <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>{d.label}</span>
              <span className="text-xs font-mono font-bold" style={{ color: "var(--cg-text-muted)" }}>{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
