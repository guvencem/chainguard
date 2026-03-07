"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RiskGauge from "@/components/RiskGauge";
import MetricCard from "@/components/MetricCard";
import HolderChart from "@/components/HolderChart";
import PriceChart from "@/components/PriceChart";
import ClusterGraph from "@/components/ClusterGraph";
import AffiliateBanner from "@/components/AffiliateBanner";
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

  useEffect(() => {
    if (!address) return;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await api.analyzeToken(address);
        setData(result);
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
          ChainGuard
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
          <p
            className="text-base font-semibold mb-2"
            style={{ color: "var(--cg-text)" }}
          >
            Token analiz ediliyor
          </p>
          <p className="text-sm" style={{ color: "var(--cg-text-dim)" }}>
            9 metrik hesaplanıyor...
          </p>
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
      <Navbar />

      {/* Token Header */}
      <div className="card-flat p-6 mb-6 animate-slide-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <h1
                className="text-xl font-bold"
                style={{ color: "var(--cg-text)" }}
              >
                {token.name || "Unknown Token"}
              </h1>
              {token.symbol && (
                <span
                  className="px-2.5 py-1 rounded-md text-xs font-mono font-bold"
                  style={{
                    background: "var(--cg-accent-dim)",
                    color: "var(--cg-accent)",
                    border: "1px solid rgba(59,130,246,0.2)",
                  }}
                >
                  ${token.symbol}
                </span>
              )}
              {token.chain && token.chain !== "solana" && (
                <span
                  className="px-2 py-1 rounded-md text-xs font-bold"
                  style={{
                    background: "rgba(251,146,60,0.1)",
                    color: "#FB923C",
                    border: "1px solid rgba(251,146,60,0.2)",
                  }}
                >
                  {token.chain.toUpperCase()}
                </span>
              )}
              {token.platform && (
                <span
                  className="px-2 py-1 rounded-md text-xs font-medium"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--cg-text-dim)",
                    border: "1px solid var(--cg-border-strong)",
                  }}
                >
                  {token.platform}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span
                className="text-xs font-mono"
                style={{ color: "var(--cg-text-dim)" }}
              >
                {address.slice(0, 8)}...{address.slice(-6)}
              </span>
              <a
                href={`https://solscan.io/token/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium hover:underline transition-opacity hover:opacity-80"
                style={{ color: "var(--cg-accent)" }}
              >
                Solscan
                <ExternalLinkIcon />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {data.cached && (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--cg-text-dim)",
                  border: "1px solid var(--cg-border)",
                }}
              >
                <DatabaseIcon />
                Cache
              </span>
            )}
            <span className="text-xs font-mono" style={{ color: "var(--cg-text-dim)" }}>
              {new Date(data.analyzed_at).toLocaleString("tr-TR")}
            </span>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-6 animate-slide-up" style={{ animationDelay: "0.03s" }}>
        <PriceChart tokenAddress={address} tokenSymbol={token.symbol} />
      </div>

      {/* Risk Gauge + Warnings + Token Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div
          className="card-flat p-8 flex items-center justify-center lg:col-span-1 animate-slide-up"
          style={{ animationDelay: "0.05s" }}
        >
          <RiskGauge
            score={score.total}
            label={score.label_tr}
            color={score.color}
          />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {warnings_tr.length > 0 && (
            <div className="space-y-2.5 animate-slide-up" style={{ animationDelay: "0.08s" }}>
              {warnings_tr.map((w: string, i: number) => (
                <div
                  key={i}
                  className="warning-banner flex items-start gap-2.5"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }}>
                    <AlertIcon />
                  </span>
                  {w}
                </div>
              ))}
            </div>
          )}

          <div
            className="card-flat p-5 flex-1 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <h3
              className="text-xs font-semibold mb-4 uppercase tracking-widest"
              style={{ color: "var(--cg-text-dim)" }}
            >
              Token Bilgileri
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
              {[
                {
                  label: "Supply",
                  value: token.supply
                    ? Number(token.supply).toLocaleString("tr-TR")
                    : "—",
                },
                {
                  label: "Decimals",
                  value: token.decimals?.toString() || "—",
                },
                { label: "Platform", value: token.platform || "—" },
                {
                  label: "Yaratıcı",
                  value: token.creator_wallet
                    ? `${token.creator_wallet.slice(0, 6)}...${token.creator_wallet.slice(-4)}`
                    : "—",
                },
                {
                  label: "Oluşturma",
                  value: token.created_at
                    ? new Date(token.created_at).toLocaleDateString("tr-TR")
                    : "—",
                },
                { label: "Risk Seviyesi", value: score.level },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    className="text-[10px] uppercase tracking-widest mb-1 font-semibold"
                    style={{ color: "var(--cg-text-dim)" }}
                  >
                    {item.label}
                  </div>
                  <div
                    className="text-sm font-mono font-medium"
                    style={{ color: "var(--cg-text-muted)" }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section header: Temel Metrikler */}
      <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: "0.12s" }}>
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
          Temel Metrikler
        </h2>
        <div className="flex-1 h-px" style={{ background: "var(--cg-border)" }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="Hacim / Likidite"
          value={`${metrics.vlr.value}x`}
          score={metrics.vlr.score}
          label={metrics.vlr.label_tr}
          icon={<BarChartIcon />}
          metricKey="vlr"
          details={[
            { label: "24s Hacim", value: `$${metrics.vlr.volume_24h.toLocaleString("tr-TR")}` },
            { label: "Likidite", value: `$${metrics.vlr.liquidity.toLocaleString("tr-TR")}` },
          ]}
        />
        <MetricCard
          title="Gerçek Likidite"
          value={`${metrics.rls.value}x`}
          score={metrics.rls.score}
          label={metrics.rls.label_tr}
          icon={<DropletIcon />}
          metricKey="rls"
          details={[
            { label: "Market Cap", value: `$${metrics.rls.mcap.toLocaleString("tr-TR")}` },
            { label: "Gerçek Çıkış", value: `$${metrics.rls.real_exit_value.toLocaleString("tr-TR")}` },
          ]}
        />
        <MetricCard
          title="Holder Analizi"
          value={
            metrics.holders.count >= 1_000_000
              ? `${(metrics.holders.count / 1_000_000).toFixed(1)}M`
              : metrics.holders.count >= 1_000
              ? `${(metrics.holders.count / 1_000).toFixed(0)}K`
              : metrics.holders.count.toString()
          }
          score={metrics.holders.score}
          label={metrics.holders.label_tr}
          icon={<UsersIcon />}
          metricKey="holders"
          details={[
            { label: "Aktif (1s)", value: metrics.holders.active_1h.toString() },
            { label: "Top 10", value: `%${(metrics.holders.top10_concentration * 100).toFixed(1)}` },
          ]}
        />
      </div>

      {/* Section header: Gelismis Analiz */}
      <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: "0.16s" }}>
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
          Gelişmiş Analiz
        </h2>
        <div className="flex-1 h-px" style={{ background: "var(--cg-border)" }} />
        <span
          className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest"
          style={{ background: "var(--cg-accent-dim)", color: "var(--cg-accent)", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          Sprint 2
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="Cüzdan Kümeleme"
          value={`${metrics.cluster?.cluster_count ?? 0}`}
          score={metrics.cluster?.score ?? 0}
          label={metrics.cluster?.label_tr || "Küme tespit edilmedi"}
          icon={<NetworkIcon />}
          metricKey="cluster"
          details={[
            { label: "En Büyük Küme", value: `%${((metrics.cluster?.largest_pct ?? 0) * 100).toFixed(1)}` },
            { label: "Bağlantılı Cüzdan", value: (metrics.cluster?.total_wallets ?? 0).toString() },
          ]}
        />
        <MetricCard
          title="Wash Trading"
          value={`${metrics.wash?.cycles_found ?? 0}`}
          score={metrics.wash?.score ?? 0}
          label={metrics.wash?.label_tr || "Döngü tespit edilmedi"}
          icon={<CycleIcon />}
          metricKey="wash"
          details={[
            { label: "Sahte Hacim", value: `%${(metrics.wash?.fake_volume_pct ?? 0).toFixed(1)}` },
            { label: "Döngü Hacmi", value: `$${(metrics.wash?.cycle_volume_usd ?? 0).toLocaleString("tr-TR")}` },
          ]}
        />
        <MetricCard
          title="Sybil Attack"
          value={`%${((metrics.sybil?.young_wallet_pct ?? 0) * 100).toFixed(0)}`}
          score={metrics.sybil?.score ?? 0}
          label={metrics.sybil?.label_tr || "Sybil tespit edilmedi"}
          icon={<BotIcon />}
          metricKey="sybil"
          details={[
            { label: "Tek Token Cüzdan", value: `%${((metrics.sybil?.single_token_pct ?? 0) * 100).toFixed(0)}` },
          ]}
        />
        <MetricCard
          title="Bundler Tespiti"
          value={metrics.bundler?.detected ? "EVET" : "Hayır"}
          score={metrics.bundler?.score ?? 0}
          label={metrics.bundler?.label_tr || "Bundler tespit edilmedi"}
          icon={<PackageIcon />}
          metricKey="bundler"
          details={[
            { label: "Bundle Sayısı", value: (metrics.bundler?.bundle_count ?? 0).toString() },
            { label: "Max Alıcı/Slot", value: (metrics.bundler?.max_recipients ?? 0).toString() },
          ]}
        />
        <MetricCard
          title="Kademeli Çıkış"
          value={`${metrics.exit?.stages ?? 0}`}
          score={metrics.exit?.score ?? 0}
          label={metrics.exit?.label_tr || "Çıkış paterni yok"}
          icon={<TrendDownIcon />}
          metricKey="exit"
          details={[
            { label: "Satıcı = Kurucu", value: metrics.exit?.seller_is_creator ? "Evet" : "Hayır" },
          ]}
        />
        <MetricCard
          title="Bonding Curve"
          value={metrics.curve?.graduation_time_min ? `${metrics.curve.graduation_time_min}dk` : "—"}
          score={metrics.curve?.score ?? 0}
          label={metrics.curve?.label_tr || "Pump.fun verisi yok"}
          icon={<CurveIcon />}
          metricKey="curve"
          details={[
            { label: "Platform", value: metrics.curve?.platform || "—" },
          ]}
        />
      </div>

      {/* Cluster Graph */}
      <div className="mb-6 animate-slide-up" style={{ animationDelay: "0.18s" }}>
        <ClusterGraph
          clusterCount={metrics.cluster?.cluster_count ?? 0}
          totalWallets={metrics.cluster?.total_wallets ?? 0}
          largestPct={metrics.cluster?.largest_pct ?? 0}
          score={metrics.cluster?.score ?? 0}
          clusters={clustersData?.clusters}
        />
      </div>

      {/* Holder Chart + Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <HolderChart
          top10Concentration={metrics.holders.top10_concentration}
          holderCount={metrics.holders.count}
        />

        <div
          className="card-flat p-6 animate-slide-up"
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
              <span
                className="text-2xl font-bold tabular-nums"
                style={{ color: score.color }}
              >
                {Math.round(score.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Profiling */}
      {metrics.creator?.known && (
        <div
          className="mb-6 p-5 rounded-2xl animate-slide-up"
          style={{
            background: metrics.creator.score >= 60
              ? "rgba(239,68,68,0.05)"
              : metrics.creator.score >= 30
              ? "rgba(251,146,60,0.05)"
              : "rgba(52,211,153,0.05)",
            border: `1px solid ${
              metrics.creator.score >= 60
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
      )}

      {/* AI Türkçe Rapor */}
      {report_tr && (
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
      )}

      {/* Affiliate Banner */}
      <div className="mb-8">
        <AffiliateBanner tokenAddress={address} score={score.total} />
      </div>

      {/* Share */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
          Bu analizi paylaş:
        </span>
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(`https://chainguard-beryl.vercel.app/token/${address}`)}&text=${encodeURIComponent(`${token?.symbol ? `$${token.symbol}` : "Token"} risk skoru: ${Math.round(score.total)}/100 — ChainGuard analizi`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="metric-badge hover:opacity-80 transition-opacity flex items-center gap-1.5"
          style={{ background: "rgba(33,150,243,0.1)", color: "#29B6F6", border: "1px solid rgba(33,150,243,0.2)", padding: "6px 14px" }}
        >
          Telegram'da Paylaş
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`$${token?.symbol || "Token"} risk skoru: ${Math.round(score.total)}/100 ${score.total >= 60 ? "⚠️ Yüksek risk!" : "✅ Düşük risk"} — ChainGuard analizi:`)}&url=${encodeURIComponent(`https://chainguard-beryl.vercel.app/token/${address}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="metric-badge hover:opacity-80 transition-opacity flex items-center gap-1.5"
          style={{ background: "rgba(0,0,0,0.2)", color: "var(--cg-text-muted)", border: "1px solid rgba(255,255,255,0.08)", padding: "6px 14px" }}
        >
          X'te Paylaş
        </a>
        <a
          href={`/learn`}
          className="metric-badge hover:opacity-80 transition-opacity"
          style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)", padding: "6px 14px" }}
        >
          Metrikleri Öğren
        </a>
      </div>

      {/* Footer */}
      <footer className="text-center py-8" style={{ borderTop: "1px solid var(--cg-border)" }}>
        <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
          ChainGuard analiz sonuçları yatırım tavsiyesi değildir. Kendi araştırmanızı yapın.
        </p>
      </footer>
    </main>
  );
}
