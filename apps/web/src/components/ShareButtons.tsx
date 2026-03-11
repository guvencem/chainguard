"use client"

import { useState, useCallback } from "react"
import { useParams } from "next/navigation"

interface ShareButtonsProps {
  tokenAddress: string
  tokenSymbol?: string | null
  score: number
}

const WEB_URL = "https://taranoid.com"

function XIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 1 0 12 24 12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

export default function ShareButtons({ tokenAddress, tokenSymbol, score }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  const params = useParams()
  const langStr = params?.lang || "tr"

  const pageUrl = `${WEB_URL}/${langStr}/token/${tokenAddress}`
  const sym = tokenSymbol ? `$${tokenSymbol}` : "Token"
  const scoreText = `${sym} risk skoru: ${Math.round(score)}/100 ${score >= 60 ? "⚠️ Yüksek risk!" : "✅ Düşük risk"} — Taranoid analizi`

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(scoreText)}&url=${encodeURIComponent(pageUrl)}`
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(scoreText)}`

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch { }
  }, [pageUrl])

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 20px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
    textDecoration: "none",
    border: "1px solid",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap" as const,
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--cg-text-dim)" }}>
        🚀 ALPHA PAYLAŞ:
      </span>

      {/* Twitter/X */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...base,
          background: hovered === "x" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
          borderColor: hovered === "x" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
          color: "var(--cg-text)",
          transform: hovered === "x" ? "translateY(-3px)" : "translateY(0)",
          boxShadow: hovered === "x" ? "0 8px 24px rgba(0,0,0,0.4)" : "none",
        }}
        onMouseEnter={() => setHovered("x")}
        onMouseLeave={() => setHovered(null)}
      >
        <XIcon /> X'te Paylaş
      </a>

      {/* Telegram */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...base,
          background: hovered === "tg" ? "rgba(41,182,246,0.18)" : "rgba(41,182,246,0.08)",
          borderColor: hovered === "tg" ? "rgba(41,182,246,0.5)" : "rgba(41,182,246,0.25)",
          color: "#29B6F6",
          transform: hovered === "tg" ? "translateY(-3px)" : "translateY(0)",
          boxShadow: hovered === "tg" ? "0 8px 24px rgba(41,182,246,0.3)" : "none",
        }}
        onMouseEnter={() => setHovered("tg")}
        onMouseLeave={() => setHovered(null)}
      >
        <TelegramIcon /> Telegram
      </a>

      {/* Copy */}
      <button
        onClick={handleCopy}
        style={{
          ...base,
          background: copied ? "rgba(52,211,153,0.12)" : hovered === "copy" ? "rgba(129,140,248,0.15)" : "rgba(129,140,248,0.07)",
          borderColor: copied ? "rgba(52,211,153,0.45)" : hovered === "copy" ? "rgba(129,140,248,0.45)" : "rgba(129,140,248,0.2)",
          color: copied ? "#34D399" : "var(--cg-accent)",
          transform: hovered === "copy" && !copied ? "translateY(-3px)" : "translateY(0)",
          boxShadow: copied ? "0 0 20px rgba(52,211,153,0.3)" : hovered === "copy" ? "0 8px 24px rgba(129,140,248,0.2)" : "none",
        }}
        onMouseEnter={() => setHovered("copy")}
        onMouseLeave={() => setHovered(null)}
      >
        {copied ? <><CheckIcon /> Kopyalandı!</> : <><CopyIcon /> Link Kopyala</>}
      </button>
    </div>
  )
}
