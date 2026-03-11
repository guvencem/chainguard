import Link from "next/link";
import LessonNav from "@/components/learn/LessonNav";
import { Metadata } from "next";
import { getT, Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as Lang;
  const t = getT(lang).learn_memecoin_101;
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

function InfoBox({ color, icon, title, children }: { color: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl mb-4" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-sm font-bold" style={{ color }}>{title}</span>
      </div>
      <div className="text-sm leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>{children}</div>
    </div>
  );
}

function SignalList({ items, color }: { items: { signal: string; detail: string }[]; color: string }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-lg flex-shrink-0">{item.signal.split(" ")[0]}</span>
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: "var(--cg-text)" }}>{item.signal.split(" ").slice(1).join(" ")}</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Memecoin101Page({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as Lang;
  const t = getT(lang).learn_memecoin_101;
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
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(99,102,241,0.1) 0%, transparent 70%)" }}
      />
      <LessonNav
        next={{ href: "/learn/wash-trading", title: "Wash Trading Tespiti" }}
      />

      <article className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="metric-badge" style={{ background: "rgba(129,140,248,0.1)", color: "#818CF8", border: "1px solid rgba(129,140,248,0.2)" }}>
              {getT(lang).learn.lessons[0].tag}
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

        {/* İçerik */}
        <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>

          <Section title={t.sections.what_is_it.title}>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              {t.sections.what_is_it.p1}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {t.sections.what_is_it.cards.map((box) => (
                <div key={box.label} className="p-4 rounded-xl" style={{ background: `${box.color}08`, border: `1px solid ${box.color}15` }}>
                  <p className="text-xs font-bold mb-3" style={{ color: box.color }}>{box.label}</p>
                  {box.items.map((item) => (
                    <p key={item} className="text-xs mb-1.5" style={{ color: "var(--cg-text-muted)" }}>
                      {box.color === "#34D399" ? "✓" : "✗"} {item}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </Section>

          <Section title={t.sections.how_it_works.title}>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--cg-text-muted)" }}>
              {t.sections.how_it_works.p1}
            </p>
            <div className="space-y-3 mb-4">
              {t.sections.how_it_works.steps.map((s) => (
                <div key={s.step} className="flex gap-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: `${s.color}15`, color: s.color }}>
                    {s.step}
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-1" style={{ color: s.color }}>{s.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title={t.sections.red_flags.title}>
            <SignalList color="#F87171" items={[...t.sections.red_flags.items]} />
          </Section>

          <InfoBox color="#34D399" icon="✅" title={t.info_boxes.golden_rule.title}>
            {t.info_boxes.golden_rule.desc}
          </InfoBox>

          <InfoBox color="#818CF8" icon="🛡️" title={t.info_boxes.what_taranoid_does.title}>
            {t.info_boxes.what_taranoid_does.desc}
          </InfoBox>

        </div>

        {/* CTA */}
        <div className="mt-10 p-6 rounded-2xl text-center animate-slide-up" style={{ animationDelay: "0.15s", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
          <p className="text-base font-bold mb-2" style={{ color: "var(--cg-text)" }}>{t.cta.title}</p>
          <p className="text-sm mb-4" style={{ color: "var(--cg-text-muted)" }}>
            {t.cta.desc}
          </p>
          <Link href={`/${lang}`} className="cta-button px-8 py-3 text-sm inline-block">
            {t.cta.btn}
          </Link>
        </div>

        {/* Paylaş */}
        <div className="mt-6 flex items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.18s" }}>
          <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>{t.share}</span>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent("https://taranoid.com/" + lang + "/learn/memecoin-101")}&text=${encodeURIComponent(t.meta_title)}`}
            target="_blank" rel="noopener noreferrer"
            className="metric-badge hover:opacity-80 transition-opacity"
            style={{ background: "rgba(33,150,243,0.1)", color: "#29B6F6", border: "1px solid rgba(33,150,243,0.2)" }}
          >
            {t.share_telegram}
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(t.meta_title)}&url=${encodeURIComponent("https://taranoid.com/" + lang + "/learn/memecoin-101")}`}
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
