"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import LiveTicker from "@/components/LiveTicker";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

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

function ZapIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
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
  "https://t.me/taranoid_bot",
  "/learn",
  "/keys",
  "/about",
];

function AnimatedStatCard({ value, label, sub, delay }: { value: string; label: string; sub: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bento-card flex flex-col items-center justify-center p-6 text-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.9)",
        transition: `all 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}s`,
      }}
    >
      <div
        className="text-4xl md:text-5xl font-black tabular-nums gradient-text mb-2 tracking-tighter"
        style={{
          animation: visible ? `jackpot-bounce 0.5s ease ${delay + 0.3}s both` : "none",
        }}
      >
        {value}
      </div>
      <div className="text-sm font-bold mb-1 tracking-wide text-white" style={{ color: "var(--cg-text)" }}>{label}</div>
      <div className="text-[10px] font-semibold uppercase tracking-widest opacity-60" style={{ color: "var(--cg-text-dim)" }}>{sub}</div>
    </div>
  );
}

export default function HomePage() {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
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
    <main className="min-h-screen flex flex-col overflow-x-hidden pt-16">

      {/* ── Animated Mesh Background ── */}
      <div className="mesh-bg" />

      {/* ── Search Backdrop ── */}
      <div className={`search-backdrop ${searchFocused ? "is-active" : ""}`} />

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Live Ticker ── */}
      <div className="w-full relative z-40 bg-black/10 backdrop-blur-md border-b border-white/5">
        <LiveTicker />
      </div>

      {/* ── Main Hero Section ── */}
      <section className="relative w-full flex flex-col items-center justify-center px-4 pt-20 pb-24 md:pt-32 md:pb-36 min-h-[85vh]">
        <div className="relative flex flex-col items-center text-center w-full max-w-5xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase animate-border-glow shadow-lg backdrop-blur-md"
              style={{
                background: "rgba(129,140,248,0.15)",
                border: "1px solid rgba(129,140,248,0.3)",
                color: "#818CF8",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full" style={{ background: "#818CF8" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#818CF8" }} />
              </span>
              {t.home.badge}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-black leading-[1.1] tracking-tighter mb-6"
            style={{ fontSize: "clamp(64px, 12vw, 150px)", textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
          >
            <span className="gradient-text">{t.home.h1_main}</span>
            <span className="block text-4xl md:text-6xl tracking-tight mt-2 opacity-90" style={{ color: "var(--cg-text)" }}>{t.home.h1_sub}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xl md:text-2xl max-w-2xl leading-relaxed mb-14 font-medium"
            style={{ color: "var(--cg-text-muted)" }}
          >
            {t.home.hero_sub}
          </motion.p>

          {/* ── Spotlight Search ── */}
          <div className={`hero-search-wrapper w-full max-w-3xl ${searchFocused ? "is-focused" : ""}`}>
            <form onSubmit={handleSearch} className="w-full relative group">
              <div
                className="relative p-2 rounded-[2rem] transition-all duration-300 backdrop-blur-2xl flex items-center"
                style={{
                  background: searchFocused ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${searchFocused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.12)"}`,
                  boxShadow: searchFocused
                    ? "0 0 0 4px rgba(99,102,241,0.1), 0 20px 80px rgba(0,0,0,0.6)"
                    : "0 10px 40px rgba(0,0,0,0.3)",
                }}
              >
                <div className="pl-4 pr-3 pointer-events-none transition-colors duration-300"
                  style={{ color: searchFocused ? "var(--cg-accent)" : "var(--cg-text-dim)" }}>
                  <SearchIcon size={24} />
                </div>

                <input
                  type="text"
                  value={address}
                  onChange={e => { setAddress(e.target.value); if (error) setError(""); }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder={t.home.placeholder}
                  className="flex-1 w-full bg-transparent min-w-[100px] text-base md:text-xl font-mono outline-none placeholder:text-sm md:placeholder:text-lg"
                  style={{ color: "var(--cg-text)", caretColor: "#3B82F6" }}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="cta-button shrink-0 px-4 md:px-8 py-3 md:py-4 text-sm md:text-base flex items-center gap-1.5 md:gap-2 rounded-2xl ml-2"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <><ZapIcon size={16} /> <span className="hidden sm:inline-block">{t.home.btn_analyze}</span> <ArrowRightIcon size={18} /></>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-10 left-0 right-0 text-center text-sm font-bold bg-red-500/10 text-red-400 py-2 rounded-xl backdrop-blur-md border border-red-500/20"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Example Tokens embedded nicely under search while focused or not */}
            <div className={`transition-all duration-500 flex flex-wrap items-center justify-center gap-3 mt-6 ${searchFocused ? "opacity-100 translate-y-0" : "opacity-80 translate-y-0"}`}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
                {t.home.try_label}
              </span>
              {EXAMPLE_TOKENS.map(tok => (
                <button
                  key={tok.label}
                  onClick={() => { setAddress(tok.address); setError(""); }}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "var(--cg-text)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(129,140,248,0.15)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(129,140,248,0.4)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  ${tok.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Value Props (Stats Bento) ── */}
      <section className="px-4 pb-24 relative z-10 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {t.stats.map((s, i) => (
            <AnimatedStatCard key={s.label} value={s.value} label={s.label} sub={s.sub} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* ── Primary Bento Layout Features ── */}
      <section id="how" className="relative px-4 py-32 max-w-[1400px] mx-auto w-full">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            <span className="gradient-text">{t.home.features_badge}</span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto font-medium" style={{ color: "var(--cg-text-muted)" }}>
            {t.home.features_sub}
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="bento-grid">
          {t.features.map((f, i) => {
            const color = FEATURE_COLORS[i % FEATURE_COLORS.length];
            // Make some cards larger for asymmetric bento feel
            const colSpan = (i === 0 || i === 3) ? "col-span-12 lg:col-span-8" : "col-span-12 lg:col-span-4";
            const minHeight = (i === 0 || i === 3) ? "min-h-[380px]" : "min-h-[320px]";

            return (
              <div
                key={f.title}
                className={`bento-card ${colSpan} ${minHeight} flex flex-col justify-between group`}
              >
                {/* Glow effect matching feature color */}
                <div
                  className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-30"
                  style={{ background: color }}
                />

                <div className="relative z-10 mt-auto">
                  <div className="flex items-start justify-between mb-8">
                    <div
                      className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                        border: `1px solid ${color}44`,
                        boxShadow: `0 8px 32px ${color}22`
                      }}
                    >
                      {f.emoji}
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight" style={{ color: "var(--cg-text)" }}>{f.title}</h3>
                  <p className="text-base md:text-lg font-medium leading-relaxed opacity-80" style={{ color: "var(--cg-text-muted)" }}>{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-4 py-32 max-w-6xl mx-auto w-full">
        <div
          className="relative rounded-[2.5rem] p-12 md:p-20 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(236,72,153,0.05) 100%)",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 20px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset",
            backdropFilter: "blur(20px)"
          }}
        >
          <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay"></div>

          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6" style={{ color: "var(--cg-text)" }}>
              {t.home.cta_title}
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-medium" style={{ color: "var(--cg-text-muted)" }}>
              {t.home.cta_sub}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="https://t.me/taranoid_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button px-10 py-5 text-lg flex items-center gap-3 rounded-[1.25rem]"
              >
                {t.home.cta_button} <ArrowRightIcon size={20} />
              </a>
              <div
                className="px-8 py-5 rounded-[1.25rem] text-base font-bold"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--cg-text-muted)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                }}
              >
                {t.home.cta_free}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Premium Footer ── */}
      <footer className="relative mt-auto pt-20 pb-10 border-t" style={{ borderColor: "rgba(255,255,255,0.03)", background: "rgba(0,0,0,0.2)" }}>
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "var(--cg-gradient-brand)", color: "white" }}
              >
                <ShieldIcon size={14} />
              </div>
              <span className="font-black text-xl tracking-tight" style={{ color: "var(--cg-text)" }}>Taranoid</span>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--cg-text-dim)" }}>
              {t.footer.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-8">
            {t.footer.links.map((label, i) => {
              const href = FOOTER_HREFS[i];
              const isExternal = href?.startsWith("http");
              const Tag = isExternal ? "a" : Link;
              return (
                <Tag
                  key={label}
                  href={href || "#"}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="text-sm font-bold transition-all"
                  style={{ color: "var(--cg-text-muted)" }}
                  onMouseEnter={(e: any) => {
                    (e.currentTarget.style.color = "var(--cg-text)");
                    (e.currentTarget.style.textShadow = "0 0 10px rgba(255,255,255,0.3)");
                  }}
                  onMouseLeave={(e: any) => {
                    (e.currentTarget.style.color = "var(--cg-text-muted)");
                    (e.currentTarget.style.textShadow = "none");
                  }}
                >
                  {label}
                </Tag>
              )
            })}
          </div>
        </div>
      </footer>
    </main>
  );
}

