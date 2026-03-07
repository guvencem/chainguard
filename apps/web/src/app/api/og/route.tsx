import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://web-production-b704c.up.railway.app";

function getRiskColor(score: number): string {
  if (score < 20) return "#34D399";
  if (score < 40) return "#34D399";
  if (score < 60) return "#FBBF24";
  if (score < 80) return "#FB923C";
  return "#F87171";
}

function getRiskLabel(score: number): string {
  if (score < 20) return "GÜVENLİ";
  if (score < 40) return "DÜŞÜK RİSK";
  if (score < 60) return "ORTA RİSK";
  if (score < 80) return "YÜKSEK RİSK";
  return "KRİTİK";
}

function getRiskEmoji(score: number): string {
  if (score < 20) return "🟢";
  if (score < 40) return "🟡";
  if (score < 60) return "🟠";
  if (score < 80) return "🔴";
  return "🚨";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address") || "";
  const scoreParam = searchParams.get("score");
  const nameParam = searchParams.get("name") || "";
  const symbolParam = searchParams.get("symbol") || "";

  let score = scoreParam ? parseFloat(scoreParam) : null;
  let name = nameParam;
  let symbol = symbolParam;

  // Score parametresi yoksa API'den çek
  if (score === null && address) {
    try {
      const res = await fetch(`${API_URL}/api/v1/token/${address}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        score = data?.score?.total ?? 50;
        name = name || data?.token?.name || "";
        symbol = symbol || data?.token?.symbol || "";
      }
    } catch {
      score = 50;
    }
  }

  score = score ?? 50;
  const color = getRiskColor(score);
  const label = getRiskLabel(score);
  const emoji = getRiskEmoji(score);
  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Solana Token";
  const displayName = name || shortAddr;
  const scoreRounded = Math.round(score);

  // Gauge arc hesapla (SVG stroke-dasharray)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #06080F 0%, #0D1117 50%, #06080F 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            background: `radial-gradient(ellipse at center, ${color}18 0%, transparent 70%)`,
            borderRadius: "50%",
          }}
        />

        {/* Grid pattern (subtle) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* ChainGuard branding — top left */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366F1, #EC4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 14,
              fontWeight: 900,
            }}
          >
            CG
          </div>
          <span style={{ color: "white", fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>
            ChainGuard
          </span>
        </div>

        {/* chainguard.app — top right */}
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 60,
            color: "rgba(255,255,255,0.3)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          chainguard.app
        </div>

        {/* Main content */}
        <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
          {/* Gauge SVG */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Glow behind gauge */}
              <div style={{
                position: "absolute",
                inset: -20,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
              }} />
              <svg width="200" height="200" viewBox="0 0 200 200">
                {/* Track */}
                <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="16" />
                {/* Progress */}
                <circle
                  cx="100" cy="100" r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 100 100)"
                  style={{ filter: `drop-shadow(0 0 12px ${color}80)` }}
                />
              </svg>
              {/* Score text overlay */}
              <div style={{
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
                <span style={{ color, fontSize: 52, fontWeight: 900, lineHeight: 1 }}>
                  {scoreRounded}
                </span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                  / 100
                </span>
              </div>
            </div>

            {/* Risk label badge */}
            <div style={{
              marginTop: 16,
              padding: "8px 20px",
              borderRadius: 100,
              background: `${color}15`,
              border: `1.5px solid ${color}35`,
              color,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 2,
            }}>
              {emoji} {label}
            </div>
          </div>

          {/* Token info */}
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 480 }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>
              Risk Analizi
            </div>
            <div style={{ color: "white", fontSize: displayName.length > 20 ? 36 : 44, fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>
              {displayName}
            </div>
            {symbol && (
              <div style={{
                display: "inline-flex",
                marginBottom: 16,
                padding: "4px 12px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "monospace",
              }}>
                ${symbol}
              </div>
            )}
            <div style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
              fontFamily: "monospace",
              marginBottom: 28,
            }}>
              {shortAddr}
            </div>

            {/* Score bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                  Risk Skoru
                </span>
                <span style={{ color, fontSize: 12, fontWeight: 700 }}>{scoreRounded}/100</span>
              </div>
              <div style={{
                width: 400,
                height: 6,
                borderRadius: 3,
                background: "rgba(255,255,255,0.08)",
              }}>
                <div style={{
                  width: `${score}%`,
                  height: "100%",
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${color}60, ${color})`,
                  boxShadow: `0 0 8px ${color}60`,
                }} />
              </div>
            </div>

            {/* Tagline */}
            <div style={{
              marginTop: 28,
              color: "rgba(255,255,255,0.25)",
              fontSize: 13,
            }}>
              9 metrikle analiz edildi · chainguard.app/token/{address.slice(0, 8)}...
            </div>
          </div>
        </div>

        {/* Bottom border accent */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, transparent, #6366F1, #EC4899, transparent)",
        }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
