import Link from "next/link";
import LessonNav from "@/components/learn/LessonNav";
import { Metadata } from "next";
import { getT, Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as Lang;
  const t = getT(lang).learn_case_pippinu;
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

function Timeline({ steps }: { steps: { time: string; event: string; detail: string; color: string; icon: string }[] }) {
  return (
    <div className="relative pl-6 space-y-0">
      <div className="absolute left-2 top-3 bottom-3 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />
      {steps.map((s, i) => (
        <div key={i} className="relative pb-6 last:pb-0">
          <div className="absolute -left-4 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px]"
            style={{ background: "#0D1117", borderColor: s.color, color: s.color }}>
            {s.icon}
          </div>
          <div className="pl-4">
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--cg-text-dim)" }}>{s.time}</div>
            <div className="text-sm font-bold mb-1" style={{ color: s.color }}>{s.event}</div>
            <div className="text-xs leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>{s.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatRow({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <span className="text-xs" style={{ color: "var(--cg-text-muted)" }}>{label}</span>
      <div className="text-right">
        <span className="text-sm font-bold" style={{ color }}>{value}</span>
        {sub && <div className="text-[10px]" style={{ color: "var(--cg-text-dim)" }}>{sub}</div>}
      </div>
    </div>
  );
}

export default async function PippinuCasePage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as Lang;
  const t = getT(lang).learn_case_pippinu;
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
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(251,146,60,0.08) 0%, transparent 70%)" }}
      />
      <LessonNav
        prev={{ href: "/learn/wallet-clustering", title: "Cüzdan Kümeleme & Sybil" }}
      />

      <article className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="metric-badge" style={{ background: "rgba(251,146,60,0.1)", color: "#FB923C", border: "1px solid rgba(251,146,60,0.2)" }}>
              {t.badge}
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

          {/* Özet kutusu */}
          <div className="p-5 rounded-2xl mb-10" style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.2)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#FB923C" }}>{t.summary.title}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-4">
              {t.summary.stats.map((s) => (
                <div key={s.label} className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.25)" }}>
                  <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>{s.label}</div>
                  <div className="text-[10px]" style={{ color: "var(--cg-text-dim)" }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-center" style={{ color: "var(--cg-text-dim)" }}>
              {t.summary.note}
            </p>
          </div>

          {/* Zaman çizelgesi */}
          <Section title={t.sections.timeline.title}>
            <Timeline steps={[...t.sections.timeline.steps]} />
          </Section>

          {/* Taranoid tespiti */}
          <Section title={t.sections.metrics.title}>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              {t.sections.metrics.p1}
            </p>
            <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="px-4 py-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>{t.sections.metrics.table_header}</span>
              </div>
              <div className="px-4 pb-2">
                {t.sections.metrics.rows.map((r, i) => (
                  <StatRow key={i} label={r.label} value={r.value} sub={r.sub} color={r.color} />
                ))}
              </div>
            </div>

            {/* Toplam skor */}
            <div className="p-5 rounded-2xl text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div className="text-5xl font-black mb-2" style={{ color: "#EF4444" }}>{t.sections.metrics.score.value}</div>
              <div className="text-sm font-bold mb-1" style={{ color: "var(--cg-text)" }}>{t.sections.metrics.score.label}</div>
              <div className="text-xs" style={{ color: "var(--cg-text-muted)" }}>{t.sections.metrics.score.desc}</div>
            </div>
          </Section>

          {/* Kümeleme analizi detayı */}
          <Section title={t.sections.clustering.title}>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              {t.sections.clustering.p1}
            </p>
            <div className="space-y-3">
              {t.sections.clustering.clusters.map((cluster) => (
                <div key={cluster.title} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${cluster.color}20` }}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-bold" style={{ color: cluster.color }}>{cluster.title}</p>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-sm font-bold" style={{ color: cluster.color }}>{cluster.wallets}</div>
                      <div className="text-[10px]" style={{ color: "var(--cg-text-dim)" }}>Supply: {cluster.supply}</div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>{cluster.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(251,146,60,0.7)" }}>
                {t.sections.clustering.code}
              </pre>
            </div>
          </Section>

          {/* Eğitim dersleri */}
          <Section title={t.sections.lessons.title}>
            <div className="space-y-3">
              {t.sections.lessons.items.map((s) => (
                <div key={s.num} className="flex gap-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: `${s.color}15`, color: s.color }}>{s.num}</div>
                  <div>
                    <p className="text-sm font-bold mb-1" style={{ color: s.color }}>{s.lesson}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Sonuç */}
          <div className="p-5 rounded-2xl" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
            <p className="text-sm font-bold mb-2" style={{ color: "#34D399" }}>{t.conclusion.title}</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
              {t.conclusion.desc}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 p-6 rounded-2xl text-center animate-slide-up" style={{ background: "rgba(251,146,60,0.05)", border: "1px solid rgba(251,146,60,0.12)" }}>
          <p className="text-base font-bold mb-2" style={{ color: "var(--cg-text)" }}>{t.cta.title}</p>
          <p className="text-sm mb-4" style={{ color: "var(--cg-text-muted)" }}>{t.cta.desc}</p>
          <Link href={`/${lang}`} className="cta-button px-8 py-3 text-sm inline-block">
            {t.cta.btn}
          </Link>
        </div>

        {/* Paylaş */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>{t.share}</span>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent("https://taranoid.app/learn/case/pippinu")}&text=${encodeURIComponent("Gerçek bir rug pull'un anatomisi: PIPPINU nasıl %97 kaybettirdi?")}`}
            target="_blank" rel="noopener noreferrer"
            className="metric-badge hover:opacity-80 transition-opacity"
            style={{ background: "rgba(33,150,243,0.1)", color: "#29B6F6", border: "1px solid rgba(33,150,243,0.2)" }}
          >
            {t.share_telegram}
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Gerçek bir rug pull'un blockchain analizi: PIPPINU vakası. 380 sahte cüzdan, %97 kayıp — Taranoid bunu önceden gördü:")}&url=${encodeURIComponent("https://taranoid.app/learn/case/pippinu")}`}
            target="_blank" rel="noopener noreferrer"
            className="metric-badge hover:opacity-80 transition-opacity"
            style={{ background: "rgba(0,0,0,0.2)", color: "var(--cg-text-muted)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {t.share_x}
          </a>
        </div>
      </article>
    </main>
  );
}
