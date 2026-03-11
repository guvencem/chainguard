"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://web-production-b704c.up.railway.app";

interface TrendingToken {
  token_address: string;
  name: string;
  symbol: string;
  total_score: number;
  risk_level: string;
  volume_24h_usd: number;
  mcap_usd: number;
  query_count: number;
  last_queried_at: string;
}

function getRiskColor(score: number): string {
  if (score < 40) return "#34D399";
  if (score < 60) return "#FBBF24";
  if (score < 80) return "#FB923C";
  return "#F87171";
}

function getRiskLabel(level: string): string {
  const map: Record<string, string> = {
    SAFE: "Güvenli", LOW: "Düşük", MEDIUM: "Orta", HIGH: "Yüksek", CRITICAL: "Kritik",
  };
  return map[level] || level;
}

function getRiskEmoji(score: number): string {
  if (score < 40) return "✅";
  if (score < 60) return "⚠️";
  if (score < 80) return "🚨";
  return "💀";
}

function formatUSD(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function FireIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c0 0-5 4.5-5 9.5a5 5 0 0 0 10 0C17 6.5 12 2 12 2z" />
      <path d="M12 12c0 0-2 1.5-2 3a2 2 0 0 0 4 0c0-1.5-2-3-2-3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ExternalLinkIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function RefreshIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15-6.7L21 7" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 17" />
      <path d="M17 4l4 3-3 3" />
      <path d="M7 20l-4-3 3-3" />
    </svg>
  );
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export default function TrendingPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchTokens = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const r = await fetch(`${API_URL}/api/v1/trending`);
      const data = await r.json();
      setTokens(data.tokens || []);
      setLastUpdate(new Date());
      setError("");
    } catch {
      setError("Trending verisi alınamadı.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTokens(); }, []);

  const isEmpty = !loading && !error && tokens.length === 0;

  // Generate dynamic JSON-LD schema for the trending list
  const schemaOrg = tokens.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": tokens.map((t, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `https://taranoid.app/en/token/${t.token_address}`,
      "name": t.name || t.symbol || "Token"
    }))
  } : null;

  return (
    <main className="min-h-screen grid-bg relative overflow-x-hidden pt-16">
      {schemaOrg && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      )}
      <div className="mesh-bg opacity-30" />
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10 w-full mb-12">

        {/* Header Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bento-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.2)]"
              style={{ background: "rgba(251,191,36,0.1)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.2)" }}
            >
              <FireIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: "var(--cg-text)", textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
                Trending Aramalar
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  style={{
                    display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                    background: "#34D399", boxShadow: "0 0 10px #34D399",
                    animation: "pulse-ring 1.5s ease-out infinite",
                  }}
                />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
                  En çok sorgulananlar
                </span>
                {lastUpdate && (
                  <>
                    <span className="text-xs" style={{ color: "var(--cg-border-strong)" }}>·</span>
                    <span className="text-xs font-mono font-bold" style={{ color: "var(--cg-text-muted)" }}>
                      {lastUpdate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => fetchTokens(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--cg-text)",
              opacity: refreshing ? 0.5 : 1,
              transform: refreshing ? "scale(0.98)" : "none",
            }}
            onMouseEnter={e => {
              if (!refreshing) {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }
            }}
            onMouseLeave={e => {
              if (!refreshing) {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }
            }}
          >
            <span style={{ animation: refreshing ? "spin-slow 0.8s linear infinite" : "none", display: "flex" }}>
              <RefreshIcon />
            </span>
            {refreshing ? "Güncelleniyor..." : "Sistemi Yenile"}
          </button>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bento-card relative overflow-hidden" style={{ height: 100 }}>
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bento-card p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-red-500/10 text-red-500 border border-red-500/20">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-lg font-bold mb-4" style={{ color: "var(--cg-text)" }}>{error}</p>
            <button onClick={() => fetchTokens()} className="cta-button px-8 py-3 text-sm rounded-xl">
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="bento-card p-16 text-center flex flex-col items-center justify-center animate-slide-up">
            <span className="text-6xl mb-6 mix-blend-screen opacity-80">📊</span>
            <h2 className="text-2xl font-black mb-3 tracking-tight" style={{ color: "var(--cg-text)" }}>Sistem Boş</h2>
            <p className="text-sm md:text-base font-medium mb-8 max-w-sm mx-auto" style={{ color: "var(--cg-text-muted)" }}>
              Motor aktif, ancak henüz token taraması yapılmadı. İlk analizi başlatın.
            </p>
            <button onClick={() => router.push("/")} className="cta-button px-10 py-4 text-base rounded-[1.25rem]">
              Ana Sayfaya Dön
            </button>
          </div>
        )}

        {/* Token list */}
        {!loading && !error && tokens.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* Table layout header for larger screens */}
            <div
              className="hidden md:grid grid-cols-12 gap-4 px-6 md:px-8 py-3 text-[10px] font-black uppercase tracking-widest bg-black/20 rounded-xl border border-white/5 backdrop-blur-md"
              style={{ color: "var(--cg-text-dim)" }}
            >
              <div className="col-span-1">#</div>
              <div className="col-span-4 lg:col-span-5">Hedef Varlık</div>
              <div className="col-span-3 lg:col-span-2 text-right">Risk Analizi</div>
              <div className="col-span-2 text-right">Hacim (24s)</div>
              <div className="col-span-2 text-right">Sorgu Yükü</div>
            </div>

            <motion.div
              className="space-y-4"
              variants={listVariants}
              initial="hidden"
              animate="show"
            >
              {tokens.map((token, i) => {
                const color = getRiskColor(token.total_score);
                const riskLabel = getRiskLabel(token.risk_level);
                const shortAddr = `${token.token_address.slice(0, 6)}...${token.token_address.slice(-4)}`;
                const isHighRisk = token.total_score >= 70;

                return (
                  <motion.div
                    key={token.token_address}
                    variants={itemVariants}
                    className="bento-card relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                    onClick={() => router.push(`/token/${token.token_address}`)}
                  >
                    {/* Left accent border */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300"
                      style={{ background: `${color}80` }}
                    />

                    {/* Background glow if high risk */}
                    {isHighRisk && (
                      <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ background: `radial-gradient(circle at right, ${color}, transparent 60%)`, mixBlendMode: 'screen' }}
                      />
                    )}

                    <div className="relative z-10 grid grid-cols-12 gap-4 items-center p-5 pl-7">
                      {/* Rank */}
                      <div className="col-span-2 md:col-span-1">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-transform duration-300 group-hover:scale-110"
                          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                        >
                          {i + 1}
                        </div>
                      </div>

                      {/* Token info */}
                      <div className="col-span-10 md:col-span-4 lg:col-span-5 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }}>{getRiskEmoji(token.total_score)}</span>
                          <span className="font-black text-base truncate tracking-tight transition-colors duration-300 group-hover:text-white" style={{ color: "var(--cg-text)" }}>
                            {token.name || shortAddr}
                          </span>
                          {token.symbol && (
                            <span
                              className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold flex-shrink-0"
                              style={{ background: "rgba(255,255,255,0.06)", color: "var(--cg-text-dim)", border: "1px solid rgba(255,255,255,0.1)" }}
                            >
                              ${token.symbol}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono opacity-60" style={{ color: "var(--cg-text-muted)" }}>{shortAddr}</span>
                          <a
                            href={`https://solscan.io/token/${token.token_address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: "var(--cg-accent)" }}
                          >
                            <ExternalLinkIcon size={14} />
                          </a>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="col-span-12 md:col-span-3 lg:col-span-2 flex items-center justify-between md:flex-col md:items-end md:justify-center gap-1 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                        <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-white/40">Risk Skoru</span>
                        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1">
                          <span
                            className="text-2xl font-black tabular-nums transition-transform duration-300 group-hover:scale-110"
                            style={{
                              color,
                              textShadow: `0 0 20px ${color}60`,
                              animation: isHighRisk ? "neon-pulse 2s ease-in-out infinite" : "none",
                            }}
                          >
                            {token.total_score.toFixed(0)}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-widest"
                            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                          >
                            {riskLabel}
                          </span>
                        </div>
                      </div>

                      {/* Volume */}
                      <div className="hidden md:flex col-span-2 flex-col items-end justify-center">
                        <span className="text-sm font-black font-mono" style={{ color: "var(--cg-text)" }}>
                          {token.volume_24h_usd > 0 ? formatUSD(token.volume_24h_usd) : "—"}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60" style={{ color: "var(--cg-text-dim)" }}>hacim</span>
                      </div>

                      {/* Query count */}
                      <div className="hidden md:flex col-span-2 flex-col items-end justify-center">
                        <span className="text-sm font-black font-mono transition-transform duration-300 group-hover:translate-x-[-2px]" style={{ color: "var(--cg-text-muted)" }}>
                          {token.query_count} Kez
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60" style={{ color: "var(--cg-text-dim)" }}>sorgulandı</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}