"use client";

import { useRouter } from "next/navigation";
import LessonNav from "@/components/learn/LessonNav";

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

export default function PippinuCasePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen grid-bg">
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
              Vaka Çalışması
            </span>
            <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>10 dk okuma</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4" style={{ color: "var(--cg-text)" }}>
            🔍 PIPPINU Rug Pull Analizi
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
            380 sahte cüzdan, %97 kayıp, 72 saat. Gerçek bir rug pull'un adım adım anatomisi —
            Taranoid hangi sinyalleri, ne zaman tespit etti?
          </p>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>

          {/* Özet kutusu */}
          <div className="p-5 rounded-2xl mb-10" style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.2)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#FB923C" }}>Vaka Özeti</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-4">
              {[
                { label: "Taranoid Skoru", value: "87", sub: "/ 100 risk", color: "#F87171" },
                { label: "Gerçek Holder", value: "~4", sub: "kişi tahmini", color: "#FBBF24" },
                { label: "Sahte Cüzdan", value: "376+", sub: "kümelenmiş", color: "#FB923C" },
                { label: "Kayıp", value: "%97", sub: "72 saatte", color: "#EF4444" },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.25)" }}>
                  <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>{s.label}</div>
                  <div className="text-[10px]" style={{ color: "var(--cg-text-dim)" }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-center" style={{ color: "var(--cg-text-dim)" }}>
              Not: Bu vaka gerçek blockchain manipülasyon örüntülerinden oluşturulmuş eğitim amaçlı analizdir.
            </p>
          </div>

          {/* Zaman çizelgesi */}
          <Section title="Olayların Kronolojisi">
            <Timeline steps={[
              {
                time: "Saat 0 — Başlangıç",
                event: "Token Pump.fun'da Oluşturuldu",
                detail: "PIPPINU tokeni ~0.02 SOL maliyet ile Pump.fun üzerinde açıldı. Toplam arzın %80'i 2 cüzdanda toplanmış halde başladı. Başlangıç likiditesi: $1.200.",
                color: "#818CF8",
                icon: "●",
              },
              {
                time: "Saat 0–2",
                event: "Sahte Holder Şişirme — Faz 1",
                detail: "Ana cüzdandan 200'den fazla alt cüzdana 0.001–0.003 SOL arası küçük transferler yapıldı. Her alt cüzdan hemen PIPPINU aldı. Görünür holder sayısı 12'den 240'a çıktı.",
                color: "#FBBF24",
                icon: "●",
              },
              {
                time: "Saat 2–6",
                event: "Sahte Hacim — Wash Trading",
                detail: "30 cüzdan arasında döngüsel alım-satım başladı. VLR 340x'e ulaştı (likidite $3.500, 24s hacim $1.2M). DEXScreener'da 'Trending' listesine girdi.",
                color: "#FB923C",
                icon: "●",
              },
              {
                time: "Saat 6",
                event: "Sosyal Medya Kampanyası",
                detail: "Telegram kanalında '1000x gem buldum' mesajları yayıldı. Bot hesaplar tarafından koordineli paylaşımlar yapıldı. Gerçek yatırımcılar almaya başladı.",
                color: "#F59E0B",
                icon: "●",
              },
              {
                time: "Saat 6–24",
                event: "Pump Fazı — Fiyat Zirvesi",
                detail: "Gerçek yatırımcıların girişiyle fiyat başlangıçtan +1400% yükseldi. Market cap ~$180.000'e ulaştı. Sahte holderlar hâlâ supply'ın %67'sini tutuyordu.",
                color: "#34D399",
                icon: "●",
              },
              {
                time: "Saat 24–48",
                event: "Kademeli Dump Başladı",
                detail: "Sahte cüzdanlar birer birer satmaya başladı — fark edilmemek için 10–30 dakika arayla. Her satışta fiyat bir miktar düştü. Likidite yavaş yavaş boşaldı.",
                color: "#F87171",
                icon: "●",
              },
              {
                time: "Saat 72",
                event: "Rug Pull Tamamlandı",
                detail: "Tüm sahte cüzdanlar satışını tamamladı. Geliştirici likidite havuzunu kapattı. Fiyat zirveden %97 düştü. Telegram kanalı silindi.",
                color: "#EF4444",
                icon: "●",
              },
            ]} />
          </Section>

          {/* Taranoid tespiti */}
          <Section title="Taranoid Metrikleri — Anlık Tablo">
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              Token açılışından 2 saat sonra Taranoid tarafından analiz edildiğinde gösterilen metrikler:
            </p>
            <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="px-4 py-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>Metrik Detayları</span>
              </div>
              <div className="px-4 pb-2">
                <StatRow label="VLR (Volume/Liquidity)" value="340x" sub="Normal: <10x" color="#F87171" />
                <StatRow label="Holder Sayısı" value="247" sub="Gerçek: ~4 kişi" color="#F87171" />
                <StatRow label="Küme Skoru" value="94/100" sub="376 cüzdan, 2 küme" color="#EF4444" />
                <StatRow label="Wash Trading" value="78/100" sub="Döngüsel işlem tespit" color="#F87171" />
                <StatRow label="Sybil Attack" value="91/100" sub="Timing + funding analizi" color="#EF4444" />
                <StatRow label="RLS (Rug Likidite)" value="82/100" sub="Kilitsiz likidite" color="#F87171" />
                <StatRow label="Top 10 Konsantrasyon" value="%89" sub="Kritik eşik: %60" color="#F87171" />
                <StatRow label="Token Yaşı" value="2 saat" sub="<24 saat: yüksek risk" color="#FB923C" />
              </div>
            </div>

            {/* Toplam skor */}
            <div className="p-5 rounded-2xl text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div className="text-5xl font-black mb-2" style={{ color: "#EF4444" }}>87</div>
              <div className="text-sm font-bold mb-1" style={{ color: "var(--cg-text)" }}>Genel Risk Skoru</div>
              <div className="text-xs" style={{ color: "var(--cg-text-muted)" }}>Pump fazına girmeden 4 saat önce bu skoru görmek mümkündü</div>
            </div>
          </Section>

          {/* Kümeleme analizi detayı */}
          <Section title="Cüzdan Kümeleme — Detaylı Bulgular">
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
              Funding graph analizi 4 aşamalı bir dağıtım ağı ortaya çıkardı:
            </p>
            <div className="space-y-3">
              {[
                {
                  title: "Küme 1 — Ana Operatör",
                  wallets: 1,
                  supply: "%42",
                  desc: "Tüm operasyonu finanse eden master cüzdan. Diğer tüm cüzdanlara SOL gönderdi.",
                  color: "#EF4444",
                },
                {
                  title: "Küme 2 — Dağıtım Katmanı",
                  wallets: 8,
                  supply: "%25",
                  desc: "Master cüzdandan fonlanan 8 ara cüzdan. Bunlar da alt cüzdanlara dağıtım yaptı.",
                  color: "#F87171",
                },
                {
                  title: "Küme 3 — Sahte Holderlar",
                  wallets: 243,
                  supply: "%28",
                  desc: "Dağıtım cüzdanlarından fonlanan ve holder sayısı şişirmek için kullanılan cüzdanlar.",
                  color: "#FB923C",
                },
                {
                  title: "Gerçek Holderlar",
                  wallets: 124,
                  supply: "%5",
                  desc: "Sosyal medya kampanyasına kanan ve gerçekten satın alan bağımsız kullanıcılar.",
                  color: "#34D399",
                },
              ].map((cluster) => (
                <div key={cluster.title} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${cluster.color}20` }}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-bold" style={{ color: cluster.color }}>{cluster.title}</p>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-sm font-bold" style={{ color: cluster.color }}>{cluster.wallets} cüzdan</div>
                      <div className="text-[10px]" style={{ color: "var(--cg-text-dim)" }}>Supply: {cluster.supply}</div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>{cluster.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="text-xs font-mono leading-relaxed" style={{ color: "rgba(251,146,60,0.7)" }}>
                {`Tespit edilen bağlantı sinyalleri:\n`}
                {`• Funding: 252 cüzdan → tek kaynaktan finanse\n`}
                {`• Timing: 180 cüzdan → 47 dakikada oluşturuldu\n`}
                {`• Behavioral: 230 cüzdan → ±%3 benzer miktar\n`}
                {`• Graph: 2 bağlı bileşen (supply'ın %95'i)`}
              </p>
            </div>
          </Section>

          {/* Eğitim dersleri */}
          <Section title="Bu Vakadan Çıkarılan 5 Ders">
            <div className="space-y-3">
              {[
                {
                  num: "1",
                  lesson: "Holder sayısı yanıltıcıdır",
                  detail: "247 görünen holder gerçekte 4 kişiydi. Sayıya değil, kümeleme analizine bak.",
                  color: "#818CF8",
                },
                {
                  num: "2",
                  lesson: "VLR >50x = acil uyarı",
                  detail: "340x VLR fiziksel olarak imkânsız. Bu kadar yüksek oran kesinlikle wash trading gösterir.",
                  color: "#FBBF24",
                },
                {
                  num: "3",
                  lesson: "Kademeli dump daha tehlikelidir",
                  detail: "Ani dump yerine 24 saat boyunca yavaş satış — fark etmek için aktif izleme gerekir.",
                  color: "#FB923C",
                },
                {
                  num: "4",
                  lesson: "Trending listesi = dikkat sinyali",
                  detail: "Wash trading ile trending'e girmek kolaydır. Trend olan token daha az şüpheyle incelenir — bu bir avantaj.",
                  color: "#F87171",
                },
                {
                  num: "5",
                  lesson: "2 saat önce tespit mümkündü",
                  detail: "Token açıldıktan 2 saat sonra tüm sinyaller zaten mevcuttu. Pump'a girmeden önce kontrol etmek kârı kurtarır.",
                  color: "#34D399",
                },
              ].map((s) => (
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
            <p className="text-sm font-bold mb-2" style={{ color: "#34D399" }}>Korunmanın tek yolu: veriyle karar vermek</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
              PIPPINU örneği bize şunu öğretiyor: sezgi, sosyal medya ve FOMO yetersizdir.
              Blockchain verisi yalan söylemez. Kümeleme, VLR ve konsantrasyon skorları gerçeği
              milisaniyeler içinde ortaya koyar — eğer nereye bakacağını bilirsen.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 p-6 rounded-2xl text-center animate-slide-up" style={{ background: "rgba(251,146,60,0.05)", border: "1px solid rgba(251,146,60,0.12)" }}>
          <p className="text-base font-bold mb-2" style={{ color: "var(--cg-text)" }}>Şüpheli bir token gördün mü?</p>
          <p className="text-sm mb-4" style={{ color: "var(--cg-text-muted)" }}>87 puanlık riski önceden gör. Token adresi yeter.</p>
          <button onClick={() => router.push("/")} className="cta-button px-8 py-3 text-sm">
            Token Analiz Et
          </button>
        </div>

        {/* Paylaş */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="text-xs" style={{ color: "var(--cg-text-dim)" }}>Bu vakayı paylaş:</span>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent("https://taranoid-beryl.vercel.app/learn/case/pippinu")}&text=${encodeURIComponent("Gerçek bir rug pull'un anatomisi: PIPPINU nasıl %97 kaybettirdi?")}`}
            target="_blank" rel="noopener noreferrer"
            className="metric-badge hover:opacity-80 transition-opacity"
            style={{ background: "rgba(33,150,243,0.1)", color: "#29B6F6", border: "1px solid rgba(33,150,243,0.2)" }}
          >
            Telegram'da Paylaş
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Gerçek bir rug pull'un blockchain analizi: PIPPINU vakası. 380 sahte cüzdan, %97 kayıp — Taranoid bunu önceden gördü:")}&url=${encodeURIComponent("https://taranoid-beryl.vercel.app/learn/case/pippinu")}`}
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
