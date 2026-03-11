import { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "$CGT — Taranoid Token",
    description: "The utility token powering the Taranoid ecosystem. Hold $CGT to unlock premium access, API keys, and governance rights.",
};

const WHY_HOLD = [
    { icon: "🔓", title: "Platform Access", desc: "5 free analyses/day. Hold $5 worth of $CGT for +5 more daily. The more you hold, the more you analyze." },
    { icon: "📈", title: "Pro Membership", desc: "Hold and pay $29/month in $CGT for unlimited bot alerts, 100 daily queries, and priority analysis." },
    { icon: "��", title: "API Access", desc: "Developers: get API keys paid in $CGT. Pro API: $29/month (1,000 req/day). Trader: $99/month (10,000 req/day)." },
    { icon: "🚀", title: "Growing Demand", desc: "Every new Taranoid user needs $CGT. As the platform grows, token demand increases organically." },
    { icon: "🎯", title: "Early Holder Bonus", desc: "First 1,000 holders get permanent +20% query bonus and an exclusive early-adopter badge." },
    { icon: "🗳️", title: "Governance", desc: "Vote on new chain integrations, feature prioritization, and the overall platform direction." },
];

const TOKENOMICS = [
    { label: "Total Supply", value: "1,000,000,000 $CGT" },
    { label: "Platform", value: "Pump.fun (fair launch)" },
    { label: "Team Allocation", value: "0% — Fair launch, no team tokens" },
    { label: "Liquidity", value: "100% community" },
    { label: "Tax", value: "0%" },
];

const HOW_IT_WORKS = [
    { step: "1", icon: "🛒", title: "Buy $CGT on Pump.fun", desc: "Visit the $CGT listing on pump.fun and purchase tokens directly with SOL.", color: "#6366F1" },
    { step: "2", icon: "🔗", title: "Connect Your Wallet", desc: "Link your Solana wallet to Taranoid. We verify your balance in real-time.", color: "#818CF8" },
    { step: "3", icon: "✅", title: "Unlock Access", desc: "Your tier activates automatically based on your $CGT holdings. No manual steps.", color: "#EC4899" },
];

export default function TokenInfoPage() {
    return (
        <main className="min-h-screen grid-bg relative overflow-x-hidden pt-16">
            <div className="mesh-bg opacity-30 fixed inset-0 pointer-events-none -z-10" />
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 space-y-16 relative z-10 w-full mb-12">

                {/* ── 1. Hero ── */}
                <section className="text-center space-y-8 pt-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
                        style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399", boxShadow: "0 0 15px rgba(52,211,153,0.2)" }}
                    >
                        <span className="w-2 h-2 rounded-full" style={{ background: "#34D399", boxShadow: "0 0 10px #34D399" }} />
                        Live on Solana
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                        <span style={{ background: "var(--cg-gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: "0 0 40px rgba(99,102,241,0.3)" }}>
                            Taranoid Token
                        </span>
                        <br />
                        <span style={{ color: "var(--cg-text)" }}>($CGT)</span>
                    </h1>

                    <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium" style={{ color: "var(--cg-text-muted)" }}>
                        The utility token powering the Taranoid ecosystem.{" "}
                        <span className="font-bold" style={{ color: "var(--cg-text)", textShadow: "0 0 10px rgba(255,255,255,0.1)" }}>Hold to unlock premium access.</span>
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <a
                            href="#"
                            className="px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105"
                            style={{ background: "var(--cg-gradient-brand)", color: "#fff", boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}
                        >
                            Buy on Pump.fun
                        </a>
                        <a
                            href="#"
                            className="px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all hover:opacity-80"
                            style={{ background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.3)", color: "var(--cg-accent)" }}
                        >
                            View Contract
                        </a>
                    </div>
                </section>

                {/* ── 2. Token Stats Bar ── */}
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Contract", value: "TBA — Coming Soon", valueColor: "var(--cg-text-muted)" },
                            { label: "Network", value: "Solana", valueColor: "#14F195" },
                            { label: "Platform", value: "Pump.fun", valueColor: "var(--cg-accent)" },
                            { label: "Status", value: "🟢 Live", valueColor: "#34D399" },
                        ].map((stat) => (
                            <div key={stat.label} className="bento-card p-5 md:p-6 text-center group hover:scale-[1.02] transition-transform duration-300">
                                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--cg-text-dim)" }}>
                                    {stat.label}
                                </p>
                                <p className="text-sm font-black tracking-tight relative z-10" style={{ color: stat.valueColor, textShadow: stat.valueColor !== "var(--cg-text-muted)" ? `0 0 20px ${stat.valueColor}50` : "none" }}>
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 3. Why Hold $CGT ── */}
                <section className="bento-card p-10 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="text-center mb-10 relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight" style={{ color: "var(--cg-text)" }}>
                            Why Hold{" "}
                            <span style={{ background: "var(--cg-gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: "0 0 20px rgba(99,102,241,0.3)" }}>
                                $CGT?
                            </span>
                        </h2>
                        <p className="text-base font-medium" style={{ color: "var(--cg-text-muted)" }}>
                            Real utility, real demand. Every feature on Taranoid runs on $CGT.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {WHY_HOLD.map((card) => (
                            <div key={card.title} className="p-6 rounded-2xl group/card transition-all hover:bg-white/5 cursor-default relative overflow-hidden" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                                <div className="text-4xl mb-4 relative z-10 filter drop-shadow-md group-hover/card:scale-110 transition-transform">{card.icon}</div>
                                <h3 className="font-black text-lg mb-2 tracking-tight relative z-10" style={{ color: "var(--cg-text)", textShadow: "0 0 10px rgba(255,255,255,0.1)" }}>
                                    {card.title}
                                </h3>
                                <p className="text-sm font-medium leading-relaxed relative z-10" style={{ color: "var(--cg-text-muted)" }}>
                                    {card.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 4. Tokenomics ── */}
                <section>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black tracking-tight" style={{ color: "var(--cg-text)", textShadow: "0 0 20px rgba(255,255,255,0.1)" }}>Tokenomics</h2>
                    </div>
                    <div className="bento-card overflow-hidden text-sm font-medium">
                        {TOKENOMICS.map((row, i) => (
                            <div key={row.label} className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 hover:bg-white/5 transition-colors" style={{ borderBottom: i < TOKENOMICS.length - 1 ? "1px solid var(--cg-border)" : "none" }}>
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest sm:mb-0 mb-1" style={{ color: "var(--cg-text-dim)" }}>
                                    {row.label}
                                </span>
                                <span className="font-black text-center sm:text-right" style={{ color: "var(--cg-text)" }}>
                                    {row.value}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-[10px] font-bold uppercase tracking-widest mt-6 opacity-60" style={{ color: "var(--cg-text-dim)" }}>
                        Fair launch on pump.fun. No presale, no team allocation. Community-owned.
                    </p>
                </section>

                {/* ── 5. How It Works ── */}
                <section>
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black mb-3 tracking-tight" style={{ color: "var(--cg-text)" }}>Getting Started</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {HOW_IT_WORKS.map((item, idx) => (
                            <div key={item.step} className="bento-card p-8 text-center relative group overflow-hidden">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at top, ${item.color}15, transparent 70%)` }} />
                                {/* connector line */}
                                {idx < HOW_IT_WORKS.length - 1 && (
                                    <div className="hidden md:block absolute top-[50%] -right-3 w-6 h-[2px] z-20" style={{ background: "var(--cg-border-strong)" }} />
                                )}
                                <div className="text-5xl mb-6 relative z-10 filter drop-shadow-lg">{item.icon}</div>
                                <div
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-base font-black mb-4 relative z-10"
                                    style={{ background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}40`, boxShadow: `0 0 20px ${item.color}20` }}
                                >
                                    {item.step}
                                </div>
                                <h3 className="font-black text-lg mb-2 tracking-tight relative z-10" style={{ color: "var(--cg-text)" }}>
                                    {item.title}
                                </h3>
                                <p className="text-sm font-medium leading-relaxed relative z-10" style={{ color: "var(--cg-text-muted)" }}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 6. CTA ── */}
                <section>
                    <div className="bento-card p-10 md:p-14 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight relative z-10" style={{ color: "var(--cg-text)", textShadow: "0 0 30px rgba(255,255,255,0.15)" }}>
                            Start Protecting Your Investments
                        </h2>
                        <p className="text-lg mb-10 max-w-xl mx-auto font-medium relative z-10" style={{ color: "var(--cg-text-muted)" }}>
                            Run a free token analysis right now — no wallet required.
                        </p>
                        <a
                            href="/"
                            className="inline-block relative z-10 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:scale-105"
                            style={{ background: "var(--cg-gradient-brand)", color: "#fff", boxShadow: "0 4px 40px rgba(99,102,241,0.5)" }}
                        >
                            Analyze a Token Free →
                        </a>
                    </div>
                </section>
            </div>

            <footer className="text-center py-12 mt-8 opacity-50 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
                    © 2026 Taranoid — $CGT is a utility token, not a financial instrument. DYOR.
                </p>
            </footer>
        </main>
    );
}