"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LangProvider";

function ShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 3L4 6.5v5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5v-5L12 3z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L20 20" />
    </svg>
  );
}

function ArrowRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

const FEATURE_COLORS = ["#818CF8", "#F87171", "#34D399", "#FBBF24", "#F472B6", "#60A5FA"];

const EXAMPLE_TOKENS = [
  { label: "BONK", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
  { label: "WIF", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" },
  { label: "JUP", address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
];

const FOOTER_HREFS = [
  "https://t.me/taranoid8_bot",
  "/learn",
  "/keys",
  "/about",
];

export default function HomePage() {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { t } = useLang();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) { setError(t.home.error_required); return; }
    const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    const evmRegex = /^0x[0-9a-fA-F]{40}$/;
    if (!solanaRegex.test(trimmed) && !evmRegex.test(trimmed)) {
      setError(t.home.error_invalid);
      return;
    }
    setError("");
    setIsLoading(true);
    router.push(`/token/${trimmed}`);
  };

  return (
    <main className="min-h-screen flex flex-col overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50 px-6 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)", boxShadow: "0 0 20px rgba(99,102,241,0.5)", color: "white" }}
          >
            <ShieldIcon size={14} />
          </div>
          <span className="font-black text-base tracking-tight" style={{ color: "var(--cg-text)" }}>Taranoid</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {[
            [t.nav.how, "#how"],
            [t.nav.trending, "/trending"],
            [t.nav.learn, "/learn"],
            [t.nav.api, "/keys"],
            [t.nav.telegram, "https://t.me/taranoid8_bot"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium transition-all duration-200"
              style={{ color: "var(--cg-text-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--cg-text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--cg-text-muted)")}
            >
              {label}
            </a>
          ))}
        </div>

        <a
          href="https://t.me/taranoid8_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button px-4 py-2 text-xs flex items-center gap-2"
        >
          <span>🤖</span> {t.nav.telegram}
        </a>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16">
        <div className="glow-orb animate-orb" style={{ width: 600, height: 600, top: "10%", left: "15%", background: "rgba(99,102,241,0.12)" }} />
        <div className="glow-orb animate-orb-reverse" style={{ width: 500, height: 500, top: "20%", right: "10%", background: "rgba(236,72,153,0.08)" }} />
        <div className="glow-orb" style={{ width: 300, height: 300, bottom: "15%", left: "30%", background: "rgba(129,140,248,0.06)" }} />

        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="animate-slide-up mb-8">
            <div
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase"
              style={{ background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.25)", color: "#818CF8" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full" style={{ background: "#818CF8" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#818CF8" }} />
              </span>
              {t.home.badge}
            </div>
          </div>

          {/* Heading */}
          <h1
            className="animate-slide-up font-black leading-none tracking-tighter mb-6"
            style={{ fontSize: "clamp(56px, 10vw, 120px)", animationDelay: "0.08s" }}
          >
            <span className="gradient-text">Chain</span>
            <span style={{ color: "var(--cg-text)" }}>Guard</span>
          </h1>

          <p
            className="animate-slide-up text-lg md:text-xl max-w-2xl leading-relaxed mb-12 font-medium"
            style={{ color: "var(--cg-text-muted)", animationDelay: "0.14s" }}
          >
            {t.home.hero_sub}
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="animate-slide-up w-full max-w-2xl"
            style={{ animationDelay: "0.2s" }}
          >
            <div
              className="relative p-1.5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
            >
              <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--cg-text-dim)" }}>
                <SearchIcon />
              </div>
              <input
                type="text"
                value={address}
                onChange={e => { setAddress(e.target.value); if (error) setError(""); }}
                placeholder={t.home.placeholder}
                className="w-full bg-transparent pl-14 pr-40 py-4 text-base font-mono outline-none"
                style={{ color: "var(--cg-text)", caretColor: "#818CF8" }}
                autoComplete="off"
                spellCheck={false}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="cta-button absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 text-sm flex items-center gap-2"
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>{t.home.btn_analyze} <ArrowRightIcon /></>
                )}
              </button>
            </div>
            {error && <p className="mt-3 text-sm font-semibold" style={{ color: "var(--cg-red)" }}>{error}</p>}
          </form>

          {/* Example tokens */}
          <div className="animate-slide-up flex items-center gap-3 mt-5" style={{ animationDelay: "0.26s" }}>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
              {t.home.try_label}
            </span>
            {EXAMPLE_TOKENS.map(tok => (
              <button
                key={tok.label}
                onClick={() => { setAddress(tok.address); setError(""); }}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--cg-text-muted)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(129,140,248,0.12)"; (e.currentTarget as HTMLElement).style.color = "#818CF8"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "var(--cg-text-muted)"; }}
              >
                ${tok.label}
              </button>
            ))}
          </div>

          {/* Stats row */}
          <div className="animate-slide-up grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 w-full max-w-3xl" style={{ animationDelay: "0.32s" }}>
            {t.stats.map(s => (
              <div key={s.label} className="stat-card">
                <div className="text-3xl md:text-4xl font-black tabular-nums gradient-text mb-1">{s.value}</div>
                <div className="text-sm font-bold mb-0.5" style={{ color: "var(--cg-text-muted)" }}>{s.label}</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ color: "var(--cg-text-dim)" }}>
          <span className="text-xs font-medium tracking-widest uppercase">{t.home.scroll}</span>
          <div className="w-px h-8 animate-float" style={{ background: "linear-gradient(to bottom, rgba(129,140,248,0.5), transparent)" }} />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="how" className="relative px-4 py-28 max-w-7xl mx-auto w-full">
        <div className="glow-orb" style={{ width: 400, height: 400, top: "20%", right: "-5%", background: "rgba(244,114,182,0.06)" }} />

        <div className="text-center mb-16 animate-slide-up">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)", color: "#818CF8" }}
          >
            {t.home.features_badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4" style={{ color: "var(--cg-text)" }}>
            {t.home.features_title}
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--cg-text-muted)" }}>
            {t.home.features_sub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.features.map((f, i) => {
            const color = FEATURE_COLORS[i];
            return (
              <div
                key={f.title}
                className="card-3d p-7 animate-slide-up"
                style={{ animationDelay: `${i * 0.06}s`, borderTop: `2px solid ${color}30` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: `${color}12`, border: `1px solid ${color}20` }}
                  >
                    {f.emoji}
                  </div>
                  <span
                    className="metric-badge"
                    style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}
                  >
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2.5" style={{ color: "var(--cg-text)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="px-4 py-20 max-w-4xl mx-auto w-full">
        <div
          className="relative rounded-3xl p-10 md:p-14 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(236,72,153,0.1) 100%)",
            border: "1px solid rgba(129,140,248,0.2)",
            boxShadow: "0 0 80px rgba(99,102,241,0.12)",
          }}
        >
          <div className="glow-orb" style={{ width: 300, height: 300, top: "-30%", right: "-10%", background: "rgba(129,140,248,0.15)" }} />
          <div className="glow-orb" style={{ width: 200, height: 200, bottom: "-20%", left: "5%", background: "rgba(244,114,182,0.1)" }} />
          <div className="relative z-10">
            <div className="text-5xl mb-6">🤖</div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4" style={{ color: "var(--cg-text)" }}>
              {t.home.cta_title}
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "var(--cg-text-muted)" }}>
              <code className="font-mono text-sm px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.08)", color: "#818CF8" }}>/analyze &lt;address&gt;</code>{" "}
              {t.home.cta_sub}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://t.me/taranoid8_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button px-8 py-4 text-base flex items-center gap-2"
              >
                {t.home.cta_button} <ArrowRightIcon />
              </a>
              <div
                className="px-6 py-4 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--cg-text-muted)" }}
              >
                {t.home.cta_free}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-8 py-8 mt-auto" style={{ borderTop: "1px solid var(--cg-border)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)", color: "white" }}
            >
              <ShieldIcon size={12} />
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--cg-text-muted)" }}>Taranoid</span>
          </div>
          <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
            {t.footer.tagline}
          </p>
          <div className="flex items-center gap-6">
            {t.footer.links.map((label, i) => (
              <a
                key={label}
                href={FOOTER_HREFS[i]}
                className="text-xs font-medium transition-colors"
                style={{ color: "var(--cg-text-dim)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--cg-text-muted)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--cg-text-dim)")}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
