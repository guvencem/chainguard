import { Metadata } from "next";
import PricingView from "@/components/PricingView";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "API Erişimi — Taranoid",
    description: "Taranoid API fiyatlandırması, dokümantasyonu ve API anahtarı alma rehberi.",
};

export default function KeysPage() {
    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Taranoid API Access",
        "image": "https://taranoid.app/api/og",
        "description": "Taranoid'i kendi botlarınıza, dApp'lerinize ve sistemlerinize entegre edin. Solana token risk analizini otomatikleştirin.",
        "brand": {
            "@type": "Brand",
            "name": "Taranoid"
        },
        "offers": [
            {
                "@type": "Offer",
                "name": "Trader Plan",
                "url": "https://taranoid.app/tr/keys",
                "priceCurrency": "USD",
                "price": "29",
                "availability": "https://schema.org/InStock"
            },
            {
                "@type": "Offer",
                "name": "Pro Plan",
                "url": "https://taranoid.app/tr/keys",
                "priceCurrency": "USD",
                "price": "99",
                "availability": "https://schema.org/InStock"
            }
        ]
    };

    return (
        <main className="min-h-screen grid-bg relative overflow-x-hidden pt-16">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
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

                    <PricingView />

                    {/* API Key Instructions */}
                    <div className="bento-card p-8 md:p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                        <h2 className="text-2xl font-black mb-8 tracking-tight relative z-10" style={{ color: "var(--cg-text)" }}>
                            API Anahtarı Nasıl Alınır?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                            {[
                                { step: "1", title: "Taranoid Bot'a Git", desc: "@TaranoidBot", href: "https://t.me/TaranoidBot", color: "#6366F1" },
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