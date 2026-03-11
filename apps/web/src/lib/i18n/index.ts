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
    h1_main: string
    h1_sub: string
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
  learn: {
    badge: string
    h1_main: string
    h1_sub: string
    desc: string
    lessons: readonly {
      tag: string
      title: string
      desc: string
      readTime: string
    }[]
    read_btn: string
    cta_title: string
    cta_desc: string
    btn_analyze: string
    disclaimer: string
  }
  learn_wash_trading: {
    meta_title: string
    meta_desc: string
    read_time: string
    h1: string
    intro: string
    sections: {
      what_is_it: {
        title: string
        p1: string
        example_title: string
        example_flow: readonly string[]
        example_caption: string
      }
      why_do_it: {
        title: string
        items: readonly { icon: string; title: string; desc: string }[]
      }
      vlr: {
        title: string
        p1: string
        code: string
        ranges: readonly { range: string; label: string; color: string }[]
      }
      other_signals: {
        title: string
        items: readonly { icon: string; title: string; desc: string }[]
      }
    }
    score_box: {
      title: string
      desc: string
    }
    cta: {
      title: string
      desc: string
      btn: string
    }
    share: string
    share_btn: string
  }
  learn_memecoin_101: {
    meta_title: string
    meta_desc: string
    read_time: string
    h1: string
    intro: string
    sections: {
      what_is_it: {
        title: string
        p1: string
        cards: readonly { label: string; items: readonly string[]; color: string }[]
      }
      how_it_works: {
        title: string
        p1: string
        steps: readonly { step: string; title: string; desc: string; color: string }[]
      }
      red_flags: {
        title: string
        items: readonly { signal: string; detail: string }[]
      }
    }
    info_boxes: {
      golden_rule: {
        title: string
        desc: string
      }
      what_taranoid_does: {
        title: string
        desc: string
      }
    }
    cta: {
      title: string
      desc: string
      btn: string
    }
    share: string
    share_telegram: string
    share_x: string
  }
  learn_wallet_clustering: {
    meta_title: string
    meta_desc: string
    read_time: string
    h1: string
    intro: string
    sections: {
      problem: {
        title: string
        p1: string
        case_title: string
        stats: readonly { label: string; value: string; sub: string }[]
      }
      how_it_works: {
        title: string
        p1: string
        steps: readonly { step: string; title: string; desc: string; example: string; color: string }[]
      }
      sybil: {
        title: string
        p1: string
        items: readonly { signal: string; risk: string }[]
      }
    }
    info_box: {
      title: string
      desc: string
    }
    cta: {
      title: string
      desc: string
      btn: string
    }
  }
  learn_case_pippinu: {
    meta_title: string
    meta_desc: string
    badge: string
    read_time: string
    h1: string
    intro: string
    summary: {
      title: string
      stats: readonly { label: string; value: string; sub: string; color: string }[]
      note: string
    }
    sections: {
      timeline: {
        title: string
        steps: readonly { time: string; event: string; detail: string; color: string; icon: string }[]
      }
      metrics: {
        title: string
        p1: string
        table_header: string
        rows: readonly { label: string; value: string; sub: string; color: string }[]
        score: {
          value: string
          label: string
          desc: string
        }
      }
      clustering: {
        title: string
        p1: string
        clusters: readonly { title: string; wallets: number; supply: string; desc: string; color: string }[]
        code: string
      }
      lessons: {
        title: string
        items: readonly { num: string; lesson: string; detail: string; color: string }[]
      }
    }
    conclusion: {
      title: string
      desc: string
    }
    cta: {
      title: string
      desc: string
      btn: string
    }
    share: string
    share_telegram: string
    share_x: string
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
