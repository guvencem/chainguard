import Link from "next/link";
import LessonNav from "@/components/learn/LessonNav";
import { Metadata } from "next";
import { getT, Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as Lang;
  const t = getT(lang).learn_wash_trading;
  return {
    title: t.meta_title,
    description: t.meta_desc,
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-black mb-4" style={{ color: "var(--cg-text)" }}>{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="text-xs p-4 rounded-xl overflow-x-auto mb-4"
      style={{ background: "rgba(0,0,0,0.4)", color: "#34D399", lineHeight: 1.8, border: "1px solid rgba(255,255,255,0.06)" }}>
      {children}
    </pre>
  );
}

export default async function WashTradingPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as Lang;
  const t = getT(lang).learn_wash_trading;
  const WEB_URL = "https://taranoid.app";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": t.meta_title,
    "image": `${WEB_URL}/api/og`,
    "author": {
      "@type": "Organization",
      "name": "Taranoid Risk Monitoring Engine",
      "url": WEB_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": "Taranoid",
      "logo": {
        "@type": "ImageObject",
        "url": `${WEB_URL}/api/og`
      }
    },
    "datePublished": "2024-03-01T08:00:00+00:00",
    "dateModified": new Date().toISOString()
  };

  return (
    <main className="min-h-screen grid-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="fixed inset-0 pointer-events-none -z-10"
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(239,68,68,0.08) 0%, transparent 70%)" }}
      />
      <LessonNav
        prev={{ href: "/learn/memecoin-101", title: "Memecoin 101" }}
        next={{ href: "/learn/wallet-clustering", title: "Cüzdan Kümeleme & Sybil" }}
      />

      <article className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="metric-badge" style={{ background: "rgba(248,113,113,0.1)", color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}>
              {getT(lang).learn.lessons[1].tag}
            </span>
            <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>{t.read_time}</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4" style={{ color: "var(--cg-text)" }}>
            {t.h1}
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
            {t.intro}
          </p>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>

          <Section title={t.sections.what_is_it.title}>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              {t.sections.what_is_it.p1}
            </p>
            <div className="p-5 rounded-2xl mb-4" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#F87171" }}>{t.sections.what_is_it.example_title}</p>
              <div className="flex items-center justify-center gap-2 text-sm font-mono flex-wrap" style={{ color: "var(--cg-text-muted)" }}>
                {t.sections.what_is_it.example_flow.map((s, i) => (
                  <span key={i} style={{ color: s === "→" ? "rgba(248,113,113,0.5)" : i === 0 || i === t.sections.what_is_it.example_flow.length - 1 ? "#F87171" : "var(--cg-text-muted)" }}>
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs mt-3 text-center" style={{ color: "var(--cg-text-dim)" }}>
                {t.sections.what_is_it.example_caption}
              </p>
            </div>
          </Section>

          <Section title={t.sections.why_do_it.title}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {t.sections.why_do_it.items.map((item) => (
                <div key={item.title} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-sm font-bold mb-1" style={{ color: "var(--cg-text)" }}>{item.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title={t.sections.vlr.title}>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              {t.sections.vlr.p1}
            </p>
            <CodeBlock>{t.sections.vlr.code}</CodeBlock>
            <div className="space-y-2 mb-4">
              {t.sections.vlr.ranges.map((row) => (
                <div key={row.range} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                  style={{ background: `${row.color}08`, border: `1px solid ${row.color}15` }}>
                  <span className="text-xs font-mono font-bold" style={{ color: row.color }}>{row.range}</span>
                  <span className="text-xs" style={{ color: row.color }}>{row.label}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title={t.sections.other_signals.title}>
            <div className="space-y-3">
              {t.sections.other_signals.items.map((s) => (
                <div key={s.title} className="flex gap-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-lg flex-shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-sm font-bold mb-1" style={{ color: "var(--cg-text)" }}>{s.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div className="p-5 rounded-2xl" style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)" }}>
            <p className="text-sm font-bold mb-2" style={{ color: "#818CF8" }}>{t.score_box.title}</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
              {t.score_box.desc}
            </p>
          </div>
        </div>

        <div className="mt-10 p-6 rounded-2xl text-center animate-slide-up" style={{ animationDelay: "0.15s", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)" }}>
          <p className="text-base font-bold mb-2" style={{ color: "var(--cg-text)" }}>{t.cta.title}</p>
          <p className="text-sm mb-4" style={{ color: "var(--cg-text-muted)" }}>{t.cta.desc}</p>
          <Link href={`/${lang}`} className="cta-button px-8 py-3 text-sm inline-block">{t.cta.btn}</Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>{t.share}</span>
          <a href={`https://t.me/share/url?url=${encodeURIComponent("https://taranoid.app/" + lang + "/learn/wash-trading")}&text=${encodeURIComponent(t.meta_title)}`}
            target="_blank" rel="noopener noreferrer"
            className="metric-badge hover:opacity-80 transition-opacity"
            style={{ background: "rgba(33,150,243,0.1)", color: "#29B6F6", border: "1px solid rgba(33,150,243,0.2)" }}>
            {t.share_btn}
          </a>
        </div>
      </article>
    </main>
  );
}
