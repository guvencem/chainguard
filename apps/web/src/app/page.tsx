"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function ShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M12 3L4 6.5v5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5v-5L12 3z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" />
    </svg>
  );
}

function NetworkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path
        d="M12 7.5v4M9.5 13l-2.5 3.5M14.5 13l2.5 3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CycleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 12a9 9 0 0 1 15-6.7L21 7" strokeLinecap="round" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 17" strokeLinecap="round" />
      <path
        d="M17 4l4 3-3 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 20l-4-3 3-3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BotIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 2v6M9.5 2h5" strokeLinecap="round" />
      <path d="M7 21v1M17 21v1" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L20 20" />
    </svg>
  );
}

export default function HomePage() {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) {
      setError("Token adresi gerekli.");
      return;
    }
    const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!solanaRegex.test(trimmed)) {
      setError("Geçersiz Solana token adresi.");
      return;
    }
    setError("");
    setIsLoading(true);
    router.push(`/token/${trimmed}`);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav
        className="w-full px-8 py-5 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--cg-border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--cg-gradient-brand)",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
              color: "white",
            }}
          >
            <ShieldIcon size={14} />
          </div>
          <span
            className="font-bold text-base tracking-tight"
            style={{ color: "var(--cg-text)" }}
          >
            ChainGuard
          </span>
        </div>

        <div className="flex items-center gap-8">
          <a
            href="/trending"
            className="text-sm font-medium transition-colors duration-200 hover:text-white"
            style={{ color: "var(--cg-text-muted)" }}
          >
            Trending
          </a>
          <a
            href="/about"
            className="text-sm font-medium transition-colors duration-200 hover:text-white"
            style={{ color: "var(--cg-text-muted)" }}
          >
            Hakkında
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24 pt-8">
        {/* Live indicator */}
        <div className="animate-slide-up mb-10">
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "var(--cg-accent-dim)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              color: "var(--cg-accent)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full"
                style={{ background: "var(--cg-accent)" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: "var(--cg-accent)" }}
              />
            </span>
            9 Metrikli Gerçek Zamanlı Analiz
          </div>
        </div>

        {/* Heading */}
        <div
          className="text-center mb-12 animate-slide-up"
          style={{ animationDelay: "0.06s" }}
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-5 leading-none">
            <span className="gradient-text">Chain</span>
            <span style={{ color: "var(--cg-text)" }}>Guard</span>
          </h1>
          <p
            className="text-base md:text-lg max-w-md mx-auto leading-relaxed"
            style={{ color: "var(--cg-text-muted)" }}
          >
            Solana token riskini saniyeler içinde ölç. Wash trading, cüzdan
            kümeleme ve manipülasyon tespiti.
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-2xl animate-slide-up"
          style={{ animationDelay: "0.12s" }}
        >
          <div className="relative">
            <div
              className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--cg-text-dim)" }}
            >
              <SearchIcon />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (error) setError("");
              }}
              placeholder="Token adresi yapıştır..."
              className="search-input w-full pl-12 pr-36 py-4 text-sm font-mono"
              autoComplete="off"
              spellCheck={false}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="cta-button absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 text-sm"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-20"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    fill="currentColor"
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                "Analiz Et"
              )}
            </button>
          </div>
          {error && (
            <p
              className="mt-3 text-sm font-medium"
              style={{ color: "var(--cg-red)" }}
            >
              {error}
            </p>
          )}
        </form>

        {/* Example tokens */}
        <div
          className="mt-5 flex items-center gap-3 animate-slide-up"
          style={{ animationDelay: "0.18s" }}
        >
          <span
            className="text-xs font-medium tracking-wide"
            style={{ color: "var(--cg-text-dim)" }}
          >
            Örnek:
          </span>
          {[
            {
              label: "BONK",
              address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
            },
            {
              label: "WIF",
              address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
            },
          ].map((token) => (
            <button
              key={token.label}
              onClick={() => {
                setAddress(token.address);
                setError("");
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 hover:opacity-80"
              style={{
                background: "var(--cg-surface)",
                border: "1px solid var(--cg-border-strong)",
                color: "var(--cg-text-muted)",
              }}
            >
              {token.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div
          className="mt-20 grid grid-cols-3 gap-4 md:gap-6 max-w-sm w-full animate-slide-up"
          style={{ animationDelay: "0.22s" }}
        >
          {[
            { value: "9", label: "Risk Metriği" },
            { value: "<3s", label: "Analiz Süresi" },
            { value: "7/24", label: "Aktif İzleme" },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="text-2xl md:text-3xl font-bold tabular-nums gradient-text mb-1.5">
                {stat.value}
              </div>
              <div
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: "var(--cg-text-dim)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div
          className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full animate-slide-up"
          style={{ animationDelay: "0.28s" }}
        >
          {[
            {
              icon: <NetworkIcon />,
              title: "Cüzdan Kümeleme",
              desc: "Graf analizi ile sahte holder ağlarını gerçek zamanlı tespit et",
              accent: "#3B82F6",
            },
            {
              icon: <CycleIcon />,
              title: "Wash Trading",
              desc: "Döngüsel işlem paternleri ve sahte hacim algılama motoru",
              accent: "#EF4444",
            },
            {
              icon: <BotIcon />,
              title: "Sybil & Bundler",
              desc: "Bot cüzdanları ve toplu dağıtım paternlerinin tespiti",
              accent: "#10B981",
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="card-3d p-6"
              style={{
                borderTop: `2px solid ${feat.accent}30`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: `${feat.accent}12`,
                  color: feat.accent,
                  border: `1px solid ${feat.accent}20`,
                }}
              >
                {feat.icon}
              </div>
              <h3
                className="font-semibold text-sm mb-2"
                style={{ color: "var(--cg-text)" }}
              >
                {feat.title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--cg-text-muted)" }}
              >
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="px-8 py-6 text-center"
        style={{ borderTop: "1px solid var(--cg-border)" }}
      >
        <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
          2026 ChainGuard — Yatırım tavsiyesi değildir.
        </p>
      </footer>
    </main>
  );
}
