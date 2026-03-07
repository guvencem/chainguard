"use client";

import { useState } from "react";

interface ClusterGraphProps {
  clusterCount: number;
  totalWallets: number;
  largestPct: number;
  score: number;
}

interface ClusterNode {
  id: number;
  size: number;
  pct: number;
  x: number;
  y: number;
  r: number;
}

function getScoreColor(score: number): string {
  if (score < 20) return "#10B981";
  if (score < 40) return "#34D399";
  if (score < 60) return "#F59E0B";
  if (score < 80) return "#F97316";
  return "#EF4444";
}

function generateClusters(
  clusterCount: number,
  totalWallets: number,
  largestPct: number
): { id: number; size: number; pct: number }[] {
  if (clusterCount === 0 || totalWallets === 0) return [];

  const count = Math.min(clusterCount, 12); // max 12 nodes for clarity
  const largest = Math.round(largestPct * totalWallets);
  const clusters: { id: number; size: number; pct: number }[] = [
    { id: 0, size: largest, pct: largestPct },
  ];

  let remaining = totalWallets - largest;

  for (let i = 1; i < count && remaining > 0; i++) {
    const decay = Math.pow(0.65, i);
    const size = Math.max(1, Math.round(remaining * decay * 0.5));
    remaining = Math.max(0, remaining - size);
    clusters.push({
      id: i,
      size,
      pct: totalWallets > 0 ? size / totalWallets : 0,
    });
  }

  return clusters;
}

function positionClusters(
  clusters: { id: number; size: number; pct: number }[],
  cx: number,
  cy: number
): ClusterNode[] {
  return clusters.map((c, i) => {
    // Largest cluster positioned prominently
    if (i === 0) {
      const r = Math.max(22, Math.min(46, c.pct * 180 + 12));
      return { ...c, x: cx - 70, y: cy - 55, r };
    }

    // Others in a radial layout
    const total = clusters.length - 1;
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2.2;
    const dist = 95 + (i % 3) * 18;
    const r = Math.max(7, Math.min(26, c.pct * 120 + 6));

    return {
      ...c,
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * (dist * 0.72),
      r,
    };
  });
}

export default function ClusterGraph({
  clusterCount,
  totalWallets,
  largestPct,
  score,
}: ClusterGraphProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const color = getScoreColor(score);
  const rawClusters = generateClusters(clusterCount, totalWallets, largestPct);

  const SVG_W = 400;
  const SVG_H = 300;
  const CX = SVG_W / 2 + 10;
  const CY = SVG_H / 2 + 10;

  const nodes = positionClusters(rawClusters, CX, CY);

  // Token center node
  const tokenR = 18;
  const TX = CX;
  const TY = CY;

  const isEmpty = clusterCount === 0 || nodes.length === 0;

  return (
    <div className="card-flat p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "var(--cg-text-dim)" }}
          >
            Küme Ağı
          </h3>
          <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
            {clusterCount} küme &middot; {totalWallets.toLocaleString("tr-TR")} cüzdan
          </p>
        </div>
        {/* Risk indicator */}
        <div
          className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest"
          style={{
            background: `${color}12`,
            color,
            border: `1px solid ${color}25`,
          }}
        >
          {score < 20
            ? "Düşük Risk"
            : score < 60
            ? "Orta Risk"
            : "Yüksek Risk"}
        </div>
      </div>

      {isEmpty ? (
        <div
          className="flex items-center justify-center rounded-xl"
          style={{
            height: 240,
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed var(--cg-border)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
            Küme tespit edilmedi
          </p>
        </div>
      ) : (
        <div className="relative" style={{ height: 270 }}>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full h-full"
            style={{ overflow: "visible" }}
          >
            <defs>
              <radialGradient id="tokenGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
              </radialGradient>
              <radialGradient id={`clusterGrad-${color.replace("#", "")}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0.04" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connection lines */}
            {nodes.map((n) => (
              <g key={`line-${n.id}`}>
                {/* Outer glow line */}
                <line
                  x1={TX}
                  y1={TY}
                  x2={n.x}
                  y2={n.y}
                  stroke={`${color}10`}
                  strokeWidth="3"
                />
                {/* Main line */}
                <line
                  x1={TX}
                  y1={TY}
                  x2={n.x}
                  y2={n.y}
                  stroke={`${color}25`}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              </g>
            ))}

            {/* Cluster nodes */}
            {nodes.map((n) => {
              const isHovered = hoveredId === n.id;
              const scale = isHovered ? 1.12 : 1;
              return (
                <g
                  key={`node-${n.id}`}
                  transform={`translate(${n.x}, ${n.y}) scale(${scale})`}
                  style={{
                    transformOrigin: `${n.x}px ${n.y}px`,
                    transition: "transform 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredId(n.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Outer ambient glow */}
                  <circle
                    cx={0}
                    cy={0}
                    r={n.r + 8}
                    fill={`url(#clusterGrad-${color.replace("#", "")})`}
                  />
                  {/* Main circle */}
                  <circle
                    cx={0}
                    cy={0}
                    r={n.r}
                    fill={`${color}12`}
                    stroke={color}
                    strokeWidth={isHovered ? 1.5 : 1}
                    strokeOpacity={isHovered ? 0.7 : 0.35}
                    filter={isHovered ? "url(#glow)" : undefined}
                  />
                  {/* Percentage label */}
                  {n.r >= 10 && (
                    <text
                      x={0}
                      y={0}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={n.r >= 18 ? 9 : 7}
                      fill={color}
                      fontWeight="700"
                      opacity="0.9"
                    >
                      {(n.pct * 100).toFixed(n.pct < 0.01 ? 1 : 0)}%
                    </text>
                  )}

                  {/* Hover tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={n.r + 4}
                        y={-14}
                        width={72}
                        height={28}
                        rx={6}
                        fill="#111827"
                        stroke="rgba(148,163,184,0.15)"
                        strokeWidth="1"
                      />
                      <text
                        x={n.r + 40}
                        y={-3}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#94A3B8"
                        fontWeight="600"
                      >
                        {n.size.toLocaleString("tr-TR")} cüzdan
                      </text>
                      <text
                        x={n.r + 40}
                        y={8}
                        textAnchor="middle"
                        fontSize="8"
                        fill={color}
                        fontWeight="700"
                      >
                        %{(n.pct * 100).toFixed(2)} supply
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Token center node */}
            <g>
              {/* Ambient ring */}
              <circle
                cx={TX}
                cy={TY}
                r={tokenR + 10}
                fill="url(#tokenGrad)"
              />
              {/* Pulsing outer ring */}
              <circle
                cx={TX}
                cy={TY}
                r={tokenR + 4}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="0.5"
                strokeOpacity="0.3"
              />
              {/* Main circle */}
              <circle
                cx={TX}
                cy={TY}
                r={tokenR}
                fill="rgba(59,130,246,0.15)"
                stroke="#3B82F6"
                strokeWidth="1.5"
                filter="url(#glow)"
              />
              <text
                x={TX}
                y={TY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7"
                fill="#3B82F6"
                fontWeight="800"
                letterSpacing="0.5"
              >
                TOKEN
              </text>
            </g>
          </svg>
        </div>
      )}

      {/* Legend */}
      <div
        className="flex items-center gap-5 mt-1 pt-3"
        style={{ borderTop: "1px solid var(--cg-border)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: `${color}20`,
              border: `1px solid ${color}50`,
            }}
          />
          <span className="text-[10px] font-medium" style={{ color: "var(--cg-text-dim)" }}>
            Küme Cüzdanları
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.5)",
            }}
          />
          <span className="text-[10px] font-medium" style={{ color: "var(--cg-text-dim)" }}>
            Token
          </span>
        </div>
        <div className="ml-auto text-[10px] font-mono" style={{ color: "var(--cg-text-dim)" }}>
          Büyük = Daha Fazla Supply
        </div>
      </div>
    </div>
  );
}
