import { Metadata } from "next";
import WalletConnect from "@/components/WalletConnect";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "API Erişimi — Taranoid",
    description: "Taranoid API fiyatlandırması, dokümantasyonu ve API anahtarı alma rehberi.",
};

export default function KeysPage() {
    return (
        <main className="min-h-screen grid-bg relative overflow-x-hidden pt-16">
            <div className="mesh-bg opacity-30 fixed inset-0 pointer-events-none -z-10" />
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-8 relative z-10 w-full mb-12">
                <div className="space-y-12">
                    {/* Hero */}
                    <div className="text-center md:text-left mb-12">
                        <div
                           className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(236,72,153,0.2)] md:mx-0 mx-auto"
                           style={{ background: "rgba(236,72,153,0.1)", color: "#EC4899", border: "1px solid rgba(236,72,153,0.3)" }}
                        >
                           ⚡ Geliştirici Merkezi
                        </div>
                        <h1
                            className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
                            style={{
                                background: "var(--cg-gradient-brand)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                textShadow: "0 0 30px rgba(236,72,153,0.3)"
                            }}
                        >
                            API Erişimi
                        </h1>
                        <p className="text-lg md:text-xl font-medium max-w-2xl" style={{ color: "var(--cg-text-muted)" }}>
                            Taranoid'i kendi botlarınıza, dApp'lerinize ve sistemlerinize entegre edin. Solana token risk analizini otomatikleştirin.
                        </p>
                    </div>

                    {/* Wallet Connect & Tier Activation */}
                    <div className="bento-card p-8 md:p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h2 className="text-2xl font-black mb-4 tracking-tight" style={{ color: "var(--cg-text)" }}>
                                    CGT ile Tier Aktif Et
                                </h2>
                                <p className="text-sm md:text-base font-medium leading-relaxed mb-6" style={{ color: "var(--cg-text-dim)" }}>
                                    Cüzdanını bağla, <strong className="text-white">$CGT</strong> bakiyeni doğrula — tier anında aktif edilir.
                                    Phantom, Solflare, Backpack ve token-gated cüzdanlar desteklenmektedir.
                                </p>
                                <div className="p-4 rounded-xl border-l-2 border-emerald-500" style={{ background: "rgba(16,185,129,0.05)" }}>
                                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Fast-Track Onboarding</span>
                                    <p className="text-[10px] uppercase font-black mt-1" style={{ color: "var(--cg-text-muted)" }}>Anlık Snapshot</p>
                                </div>
                            </div>
                            <div className="flex justify-center md:justify-end">
                                <div className="w-full max-w-sm">
                                    <WalletConnect />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Tiers */}
                    <div>
                        <h2 className="text-2xl font-black mb-8 tracking-tight" style={{ color: "var(--cg-text)", textShadow: "0 0 20px rgba(255,255,255,0.1)" }}>
                            Sistem Planları
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Free */}
                            <div className="bento-card p-8 flex flex-col group hover:scale-[1.02] transition-transform duration-300">
                                <div className="mb-6 flex justify-between items-start">
                                    <span
                                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--cg-text-muted)" }}
                                    >
                                        Giriş
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <span className="text-3xl font-black tracking-tighter" style={{ color: "var(--cg-text)" }}>Ücretsiz</span>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-8 opacity-60" style={{ color: "var(--cg-text-dim)" }}>limitli kullanım</p>
                                <ul className="space-y-4 flex-1">
                                    {[
                                        { t: "5 sorgu / gün", v: true },
                                        { t: "Web Dashboard arayüzü", v: true },
                                        { t: "API erişimi", v: false },
                                    ].map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-semibold" style={{ color: "var(--cg-text-muted)" }}>
                                            <span className="flex-shrink-0" style={{ color: f.v ? "#22C55E" : "#6B7280" }}>
                                               {f.v ? "✓" : "✗"}
                                            </span>
                                            {f.t}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Holder */}
                            <div className="bento-card p-8 flex flex-col relative group hover:scale-[1.02] transition-transform duration-300">
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="mb-6 relative z-10 flex justify-between items-start">
                                    <span
                                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
                                        style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981", boxShadow: "0 0 15px rgba(16,185,129,0.2)" }}
                                    >
                                        Holder
                                    </span>
                                </div>
                                <div className="mb-2 relative z-10">
                                    <span className="text-4xl font-black tracking-tighter" style={{ color: "#10B981", textShadow: "0 0 20px rgba(16,185,129,0.4)" }}>$5</span>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-8 opacity-60 relative z-10" style={{ color: "var(--cg-text-dim)" }}>
                                    cüzdanında CGT tutarak
                                </p>
                                <ul className="space-y-4 flex-1 relative z-10">
                                    {[
                                        { t: "10 sorgu / gün", v: true },
                                        { t: "Web arayüzü", v: true },
                                        { t: "Holder Rozeti", v: true },
                                    ].map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-semibold" style={{ color: "var(--cg-text-muted)" }}>
                                            <span className="flex-shrink-0 text-emerald-400">✓</span> {f.t}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Pro API */}
                            <div className="bento-card p-8 flex flex-col relative group hover:-translate-y-2 transition-transform duration-300" style={{ border: "1px solid rgba(129,140,248,0.5)", boxShadow: "0 0 40px rgba(129,140,248,0.15)" }}>
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-pink-500" />
                                <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
                                <div className="mb-6 relative z-10 flex justify-between items-start">
                                    <span
                                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
                                        style={{ background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)", color: "var(--cg-accent)", boxShadow: "0 0 15px rgba(129,140,248,0.3)" }}
                                    >
                                        Pro API
                                    </span>
                                    <span className="text-[8px] font-black uppercase bg-indigo-500 text-white px-2 py-1 rounded">Popüler</span>
                                </div>
                                <div className="mb-2 relative z-10">
                                    <span className="text-4xl font-black tracking-tighter" style={{ color: "var(--cg-text)" }}>$29</span>
                                    <span className="text-sm font-bold opacity-50 ml-1">/ay</span>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-8 opacity-60 relative z-10" style={{ color: "var(--cg-text-dim)" }}>
                                    CGT veya 250 Telegram Stars
                                </p>
                                <ul className="space-y-4 flex-1 relative z-10">
                                    {[
                                        "1.000 İstek / gün",
                                        "Ful API Erişimi",
                                        "9 Metrikli Derin Analiz",
                                    ].map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-semibold" style={{ color: "var(--cg-text)" }}>
                                            <span className="flex-shrink-0" style={{ color: "var(--cg-accent)", textShadow: "0 0 10px rgba(129,140,248,0.6)" }}>✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Trader */}
                            <div className="bento-card p-8 flex flex-col relative group hover:scale-[1.02] transition-transform duration-300">
                                <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="mb-6 relative z-10 flex justify-between items-start">
                                    <span
                                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
                                        style={{ background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.3)", color: "#EC4899", boxShadow: "0 0 15px rgba(236,72,153,0.2)" }}
                                    >
                                        Trader
                                    </span>
                                </div>
                                <div className="mb-2 relative z-10">
                                    <span className="text-4xl font-black tracking-tighter" style={{ color: "#EC4899", textShadow: "0 0 20px rgba(236,72,153,0.3)" }}>$99</span>
                                    <span className="text-sm font-bold opacity-50 ml-1">/ay</span>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-8 opacity-60 relative z-10" style={{ color: "var(--cg-text-dim)" }}>
                                    CGT veya 1.000 TG Stars
                                </p>
                                <ul className="space-y-4 flex-1 relative z-10">
                                    {[
                                        "10.000 İstek / gün",
                                        "Webhook Bağlantısı",
                                        "Özel Node Önceliği",
                                    ].map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-semibold" style={{ color: "var(--cg-text)" }}>
                                            <span className="flex-shrink-0 text-pink-500" style={{ textShadow: "0 0 10px rgba(236,72,153,0.6)" }}>✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* API Key Instructions */}
                    <div className="bento-card p-8 md:p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                        <h2 className="text-2xl font-black mb-8 tracking-tight relative z-10" style={{ color: "var(--cg-text)" }}>
                            API Anahtarı Nasıl Alınır?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                            {[
                                { step: "1", title: "Taranoid Bot'a Git", desc: "@TaranoidBot", href: "https://t.me/taranoid8_bot", color: "#6366F1" },
                                { step: "2", title: "Kodu Çalıştır", desc: "/apikey yazarak anahtarı türet.", href: null, color: "#818CF8" },
                                { step: "3", title: "Entegre Et", desc: "X-CG-API-Key başlığında gönder.", href: null, color: "#EC4899" },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-black shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                                        style={{ background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}40` }}
                                    >
                                        {item.step}
                                    </div>
                                    <div>
                                        <p className="font-black mb-1.5 text-base tracking-tight" style={{ color: "var(--cg-text)" }}>
                                            {item.title}
                                        </p>
                                        {item.href ? (
                                            <a
                                                href={item.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                                                style={{ color: "var(--cg-accent)" }}
                                            >
                                                {item.desc}
                                            </a>
                                        ) : (
                                            <p className="text-sm font-medium" style={{ color: "var(--cg-text-muted)" }}>
                                                {item.desc}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* API Docs */}
                    <div>
                        <h2 className="text-2xl font-black mb-8 tracking-tight" style={{ color: "var(--cg-text)", textShadow: "0 0 20px rgba(255,255,255,0.1)" }}>
                            API Dokümantasyonu
                        </h2>
                        <div className="bento-card p-6 md:p-8 space-y-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--cg-text-dim)" }}>
                                    Base Endpoint
                                </p>
                                <code className="block px-5 py-4 rounded-xl text-sm md:text-base font-mono font-bold" style={{ background: "rgba(0,0,0,0.4)", color: "#34D399", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)" }}>
                                    https://taranoid.app/api
                                </code>
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--cg-text-dim)" }}>
                                    Token Tarama Motoru
                                </p>
                                <div className="px-5 py-4 rounded-xl font-mono text-sm md:text-base font-bold" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)" }}>
                                    <div className="mb-2">
                                        <span className="text-indigo-400">GET </span>
                                        <span className="text-white">/v1/token/</span>
                                        <span className="text-amber-400">{"{address}"}</span>
                                    </div>
                                    <div className="opacity-80">
                                        Header: <span className="text-emerald-400">X-CG-API-Key</span>: <span className="text-indigo-400 text-xs">cg_live_...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API Examples */}
                    <div className="bento-card p-6 md:p-8">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--cg-text-dim)" }}>
                            cURL Testi
                        </p>
                        <pre
                            className="text-xs md:text-sm overflow-x-auto leading-relaxed"
                            style={{ background: "rgba(0,0,0,0.4)", color: "#34D399", padding: "1.25rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)" }}
                        >{`curl -H "X-CG-API-Key: cg_live_..." \\
https://taranoid.app/api/v1/token/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`}</pre>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--cg-text-dim)" }}>
                                    Python Entegrasyonu
                                </p>
                                <pre
                                    className="text-xs md:text-sm overflow-x-auto leading-relaxed"
                                    style={{ background: "rgba(0,0,0,0.4)", color: "#818CF8", padding: "1.25rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "ui-monospace, Consolas, monospace", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)" }}
                                >{`import httpx

headers = {"X-CG-API-Key": "cg_live_..."}
r = httpx.get(
    "https://taranoid.app/api/v1/token/ADRES",
    headers=headers
)
print(r.json()["score"]["total"])`}</pre>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--cg-text-dim)" }}>
                                    Node.js Fetch
                                </p>
                                <pre
                                    className="text-xs md:text-sm overflow-x-auto leading-relaxed"
                                    style={{ background: "rgba(0,0,0,0.4)", color: "#34D399", padding: "1.25rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "ui-monospace, Consolas, monospace", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)" }}
                                >{`const res = await fetch(
  "https://taranoid.app/api/v1/token/ADRES",
  { headers: { "X-CG-API-Key": "cg_live_..." } }
);
const data = await res.json();
console.log(data.score.total);`}</pre>
                            </div>
                        </div>
                    </div>

                    <div className="bento-card p-6 border-l-4" style={{ borderColor: "#818CF8", background: "rgba(129,140,248,0.05)" }}>
                        <p className="text-sm font-black" style={{ color: "var(--cg-text-dim)" }}>
                            Limit aşıldığında <code className="px-2 py-1 rounded-md text-xs bg-red-500/20 text-red-500 border border-red-500/30">429 Too Many Requests</code> döner. 
                            Ratelimit UTC 00:00'da sıfırlanır.
                        </p>
                    </div>
                </div>

                <footer className="text-center py-12 mt-8 opacity-50">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
                        © 2026 Taranoid Developer Suite
                    </p>
                </footer>
            </div>
        </main>
    );
}