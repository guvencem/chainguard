import Link from "next/link";
import LessonNav from "@/components/learn/LessonNav";
import { Metadata } from "next";
import { getT, Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as Lang;
  const t = getT(lang).learn_wallet_clustering;
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

export default async function WalletClusteringPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as Lang;
  const t = getT(lang).learn_wallet_clustering;
  const WEB_URL = "https://taranoid.com";

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
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(251,191,36,0.08) 0%, transparent 70%)" }}
      />
      <LessonNav
        prev={{ href: "/learn/wash-trading", title: "Wash Trading Tespiti" }}
        next={{ href: "/learn/case/pippinu", title: "Vaka: PIPPINU Analizi" }}
      />

      <article className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="metric-badge" style={{ background: "rgba(251,191,36,0.1)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.2)" }}>
              {getT(lang).learn.lessons[2].tag}
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

          <Section title={t.sections.problem.title}>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              {t.sections.problem.p1}
            </p>
            <div className="p-5 rounded-2xl mb-5" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
              <p className="text-sm font-bold mb-3" style={{ color: "#FBBF24" }}>{t.sections.problem.case_title}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {t.sections.problem.stats.map((s) => (
                  <div key={s.label} className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.2)" }}>
                    <div className="text-xl font-black mb-1" style={{ color: "#FBBF24" }}>{s.value}</div>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>{s.label}</div>
                    <div className="text-[10px]" style={{ color: "var(--cg-text-dim)" }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section title={t.sections.how_it_works.title}>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              {t.sections.how_it_works.p1}
            </p>
            <div className="space-y-3">
              {t.sections.how_it_works.steps.map((s) => (
                <div key={s.step} className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}15` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: `${s.color}15`, color: s.color }}>{s.step}</div>
                    <p className="text-sm font-bold" style={{ color: s.color }}>{s.title}</p>
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--cg-text-muted)" }}>{s.desc}</p>
                  <pre className="text-[11px] p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.3)", color: `${s.color}90`, lineHeight: 1.7 }}>
                    {s.example}
                  </pre>
                </div>
              ))}
            </div>
          </Section>

          <Section title={t.sections.sybil.title}>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              {t.sections.sybil.p1}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {t.sections.sybil.items.map((row) => (
                <div key={row.signal} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--cg-text)" }}>⚠️ {row.signal}</p>
                  <p className="text-[11px]" style={{ color: "#F87171" }}>{row.risk}</p>
                </div>
              ))}
            </div>
          </Section>

          <div className="p-5 rounded-2xl" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
            <p className="text-sm font-bold mb-2" style={{ color: "#34D399" }}>{t.info_box.title}</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
              {t.info_box.desc}
            </p>
          </div>
        </div>

        <div className="mt-10 p-6 rounded-2xl text-center animate-slide-up" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)" }}>
          <p className="text-base font-bold mb-2" style={{ color: "var(--cg-text)" }}>{t.cta.title}</p>
          <p className="text-sm mb-4" style={{ color: "var(--cg-text-muted)" }}>{t.cta.desc}</p>
          <Link href={`/${lang}/learn/case/pippinu`} className="cta-button px-8 py-3 text-sm inline-block">
            {t.cta.btn}
          </Link>
        </div>
      </article>
    </main>
  );
}
