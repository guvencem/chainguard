import { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "Hakkında — Taranoid",
    description: "Taranoid nedir, nasıl çalışır? Solana token risk analiz platformu hakkında bilgi.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen grid-bg relative overflow-x-hidden pt-16">
            <div className="mesh-bg opacity-30 fixed inset-0 pointer-events-none -z-10" />
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-8 relative z-10 w-full mb-12">
                <div className="space-y-10">
                    {/* Hero */}
                    <div className="text-center md:text-left mb-12">
                        <div
                           className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)] md:mx-0 mx-auto"
                           style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.3)" }}
                        >
                           ℹ️ Platform Hakkında
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight" style={{ background: "var(--cg-gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: "0 0 30px rgba(99,102,241,0.3)" }}>
                            Taranoid Nedir?
                        </h1>
                        <p className="text-lg md:text-xl leading-relaxed max-w-3xl" style={{ color: "var(--cg-text-muted)" }}>
                            Taranoid, <span className="font-black" style={{ color: "var(--cg-text)" }}>Solana, Base ve BSC</span> zincirlerindeki tokenları gerçek zamanlı olarak analiz eden
                            bir risk değerlendirme platformudur. 9 metrik motoru, <span className="font-black" style={{ color: "var(--cg-text)" }}>AI destekli Türkçe rapor</span> ve{" "}
                            <span className="font-black" style={{ color: "var(--cg-text)" }}>creator profiling</span> ile yatırımcıları{" "}
                            <span className="font-black underline decoration-red-500/30 underline-offset-4" style={{ color: "var(--cg-text)" }}>
                                sahte projeler, rug pull'lar ve manipülatif tokenlardan
                            </span>{" "}
                            koruruz.
                        </p>
                    </div>

                    {/* Nasıl Çalışır */}
                    <div className="bento-card p-8 md:p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                        <h2 className="text-2xl font-black mb-8 tracking-tight" style={{ color: "var(--cg-text)" }}>
                            🔍 Nasıl Çalışır?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                            {[
                                { step: "1", title: "Token Adresi Gir", desc: "Solana token adresini arama kutusuna yapıştır.", icon: "🔎", color: "#6366F1" },
                                { step: "2", title: "Analiz Bekle", desc: "9 metrik ile derin blockchain analizi yapılır — cüzdan kümeleri, wash trading, vb.", icon: "⚡", color: "#818CF8" },
                                { step: "3", title: "Risk Skorunu Gör", desc: "0–100 arası Türkçe risk skoru ve detaylı metriklerle karar ver.", icon: "��️", color: "#EC4899" },
                            ].map((item, idx) => (
                                <div key={item.step} className="text-center relative">
                                    {idx < 2 && <div className="hidden md:block absolute top-[25%] -right-4 w-8 h-px bg-white/10" />}
                                    <div className="text-5xl mb-5 filter drop-shadow-lg">{item.icon}</div>
                                    <div
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-xl font-black mb-4 mx-auto"
                                        style={{ background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}40`, boxShadow: `0 0 15px ${item.color}20` }}
                                    >
                                        {item.step}
                                    </div>
                                    <h3 className="font-black text-lg mb-2" style={{ color: "var(--cg-text)" }}>
                                        {item.title}
                                    </h3>
                                    <p className="text-sm font-medium" style={{ color: "var(--cg-text-dim)" }}>
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Desteklenen Zincirler */}
                    <div className="bento-card p-8 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h2 className="text-xl font-black mb-6 tracking-tight relative z-10" style={{ color: "var(--cg-text)" }}>
                            🔗 Desteklenen Zincirler
                        </h2>
                        <div className="flex flex-wrap gap-4 relative z-10">
                            {[
                                { label: "Solana", color: "#14F195" },
                                { label: "Base", color: "#0052FF" },
                                { label: "BSC", color: "#F3BA2F" },
                                { label: "EVM uyumlu", color: "#818CF8" },
                            ].map((chain) => (
                                <span
                                    key={chain.label}
                                    className="px-5 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-transform hover:scale-105 cursor-default"
                                    style={{ background: `${chain.color}15`, color: chain.color, border: `1px solid ${chain.color}40`, boxShadow: `0 0 20px ${chain.color}10` }}
                                >
                                    {chain.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Metrikler */}
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black mb-8 tracking-tight" style={{ color: "var(--cg-text)", textShadow: "0 0 20px rgba(255,255,255,0.1)" }}>
                            📊 Risk Metrikleri
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                                { title: "VLR Oranı", weight: "%25", desc: "24s hacim/likidite. Wash trading göstergesi.", color: "#E84142" },
                                { title: "Cüzdan Kümeleme", weight: "%20", desc: "Aynı kişiye ait 400 cüzdan = 1 küme.", color: "#F97316" },
                                { title: "Wash Trading", weight: "%15", desc: "A→B→C→A döngüsel hacim tespiti.", color: "#F59E0B" },
                                { title: "Sybil Attack", weight: "%12", desc: "Yeni oluşturulmuş bot holder tespiti.", color: "#EC4899" },
                                { title: "Holder Analizi", weight: "%12", desc: "Top 10 yoğunlaşma ve büyüme hızı.", color: "#818CF8" },
                                { title: "Bundler Tespiti", weight: "%10", desc: "Aynı slot/blok üzerinde ekip alımları.", color: "#38BDF8" },
                                { title: "Kademeli Çıkış", weight: "%8", desc: "Balinaların yavaş satış analizleri.", color: "#A78BFA" },
                                { title: "Bonding Curve", weight: "%5", desc: "Pump.fun to Raydium geçiş hızı/riski.", color: "#34D399" },
                                { title: "RLS Skoru", weight: "%5", desc: "Mcap / likidite. Gerçek çıkabilirlik.", color: "#14F195" },
                            ].map((metric) => (
                                <div key={metric.title} className="bento-card p-6 group hover:scale-[1.02] transition-transform duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-black text-sm tracking-tight" style={{ color: "var(--cg-text)" }}>
                                            {metric.title}
                                        </h3>
                                        <span
                                            className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
                                            style={{ background: `${metric.color}15`, color: metric.color, border: `1px solid ${metric.color}30` }}
                                        >
                                            {metric.weight}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
                                        {metric.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risk Seviyeleri */}
                    <div className="bento-card p-8 relative overflow-hidden">
                        <h2 className="text-2xl font-black mb-6 tracking-tight relative z-10" style={{ color: "var(--cg-text)" }}>
                            🚦 Risk Seviyeleri
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
                            {[
                                { label: "GÜVENLİ", range: "0–19", color: "#22C55E" },
                                { label: "DÜŞÜK RİSK", range: "20–39", color: "#84CC16" },
                                { label: "ORTA RİSK", range: "40–59", color: "#FBBF24" },
                                { label: "YÜKSEK RİSK", range: "60–79", color: "#F97316" },
                                { label: "KRİTİK", range: "80–100", color: "#EF4444" },
                            ].map((level) => (
                                <div
                                    key={level.label}
                                    className="p-4 rounded-xl text-center transition-all hover:scale-105 cursor-default"
                                    style={{ background: `${level.color}10`, border: `1px solid ${level.color}30`, boxShadow: `0 0 20px ${level.color}10` }}
                                >
                                    <div className="text-xs font-black mb-1.5 tracking-tight" style={{ color: level.color, textShadow: `0 0 10px ${level.color}50` }}>
                                        {level.label}
                                    </div>
                                    <div className="text-[10px] font-bold font-mono" style={{ color: "var(--cg-text-dim)" }}>
                                        {level.range}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bento-card p-8 border-l-4" style={{ borderColor: "#FBBF24", background: "rgba(251,191,36,0.05)" }}>
                        <h2 className="text-lg font-black mb-3" style={{ color: "#FBBF24" }}>
                            ⚠️ Yasal Uyarı (Disclaimer)
                        </h2>
                        <div className="space-y-3 text-sm font-medium leading-relaxed" style={{ color: "var(--cg-text-dim)" }}>
                            <p>
                                Taranoid tarafından sunulan analizler ve risk skorları <strong className="text-white">yatırım tavsiyesi değildir</strong>. Platform, blockchain verilerini algoritmik olarak değerlendirir.
                            </p>
                            <p>
                                Kripto para yatırımları süper yüksek risk içerir. Yatırım kararlarınızı vermeden önce kendi araştırmanızı yapmanız (DYOR) şiddetle tavsiye edilir. Taranoid, herhangi bir finansal kayıptan sorumlu tutulamaz.
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="text-center py-12 mt-4 opacity-50">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
                        © 2026 Taranoid — Risk Monitoring Engine
                    </p>
                </footer>
            </div>
        </main>
    );
}