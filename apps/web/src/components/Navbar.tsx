"use client";

import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";
import { useLang } from "./LangProvider";

function ShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 3L4 6.5v5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5v-5L12 3z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" />
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

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLang();

  const isHome = pathname === "/" || pathname === "";

  return (
    <nav className="nav-glass fixed top-0 left-0 right-0 z-[100] px-4 md:px-10 h-16 flex items-center justify-between pointer-events-auto">
      <div className="flex items-center gap-3">
        {!isHome && (
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-x-1 mr-2"
            style={{ color: "var(--cg-text-muted)" }}
            aria-label="Ana Sayfaya Dön"
          >
            <ArrowLeftIcon />
          </button>
        )}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
          style={{
            background: "var(--cg-gradient-brand)",
            boxShadow: "0 0 20px rgba(99,102,241,0.5)",
            color: "white",
          }}
        >
          <ShieldIcon size={14} />
        </div>
        <span className="font-black text-lg tracking-tight hidden sm:inline-block" style={{ color: "var(--cg-text)" }}>Taranoid</span>
      </div>

      <div className="hidden lg:flex items-center gap-8">
        {[
          [t.nav.how, "/#how"],
          [t.nav.trending, "/trending"],
          [t.nav.learn, "/learn"],
          [t.nav.api, "/keys"],
        ].map(([label, href]) => (
          <a
            key={label}
            href={href}
            className="text-sm font-semibold transition-all duration-200"
            style={{ color: "var(--cg-text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--cg-text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--cg-text-muted)")}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />
        <LangToggle />
        <a
          href="https://t.me/taranoid_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button px-4 py-2 text-xs items-center gap-2 font-bold whitespace-nowrap hidden sm:flex"
        >
          <span>🤖</span> <span className="hidden md:inline-block">{t.nav.telegram}</span><span className="md:hidden">Bot</span>
        </a>
      </div>
    </nav>
  );
}