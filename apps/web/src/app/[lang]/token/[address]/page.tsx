"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import RiskGauge from "@/components/RiskGauge";
import MetricCard from "@/components/MetricCard";
import HolderChart from "@/components/HolderChart";
import PriceChart from "@/components/PriceChart";
import ClusterGraph from "@/components/ClusterGraph";
import AffiliateBanner from "@/components/AffiliateBanner";
import AnimatedCounter from "@/components/AnimatedCounter";
import ShareButtons from "@/components/ShareButtons";
import { api, TokenAnalysis, ClustersData, APIError } from "@/lib/api";

// ── SVG Icon Library ──

function ShieldIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 3L4 6.5v5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5v-5L12 3z" />
    </svg>
  );
}

function ArrowLeftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function BarChartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="6" width="4" height="15" rx="1" />
      <rect x="17" y="9" width="4" height="12" rx="1" />
    </svg>
  );
}

function DropletIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C12 2 5 10.4 5 15a7 7 0 0 0 14 0c0-4.6-7-13-7-13z" />
    </svg>
  );
}

function UsersIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 6c1.7 0 3 1.3 3 3s-1.3 3-3 3" />
      <path d="M20 20c0-2.7-1.8-5-4.3-5.8" />
    </svg>
  );
}

function NetworkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path d="M12 7.5v4M9.5 13l-2.5 3.5M14.5 13l2.5 3.5" strokeLinecap="round" />
    </svg>
  );
}

function CycleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12a9 9 0 0 1 15-6.7L21 7" strokeLinecap="round" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 17" strokeLinecap="round" />
      <path d="M17 4l4 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 20l-4-3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BotIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 2v6" strokeLinecap="round" />
    </svg>
  );
}

function PackageIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M21 8L12 3 3 8v8l9 5 9-5V8z" />
      <path d="M3 8l9 5 9-5" strokeLinecap="round" />
      <path d="M12 13v8" strokeLinecap="round" />
      <path d="M7.5 5.5L16.5 10.5" strokeLinecap="round" />
    </svg>
  );
}

function TrendDownIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 17l-8.5-8.5-5 5L2 7" />
      <path d="M16 17h6v-6" />
    </svg>
  );
}

function CurveIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 20c4-12 14-12 18 0" />
      <circle cx="3" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="21" cy="20" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function AlertIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ScaleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 9l9-6 9 6" />
      <path d="M3 9l3 6H3" />
      <path d="M21 9l-3 6h3" />
      <path d="M6 15H3M21 15h-3" />
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

function DatabaseIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

export default function TokenPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;

  const [data, setData] = useState<TokenAnalysis | null>(null);
  const [clustersData, setClustersData] = useState<ClustersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWinFlash, setShowWinFlash] = useState(false);

  useEffect(() => {
    if (!address) return;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await api.analyzeToken(address);
        setData(result);
        // Win flash for safe tokens
        if (result.score.total < 30) {
          setShowWinFlash(true);
          setTimeout(() => setShowWinFlash(false), 2000);
        }
        // Küme detaylarını paralel olarak çek (analiz tamamlandıktan sonra cache'de olur)
        api.getClusters(address).then((cd) => {
          if (cd) setClustersData(cd);
        });
      } catch (err) {
        if (err instanceof APIError) {
          setError(err.message);
        } else {
          setError("Analiz sırasında beklenmeyen bir hata oluştu.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [address]);

  const Navbar = () => (
    <nav className="flex items-center justify-between mb-8">
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:opacity-80 group"
        style={{ color: "var(--cg-text-muted)" }}
      >
        <span className="transition-transform group-hover:-translate-x-0.5">
          <ArrowLeftIcon />
        </span>
        Ana Sayfa
      </button>
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: "var(--cg-gradient-brand)",
            boxShadow: "0 3px 10px rgba(59,130,246,0.4)",
          }}
        >
          <ShieldIcon />
        </div>
        <span
          className="font-bold text-sm"
          style={{ color: "var(--cg-text)" }}
        >
          Taranoid
        </span>
      </div>
    </nav>
  );

  // ── Loading ──
  if (loading) {
    return (
      <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-28">
          <div className="relative w-16 h-16 mb-8">
            <div
              className="absolute inset-0 rounded-full animate-spin-slow"
              style={{
                border: "2px solid rgba(255,255,255,0.05)",
                borderTopColor: "var(--cg-accent)",
              }}
            />
            <div
              className="absolute inset-2 rounded-full animate-spin-slow"
              style={{
                border: "2px solid rgba(255,255,255,0.04)",
                borderBottomColor: "#6366F1",
                animationDirection: "reverse",
                animationDuration: "1.8s",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: "var(--cg-accent)" }}>
              <ShieldIcon size={18} />
            </div>
          </div>
          <h1
            className="text-base font-semibold mb-2 animate-border-glow"
            style={{ color: "var(--cg-text)" }}
          >
            Taranoid Scanner: Solana Token Analizi Yükleniyor...
          </h1>
          <p className="text-sm" style={{ color: "var(--cg-text-dim)" }}>
            ⚡ Wash trading, cüzdan kümeleme ve rug pull tespiti yapılıyor...
          </p>
          <div className="flex items-center gap-1.5 mt-4">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--cg-accent)",
                  opacity: 0.3,
                  animation: `pulse-ring 1.5s ease-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ── Error ──
  if (error || !data) {
    return (
      <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-28">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: "var(--cg-red)12", color: "var(--cg-red)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertIcon size={28} />
          </div>
          <p
            className="text-base font-medium mb-6 text-center max-w-sm"
            style={{ color: "var(--cg-text)" }}
          >
            {error || "Token bulunamadı."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="cta-button px-6 py-3 text-sm"
          >
            Yeni Arama
          </button>
        </div>
      </main>
    );
  }

  const { token, score, metrics } = data;
  const warnings_tr = data.warnings_tr || [];
  const report_tr = data.report_tr || "";

  const scoreBreakdown = [
    { label: "VLR (Hacim/Likidite)", weight: 25, score: metrics.vlr.score, color: "#3B82F6" },
    { label: "Cüzdan Kümeleme", weight: 20, score: metrics.cluster?.score ?? 0, color: "#8B5CF6" },
    { label: "Wash Trading", weight: 15, score: metrics.wash?.score ?? 0, color: "#EF4444" },
    { label: "Sybil Attack", weight: 12, score: metrics.sybil?.score ?? 0, color: "#F97316" },
    { label: "Bundler", weight: 10, score: metrics.bundler?.score ?? 0, color: "#F59E0B" },
    { label: "Kademeli Çıkış", weight: 8, score: metrics.exit?.score ?? 0, color: "#10B981" },
    { label: "Holder Analizi", weight: 5, score: metrics.holders.score, color: "#06B6D4" },
    { label: "RLS (Gerçek Likidite)", weight: 5, score: metrics.rls.score, color: "#A78BFA" },
  ];

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Win flash overlay — dopamine hit for safe tokens */}
      {showWinFlash && <div className="win-flash-overlay" />}
      <Navbar />
      <div
        className="bento-card p-6 md:p-8 animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <ScaleIcon size={14} />
          <h3
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--cg-text-dim)" }}
          >
            Skor Dağılımı
          </h3>
        </div>

        <div className="space-y-3.5">
          {scoreBreakdown.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs" style={{ color: "var(--cg-text-muted)" }}>
                  {item.label}
                  <span
                    className="ml-1.5 font-mono text-[10px]"
                    style={{ color: "var(--cg-text-dim)" }}
                  >
                    %{item.weight}
                  </span>
                </span>
                <span
                  className="text-xs font-mono font-bold"
                  style={{ color: item.color }}
                >
                  {Math.round(item.score)}
                </span>
              </div>
              <div className="score-bar">
                <div
                  className="score-bar-fill animate-score-fill"
                  style={{
                    width: `${item.score}%`,
                    background: `linear-gradient(90deg, ${item.color}50, ${item.color})`,
                    boxShadow: `0 0 6px ${item.color}40`,
                  }}
                />
              </div>
            </div>
          ))}

          <div
            className="pt-4 flex justify-between items-center"
            style={{ borderTop: "1px solid var(--cg-border)" }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--cg-text-dim)" }}
            >
              Toplam Skor
            </span>
            <AnimatedCounter
              value={Math.round(score.total)}
              duration={1600}
              className="text-2xl font-bold tabular-nums score-pop"
              style={{
                color: score.color,
                textShadow: `0 0 20px ${score.color}60`,
                display: "inline-block",
                animation: "score-pop 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards",
              }}
            />
          </div>
        </div>
      </div>

      {/* Creator Profiling */}
      {
        metrics.creator?.known && (
          <div
            className="mb-6 p-5 rounded-2xl animate-slide-up"
            style={{
              background: metrics.creator.score >= 60
                ? "rgba(239,68,68,0.05)"
                : metrics.creator.score >= 30
                  ? "rgba(251,146,60,0.05)"
                  : "rgba(52,211,153,0.05)",
              border: `1px solid ${metrics.creator.score >= 60
                ? "rgba(239,68,68,0.2)"
                : metrics.creator.score >= 30
                  ? "rgba(251,146,60,0.2)"
                  : "rgba(52,211,153,0.2)"
                }`,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md"
                    style={{
                      background: metrics.creator.score >= 60
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(255,255,255,0.06)",
                      color: metrics.creator.score >= 60
                        ? "#F87171"
                        : metrics.creator.score >= 30
                          ? "#FB923C"
                          : "#34D399",
                    }}
                  >
                    Yaratıcı Geçmişi
                  </span>
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--cg-text)" }}>
                  {metrics.creator.label_tr}
                </p>
                <p className="text-xs font-mono" style={{ color: "var(--cg-text-dim)" }}>
                  {metrics.creator.creator_wallet.slice(0, 8)}...{metrics.creator.creator_wallet.slice(-6)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div
                  className="text-2xl font-black"
                  style={{
                    color: metrics.creator.score >= 60
                      ? "#F87171"
                      : metrics.creator.score >= 30
                        ? "#FB923C"
                        : "#34D399",
                  }}
                >
                  {metrics.creator.rug_count}/{metrics.creator.total_tokens}
                </div>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
                  rug / toplam
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* AI Türkçe Rapor */}
      {
        report_tr && (
          <div
            className="mb-6 p-5 rounded-2xl animate-slide-up"
            style={{
              background: "rgba(99,102,241,0.05)",
              border: "1px solid rgba(99,102,241,0.15)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md"
                style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}
              >
                AI Analiz Özeti
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
              {report_tr}
            </p>
          </div>
        )
      }

      {/* Affiliate Banner */}
      <div className="mb-8">
        <AffiliateBanner tokenAddress={address} score={score.total} />
      </div>

      {/* Share — dopamine paylaşım butonları */}
      <div
        className="mb-8 p-5 rounded-2xl animate-slide-up"
        style={{
          background: "rgba(129,140,248,0.04)",
          border: "1px solid rgba(129,140,248,0.12)",
        }}
      >
        <ShareButtons
          tokenAddress={address}
          tokenSymbol={token?.symbol}
          score={score.total}
        />
        <div className="flex justify-center mt-6 gap-6">
          <Link
            href="/learn"
            style={{
              fontSize: 12, fontWeight: 600, color: "var(--cg-text-dim)",
              textDecoration: "none", transition: "color 0.2s",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "var(--cg-accent)"; }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "var(--cg-text-dim)"; }}
          >
            📚 Metrikleri Öğren
          </Link>
          <button
            onClick={() => {
              const langStr = params.lang || "en";
              const code = `<iframe src="https://taranoid.com/${langStr}/embed/${address}" width="300" height="140" style="border:none;border-radius:16px;overflow:hidden;"></iframe>`;
              navigator.clipboard.writeText(code);
              alert("🚀 Widget kodu panoya kopyalandı! Kendi sitenize ekleyebilirsiniz.");
            }}
            className="flex items-center gap-1.5"
            style={{
              fontSize: 12, fontWeight: 600, color: "var(--cg-text-dim)",
              textDecoration: "none", transition: "color 0.2s", background: "none", border: "none", cursor: "pointer"
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "var(--cg-accent)"; }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "var(--cg-text-dim)"; }}
          >
            🔗 Widget Kopyala
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8" style={{ borderTop: "1px solid var(--cg-border)" }}>
        <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
          Taranoid analiz sonuçları yatırım tavsiyesi değildir. Kendi araştırmanızı yapın.
        </p>
      </footer>
    </main>
  );
}
