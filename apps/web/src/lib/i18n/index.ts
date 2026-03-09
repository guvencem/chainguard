import { tr } from "./tr"
import { en } from "./en"

export type Lang = "tr" | "en"

export interface FeatureItem {
  emoji: string
  title: string
  desc: string
  tag: string
}

export interface StatItem {
  value: string
  label: string
  sub: string
}

export interface Translations {
  nav: {
    how: string
    trending: string
    learn: string
    api: string
    telegram: string
  }
  home: {
    badge: string
    hero_sub: string
    placeholder: string
    btn_analyze: string
    try_label: string
    scroll: string
    features_badge: string
    features_title: string
    features_sub: string
    cta_title: string
    cta_sub: string
    cta_button: string
    cta_free: string
    error_required: string
    error_invalid: string
  }
  stats: readonly StatItem[]
  features: readonly FeatureItem[]
  footer: {
    tagline: string
    links: readonly string[]
  }
}

export const translations: Record<Lang, Translations> = {
  tr: tr as unknown as Translations,
  en: en as unknown as Translations,
}
export const defaultLang: Lang = "tr"

export function getT(lang: Lang): Translations {
  return translations[lang]
}
