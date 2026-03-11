"use client"

import { useEffect, useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://web-production-b704c.up.railway.app"

interface TickerToken {
  token_address: string
  name: string
  symbol: string
  total_score: number
}

function getRiskColor(score: number): string {
  if (score < 40) return "#34D399"
  if (score < 60) return "#FBBF24"
  if (score < 80) return "#FB923C"
  return "#F87171"
}

function getRiskEmoji(score: number): string {
  if (score < 40) return "🟢"
  if (score < 60) return "🟡"
  if (score < 80) return "🟠"
  return "🔴"
}

export default function LiveTicker() {
  const [tokens, setTokens] = useState<TickerToken[]>([])

  useEffect(() => {
    fetch(`${API_URL}/api/v1/trending`)
      .then(r => r.json())
      .then(d => setTokens(d.tokens?.slice(0, 14) || []))
      .catch(() => {})
  }, [])

  if (tokens.length === 0) return null

  const items = [...tokens, ...tokens] // seamless loop

  return (
    <div
      style={{
        height: 34,
        overflow: "hidden",
        borderBottom: "1px solid var(--cg-border)",
        background: "var(--cg-surface)",
        position: "relative",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Fade edges */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(90deg, var(--cg-surface), transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(-90deg, var(--cg-surface), transparent)", zIndex: 2, pointerEvents: "none" }} />

      {/* LIVE badge */}
      <div style={{ position: "absolute", left: 14, zIndex: 3, display: "flex", alignItems: "center", gap: 5 }}>
        <span
          style={{
            width: 6, height: 6, borderRadius: "50%", background: "#34D399", display: "inline-block",
            boxShadow: "0 0 8px #34D399",
            animation: "pulse-ring 1.5s ease-out infinite",
          }}
        />
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#34D399", textTransform: "uppercase" }}>
          LIVE
        </span>
      </div>

      {/* Scrolling track */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          paddingLeft: 64,
          animation: `ticker-scroll ${tokens.length * 4}s linear infinite`,
        }}
      >
        {items.map((tok, i) => {
          const color = getRiskColor(tok.total_score)
          return (
            <a
              key={`${tok.token_address}-${i}`}
              href={`/token/${tok.token_address}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginRight: 36,
                textDecoration: "none",
                fontSize: 11,
                fontWeight: 700,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <span style={{ fontSize: 10 }}>{getRiskEmoji(tok.total_score)}</span>
              <span style={{ color: "var(--cg-text-muted)", fontFamily: "var(--font-mono)" }}>
                {tok.symbol || tok.name?.slice(0, 8) || "???"}
              </span>
              <span
                style={{
                  color,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 800,
                  background: `${color}18`,
                  padding: "2px 6px",
                  borderRadius: 5,
                  border: `1px solid ${color}30`,
                }}
              >
                {Math.round(tok.total_score)}
              </span>
              <span style={{ color: "var(--cg-border-strong)", marginLeft: 4 }}>·</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
