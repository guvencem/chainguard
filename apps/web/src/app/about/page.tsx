import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Hakkında — ChainGuard",
    description: "ChainGuard nedir, nasıl çalışır? Solana token risk analiz platformu hakkında bilgi.",
};

/**
 * Hakkında Sayfası — ChainGuard nedir, nasıl çalışır
 */

export default function AboutPage() {
    return (
        <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
            {/* ── Navbar ── */}
            <nav className="flex items-center justify-between mb-10">
                <a
                    href="/"
                    className="text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
                    style={{ color: "var(--cg-text-muted)" }}
                >
                    ← Ana Sayfa
                </a>
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{
                            background: "linear-gradient(135deg, var(--cg-accent), var(--cg-green))",
                        }}
                    >
                        <span className="text-white font-bold text-[10px]">CG</span>
                    </div>
                    <span className="font-bold text-sm" style={{ color: "var(--cg-text)" }}>
                        ChainGuard
                    </span>
                </div>
            </nav>

            {/* ── Content ── */}
            <div className="space-y-10">
                {/* Hero */}
                <div>
                    <h1 className="text-4xl font-bold mb-4 gradient-text">
                        ChainGuard Nedir?
                    </h1>
                    <p className="text-lg leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
                        ChainGuard, Solana blockchain üzerindeki tokenları gerçek zamanlı olarak analiz eden
                        bir risk değerlendirme platformudur. Amacımız, kripto yatırımcılarını{" "}
                        <span className="font-semibold" style={{ color: "var(--cg-text)" }}>
                            sahte projeler, rug pull&apos;lar ve manipülatif tokenlardan
                        </span>{" "}
                        korumaktır.
                    </p>
                </div>

                {/* Nasıl Çalışır */}
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--cg-text)" }}>
                        🔍 Nasıl Çalışır?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                step: "1",
                                title: "Token Adresi Gir",
                                desc: "Solana token adresini arama kutusuna yapıştır.",
                                icon: "🔎",
                            },
                            {
                                step: "2",
                                title: "Analiz Bekle",
                                desc: "Sistem blockchain verilerini toplar ve 3 saniye içinde analiz eder.",
                                icon: "⚡",
                            },
                            {
                                step: "3",
                                title: "Risk Skorunu Gör",
                                desc: "0–100 arası Türkçe risk skoru ve detaylı metriklerle karar ver.",
                                icon: "🛡️",
                            },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="text-4xl mb-3">{item.icon}</div>
                                <div
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mb-2"
                                    style={{
                                        background: "var(--cg-accent)" + "20",
                                        color: "var(--cg-accent)",
                                    }}
                                >
                                    {item.step}
                                </div>
                                <h3 className="font-semibold mb-1" style={{ color: "var(--cg-text)" }}>
                                    {item.title}
                                </h3>
                                <p className="text-sm" style={{ color: "var(--cg-text-dim)" }}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metrikler */}
                <div>
                    <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--cg-text)" }}>
                        📊 Risk Metrikleri
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                title: "VLR — Hacim/Likidite Oranı",
                                weight: "50%",
                                desc: "24 saatlik işlem hacmini likidite havuzuyla karşılaştırır. Yüksek oran (>50x) wash trading göstergesidir.",
                                color: "#E84142",
                            },
                            {
                                title: "Holder Analizi",
                                weight: "30%",
                                desc: "Holder sayısı, aktif oran, top 10 yoğunlaşma ve büyüme hızını inceler. Az holder veya yüksek yoğunlaşma tehlike işaretidir.",
                                color: "#F59E0B",
                            },
                            {
                                title: "RLS — Gerçek Likidite Skoru",
                                weight: "20%",
                                desc: "Market cap ile gerçek likidite arasındaki farkı ölçer. AMM price impact hesaplaması ile gerçekte ne kadar çıkabileceğinizi gösterir.",
                                color: "#14F195",
                            },
                        ].map((metric) => (
                            <div key={metric.title} className="glass-card p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold" style={{ color: "var(--cg-text)" }}>
                                        {metric.title}
                                    </h3>
                                    <span
                                        className="text-xs font-bold px-2 py-1 rounded-full"
                                        style={{ background: `${metric.color}20`, color: metric.color }}
                                    >
                                        Ağırlık: {metric.weight}
                                    </span>
                                </div>
                                <p className="text-sm" style={{ color: "var(--cg-text-muted)" }}>
                                    {metric.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Risk Seviyeleri */}
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--cg-text)" }}>
                        🚦 Risk Seviyeleri
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                            { label: "GÜVENLİ", range: "0–19", color: "#22C55E" },
                            { label: "DÜŞÜK RİSK", range: "20–39", color: "#84CC16" },
                            { label: "ORTA RİSK", range: "40–59", color: "#F59E0B" },
                            { label: "YÜKSEK RİSK", range: "60–79", color: "#F97316" },
                            { label: "KRİTİK", range: "80–100", color: "#EF4444" },
                        ].map((level) => (
                            <div
                                key={level.label}
                                className="p-3 rounded-xl text-center"
                                style={{ background: `${level.color}15`, border: `1px solid ${level.color}30` }}
                            >
                                <div className="text-xs font-bold mb-1" style={{ color: level.color }}>
                                    {level.label}
                                </div>
                                <div className="text-[10px]" style={{ color: "var(--cg-text-dim)" }}>
                                    {level.range}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div
                    className="p-5 rounded-xl"
                    style={{
                        background: "var(--cg-yellow)" + "10",
                        border: "1px solid " + "var(--cg-yellow)" + "30",
                    }}
                >
                    <h2 className="text-lg font-bold mb-2" style={{ color: "var(--cg-yellow)" }}>
                        ⚠️ Yasal Uyarı (Disclaimer)
                    </h2>
                    <div className="space-y-2 text-sm" style={{ color: "var(--cg-text-muted)" }}>
                        <p>
                            ChainGuard tarafından sunulan analizler ve risk skorları <strong>yatırım tavsiyesi değildir</strong>.
                            Platform, blockchain verilerini algoritmik olarak değerlendirir; bu değerlendirmeler hatalı olabilir.
                        </p>
                        <p>
                            Kripto para yatırımları yüksek risk içerir. Yatırım kararlarınızı vermeden önce kendi araştırmanızı
                            yapmanız (DYOR — Do Your Own Research) önerilir.
                        </p>
                        <p>
                            ChainGuard, herhangi bir finansal kayıptan sorumlu tutulamaz. Platform &quot;olduğu gibi&quot; (as-is)
                            sunulmaktadır.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <footer className="text-center py-10">
                <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
                    © 2026 ChainGuard — Solana token risk analizi.
                </p>
            </footer>
        </main>
    );
}
