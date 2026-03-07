"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://web-production-b704c.up.railway.app";

const EXCHANGES = [
  {
    id: "binance",
    name: "Binance",
    emoji: "🟡",
    desc: "%20 fee iadesi",
    url: "https://www.binance.com/tr/register?ref=CHAINGUARD",
    color: "#F0B90B",
  },
  {
    id: "okx",
    name: "OKX",
    emoji: "⚫",
    desc: "%20 komisyon",
    url: "https://www.okx.com/join/CHAINGUARD",
    color: "#000000",
  },
  {
    id: "bybit",
    name: "Bybit",
    emoji: "🟠",
    desc: "%30 fee iadesi",
    url: "https://www.bybit.com/register?affiliate_id=CHAINGUARD",
    color: "#F7A600",
  },
  {
    id: "gate",
    name: "Gate.io",
    emoji: "🔵",
    desc: "%40 komisyon",
    url: "https://www.gate.io/signup?ref=CHAINGUARD",
    color: "#2354E6",
  },
];

interface AffiliateBannerProps {
  tokenAddress?: string;
  score?: number;
}

function trackClick(exchange: string, tokenAddress?: string) {
  const params = new URLSearchParams({ exchange, source: "web" });
  if (tokenAddress) params.set("token_address", tokenAddress);
  fetch(`${API_URL}/api/v1/affiliate/click?${params.toString()}`).catch(() => {});
}

export default function AffiliateBanner({ tokenAddress, score = 0 }: AffiliateBannerProps) {
  const isRisky = score >= 40;

  return (
    <div className="affiliate-banner p-6 md:p-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
      {/* Decorative orbs */}
      <div className="absolute top-4 right-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)" }} />
      <div className="absolute bottom-2 left-16 w-20 h-20 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)" }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">🛡️</span>
              <span className="text-white font-bold text-base md:text-lg">
                {isRisky ? "Bu Token Riskli — Güvenli Borsalarda İşlem Yap" : "Güvenli Borsalarda İşlem Yap"}
              </span>
            </div>
            <p className="text-white/75 text-sm font-medium">
              {isRisky
                ? "Risk tespitinde biz varız, sermayeni güvende tut."
                : "Analizini yaptın, şimdi güvenle işlem yap."}
            </p>
          </div>
          {isRisky && (
            <div className="hidden md:flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3 py-1 flex-shrink-0">
              <span className="text-xs font-bold text-white/90 uppercase tracking-widest">
                ⚠️ Skor {Math.round(score)}
              </span>
            </div>
          )}
        </div>

        {/* Exchange buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {EXCHANGES.map((ex) => (
            <a
              key={ex.id}
              href={ex.url}
              target="_blank"
              rel="noopener noreferrer"
              className="exchange-btn px-4 py-3 flex-col text-center"
              style={{ flexDirection: "column", alignItems: "center", gap: "4px" }}
              onClick={() => trackClick(ex.id, tokenAddress)}
            >
              <span className="text-xl">{ex.emoji}</span>
              <span className="font-bold text-sm">{ex.name}</span>
              <span className="text-white/70 text-xs">{ex.desc}</span>
            </a>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-white/50 text-xs mt-4 text-center">
          ChainGuard partner borsalardaki affiliate linkler aracılığıyla gelir elde eder. Bu bir finansal tavsiye değildir.
        </p>
      </div>
    </div>
  );
}
