"use client"

import { usePathname, useRouter } from "next/navigation"
import { useLang } from "./LangProvider"
import type { Lang } from "@/lib/i18n"

const LANGS: Lang[] = ["tr", "en"]

export function LangToggle() {
  const { lang, setLang } = useLang()
  const router = useRouter()
  const pathname = usePathname()

  const handleLangChange = (newLang: Lang) => {
    if (newLang === lang) return;
    setLang(newLang);

    // Rewrite URL to new language
    const segments = pathname.split('/');
    if (segments[1] === "tr" || segments[1] === "en") {
      segments[1] = newLang;
      router.push(segments.join('/') || '/');
    } else {
      router.push(`/${newLang}${pathname}`);
    }
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        padding: "3px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {LANGS.map((l) => {
        const isActive = lang === l
        return (
          <button
            key={l}
            onClick={() => handleLangChange(l)}
            aria-pressed={isActive}
            aria-label={l === "tr" ? "Türkçe" : "English"}
            style={{
              padding: "8px 14px",
              minHeight: "36px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              lineHeight: 1,
              transition: "background 0.15s, color 0.15s",
              background: isActive
                ? "rgba(129,140,248,0.18)"
                : "transparent",
              color: isActive
                ? "var(--cg-accent)"
                : "var(--cg-text-dim)",
            }}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}
