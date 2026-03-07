"use client";

import { useEffect, useState } from "react";

interface PriceData {
  price: number;
  priceChange24h: number;
  priceChange1h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
  pairAddress: string;
  dexId: string;
}

interface OHLCVCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceChartProps {
  tokenAddress: string;
  tokenSymbol?: string | null;
}

function formatPrice(price: number): string {
  if (price === 0) return "—";
  if (price < 0.000001) return `$${price.toExponential(2)}`;
  if (price < 0.001) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  if (price < 1000) return `$${price.toFixed(2)}`;
  return `$${(price / 1000).toFixed(1)}K`;
}

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V3M3 6l3-3 3 3" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v6M3 6l3 3 3-3" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 7v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3" />
      <path d="M8 1h3v3" />
      <path d="M5 7L11 1" />
    </svg>
  );
}

// ── SVG Area Chart ──────────────────────────────────────────

function AreaChart({
  candles,
  color,
  height = 100,
}: {
  candles: OHLCVCandle[];
  color: string;
  height?: number;
}) {
  if (!candles || candles.length < 2) return null;

  const prices = candles.map((c) => c.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const W = 600;
  const H = height;
  const PAD = 2;

  const pts = prices.map((v, i) => ({
    x: PAD + (i / (prices.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (v - min) / range) * (H - PAD * 2),
  }));

  // Smooth bezier
  let linePath = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2;
    linePath += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }

  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x},${H} L ${pts[0].x},${H} Z`;

  const gradId = `pg-${color.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
      />
      {/* Last price dot */}
      <circle
        cx={pts[pts.length - 1].x}
        cy={pts[pts.length - 1].y}
        r="3"
        fill={color}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

// ── Volume Bars ─────────────────────────────────────────────

function VolumeBars({ candles, color }: { candles: OHLCVCandle[]; color: string }) {
  if (!candles || candles.length < 2) return null;

  const vols = candles.map((c) => c.volume);
  const maxVol = Math.max(...vols) || 1;
  const W = 600;
  const H = 28;
  const barW = W / candles.length - 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
      {candles.map((c, i) => {
        const barH = (c.volume / maxVol) * H;
        return (
          <rect
            key={i}
            x={i * (W / candles.length)}
            y={H - barH}
            width={barW}
            height={barH}
            fill={`${color}30`}
            rx="1"
          />
        );
      })}
    </svg>
  );
}

// ── Loading Skeleton ─────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`shimmer ${className || ""}`}
      style={{ borderRadius: 6 }}
    />
  );
}

// ── Main Component ───────────────────────────────────────────

export default function PriceChart({ tokenAddress, tokenSymbol }: PriceChartProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [candles, setCandles] = useState<OHLCVCandle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!tokenAddress) return;

    const fetchAll = async () => {
      setLoading(true);
      setError(false);

      try {
        // 1. DexScreener
        const dsRes = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
          { cache: "no-store" }
        );
        if (!dsRes.ok) throw new Error("DexScreener error");
        const dsData = await dsRes.json();

        const pairs: any[] = (dsData.pairs || []).filter(
          (p: any) => p.chainId === "solana"
        );
        if (!pairs.length) {
          setLoading(false);
          return;
        }

        const best = pairs.sort(
          (a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
        )[0];

        setPriceData({
          price: parseFloat(best.priceUsd || "0"),
          priceChange24h: best.priceChange?.h24 || 0,
          priceChange1h: best.priceChange?.h1 || 0,
          volume24h: best.volume?.h24 || 0,
          liquidity: best.liquidity?.usd || 0,
          marketCap: best.marketCap || best.fdv || 0,
          pairAddress: best.pairAddress || "",
          dexId: best.dexId || "",
        });

        // 2. GeckoTerminal OHLCV
        if (best.pairAddress) {
          try {
            const gtRes = await fetch(
              `https://api.geckoterminal.com/api/v2/networks/solana/pools/${best.pairAddress}/ohlcv/minute?aggregate=15&limit=48`,
              {
                headers: { Accept: "application/json" },
                cache: "no-store",
              }
            );
            if (gtRes.ok) {
              const gtData = await gtRes.json();
              const raw: any[][] =
                gtData?.data?.attributes?.ohlcv_list || [];
              const parsed: OHLCVCandle[] = raw
                .slice()
                .reverse()
                .map((c) => ({
                  time: c[0],
                  open: parseFloat(c[1]),
                  high: parseFloat(c[2]),
                  low: parseFloat(c[3]),
                  close: parseFloat(c[4]),
                  volume: parseFloat(c[5]),
                }));
              setCandles(parsed);
            }
          } catch {
            // OHLCV olmasa da devam et
          }
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [tokenAddress]);

  const isPositive = (priceData?.priceChange24h ?? 0) >= 0;
  const chartColor = isPositive ? "#10B981" : "#EF4444";

  // ── Error / No Data ──
  if (!loading && (error || !priceData)) {
    return (
      <div
        className="card-flat p-5 flex items-center justify-center"
        style={{ minHeight: 180 }}
      >
        <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
          Fiyat verisi bulunamadı
        </p>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="card-flat p-5" style={{ minHeight: 220 }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Skeleton className="h-20 w-full mb-1" />
        <Skeleton className="h-7 w-full" />
      </div>
    );
  }

  return (
    <div className="card-flat p-5 animate-slide-up">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        {/* Price */}
        <div>
          <div
            className="text-2xl font-bold tabular-nums mb-1"
            style={{ color: "var(--cg-text)" }}
          >
            {formatPrice(priceData!.price)}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md"
              style={{
                background: isPositive
                  ? "rgba(16, 185, 129, 0.12)"
                  : "rgba(239, 68, 68, 0.12)",
                color: isPositive ? "#10B981" : "#EF4444",
              }}
            >
              {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {Math.abs(priceData!.priceChange24h).toFixed(2)}%
            </span>
            <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
              24s
            </span>
            {priceData!.priceChange1h !== 0 && (
              <>
                <span
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={{
                    background:
                      priceData!.priceChange1h >= 0
                        ? "rgba(16, 185, 129, 0.12)"
                        : "rgba(239, 68, 68, 0.12)",
                    color:
                      priceData!.priceChange1h >= 0 ? "#10B981" : "#EF4444",
                  }}
                >
                  {priceData!.priceChange1h >= 0 ? (
                    <ArrowUpIcon />
                  ) : (
                    <ArrowDownIcon />
                  )}
                  {Math.abs(priceData!.priceChange1h).toFixed(2)}%
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--cg-text-dim)" }}
                >
                  1s
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 sm:gap-8">
          {[
            { label: "Hacim 24s", value: formatVolume(priceData!.volume24h) },
            { label: "Likidite", value: formatVolume(priceData!.liquidity) },
            ...(priceData!.marketCap
              ? [{ label: "Market Cap", value: formatVolume(priceData!.marketCap) }]
              : []),
          ].map((s) => (
            <div key={s.label}>
              <div
                className="text-[10px] uppercase tracking-widest mb-1 font-semibold"
                style={{ color: "var(--cg-text-dim)" }}
              >
                {s.label}
              </div>
              <div
                className="text-sm font-bold font-mono"
                style={{ color: "var(--cg-text)" }}
              >
                {s.value}
              </div>
            </div>
          ))}

          {/* DexScreener link */}
          {priceData!.pairAddress && (
            <a
              href={`https://dexscreener.com/solana/${priceData!.pairAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium hover:underline"
              style={{ color: "var(--cg-accent)" }}
            >
              DexScreener
              <ExternalIcon />
            </a>
          )}
        </div>
      </div>

      {/* Chart area */}
      {candles.length > 2 ? (
        <>
          {/* Area chart */}
          <div style={{ height: 100 }}>
            <AreaChart candles={candles} color={chartColor} height={100} />
          </div>
          {/* Volume bars */}
          <div style={{ height: 28, marginTop: 2 }}>
            <VolumeBars candles={candles} color={chartColor} />
          </div>
          {/* Time labels */}
          <div className="flex justify-between mt-1">
            <span className="text-[10px]" style={{ color: "var(--cg-text-dim)" }}>
              12s önce
            </span>
            <span className="text-[10px]" style={{ color: "var(--cg-text-dim)" }}>
              Şimdi
            </span>
          </div>
        </>
      ) : (
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            height: 130,
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed var(--cg-border)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
            Grafik verisi yükleniyor...
          </p>
        </div>
      )}

      {/* DEX info */}
      {priceData!.dexId && (
        <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid var(--cg-border)" }}>
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
            DEX
          </span>
          <span
            className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "var(--cg-text-muted)",
              border: "1px solid var(--cg-border)",
              textTransform: "uppercase",
            }}
          >
            {priceData!.dexId}
          </span>
        </div>
      )}
    </div>
  );
}
