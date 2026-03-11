import Link from "next/link";
import LessonNav from "@/components/learn/LessonNav";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const isTr = resolvedParams.lang === "tr";
  return {
    title: isTr ? "Wash Trading Nedir, Nasıl Tespit Edilir? | Taranoid" : "What is Wash Trading and How to Detect it? | Taranoid",
    description: isTr
      ? "Solana ve kripto paralar üzerinde wash trading nasıl yapılır? Taranoid'ın VLR (Volume/Liquidity Ratio) ve döngüsel hacim tespiti algoritmalarını öğrenin."
      : "How is wash trading done on Solana and crypto tokens? Learn about Taranoid's VLR (Volume/Liquidity Ratio) and cyclical volume detection algorithms.",
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
  const lang = resolvedParams.lang;
  const isTr = lang === "tr";
  const WEB_URL = "https://taranoid.app";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": isTr ? "Wash Trading Nedir, Nasıl Tespit Edilir?" : "What is Wash Trading and How to Detect it?",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      </head>
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
              Ders 2
            </span>
            <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>6 dk okuma</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4" style={{ color: "var(--cg-text)" }}>
            🔄 Wash Trading Tespiti
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
            Milyonlarca dolarlık "hacim" nasıl saatte yerden biter? Aynı paranın döngüde kullanılmasını ve
            Taranoid'ın bunu nasıl tespit ettiğini öğren.
          </p>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>

          <Section title="Wash Trading Nedir?">
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              Wash trading, aynı kişi veya koordineli bir grubun kendi kendine alım-satım yaparak yapay hacim
              oluşturmasıdır. A cüzdanı B'ye satar, B cüzdanı C'ye, C cüzdanı tekrar A'ya. Sonuç: 3 işlem,
              ama gerçekte hiçbir para el değiştirmemiş.
            </p>
            <div className="p-5 rounded-2xl mb-4" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#F87171" }}>Döngü Örneği</p>
              <div className="flex items-center justify-center gap-2 text-sm font-mono flex-wrap" style={{ color: "var(--cg-text-muted)" }}>
                {["Cüzdan A", "→", "Cüzdan B", "→", "Cüzdan C", "→", "Cüzdan A"].map((s, i) => (
                  <span key={i} style={{ color: s === "→" ? "rgba(248,113,113,0.5)" : s === "Cüzdan A" ? "#F87171" : "var(--cg-text-muted)" }}>
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs mt-3 text-center" style={{ color: "var(--cg-text-dim)" }}>
                Blockchain'de 3 işlem görünür → Borsa "yüksek hacim" gösterir → Yatırımcı ilgi duyar
              </p>
            </div>
          </Section>

          <Section title="Neden Yapılır?">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {[
                { icon: "📈", title: "Algı Yaratmak", desc: "Yüksek hacim = popüler token algısı. CoinGecko/DEXScreener'da üst sıralara çıkmak." },
                { icon: "🎯", title: "FOMO Yaratmak", desc: "$5M günlük hacim gören yatırımcı 'kaçırmayayım' diye alım yapar." },
                { icon: "💰", title: "Pump Hazırlığı", desc: "Sahte aktivite oluşturduktan sonra tokenı dump etmek için zemin hazırlamak." },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-sm font-bold mb-1" style={{ color: "var(--cg-text)" }}>{item.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="VLR — Hacim / Likidite Oranı">
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              Taranoid'ın en önemli metrigi VLR (Volume/Liquidity Ratio), wash trading'i şu formülle yakalar:
            </p>
            <CodeBlock>{`VLR = 24s Hacim ÷ Likidite Havuzu

Örnek 1 (Normal):
  Hacim: $500K    Likidite: $200K    VLR = 2.5x ✅

Örnek 2 (Şüpheli):
  Hacim: $8M      Likidite: $80K     VLR = 100x ⚠️

Örnek 3 (Kritik):
  Hacim: $50M     Likidite: $50K     VLR = 1000x 🚨`}</CodeBlock>
            <div className="space-y-2 mb-4">
              {[
                { range: "VLR < 10x", label: "Normal", color: "#34D399" },
                { range: "VLR 10–50x", label: "Şüpheli", color: "#FBBF24" },
                { range: "VLR 50–200x", label: "Yüksek Risk", color: "#FB923C" },
                { range: "VLR > 200x", label: "Neredeyse Kesin Wash", color: "#F87171" },
              ].map((row) => (
                <div key={row.range} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                  style={{ background: `${row.color}08`, border: `1px solid ${row.color}15` }}>
                  <span className="text-xs font-mono font-bold" style={{ color: row.color }}>{row.range}</span>
                  <span className="text-xs" style={{ color: row.color }}>{row.label}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Diğer Tespit Sinyalleri">
            <div className="space-y-3">
              {[
                { icon: "⏱️", title: "30 Saniyede Geri-İleri", desc: "Aynı iki cüzdan arasında 30 saniyeden kısa aralıklarla yapılan çok sayıda işlem. İnsan davranışı değil." },
                { icon: "💯", title: "Aynı Miktar ±%5", desc: "100 SOL → 100.3 SOL → 99.8 SOL şeklinde dönen para. Tolerans eklenerek 'gerçekmiş gibi' gösterilir." },
                { icon: "🌙", title: "Gece Saati Aktivitesi", detail: "Türkiye saatiyle 03:00–06:00 arası anormal yüksek hacim. Bot çalışıyor, insan uyuyor." },
                { icon: "👻", title: "Az Unique Cüzdan", desc: "10.000 işlem ama sadece 15 farklı cüzdan. Gerçek piyasada yüzlerce farklı alıcı olur." },
              ].map((s) => (
                <div key={s.title} className="flex gap-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-lg flex-shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-sm font-bold mb-1" style={{ color: "var(--cg-text)" }}>{s.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>{(s as any).desc || (s as any).detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div className="p-5 rounded-2xl" style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)" }}>
            <p className="text-sm font-bold mb-2" style={{ color: "#818CF8" }}>🛡️ Taranoid Wash Trading Skoru</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
              VLR + döngü tespiti + unique cüzdan oranı birleştirilerek 0–100 arası wash trading skoru hesaplanır.
              Skor 60+'ı geçen tokenlarda anlamlı wash trading tespit edilmiş demektir.
            </p>
          </div>
        </div>

        <div className="mt-10 p-6 rounded-2xl text-center animate-slide-up" style={{ animationDelay: "0.15s", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)" }}>
          <p className="text-base font-bold mb-2" style={{ color: "var(--cg-text)" }}>Şüpheli bir token gördün mü?</p>
          <p className="text-sm mb-4" style={{ color: "var(--cg-text-muted)" }}>Adresi gir, VLR ve wash trading skorunu anında gör.</p>
          <Link href={`/${lang}`} className="cta-button px-8 py-3 text-sm inline-block">Token Analiz Et</Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>Bu dersi paylaş:</span>
          <a href={`https://t.me/share/url?url=${encodeURIComponent("https://taranoid.app/learn/wash-trading")}&text=${encodeURIComponent("Wash trading nedir, nasıl tespit edilir? Türkçe açıklama:")}`}
            target="_blank" rel="noopener noreferrer"
            className="metric-badge hover:opacity-80 transition-opacity"
            style={{ background: "rgba(33,150,243,0.1)", color: "#29B6F6", border: "1px solid rgba(33,150,243,0.2)" }}>
            Telegram'da Paylaş
          </a>
        </div>
      </article>
    </main>
  );
}
