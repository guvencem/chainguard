import Link from "next/link";
import LessonNav from "@/components/learn/LessonNav";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const isTr = resolvedParams.lang === "tr";
  return {
    title: isTr ? "Cüzdan Kümeleme ve Sybil Attack Skoru | Taranoid" : "Wallet Clustering and Sybil Attack Score | Taranoid",
    description: isTr
      ? "Blockchain graf analizi ile sahte holder sayılarını tespit edin. Taranoid'ın cüzdan kümeleme algoritması cüzdan ağlarını nasıl çıkarıyor?"
      : "Detect fake token holders with blockchain transaction graph analysis. Learn how Taranoid's wallet clustering algorithm maps sybil networks.",
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
  const lang = resolvedParams.lang;
  const isTr = lang === "tr";
  const WEB_URL = "https://taranoid.app";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": isTr ? "Cüzdan Kümeleme & Sybil Attack" : "Wallet Clustering & Sybil Attack",
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
              Ders 3
            </span>
            <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>7 dk okuma</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4" style={{ color: "var(--cg-text)" }}>
            🔗 Cüzdan Kümeleme & Sybil Attack
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
            400 cüzdan aslında tek kişi olabilir. Blockchain grafı analizi ile sahte holder şişirmesini
            nasıl tespit ederiz?
          </p>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>

          <Section title="Problem: Sahte Holder Şişirmesi">
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              Bir token "5.000 holder" gösteriyorsa güvenli görünür. Ama bu 5.000 holderın 4.000'i aynı
              kişiye aitse? Blockchain üzerinde her cüzdanı ayrı bir kimlik olarak görmek mümkün değil —
              ya da öyle sanılıyordu.
            </p>
            <div className="p-5 rounded-2xl mb-5" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
              <p className="text-sm font-bold mb-3" style={{ color: "#FBBF24" }}>Gerçek Dünya Örneği: PIPPINU</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Görünen Holder", value: "380+", sub: "cüzdan" },
                  { label: "Gerçek Kişi", value: "~3-5", sub: "kişi tahmini" },
                  { label: "Sahte Oran", value: "%99", sub: "sahte holder" },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.2)" }}>
                    <div className="text-xl font-black mb-1" style={{ color: "#FBBF24" }}>{s.value}</div>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>{s.label}</div>
                    <div className="text-[10px]" style={{ color: "var(--cg-text-dim)" }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Kümeleme Nasıl Çalışır?">
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              Taranoid 4 farklı sinyal kullanarak aynı kişiye ait cüzdanları tespit eder:
            </p>
            <div className="space-y-3">
              {[
                {
                  step: "1", color: "#818CF8",
                  title: "Funding Graph — Kim Kimi Finanse Etti?",
                  desc: "Her cüzdanın ilk SOL transferi 3 seviye geriye kadar izlenir. Aynı kaynak cüzdandan fonlananlar = muhtemelen aynı kişi.",
                  example: "Ana Cüzdan → 50 alt cüzdana 0.01 SOL transfer → Bu 50 cüzdan token alır",
                },
                {
                  step: "2", color: "#FBBF24",
                  title: "Timing Cluster — Aynı Anda Doğanlar",
                  desc: "Aynı 5 dakika içinde oluşturulan 10+ cüzdan otomatik olarak şüpheli sayılır. İnsan 5 dakikada 10 cüzdan açamaz.",
                  example: "15:42:03 → Cüzdan 1 oluştu\n15:43:17 → Cüzdan 2 oluştu\n15:44:55 → Cüzdan 3 oluştu ... → Script!",
                },
                {
                  step: "3", color: "#FB923C",
                  title: "Behavioral Similarity — Aynı Davranış",
                  desc: "Benzer miktarlarda (±%5 tolerans), benzer zaman aralıklarında işlem yapan cüzdanlar eşleştirilir.",
                  example: "Cüzdan A: 1000 token → 5dk sonra satar\nCüzdan B: 1000 token → 5dk sonra satar → Bot!",
                },
                {
                  step: "4", color: "#F87171",
                  title: "Connected Components — Graf Analizi",
                  desc: "Bu 3 sinyal birleştirilerek bir ağ (graph) oluşturulur. Birbirine bağlı cüzdan grupları = bir küme = bir kişi.",
                  example: "Küme 1: 380 cüzdan → Supply'ın %67'si\nKüme 2: 12 cüzdan → Supply'ın %8'i",
                },
              ].map((s) => (
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

          <Section title="Sybil Attack Nedir?">
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              Sybil attack, bir kişinin çok sayıda sahte kimlik oluşturarak sistemi kandırmasıdır.
              Kripto dünyasında en yaygın kullanım: airdrop farming ve holder sayısı şişirme.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { signal: "Cüzdan yaşı < 24 saat", risk: "%70+ yeni → +35 puan" },
                { signal: "Tek token cüzdanı", risk: "%60+ tek token → +25 puan" },
                { signal: "Benzer SOL bakiyesi", risk: "0.001–0.003 SOL → +20 puan" },
                { signal: "Holder ani düşüş", risk: "10dk'da %50 düşüş → +30 puan" },
              ].map((row) => (
                <div key={row.signal} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--cg-text)" }}>⚠️ {row.signal}</p>
                  <p className="text-[11px]" style={{ color: "#F87171" }}>{row.risk}</p>
                </div>
              ))}
            </div>
          </Section>

          <div className="p-5 rounded-2xl" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
            <p className="text-sm font-bold mb-2" style={{ color: "#34D399" }}>✅ Gerçek holder = gerçek güven</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
              Kümeleme analizi sıfır çıkan bir tokende holderlar gerçekten bağımsız kişilerdir.
              Bu tek başına büyük bir güven sinyalidir — ama yeterli değil, diğer 8 metriği de kontrol et.
            </p>
          </div>
        </div>

        <div className="mt-10 p-6 rounded-2xl text-center animate-slide-up" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)" }}>
          <p className="text-base font-bold mb-2" style={{ color: "var(--cg-text)" }}>Gerçek vaka: PIPPINU'yu gör</p>
          <p className="text-sm mb-4" style={{ color: "var(--cg-text-muted)" }}>380 sahte holderın tespiti adım adım.</p>
          <Link href={`/${lang}/learn/case/pippinu`} className="cta-button px-8 py-3 text-sm inline-block">
            Vakayı İncele →
          </Link>
        </div>
      </article>
    </main>
  );
}
