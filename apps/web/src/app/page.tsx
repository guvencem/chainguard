"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * ChainGuard — Ana Sayfa
 *
 * Hero bölümü + arama kutusu + son analiz edilen tokenlar
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

    // Basit Solana adres doğrulama (base58, 32-44 karakter)
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
      {/* ── Navbar ── */}
      <nav className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--cg-accent), var(--cg-green))" }}>
            <span className="text-white font-bold text-sm">CG</span>
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: "var(--cg-text)" }}>
            ChainGuard
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/trending" className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--cg-text-muted)" }}>
            Trending
          </a>
          <a href="/about" className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--cg-text-muted)" }}>
            Hakkında
          </a>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        {/* Logo / Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: "var(--cg-accent-glow)", border: "1px solid var(--cg-accent)" }}>
            <div className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: "var(--cg-accent)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--cg-accent)" }}>
              Solana Token Risk Analizi
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="gradient-text">ChainGuard</span>
          </h1>

          <p className="text-lg md:text-xl max-w-xl mx-auto leading-relaxed"
            style={{ color: "var(--cg-text-muted)" }}>
            Token adresini gir, saniyeler içinde{" "}
            <span className="font-semibold" style={{ color: "var(--cg-text)" }}>risk skorunu</span>{" "}
            gör. Wash trading, rug pull ve manipülasyonu{" "}
            <span className="font-semibold" style={{ color: "var(--cg-accent)" }}>anında tespit et</span>.
          </p>
        </div>

        {/* ── Search Box ── */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-2xl mx-auto"
        >
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
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, var(--cg-accent), #C62828)",
                boxShadow: "0 4px 20px var(--cg-accent-glow)",
              }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analiz...
                </span>
              ) : (
                "Analiz Et"
              )}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm font-medium" style={{ color: "var(--cg-red)" }}>
              {error}
            </p>
          )}
        </form>

        {/* ── Example Tokens ── */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>Örnek:</span>
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
              className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 hover:scale-105"
              style={{
                background: "var(--cg-surface)",
                border: "1px solid var(--cg-border)",
                color: "var(--cg-text-muted)",
              }}
            >
              {token.label}
            </button>
          ))}
        </div>

        {/* ── Stats ── */}
        <div className="mt-16 grid grid-cols-3 gap-8 md:gap-16 text-center">
          {[
            { value: "3", label: "Risk Metriği" },
            { value: "<3s", label: "Analiz Süresi" },
            { value: "7/24", label: "Aktif İzleme" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs mt-1" style={{ color: "var(--cg-text-dim)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="px-6 py-6 text-center" style={{ borderTop: "1px solid var(--cg-border)" }}>
        <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
          © 2026 ChainGuard — Solana token risk analizi. Yatırım tavsiyesi değildir.
        </p>
      </footer>
    </main>
  );
}
