"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  if (score < 20) return "#34D399";
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

function formatUSD(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function ShieldIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 3L4 6.5v5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5v-5L12 3z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" />
    </svg>
  );
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

export default function TrendingPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/v1/trending`)
      .then(r => r.json())
      .then(data => {
        setTokens(data.tokens || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Trending verisi alınamadı.");
        setLoading(false);
      });
  }, []);

  const isEmpty = !loading && !error && tokens.length === 0;

  return (
    <main className="min-h-screen grid-bg">
      {/* Background orb */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
      />

      {/* Navbar */}
      <nav className="nav-glass sticky top-0 z-50 px-6 md:px-10 h-16 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm font-medium transition-all hover:opacity-80"
          style={{ color: "var(--cg-text-muted)" }}
        >
          ← Ana Sayfa
        </button>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)", boxShadow: "0 0 16px rgba(99,102,241,0.4)", color: "white" }}
          >
            <ShieldIcon />
          </div>
          <span className="font-black text-sm" style={{ color: "var(--cg-text)" }}>ChainGuard</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(251,191,36,0.12)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.2)" }}
            >
              <FireIcon size={18} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--cg-text)" }}>
                Trending Tokenlar
              </h1>
              <p className="text-sm" style={{ color: "var(--cg-text-muted)" }}>
                En çok sorgulanan tokenlar — gerçek zamanlı risk verileriyle
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="shimmer h-20 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card-flat p-8 text-center">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="font-semibold mb-2" style={{ color: "var(--cg-text)" }}>{error}</p>
            <button onClick={() => window.location.reload()} className="cta-button px-6 py-2.5 text-sm mt-4">
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="card-flat p-12 text-center animate-slide-up">
            <p className="text-5xl mb-5">📊</p>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--cg-text)" }}>Henüz Veri Yok</h2>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--cg-text-muted)" }}>
              Token analiz ettikçe burada listelenecek. İlk analizi başlatmak için ana sayfaya dön.
            </p>
            <button onClick={() => router.push("/")} className="cta-button px-6 py-3 text-sm">
              Token Analiz Et
            </button>
          </div>
        )}

        {/* Token list */}
        {!loading && !error && tokens.length > 0 && (
          <div className="space-y-3">
            {/* Table header */}
            <div
              className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--cg-text-dim)" }}
            >
              <div className="col-span-1">#</div>
              <div className="col-span-4">Token</div>
              <div className="col-span-2 text-right">Risk Skoru</div>
              <div className="col-span-2 text-right">Hacim 24s</div>
              <div className="col-span-2 text-right">Market Cap</div>
              <div className="col-span-1 text-right">Sorgu</div>
            </div>

            {tokens.map((token, i) => {
              const color = getRiskColor(token.total_score);
              const riskLabel = getRiskLabel(token.risk_level);
              const shortAddr = `${token.token_address.slice(0, 6)}...${token.token_address.slice(-4)}`;

              return (
                <div
                  key={token.token_address}
                  className="card-flat animate-slide-up cursor-pointer group"
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => router.push(`/token/${token.token_address}`)}
                >
                  <div className="grid grid-cols-12 gap-4 items-center p-5">
                    {/* Rank */}
                    <div className="col-span-1">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                        style={{ background: `${color}12`, color }}
                      >
                        {i + 1}
                      </div>
                    </div>

                    {/* Token info */}
                    <div className="col-span-5 md:col-span-4 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm truncate" style={{ color: "var(--cg-text)" }}>
                          {token.name || shortAddr}
                        </span>
                        {token.symbol && (
                          <span
                            className="px-2 py-0.5 rounded-md text-xs font-mono font-bold flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.06)", color: "var(--cg-text-dim)" }}
                          >
                            ${token.symbol}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono" style={{ color: "var(--cg-text-dim)" }}>{shortAddr}</span>
                        <a
                          href={`https://solscan.io/token/${token.token_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: "var(--cg-accent)" }}
                        >
                          <ExternalLinkIcon />
                        </a>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="col-span-3 md:col-span-2 flex flex-col items-end gap-1">
                      <span className="text-xl font-black tabular-nums" style={{ color, textShadow: `0 0 16px ${color}40` }}>
                        {token.total_score.toFixed(0)}
                      </span>
                      <span
                        className="metric-badge"
                        style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}
                      >
                        {riskLabel}
                      </span>
                    </div>

                    {/* Volume */}
                    <div className="hidden md:flex col-span-2 flex-col items-end">
                      <span className="text-sm font-bold font-mono" style={{ color: "var(--cg-text)" }}>
                        {token.volume_24h_usd > 0 ? formatUSD(token.volume_24h_usd) : "—"}
                      </span>
                      <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>hacim</span>
                    </div>

                    {/* MCap */}
                    <div className="hidden md:flex col-span-2 flex-col items-end">
                      <span className="text-sm font-bold font-mono" style={{ color: "var(--cg-text)" }}>
                        {token.mcap_usd > 0 ? formatUSD(token.mcap_usd) : "—"}
                      </span>
                      <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>mcap</span>
                    </div>

                    {/* Query count */}
                    <div className="hidden md:flex col-span-1 flex-col items-end">
                      <span className="text-sm font-bold" style={{ color: "var(--cg-text-muted)" }}>
                        {token.query_count}x
                      </span>
                    </div>
                  </div>

                  {/* Score bar at bottom */}
                  <div className="score-bar mx-5 mb-4" style={{ height: "3px" }}>
                    <div
                      className="score-bar-fill"
                      style={{ width: `${token.total_score}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <footer className="text-center py-12">
          <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
            Risk skorları yatırım tavsiyesi değildir. DYOR.
          </p>
        </footer>
      </div>
    </main>
  );
}
