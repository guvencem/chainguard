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
  // Sync URL-driven language to localStorage/cookie for middleware to use on next direct visit
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== initialLang) {
        localStorage.setItem(STORAGE_KEY, initialLang)
        document.cookie = `${STORAGE_KEY}=${initialLang}; path=/; max-age=31536000; SameSite=Lax`
      }
    } catch {
      // ignore
    }
  }, [initialLang])

  // setLang now just sets storage and handles route push.
  // We don't use React state because the URL is the source of truth for Next.js App Router i18n.
  // Any UI change will happen via Next.js navigation to the new /[lang] path.
  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
      document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax`
    } catch { }
  }, [])

  const t = getT(initialLang)

  return (
    <LangContext.Provider value={{ lang: initialLang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  return useContext(LangContext)
}
