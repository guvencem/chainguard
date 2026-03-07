"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://web-production-b704c.up.railway.app";

function trackClick(exchange: string, tokenAddress?: string) {
  const params = new URLSearchParams({ exchange, source: "web" });
  if (tokenAddress) params.set("token_address", tokenAddress);
  fetch(`${API_URL}/api/v1/affiliate/click?${params.toString()}`).catch(() => {});
}

const EXCHANGES = [
  {
    id: "binance",
    name: "Binance",
    tagline: "Dünyanın #1 Borsası",
    bonus: "%20 Fee İadesi",
    features: ["500+ kripto", "Düşük komisyon", "Türkçe destek"],
    url: "https://www.binance.com/tr/register?ref=CHAINGUARD",
    brand: "#F0B90B",
    brandDark: "#B8860B",
    initial: "B",
    users: "180M+ kullanıcı",
  },
  {
    id: "okx",
    name: "OKX",
    tagline: "Web3'ün En Büyük Gateway'i",
    bonus: "%20 Komisyon İadesi",
    features: ["350+ token", "Futures & Spot", "DeFi entegre"],
    url: "https://www.okx.com/join/CHAINGUARD",
    brand: "#00D4FF",
    brandDark: "#0099BB",
    initial: "O",
    users: "50M+ kullanıcı",
  },
  {
    id: "bybit",
    name: "Bybit",
    tagline: "Trader'ın Tercihi",
    bonus: "%30 Fee İadesi",
    features: ["Copy trading", "Launchpad erişim", "7/24 destek"],
    url: "https://www.bybit.com/register?affiliate_id=CHAINGUARD",
    brand: "#F7A600",
    brandDark: "#C47D00",
    initial: "By",
    users: "20M+ kullanıcı",
  },
  {
    id: "gate",
    name: "Gate.io",
    tagline: "En Fazla Token Seçeneği",
    bonus: "%40 Komisyon",
    features: ["1700+ token", "Erken listeleme", "Staking fırsatları"],
    url: "https://www.gate.io/signup?ref=CHAINGUARD",
    brand: "#2ECC71",
    brandDark: "#1A9951",
    initial: "G",
    users: "14M+ kullanıcı",
  },
];

interface AffiliateBannerProps {
  tokenAddress?: string;
  score?: number;
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 3L4 6.5v5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5v-5L12 3z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 6c1.7 0 3 1.3 3 3s-1.3 3-3 3M20 20c0-2.7-1.8-5-4.3-5.8" />
    </svg>
  );
}

export default function AffiliateBanner({ tokenAddress, score = 0 }: AffiliateBannerProps) {
  return (
    <section className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
      {/* Section Header */}
      <div
        className="rounded-2xl p-6 md:p-8 mb-4"
        style={{
          background: "linear-gradient(135deg, #0F0F1A 0%, #1A1030 50%, #0F1828 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25), 0 0 80px rgba(99,102,241,0.08)",
        }}
      >
        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366F1, #EC4899)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
                color: "white",
              }}
            >
              <ShieldCheckIcon />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl leading-tight">
                Güvenli Borsalarda İşlem Yap
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "3px" }}>
                {score >= 40
                  ? `Bu token ${Math.round(score)} risk skoru taşıyor — sermayeni güvende tut`
                  : "ChainGuard partner borsalarla ayrıcalıklı komisyon iadesi"}
              </p>
            </div>
          </div>

          {score >= 40 && (
            <div
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#EF4444" }} />
              <span style={{ color: "#FCA5A5", fontSize: "13px", fontWeight: 700 }}>
                ⚠️ Yüksek Risk Tespit Edildi
              </span>
            </div>
          )}
        </div>

        {/* Exchange Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXCHANGES.map((ex) => (
            <a
              key={ex.id}
              href={ex.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(ex.id, tokenAddress)}
              className="group relative block rounded-2xl overflow-hidden no-underline"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.borderColor = `${ex.brand}50`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px rgba(0,0,0,0.3), 0 0 30px ${ex.brand}20`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Brand top bar */}
              <div style={{ height: "3px", background: `linear-gradient(90deg, ${ex.brand}, ${ex.brandDark})` }} />

              <div className="p-5">
                {/* Logo + Bonus */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black"
                    style={{
                      background: `linear-gradient(135deg, ${ex.brand}22, ${ex.brand}11)`,
                      border: `1.5px solid ${ex.brand}40`,
                      color: ex.brand,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {ex.initial}
                  </div>
                  <div
                    className="px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{
                      background: `${ex.brand}18`,
                      color: ex.brand,
                      border: `1px solid ${ex.brand}35`,
                    }}
                  >
                    {ex.bonus}
                  </div>
                </div>

                {/* Name + tagline */}
                <div className="mb-3">
                  <div className="text-white font-bold text-base leading-tight">{ex.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", marginTop: "2px" }}>
                    {ex.tagline}
                  </div>
                </div>

                {/* User count */}
                <div className="flex items-center gap-1.5 mb-4">
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>
                    <UsersIcon />
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>
                    {ex.users}
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-1.5 mb-5">
                  {ex.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <span style={{ color: ex.brand, flexShrink: 0 }}>
                        <CheckIcon />
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div
                  className="w-full py-2.5 rounded-xl text-center text-sm font-bold transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${ex.brand}, ${ex.brandDark})`,
                    color: ex.id === "okx" ? "white" : "#0A0A0A",
                    boxShadow: `0 4px 16px ${ex.brand}40`,
                  }}
                >
                  Hesap Aç →
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-5 flex flex-col md:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-4">
            {["Güvenli & Lisanslı", "Affiliate Partner", "Komisyon İadeli"].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10B981" }} />
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>{badge}</span>
              </div>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>
            Affiliate linkler üzerinden komisyon kazanılır. Finansal tavsiye değildir.
          </p>
        </div>
      </div>
    </section>
  );
}
