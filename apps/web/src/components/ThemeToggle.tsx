"use client"

import { useTheme } from "./ThemeProvider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
      title={isDark ? "Açık Mod" : "Koyu Mod"}
      style={{
        width: 34,
        height: 34,
        borderRadius: "9px",
        border: "1px solid var(--cg-border-strong)",
        background: "var(--cg-surface)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        fontSize: "15px",
        lineHeight: 1,
        boxShadow: "var(--cg-shadow-sm)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.1) rotate(-10deg)"
        ;(e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px rgba(129,140,248,0.3)"
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1) rotate(0deg)"
        ;(e.currentTarget as HTMLElement).style.boxShadow = "var(--cg-shadow-sm)"
      }}
    >
      <span style={{ display: "block", transition: "transform 0.3s ease" }}>
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  )
}
