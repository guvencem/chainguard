import { Metadata } from "next";
import WalletConnect from "@/components/WalletConnect";

export const metadata: Metadata = {
    title: "API Erişimi — Taranoid",
    description: "Taranoid API fiyatlandırması, dokümantasyonu ve API anahtarı alma rehberi.",
};

export default function KeysPage() {
    return (
        <main className="min-h-screen grid-bg p-4 md:p-8 max-w-4xl mx-auto">
            {/* Navbar */}
            <nav className="nav-glass sticky top-0 -mx-4 md:-mx-8 px-4 md:px-8 mb-10 h-16 flex items-center justify-between rounded-none">
                <a
                    href="/"
                    className="text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
                    style={{ color: "var(--cg-text-muted)" }}
                >
                    ← Ana Sayfa
                </a>
                <div className="flex items-center gap-2">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)", color: "white" }}
                    >
                        <span className="font-bold text-[10px]">CG</span>
                    </div>
                    <span className="font-black text-sm" style={{ color: "var(--cg-text)" }}>
                        Taranoid
                    </span>
                </div>
            </nav>

            <div className="space-y-12">
                {/* Hero */}
                <div>
                    <h1
                        className="text-4xl font-bold mb-3"
                        style={{
                            background: "var(--cg-gradient-brand)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        API Erişimi
                    </h1>
                    <p className="text-lg" style={{ color: "var(--cg-text-muted)" }}>
                        Taranoid&apos;ı kendi uygulamalarınıza entegre edin. Solana token risk analizini programatik olarak kullanın.
                    </p>
                </div>

                {/* Wallet Connect — CGT ile Tier Aktif Et */}
                <div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: "var(--cg-text)" }}>
                        CGT ile Tier Aktif Et
                    </h2>
                    <p className="text-sm mb-6" style={{ color: "var(--cg-text-muted)" }}>
                        Cüzdanını bağla, CGT bakiyeni doğrula — tier otomatik aktif edilir.
                        Phantom, Solflare, Backpack ve MetaMask desteklenmektedir.
                    </p>
                    <div className="max-w-sm">
                        <WalletConnect />
                    </div>
                </div>

                {/* Pricing Tiers */}
                <div>
                    <h2 className="text-xl font-bold mb-6" style={{ color: "var(--cg-text)" }}>
                        Planlar
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Free */}
                        <div className="card-flat p-6 flex flex-col">
                            <div className="mb-4">
                                <span
                                    className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                                    style={{ background: "rgba(255,255,255,0.06)", color: "var(--cg-text-muted)" }}
                                >
                                    Free
                                </span>
                            </div>
                            <div className="mb-1">
                                <span className="text-3xl font-black" style={{ color: "var(--cg-text)" }}>Ücretsiz</span>
                            </div>
                            <p className="text-xs mb-6" style={{ color: "var(--cg-text-muted)" }}>her zaman</p>
                            <ul className="space-y-3 flex-1">
                                {[
                                    "5 sorgu/gün",
                                    "Web arayüzü",
                                    "API erişimi yok",
                                ].map((f, i) => (
                                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--cg-text-muted)" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                            stroke={i === 2 ? "#6B7280" : "#22C55E"}
                                            strokeWidth="2.5" strokeLinecap="round">
                                            <path d={i === 2 ? "M18 6L6 18M6 6l12 12" : "M20 6L9 17l-5-5"} />
                                        </svg>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Holder */}
                        <div className="card-flat p-6 flex flex-col"
                            style={{ border: "1px solid rgba(16,185,129,0.3)" }}>
                            <div className="mb-4">
                                <span
                                    className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                                    style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
                                >
                                    Holder
                                </span>
                            </div>
                            <div className="mb-1">
                                <span className="text-3xl font-black" style={{ color: "var(--cg-text)" }}>$5</span>
                                <span className="text-sm ml-1" style={{ color: "var(--cg-text-muted)" }}>CGT tutarak</span>
                            </div>
                            <p className="text-xs mb-6" style={{ color: "var(--cg-text-muted)" }}>cüzdan bağla → otomatik aktif</p>
                            <ul className="space-y-3 flex-1">
                                {[
                                    "10 sorgu/gün",
                                    "Web arayüzü",
                                    "Holder rozeti",
                                ].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--cg-text-muted)" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pro API — highlighted */}
                        <div
                            className="card-flat p-6 flex flex-col relative"
                            style={{ border: "1px solid var(--cg-accent)", boxShadow: "0 0 24px rgba(129,140,248,0.12)" }}
                        >
                            <div
                                className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                                style={{ background: "var(--cg-accent)", color: "#0D1117" }}
                            >
                                Popüler
                            </div>
                            <div className="mb-4">
                                <span
                                    className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                                    style={{ background: "rgba(129,140,248,0.12)", color: "var(--cg-accent)" }}
                                >
                                    Pro
                                </span>
                            </div>
                            <div className="mb-1">
                                <span className="text-3xl font-black" style={{ color: "var(--cg-text)" }}>$29</span>
                                <span className="text-sm ml-1" style={{ color: "var(--cg-text-muted)" }}>CGT/ay</span>
                            </div>
                            <p className="text-xs mb-6" style={{ color: "var(--cg-text-muted)" }}>veya 250 Telegram Stars</p>
                            <ul className="space-y-3 flex-1">
                                {[
                                    "1.000 istek/gün",
                                    "API erişimi",
                                    "9 metrik (tam analiz)",
                                ].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--cg-text-muted)" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cg-accent)" strokeWidth="2.5" strokeLinecap="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Trader */}
                        <div className="card-flat p-6 flex flex-col">
                            <div className="mb-4">
                                <span
                                    className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                                    style={{ background: "rgba(236,72,153,0.12)", color: "#EC4899" }}
                                >
                                    Trader
                                </span>
                            </div>
                            <div className="mb-1">
                                <span className="text-3xl font-black" style={{ color: "var(--cg-text)" }}>$99</span>
                                <span className="text-sm ml-1" style={{ color: "var(--cg-text-muted)" }}>CGT/ay</span>
                            </div>
                            <p className="text-xs mb-6" style={{ color: "var(--cg-text-muted)" }}>veya 1.000 Telegram Stars</p>
                            <ul className="space-y-3 flex-1">
                                {[
                                    "10.000 istek/gün",
                                    "Webhook desteği",
                                    "Öncelikli destek",
                                ].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--cg-text-muted)" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* API Anahtarı Nasıl Alınır */}
                <div className="card-flat p-6">
                    <h2 className="text-xl font-bold mb-6" style={{ color: "var(--cg-text)" }}>
                        API Anahtarı Nasıl Alınır?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                step: "1",
                                title: "Telegram botuna git",
                                desc: "@TaranoidBot",
                                href: "https://t.me/TaranoidBot",
                                color: "#6366F1",
                            },
                            {
                                step: "2",
                                title: "/apikey komutunu yaz",
                                desc: "Bot sana API anahtarını oluşturacak.",
                                href: null,
                                color: "#818CF8",
                            },
                            {
                                step: "3",
                                title: "Anahtarını kopyala",
                                desc: "API isteklerinde X-CG-API-Key başlığında kullan.",
                                href: null,
                                color: "#EC4899",
                            },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black"
                                    style={{ background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}40` }}
                                >
                                    {item.step}
                                </div>
                                <div>
                                    <p className="font-semibold mb-1 text-sm" style={{ color: "var(--cg-text)" }}>
                                        {item.title}
                                    </p>
                                    {item.href ? (
                                        <a
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm hover:opacity-80 transition-opacity"
                                            style={{ color: "var(--cg-accent)" }}
                                        >
                                            {item.desc}
                                        </a>
                                    ) : (
                                        <p className="text-sm" style={{ color: "var(--cg-text-muted)" }}>
                                            {item.desc}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* API Dokümantasyonu */}
                <div>
                    <h2 className="text-xl font-bold mb-6" style={{ color: "var(--cg-text)" }}>
                        API Dokümantasyonu
                    </h2>
                    <div className="card-flat p-6 space-y-5">
                        <div>
                            <p
                                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                                style={{ color: "var(--cg-text-muted)" }}
                            >
                                Base URL
                            </p>
                            <code
                                className="block px-4 py-3 rounded-xl text-sm font-mono"
                                style={{ background: "rgba(0,0,0,0.35)", color: "#34D399", border: "1px solid rgba(255,255,255,0.06)" }}
                            >
                                https://web-production-b704c.up.railway.app
                            </code>
                        </div>

                        <div>
                            <p
                                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                                style={{ color: "var(--cg-text-muted)" }}
                            >
                                Token Analizi — Endpoint
                            </p>
                            <div
                                className="px-4 py-3 rounded-xl font-mono text-sm space-y-1.5"
                                style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)" }}
                            >
                                <div>
                                    <span style={{ color: "#818CF8" }}>GET </span>
                                    <span style={{ color: "var(--cg-text)" }}>/api/v1/token/</span>
                                    <span style={{ color: "#FBBF24" }}>{"{address}"}</span>
                                </div>
                                <div style={{ color: "var(--cg-text-muted)" }}>
                                    Header:{" "}
                                    <span style={{ color: "#34D399" }}>X-CG-API-Key</span>
                                    <span style={{ color: "var(--cg-text-muted)" }}>: </span>
                                    <span style={{ color: "#818CF8" }}>cg_live_...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Örnek İstek */}
                <div>
                    <h2 className="text-xl font-bold mb-6" style={{ color: "var(--cg-text)" }}>
                        Örnek İstek
                    </h2>
                    <div className="card-flat p-6">
                        <p
                            className="text-[10px] font-bold uppercase tracking-widest mb-3"
                            style={{ color: "var(--cg-text-muted)" }}
                        >
                            cURL
                        </p>
                        <pre
                            className="text-xs overflow-x-auto leading-relaxed"
                            style={{
                                background: "rgba(0,0,0,0.35)",
                                color: "#34D399",
                                padding: "1rem",
                                borderRadius: "0.75rem",
                                border: "1px solid rgba(255,255,255,0.06)",
                                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                            }}
                        >{`curl -H "X-CG-API-Key: cg_live_..." \\
  https://web-production-b704c.up.railway.app/api/v1/token/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`}</pre>

                        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p
                                    className="text-[10px] font-bold uppercase tracking-widest mb-3"
                                    style={{ color: "var(--cg-text-muted)" }}
                                >
                                    Python
                                </p>
                                <pre
                                    className="text-xs overflow-x-auto leading-relaxed"
                                    style={{
                                        background: "rgba(0,0,0,0.35)",
                                        color: "#818CF8",
                                        padding: "1rem",
                                        borderRadius: "0.75rem",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                    }}
                                >{`import httpx

headers = {"X-CG-API-Key": "cg_live_..."}
resp = httpx.get(
    "https://web-production-b704c.up.railway.app"
    "/api/v1/token/<adres>",
    headers=headers,
)
data = resp.json()
print(data["score"]["total"])`}</pre>
                            </div>
                            <div>
                                <p
                                    className="text-[10px] font-bold uppercase tracking-widest mb-3"
                                    style={{ color: "var(--cg-text-muted)" }}
                                >
                                    JavaScript / Node.js
                                </p>
                                <pre
                                    className="text-xs overflow-x-auto leading-relaxed"
                                    style={{
                                        background: "rgba(0,0,0,0.35)",
                                        color: "#34D399",
                                        padding: "1rem",
                                        borderRadius: "0.75rem",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                    }}
                                >{`const res = await fetch(
  "https://web-production-b704c.up.railway.app"
  + "/api/v1/token/<adres>",
  { headers: { "X-CG-API-Key": "cg_live_..." } }
);
const { score } = await res.json();
console.log(score.total);`}</pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rate Limit Bilgisi */}
                <div
                    className="p-5 rounded-xl"
                    style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.18)" }}
                >
                    <p className="text-sm" style={{ color: "var(--cg-text-muted)" }}>
                        Günlük limit aşıldığında API{" "}
                        <code
                            className="px-1.5 py-0.5 rounded text-xs"
                            style={{ background: "rgba(0,0,0,0.3)", color: "#F87171" }}
                        >
                            429 Too Many Requests
                        </code>{" "}
                        döner. Limit her gün UTC 00:00&apos;da sıfırlanır.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-10">
                <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
                    © 2026 Taranoid — Solana token risk analizi.
                </p>
            </footer>
        </main>
    );
}
