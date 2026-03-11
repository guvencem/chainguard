"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react"
import { type Lang, type Translations, defaultLang, getT } from "@/lib/i18n"

const STORAGE_KEY = "cg_lang"

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translations
}

const LangContext = createContext<LangContextValue>({
  lang: defaultLang,
  setLang: () => undefined,
  t: getT(defaultLang),
})

export function LangProvider({ children, initialLang = defaultLang }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  // Hydrate from localStorage on mount ONLY if it overrides the URL (advanced sync)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
      if (stored && stored !== initialLang && (stored === "tr" || stored === "en")) {
        // We only enforce localStorage if they navigate without middleware catching it, 
        // but generally middleware handles the cookie.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLangState(stored)
      }
    } catch {
      // localStorage unavailable (SSR safety)
    }
  }, [initialLang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
      // Also set a cookie so the server can read it if needed
      document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax`
    } catch {
      // Ignore storage errors
    }
  }, [])

  const t = getT(lang)

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  return useContext(LangContext)
}
