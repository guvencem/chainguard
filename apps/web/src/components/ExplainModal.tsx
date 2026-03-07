"use client";

import { useState } from "react";

const EXPLANATIONS: Record<string, { title: string; what: string; why: string; signals: string[]; safe: string }> = {
  vlr: {
    title: "Hacim / Likidite Oranı (VLR)",
    what: "24 saatlik işlem hacmini likidite havuzuyla karşılaştırır. Normal bir tokenda hacim, likiditenin 1-5 katı olur.",
    why: "Hacim likiditeyi aşırı geçiyorsa (>50x) aynı para defalarca el değiştiriyor demektir. Buna 'wash trading' denir — gerçek alıcı yok, sadece yapay aktivite.",
    signals: [
      "VLR > 10x → Şüpheli",
      "VLR > 50x → Yüksek ihtimalle wash trading",
      "VLR > 100x → Neredeyse kesin manipülasyon",
    ],
    safe: "Güvenli tokenlarda VLR genellikle 1-5x arasındadır.",
  },
  rls: {
    title: "Gerçek Likidite Skoru (RLS)",
    what: "Market cap ile gerçekte çıkabileceğin miktar arasındaki farkı ölçer. AMM (otomatik piyasa yapıcı) fiyat etkisi hesaplaması yapar.",
    why: "Bir token $10M market cap gösterebilir ama likidite havuzunda sadece $50K olabilir. Büyük miktarda satmaya kalksan fiyat çöker ve gerçekte çok daha az alırsın.",
    signals: [
      "Market cap / Likidite > 100x → Çıkış çok zor",
      "Gerçek çıkış değeri market cap'in %1'inden az → Tuzak",
    ],
    safe: "Sağlıklı tokenlarda market cap / likidite oranı 10-50x arasındadır.",
  },
  holders: {
    title: "Holder Analizi",
    what: "Token sahiplerinin sayısını, aktivitesini, dağılımını ve büyüme hızını analiz eder.",
    why: "Az holder = az güven ve manipülasyona açık. Top 10 cüzdanın supply'ın büyük kısmını tutması rug pull riskini artırır. Sahte holder şişirmesi de yaygın bir dolandırıcılık taktiğidir.",
    signals: [
      "Holder sayısı < 100 → Çok riskli",
      "Top 10 holder > %80 supply → Rug pull riski",
      "Holder sayısı kısa sürede dramatik düştü → Dump başlamış olabilir",
    ],
    safe: "Güvenli projeler genellikle 1000+ holder ve dengeli dağılım gösterir.",
  },
  cluster: {
    title: "Cüzdan Kümeleme",
    what: "Aynı kişiye ait birden fazla cüzdanı tespit eder. Bir dolandırıcı 400 farklı cüzdan açıp hepsine token göndererek sahte holder sayısı şişirebilir.",
    why: "Kümeleme tespiti, bu cüzdanların aynı kaynaktan fonlandığını, aynı anda oluşturulduğunu veya benzer şekilde davrandığını ortaya çıkarır.",
    signals: [
      "Büyük küme > %30 supply → Çok tehlikeli",
      "Cüzdanlar < 24 saat yaşında → Script ile oluşturulmuş",
      "Davranış benzerliği > %80 → Bot kontrolünde",
    ],
    safe: "Gerçek projelerde cüzdanlar birbirinden bağımsız ve farklı kaynaklardan fon almıştır.",
  },
  wash: {
    title: "Wash Trading Tespiti",
    what: "A → B → C → A gibi döngüsel işlemleri tespit eder. Aynı para el değiştirerek yapay hacim oluşturulur.",
    why: "Yüksek hacim gören yatırımcılar tokeni popüler sanır ve alır. Dolandırıcılar bu sahte ivmeyi kullanarak token fiyatını yükseltip çıkar.",
    signals: [
      "Tespit edilen döngü sayısı > 5 → Ciddi wash trading",
      "Sahte hacim oranı > %50 → Hacmin yarısından fazlası sahte",
      "Aynı cüzdan çifti kısa aralıklarla tekrar işlem → Klasik wash",
    ],
    safe: "Gerçek piyasalarda döngüsel işlem örüntüsü neredeyse hiç görülmez.",
  },
  sybil: {
    title: "Sybil Attack Skoru",
    what: "Çok sayıda sahte kimlik/cüzdan kullanarak oy sayısı, holder sayısı veya airdrop miktarı şişirilmesini tespit eder.",
    why: "Bir kişinin binlerce cüzdan açıp tokeni kendine transfer etmesi, sahte bir topluluk izlenimi yaratır. Gerçek yatırımcılar bu göstergelerle aldatılır.",
    signals: [
      "Holder cüzdanların %70+ yaşı < 24 saat → Toplu oluşturulmuş",
      "Tek token cüzdanı > %60 → Sadece bu amaç için açılmış",
      "Benzer SOL bakiyesi (0.001-0.003) → Fabrika cüzdanlar",
    ],
    safe: "Organik topluluklarda farklı yaşlarda, farklı bakiyelerde çeşitli cüzdanlar bulunur.",
  },
  bundler: {
    title: "Bundler Tespiti",
    what: "Aynı blokta 10+ cüzdana eş zamanlı token transferini tespit eder. Jito bundle veya benzer MEV araçlarıyla yapılır.",
    why: "Bundler kullanmak başlı başına kötü değildir, ama genellikle rug pull hazırlığının işaretidir. Tek seferde yüzlerce sahte cüzdana token dağıtmak için kullanılır.",
    signals: [
      "Bundle sayısı > 3 → Dikkatli ol",
      "Bundle alıcılarının %50+ yaşı < 1 saat → Yeni açılmış sahte cüzdanlar",
    ],
    safe: "Meşru projelerde geniş çaplı bundler kullanımı nadirdir.",
  },
  exit: {
    title: "Kademeli Çıkış (Laddered Exit)",
    what: "Büyük holder cüzdanlarının (özellikle kurucunun) tokenı kademe kademe satmasını tespit eder.",
    why: "Tek seferde büyük satış yerine küçük parçalara bölerek fiyat düşüşünü yavaşlatmak ve panik yaratmamak için kullanılır. Her satışta fiyat biraz düşer ama toparlandıkça bir sonraki satış başlar.",
    signals: [
      "3+ kademeli satış → Klasik laddered exit",
      "Satıcı = Kurucu cüzdanı → Rug pull sinyali",
      "Her satışta %10+ fiyat düşüşü → Büyük miktarlar satılıyor",
    ],
    safe: "Uzun vadeli projeler genellikle büyük vesting/lock-up programlarına sahiptir.",
  },
  curve: {
    title: "Bonding Curve Analizi",
    what: "Pump.fun gibi platformlarda tokenın bonding curve'den Raydium'a geçiş sürecini ve ilk alıcıların bağlantısını analiz eder.",
    why: "Dolandırıcılar token açar açmaz kendi cüzdanlarıyla alım yaparak bonding curve'i hızla tamamlar ve Raydium'a geçer. İlk 30 alıcının aynı kaynaktan geldiği görülürse manipüle edilmiş bir geçiş olabilir.",
    signals: [
      "Bonding curve → Raydium geçişi < 10 dakika → Çok hızlı, şüpheli",
      "İlk 30 alıcının %50+ aynı kaynaktan → İçeriden alım",
    ],
    safe: "Organik tokenlarda bonding curve saatler veya günler içinde tamamlanır.",
  },
};

interface ExplainModalProps {
  metricKey: string;
  score: number;
}

function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function InfoIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeWidth="2" />
    </svg>
  );
}

export default function ExplainModal({ metricKey, score }: ExplainModalProps) {
  const [open, setOpen] = useState(false);
  const info = EXPLANATIONS[metricKey];
  if (!info) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-[10px] font-medium hover:opacity-100 transition-opacity opacity-60"
        style={{ color: "var(--cg-text-muted)" }}
        title="Bu metrik ne anlama geliyor?"
      >
        <InfoIcon />
        Ne anlama geliyor?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg animate-slide-up"
            style={{
              background: "#0D1117",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 28,
              boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--cg-text-dim)" }}>
                  Eğitim
                </div>
                <h2 className="text-base font-black leading-tight" style={{ color: "var(--cg-text)" }}>
                  {info.title}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0 ml-4"
                style={{ background: "rgba(255,255,255,0.06)", color: "var(--cg-text-muted)" }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Score */}
            <div
              className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-xs font-medium" style={{ color: "var(--cg-text-dim)" }}>Bu token için skor:</span>
              <span
                className="text-sm font-black font-mono"
                style={{
                  color: score < 40 ? "#34D399" : score < 60 ? "#FBBF24" : score < 80 ? "#FB923C" : "#F87171"
                }}
              >
                {Math.round(score)}/100
              </span>
            </div>

            {/* What */}
            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--cg-text-dim)" }}>
                Nedir?
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
                {info.what}
              </p>
            </div>

            {/* Why dangerous */}
            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--cg-text-dim)" }}>
                Neden tehlikeli?
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
                {info.why}
              </p>
            </div>

            {/* Signals */}
            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--cg-text-dim)" }}>
                Risk sinyalleri
              </div>
              <div className="space-y-1.5">
                {info.signals.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: "#F87171" }}>⚠</span>
                    <span className="text-xs" style={{ color: "var(--cg-text-muted)" }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safe */}
            <div
              className="p-3 rounded-xl"
              style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}
            >
              <div className="flex items-start gap-2">
                <span className="text-xs flex-shrink-0 mt-0.5">✓</span>
                <p className="text-xs leading-relaxed" style={{ color: "#34D399" }}>
                  {info.safe}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
