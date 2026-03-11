import Link from "next/link";
import LessonNav from "@/components/learn/LessonNav";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const isTr = resolvedParams.lang === "tr";
  return {
    title: isTr ? "Memecoin 101: Rug Pull Nedir, Nasıl Çalışır? | Taranoid" : "Memecoin 101: What is a Rug Pull and How it Works | Taranoid",
    description: isTr
      ? "Memecoin nedir ve rug pull dolandırıcılığı nasıl yapılır? Pump.fun üzerindeki sahte projelere karşı Taranoid risk metriklerini öğren."
      : "What is a memecoin and how do rug pull scams work? Learn to avoid Pump.fun scams using Taranoid's AI risk metrics.",
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
  const lang = resolvedParams.lang;
  const isTr = lang === "tr";
  const WEB_URL = "https://taranoid.app";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": isTr ? "Memecoin 101: Rug Pull Nedir, Nasıl Çalışır?" : "Memecoin 101: What is a Rug Pull and How it Works",
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
              Ders 1
            </span>
            <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>8 dk okuma</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4" style={{ color: "var(--cg-text)" }}>
            🎓 Memecoin 101
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
            Memecoin nedir, nasıl çalışır ve insanlar neden kaybeder? Bu derste rug pull mekanizmasını ve tehlike sinyallerini öğreneceksin.
          </p>
        </div>

        {/* İçerik */}
        <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>

          <Section title="Memecoin Nedir?">
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              Memecoin, genellikle internet meme'lerine veya viral içeriklere dayanan kripto para birimidir.
              DOGE, SHIB, PEPE bunların en tanınmış örnekleri. Ancak günde yüzlerce yeni memecoin piyasaya çıkıyor
              ve çoğu dolandırıcılık amacıyla tasarlanmış.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Meşru Memecoin", items: ["Gerçek topluluk desteği", "Şeffaf geliştirici", "Büyük borsalarda listelendi", "Uzun süredir var"], color: "#34D399" },
                { label: "Sahte Memecoin", items: ["Anonim ekip", "Hızlı pump & dump", "Sosyal medya botu ordusu", "Kısa ömürlü"], color: "#F87171" },
              ].map((box) => (
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

          <Section title="Rug Pull Nasıl Çalışır?">
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--cg-text-muted)" }}>
              Rug pull, geliştiricilerin yatırımcıların parasını alıp kaçmasıdır. Tipik senaryo:
            </p>
            <div className="space-y-3 mb-4">
              {[
                { step: "1", title: "Token Oluştur", desc: "Pump.fun'da 2-3 dakikada token açılır. Maliyet: ~0.02 SOL. Toplam arz birkaç kişinin elinde.", color: "#818CF8" },
                { step: "2", title: "Sahte Topluluk Kur", desc: "Telegram/Discord grubu açılır. Bot hesaplarla şişirilir. 'Büyük proje' izlenimi yaratılır.", color: "#FBBF24" },
                { step: "3", title: "Holder Sayısını Şişir", desc: "Aynı kişiye ait yüzlerce cüzdan token alır. 'Binlerce holder var' algısı oluşturulur.", color: "#FB923C" },
                { step: "4", title: "Pump Yap", desc: "Koordineli alımlarla fiyat yapay olarak yükselir. Sosyal medyada '100x fırsat' paylaşımları yapılır.", color: "#F87171" },
                { step: "5", title: "Dump Et & Kaç", desc: "Geliştirici tüm tokenlarını satar. Fiyat %90-99 düşer. Proje terk edilir.", color: "#EF4444" },
              ].map((s) => (
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

          <Section title="Tehlike Sinyalleri">
            <SignalList color="#F87171" items={[
              { signal: "🔴 Anonim geliştirici", detail: "Kim olduğunu bilmediğin birine para veriyorsun. Doğrulanmış kimlik yoksa risk çok yüksek." },
              { signal: "⚠️ Az holder, yüksek yoğunlaşma", detail: "100'den az holder veya top 10 cüzdanın supply'ın %80+'ını tutması — satış anında fiyat çöker." },
              { signal: "🚨 Çok hızlı yükseliş", detail: "Token açılışından itibaren dakikalar içinde %1000+ yükseliş. Gerçek değil, koordineli pump." },
              { signal: "🤖 Bot aktivitesi", detail: "Telegram'da sürekli aynı mesajları atan hesaplar, Twitter'da anlamsız RT şişirmesi." },
              { signal: "🔒 Kilitli likidite yok", detail: "Likidite kilitlenmemişse geliştirici dilediği zaman havuzu boşaltabilir." },
            ]} />
          </Section>

          <InfoBox color="#34D399" icon="✅" title="Altın Kural">
            FOMO (kaçırma korkusu) ile alım yapma. Eğer bir token sana '10 dakikada 10x' vaat ediyorsa, büyük ihtimalle
            sen zaten onların çıkış likiditesisin.
          </InfoBox>

          <InfoBox color="#818CF8" icon="🛡️" title="Taranoid Ne Yapar?">
            Bir token adresini girerek VLR (wash trading), cüzdan kümeleme (sahte holder), Sybil attack ve 6 metrik
            daha ile saniyeler içinde risk skoru alabilirsin. 0 = güvenli, 100 = kritik risk.
          </InfoBox>

        </div>

        {/* CTA */}
        <div className="mt-10 p-6 rounded-2xl text-center animate-slide-up" style={{ animationDelay: "0.15s", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
          <p className="text-base font-bold mb-2" style={{ color: "var(--cg-text)" }}>Öğrendiklerini test et</p>
          <p className="text-sm mb-4" style={{ color: "var(--cg-text-muted)" }}>
            Merak ettiğin bir tokenı analiz et ve risk skorunu gör.
          </p>
          <Link href={`/${lang}`} className="cta-button px-8 py-3 text-sm inline-block">
            Token Analiz Et
          </Link>
        </div>

        {/* Paylaş */}
        <div className="mt-6 flex items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.18s" }}>
          <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>Bu dersi paylaş:</span>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent("https://taranoid-beryl.vercel.app/learn/memecoin-101")}&text=${encodeURIComponent("Memecoin dolandırıcılıklarını öğrenmek isteyenlere: Taranoid Eğitim Merkezi")}`}
            target="_blank" rel="noopener noreferrer"
            className="metric-badge hover:opacity-80 transition-opacity"
            style={{ background: "rgba(33,150,243,0.1)", color: "#29B6F6", border: "1px solid rgba(33,150,243,0.2)" }}
          >
            Telegram'da Paylaş
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Memecoin rug pull'ları nasıl çalışır? @taranoidapp Türkçe eğitim:")}&url=${encodeURIComponent("https://taranoid-beryl.vercel.app/learn/memecoin-101")}`}
            target="_blank" rel="noopener noreferrer"
            className="metric-badge hover:opacity-80 transition-opacity"
            style={{ background: "rgba(0,0,0,0.2)", color: "var(--cg-text-muted)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            X'te Paylaş
          </a>
        </div>
      </article>
    </main>
  );
}
