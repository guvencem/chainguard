"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * ChainGuard — Ana Sayfa (Sprint 2 / Light Theme)
 * Vibrant hero + arama + 9 metrik göstergesi
 */

export default function HomePage() {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();

    if (!trimmed) {
      setError("Lütfen bir token adresi girin.");
      return;
    }

    const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!solanaRegex.test(trimmed)) {
      setError("Geçersiz Solana token adresi. Lütfen doğru adresi girin.");
      return;
    }

    setError("");
    setIsLoading(true);
    router.push(`/token/${trimmed}`);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--cg-gradient-cta)" }}
          >
            <span className="text-white font-bold text-sm">CG</span>
          </div>
          <span
            className="font-bold text-lg tracking-tight"
            style={{ color: "var(--cg-text)" }}
          >
            ChainGuard
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/trending"
            className="text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: "var(--cg-text-muted)" }}
          >
            Trending
          </a>
          <a
            href="/about"
            className="text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: "var(--cg-text-muted)" }}
          >
            Hakkında
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        {/* Badge */}
        <div className="text-center mb-12 animate-slide-up">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: "var(--cg-accent-light)",
              border: "1px solid rgba(124, 58, 237, 0.2)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse-glow"
              style={{ background: "var(--cg-accent)" }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--cg-accent)" }}
            >
              9 Metrikli Solana Token Risk Analizi
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-5">
            <span className="gradient-text">ChainGuard</span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-xl mx-auto leading-relaxed"
            style={{ color: "var(--cg-text-muted)" }}
          >
            Token adresini gir, saniyeler içinde{" "}
            <span className="font-semibold" style={{ color: "var(--cg-text)" }}>
              risk skorunu
            </span>{" "}
            gör. Wash trading, cüzdan kümeleme ve manipülasyonu{" "}
            <span
              className="font-bold"
              style={{ color: "var(--cg-accent)" }}
            >
              anında tespit et
            </span>
            .
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="relative">
            <input
              id="token-search"
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (error) setError("");
              }}
              placeholder="Solana token adresi yapıştır..."
              className="search-input w-full px-6 py-5 pr-36 text-base md:text-lg"
              autoComplete="off"
              spellCheck={false}
              disabled={isLoading}
            />
            <button
              id="analyze-button"
              type="submit"
              disabled={isLoading}
              className="cta-button absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 text-sm"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Analiz...
                </span>
              ) : (
                "🔍 Analiz Et"
              )}
            </button>
          </div>

          {error && (
            <p
              className="mt-3 text-sm font-medium"
              style={{ color: "var(--cg-coral)" }}
            >
              {error}
            </p>
          )}
        </form>

        {/* Example Tokens */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
            Örnek:
          </span>
          {[
            { label: "BONK", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
            { label: "WIF", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" },
          ].map((token) => (
            <button
              key={token.label}
              onClick={() => {
                setAddress(token.address);
                setError("");
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all duration-200 hover:scale-105 hover:shadow-md"
              style={{
                background: "var(--cg-bg-card-solid)",
                border: "1px solid var(--cg-border)",
                color: "var(--cg-text-muted)",
                boxShadow: "var(--cg-shadow-sm)",
              }}
            >
              {token.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 md:gap-12 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          {[
            { value: "9", label: "Risk Metriği", emoji: "🛡️" },
            { value: "<3s", label: "Analiz Süresi", emoji: "⚡" },
            { value: "7/24", label: "Aktif İzleme", emoji: "👁️" },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="text-lg mb-1">{stat.emoji}</div>
              <div className="text-2xl md:text-3xl font-bold gradient-text">
                {stat.value}
              </div>
              <div
                className="text-xs mt-1 font-medium"
                style={{ color: "var(--cg-text-dim)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full animate-slide-up" style={{ animationDelay: "0.4s" }}>
          {[
            {
              icon: "🔗",
              title: "Cüzdan Kümeleme",
              desc: "Sahte holder ağlarını graf analizi ile tespit",
              color: "#7C3AED",
            },
            {
              icon: "🔄",
              title: "Wash Trading",
              desc: "Döngüsel işlem ve sahte hacim algılama",
              color: "#FF6B6B",
            },
            {
              icon: "🤖",
              title: "Sybil & Bundler",
              desc: "Bot cüzdanları ve toplu dağıtım tespiti",
              color: "#06D6A0",
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="glass-card p-5 text-center cursor-default"
              style={{ borderTopWidth: "3px", borderTopColor: feat.color }}
            >
              <div className="text-2xl mb-2">{feat.icon}</div>
              <h3 className="font-bold text-sm mb-1" style={{ color: "var(--cg-text)" }}>
                {feat.title}
              </h3>
              <p className="text-xs" style={{ color: "var(--cg-text-muted)" }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="px-6 py-6 text-center"
        style={{ borderTop: "1px solid var(--cg-border)" }}
      >
        <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
          © 2026 ChainGuard — Solana token risk analizi. Yatırım tavsiyesi
          değildir.
        </p>
      </footer>
    </main>
  );
}
