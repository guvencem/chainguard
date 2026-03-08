import { tr } from "./tr"
import { en } from "./en"

export type Lang = "tr" | "en"

// Derive a structural shape (widened strings) so both tr and en satisfy it
export type Translations = {
  nav: {
    analyze: string
    trending: string
    learn: string
    token: string
    api: string
  }
  home: {
    hero_title: string
    hero_title2: string
    hero_sub: string
    placeholder: string
    btn_analyze: string
    btn_trending: string
    stats_analyzed: string
    stats_protected: string
    stats_chains: string
    features_title: string
  }
  risk: {
    safe: string
    low: string
    medium: string
    high: string
    critical: string
  }
  footer: {
    tagline: string
    rights: string
  }
}

export const translations: Record<Lang, Translations> = { tr, en }
export const defaultLang: Lang = "tr"

export function getT(lang: Lang): Translations {
  return translations[lang]
}
