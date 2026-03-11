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
  if (score < 40) return "Düþük";
  if (score < 60) return "Orta";
  if (score < 80) return "Yüksek";
  return "Kritik";
}

export default function MetricCard({ title, value, score, label, icon, details, compact = false, metricKey }: MetricCardProps) {
  const color = getScoreColor(score);

  return (
    <div 
      className="bento-card p-5 animate-slide-up group flex flex-col justify-between min-h-[180px]" 
      style={{ borderLeft: `3px solid ${color}60` }}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}
            >
              {icon}
            </div>
            <span className="text-sm font-bold tracking-tight" style={{ color: "var(--cg-text)" }}>{title}</span>
          </div>
          <span 
            className="px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest flex-shrink-0 transition-all duration-300" 
            style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}
          >
            {getScoreTag(score)}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-black tabular-nums transition-transform duration-300 group-hover:scale-105" style={{ color, textShadow: `0 0 20px ${color}30` }}>{value}</span>
          <span className="text-xs font-mono font-semibold opacity-60 flex gap-1" style={{ color: "var(--cg-text-dim)" }}>
            skor <span style={{ color }}>{Math.round(score)}</span>
          </span>
        </div>

        <div className="h-1.5 w-full bg-black/20 rounded-full mb-4 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(score, 100)}%`, background: `linear-gradient(90deg, ${color}60, ${color})`, boxShadow: `0 0 8px ${color}50` }}
          />
        </div>

        <p className="text-xs leading-relaxed font-medium opacity-80" style={{ color: "var(--cg-text-muted)" }}>{label}</p>
      </div>

      <div>
        {metricKey && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <ExplainModal metricKey={metricKey} score={score} />
          </div>
        )}

        {details && details.length > 0 && !compact && (
          <div className="mt-3 pt-3 space-y-2 border-t border-white/5">
            {details.map(d => (
              <div key={d.label} className="flex justify-between items-center group/detail">
                <span className="text-xs font-semibold opacity-60" style={{ color: "var(--cg-text-dim)" }}>{d.label}</span>
                <span className="text-xs font-mono font-bold opacity-80 group-hover/detail:opacity-100 transition-opacity" style={{ color: "var(--cg-text-muted)" }}>{d.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
