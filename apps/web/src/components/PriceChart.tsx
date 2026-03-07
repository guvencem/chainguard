"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────────

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
  time: number; // unix seconds
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

// ── Helpers ────────────────────────────────────────────────

function formatPrice(price: number): string {
  if (!price) return "—";
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

function formatTime(unixSec: number): string {
  return new Date(unixSec * 1000).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(unixSec: number): string {
  return new Date(unixSec * 1000).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
  });
}

// ── Icons ──────────────────────────────────────────────────

function ArrowUpIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V3M3 6l3-3 3 3" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v6M3 6l3 3 3-3" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 7v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3" />
      <path d="M8 1h3v3M5 7L11 1" />
    </svg>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={spinning ? { animation: "spin-slow 1s linear infinite" } : undefined}
    >
      <path d="M10 6A4 4 0 1 1 6 2M6 2l2 2-2 2" />
    </svg>
  );
}

// ── Loading Skeleton ───────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`shimmer ${className ?? ""}`} style={{ borderRadius: 6 }} />;
}

// ── Chart Constants ────────────────────────────────────────

const VW = 600; // SVG viewBox width
const VH = 130; // SVG viewBox height
const PAD_X = 2;
const PAD_Y = 6;

// ── Interactive Chart ─────────────────────────────────────

function InteractiveChart({
  candles,
  color,
  onHover,
}: {
  candles: OHLCVCandle[];
  color: string;
  onHover: (candle: OHLCVCandle | null, pct: number | null) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  const prices = candles.map((c) => c.close);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const pts = prices.map((v, i) => ({
    x: PAD_X + (i / (prices.length - 1)) * (VW - PAD_X * 2),
    y: PAD_Y + (1 - (v - minP) / range) * (VH - PAD_Y * 2),
  }));

  // Smooth cubic bezier path
  let linePath = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2;
    linePath += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }
  const areaPath = `${linePath} L ${pts[pts.length - 1].x},${VH} L ${pts[0].x},${VH} Z`;
  const gradId = `pg-${color.replace("#", "")}`;

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const idx = Math.round(pct * (candles.length - 1));
      setHoverIdx(idx);
      onHover(candles[idx], pct);
    },
    [candles, onHover]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverIdx(null);
    onHover(null, null);
  }, [onHover]);

  const hoverPt = hoverIdx !== null ? pts[hoverIdx] : null;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="none"
      className="w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: "crosshair", display: "block" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="chartGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Line */}
      <path
        d={linePath}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        filter="url(#chartGlow)"
      />

      {/* Last price dot (hidden when hovering) */}
      {hoverIdx === null && (
        <>
          <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="5" fill={color} opacity="0.15" />
          <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill={color} filter="url(#chartGlow)" />
        </>
      )}

      {/* Crosshair */}
      {hoverPt && (
        <>
          {/* Vertical line */}
          <line
            x1={hoverPt.x} y1={0}
            x2={hoverPt.x} y2={VH}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          {/* Horizontal line */}
          <line
            x1={0} y1={hoverPt.y}
            x2={VW} y2={hoverPt.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          {/* Outer ring */}
          <circle cx={hoverPt.x} cy={hoverPt.y} r="7" fill={color} opacity="0.15" />
          {/* Inner dot */}
          <circle
            cx={hoverPt.x}
            cy={hoverPt.y}
            r="4"
            fill={color}
            stroke="rgba(7,11,20,0.9)"
            strokeWidth="1.5"
            filter="url(#chartGlow)"
          />
        </>
      )}
    </svg>
  );
}

// ── Volume Bars ────────────────────────────────────────────

function VolumeBars({
  candles,
  color,
  hoverIdx,
}: {
  candles: OHLCVCandle[];
  color: string;
  hoverIdx: number | null;
}) {
  const vols = candles.map((c) => c.volume);
  const maxVol = Math.max(...vols) || 1;
  const barW = VW / candles.length - 0.8;

  return (
    <svg viewBox={`0 0 ${VW} 32`} preserveAspectRatio="none" className="w-full h-full" style={{ display: "block" }}>
      {candles.map((c, i) => {
        const barH = Math.max(1, (c.volume / maxVol) * 32);
        const isHovered = i === hoverIdx;
        return (
          <rect
            key={i}
            x={i * (VW / candles.length)}
            y={32 - barH}
            width={barW}
            height={barH}
            fill={isHovered ? `${color}60` : `${color}25`}
            rx="1"
          />
        );
      })}
    </svg>
  );
}

// ── Hover Tooltip ─────────────────────────────────────────

function HoverTooltip({
  candle,
  pct,
  color,
}: {
  candle: OHLCVCandle;
  pct: number;
  color: string;
}) {
  const isLeft = pct > 0.65;
  const priceUp = candle.close >= candle.open;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        [isLeft ? "right" : "left"]: isLeft ? "4px" : `${pct * 100}%`,
        transform: isLeft ? "none" : "translateX(-50%)",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <div
        style={{
          background: "#0C1120",
          border: "1px solid rgba(148,163,184,0.15)",
          borderRadius: 10,
          padding: "8px 12px",
          minWidth: 148,
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        }}
      >
        {/* Time */}
        <div
          style={{
            fontSize: 10,
            color: "#475569",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {formatDate(candle.time)} · {formatTime(candle.time)}
        </div>
        {/* OHLC grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 12px" }}>
          {[
            { label: "Açılış", value: formatPrice(candle.open) },
            { label: "Kapanış", value: formatPrice(candle.close) },
            { label: "Yüksek", value: formatPrice(candle.high) },
            { label: "Düşük", value: formatPrice(candle.low) },
          ].map((row) => (
            <div key={row.label}>
              <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {row.label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono, monospace)",
                  color: row.label === "Kapanış" ? (priceUp ? "#10B981" : "#EF4444") : "#E2E8F0",
                }}
              >
                {row.value}
              </div>
            </div>
          ))}
        </div>
        {/* Volume */}
        <div
          style={{
            marginTop: 6,
            paddingTop: 6,
            borderTop: "1px solid rgba(148,163,184,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 9, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Hacim
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono, monospace)", color: `${color}CC` }}>
            {formatVolume(candle.volume)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export default function PriceChart({ tokenAddress, tokenSymbol }: PriceChartProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [candles, setCandles] = useState<OHLCVCandle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Hover state
  const [hoverCandle, setHoverCandle] = useState<OHLCVCandle | null>(null);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const pairAddressRef = useRef<string>("");

  // ── Fetch OHLCV ──
  const fetchOHLCV = useCallback(async (pairAddress: string) => {
    try {
      const res = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/solana/pools/${pairAddress}/ohlcv/minute?aggregate=15&limit=48`,
        { headers: { Accept: "application/json" }, cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      const raw: any[][] = data?.data?.attributes?.ohlcv_list || [];
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
    } catch {
      // OHLCV olmasa da devam
    }
  }, []);

  // ── Fetch price only (for refresh) ──
  const fetchPriceOnly = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      const pairs: any[] = (data.pairs || []).filter((p: any) => p.chainId === "solana");
      if (!pairs.length) return;
      const best = pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
      setPriceData((prev) => prev ? {
        ...prev,
        price: parseFloat(best.priceUsd || "0"),
        priceChange24h: best.priceChange?.h24 || 0,
        priceChange1h: best.priceChange?.h1 || 0,
        volume24h: best.volume?.h24 || 0,
      } : prev);
      setLastUpdated(new Date());
    } catch {
      // sessiz hata
    } finally {
      setRefreshing(false);
    }
  }, [tokenAddress]);

  // ── Initial full fetch ──
  useEffect(() => {
    if (!tokenAddress) return;

    const fetchAll = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("dexscreener");
        const data = await res.json();

        const pairs: any[] = (data.pairs || []).filter((p: any) => p.chainId === "solana");
        if (!pairs.length) { setLoading(false); return; }

        const best = pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

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
        setLastUpdated(new Date());
        pairAddressRef.current = best.pairAddress || "";

        if (best.pairAddress) {
          await fetchOHLCV(best.pairAddress);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [tokenAddress, fetchOHLCV]);

  // ── 30s auto-refresh (price only) ──
  useEffect(() => {
    const interval = setInterval(fetchPriceOnly, 30_000);
    return () => clearInterval(interval);
  }, [fetchPriceOnly]);

  // ── Hover handler ──
  const handleHover = useCallback(
    (candle: OHLCVCandle | null, pct: number | null) => {
      setHoverCandle(candle);
      setHoverPct(pct);
      if (candle && candles.length) {
        const idx = candles.indexOf(candle);
        setHoverIdx(idx >= 0 ? idx : null);
      } else {
        setHoverIdx(null);
      }
    },
    [candles]
  );

  // ── Derived display values ──
  const displayPrice = hoverCandle ? hoverCandle.close : priceData?.price ?? 0;
  const isPositive = (priceData?.priceChange24h ?? 0) >= 0;
  const chartColor = isPositive ? "#10B981" : "#EF4444";
  const hoverUp = hoverCandle ? hoverCandle.close >= hoverCandle.open : null;

  // ── Render ──

  if (!loading && (error || !priceData)) {
    return (
      <div className="card-flat p-5 flex items-center justify-center" style={{ minHeight: 180 }}>
        <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>Fiyat verisi bulunamadı</p>
      </div>
    );
  }

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
        <Skeleton className="h-32 w-full mb-1" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="card-flat p-5 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        {/* Price + changes */}
        <div>
          <div
            className="text-2xl font-bold tabular-nums mb-1.5 transition-all duration-100"
            style={{
              color: hoverCandle
                ? hoverUp
                  ? "#10B981"
                  : "#EF4444"
                : "var(--cg-text)",
            }}
          >
            {formatPrice(displayPrice)}
            {hoverCandle && (
              <span
                className="ml-2 text-sm font-semibold"
                style={{ color: hoverUp ? "#10B981" : "#EF4444" }}
              >
                {hoverUp ? "+" : ""}
                {(((hoverCandle.close - hoverCandle.open) / hoverCandle.open) * 100).toFixed(2)}%
              </span>
            )}
          </div>
          {!hoverCandle && (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md"
                style={{
                  background: isPositive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                  color: isPositive ? "#10B981" : "#EF4444",
                }}
              >
                {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {Math.abs(priceData!.priceChange24h).toFixed(2)}%
              </span>
              <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>24s</span>

              {priceData!.priceChange1h !== 0 && (
                <>
                  <span
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      background: priceData!.priceChange1h >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                      color: priceData!.priceChange1h >= 0 ? "#10B981" : "#EF4444",
                    }}
                  >
                    {priceData!.priceChange1h >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    {Math.abs(priceData!.priceChange1h).toFixed(2)}%
                  </span>
                  <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>1s</span>
                </>
              )}
            </div>
          )}
          {hoverCandle && (
            <div className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
              {formatDate(hoverCandle.time)} · {formatTime(hoverCandle.time)}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 sm:gap-7 flex-wrap">
          {[
            { label: "Hacim 24s", value: formatVolume(priceData!.volume24h) },
            { label: "Likidite", value: formatVolume(priceData!.liquidity) },
            ...(priceData!.marketCap ? [{ label: "Mkt Cap", value: formatVolume(priceData!.marketCap) }] : []),
          ].map((s) => (
            <div key={s.label}>
              <div className="text-[10px] uppercase tracking-widest mb-1 font-semibold" style={{ color: "var(--cg-text-dim)" }}>
                {s.label}
              </div>
              <div className="text-sm font-bold font-mono" style={{ color: "var(--cg-text)" }}>
                {s.value}
              </div>
            </div>
          ))}

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
          {/* Area chart with hover */}
          <div style={{ height: 130, position: "relative" }}>
            <InteractiveChart candles={candles} color={chartColor} onHover={handleHover} />
            {/* Tooltip overlay */}
            {hoverCandle && hoverPct !== null && (
              <HoverTooltip candle={hoverCandle} pct={hoverPct} color={chartColor} />
            )}
          </div>

          {/* Volume bars */}
          <div style={{ height: 32, marginTop: 2 }}>
            <VolumeBars candles={candles} color={chartColor} hoverIdx={hoverIdx} />
          </div>

          {/* Time axis */}
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] font-mono" style={{ color: "var(--cg-text-dim)" }}>
              {candles[0] ? formatTime(candles[0].time) : "—"}
            </span>
            <span className="text-[10px]" style={{ color: "var(--cg-text-dim)" }}>15dk · 48 mum</span>
            <span className="text-[10px] font-mono" style={{ color: "var(--cg-text-dim)" }}>
              {candles[candles.length - 1] ? formatTime(candles[candles.length - 1].time) : "—"}
            </span>
          </div>
        </>
      ) : (
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ height: 164, background: "rgba(255,255,255,0.02)", border: "1px dashed var(--cg-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>Grafik verisi yükleniyor...</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--cg-border)" }}>
        <div className="flex items-center gap-2">
          {priceData!.dexId && (
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
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: refreshing ? "var(--cg-accent)" : "var(--cg-text-dim)" }}>
            <RefreshIcon spinning={refreshing} />
          </span>
          <span className="text-[10px]" style={{ color: "var(--cg-text-dim)" }}>
            {lastUpdated
              ? `${lastUpdated.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · 30s`
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
