import { Metadata } from "next";

export const metadata: Metadata = {
    title: "$CGT — ChainGuard Token",
    description:
        "The utility token powering the ChainGuard ecosystem. Hold $CGT to unlock premium access, API keys, and governance rights.",
};

const WHY_HOLD = [
    {
        icon: "🔓",
        title: "Platform Access",
        desc: "5 free analyses/day. Hold $5 worth of $CGT for +5 more daily. The more you hold, the more you analyze.",
    },
    {
        icon: "📈",
        title: "Pro Membership",
        desc: "Hold and pay $29/month in $CGT for unlimited bot alerts, 100 daily queries, and priority analysis.",
    },
    {
        icon: "🔌",
        title: "API Access",
        desc: "Developers: get API keys paid in $CGT. Pro API: $29/month (1,000 req/day). Trader: $99/month (10,000 req/day).",
    },
    {
        icon: "🚀",
        title: "Growing Demand",
        desc: "Every new ChainGuard user needs $CGT. As the platform grows, token demand increases organically.",
    },
    {
        icon: "🎯",
        title: "Early Holder Bonus",
        desc: "First 1,000 holders get permanent +20% query bonus and an exclusive early-adopter badge.",
    },
    {
        icon: "🗳️",
        title: "Governance",
        desc: "Vote on new chain integrations, feature prioritization, and the overall platform direction.",
    },
];

const TOKENOMICS = [
    { label: "Total Supply", value: "1,000,000,000 $CGT" },
    { label: "Platform", value: "Pump.fun (fair launch)" },
    { label: "Team Allocation", value: "0% — Fair launch, no team tokens" },
    { label: "Liquidity", value: "100% community" },
    { label: "Tax", value: "0%" },
];

const HOW_IT_WORKS = [
    {
        step: "1",
        icon: "🛒",
        title: "Buy $CGT on Pump.fun",
        desc: "Visit the $CGT listing on pump.fun and purchase tokens directly with SOL.",
        color: "#6366F1",
    },
    {
        step: "2",
        icon: "🔗",
        title: "Connect Your Wallet",
        desc: "Link your Solana wallet to ChainGuard. We verify your balance in real-time.",
        color: "#818CF8",
    },
    {
        step: "3",
        icon: "✅",
        title: "Unlock Access",
        desc: "Your tier activates automatically based on your $CGT holdings. No manual steps.",
        color: "#EC4899",
    },
];

export default function TokenInfoPage() {
    return (
        <main className="min-h-screen grid-bg" style={{ background: "var(--cg-bg)" }}>
            {/* ── Navbar ── */}
            <nav className="nav-glass sticky top-0 px-4 md:px-8 h-16 flex items-center justify-between">
                <a
                    href="/"
                    className="text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
                    style={{ color: "var(--cg-text-muted)" }}
                >
                    ← Back to App
                </a>
                <div className="flex items-center gap-2">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)", color: "white" }}
                    >
                        <span className="font-bold text-[10px]">CG</span>
                    </div>
                    <span className="font-black text-sm" style={{ color: "var(--cg-text)" }}>
                        ChainGuard
                    </span>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 space-y-20">

                {/* ── 1. Hero ── */}
                <section className="text-center space-y-6 pt-4">
                    {/* Live badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{
                            background: "rgba(52,211,153,0.1)",
                            border: "1px solid rgba(52,211,153,0.3)",
                            color: "#34D399",
                        }}
                    >
                        <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 8px #34D399" }} />
                        Live on Solana
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
                        <span
                            style={{
                                background: "var(--cg-gradient-brand)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            ChainGuard Token
                        </span>
                        <br />
                        <span style={{ color: "var(--cg-text)" }}>($CGT)</span>
                    </h1>

                    <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
                        The utility token powering the ChainGuard ecosystem.{" "}
                        <span style={{ color: "var(--cg-text)" }}>Hold to unlock premium access.</span>
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <a
                            href="#"
                            className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:scale-105"
                            style={{
                                background: "var(--cg-gradient-brand)",
                                color: "#fff",
                                boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
                            }}
                        >
                            Buy on Pump.fun
                        </a>
                        <a
                            href="#"
                            className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-80"
                            style={{
                                background: "rgba(129,140,248,0.1)",
                                border: "1px solid rgba(129,140,248,0.3)",
                                color: "var(--cg-accent)",
                            }}
                        >
                            View Contract
                        </a>
                    </div>
                </section>

                {/* ── 2. Token Stats Bar ── */}
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: "Contract", value: "TBA — Coming Soon", valueColor: "var(--cg-text-muted)" },
                            { label: "Network", value: "Solana", valueColor: "#14F195" },
                            { label: "Platform", value: "Pump.fun", valueColor: "var(--cg-accent)" },
                            { label: "Status", value: "🟢 Live", valueColor: "#34D399" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="card-flat p-4 md:p-5 text-center"
                            >
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--cg-text-dim)" }}>
                                    {stat.label}
                                </p>
                                <p className="text-sm font-semibold" style={{ color: stat.valueColor }}>
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 3. Why Hold $CGT ── */}
                <section>
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: "var(--cg-text)" }}>
                            Why Hold{" "}
                            <span
                                style={{
                                    background: "var(--cg-gradient-brand)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                $CGT?
                            </span>
                        </h2>
                        <p className="text-base" style={{ color: "var(--cg-text-muted)" }}>
                            Real utility, real demand. Every feature on ChainGuard runs on $CGT.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {WHY_HOLD.map((card) => (
                            <div
                                key={card.title}
                                className="p-6 rounded-2xl transition-all duration-200"
                                style={{
                                    background: "var(--cg-surface)",
                                    border: "1px solid var(--cg-border-strong)",
                                    boxShadow: "var(--cg-shadow-sm)",
                                    // hover handled via inline style — static SSR only, so we use a wrapper trick below
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--cg-border-accent)";
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 24px rgba(129,140,248,0.12)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--cg-border-strong)";
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--cg-shadow-sm)";
                                }}
                            >
                                <div className="text-3xl mb-3">{card.icon}</div>
                                <h3 className="font-bold text-base mb-2" style={{ color: "var(--cg-text)" }}>
                                    {card.title}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
                                    {card.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 4. Tokenomics ── */}
                <section>
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: "var(--cg-text)" }}>
                            Tokenomics
                        </h2>
                    </div>

                    <div className="card-flat overflow-hidden">
                        {TOKENOMICS.map((row, i) => (
                            <div
                                key={row.label}
                                className="flex items-center justify-between px-6 py-4"
                                style={{
                                    borderBottom: i < TOKENOMICS.length - 1 ? "1px solid var(--cg-border)" : "none",
                                }}
                            >
                                <span className="text-sm font-medium" style={{ color: "var(--cg-text-muted)" }}>
                                    {row.label}
                                </span>
                                <span className="text-sm font-bold text-right" style={{ color: "var(--cg-text)" }}>
                                    {row.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-sm mt-5" style={{ color: "var(--cg-text-dim)" }}>
                        Fair launch on pump.fun. No presale, no team allocation. Community-owned.
                    </p>
                </section>

                {/* ── 5. How It Works ── */}
                <section>
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: "var(--cg-text)" }}>
                            How It Works
                        </h2>
                        <p className="text-base" style={{ color: "var(--cg-text-muted)" }}>
                            From purchase to unlocked access in three steps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {HOW_IT_WORKS.map((item, idx) => (
                            <div key={item.step} className="card-flat p-6 text-center relative">
                                {/* connector line (hidden on last) */}
                                {idx < HOW_IT_WORKS.length - 1 && (
                                    <div
                                        className="hidden md:block absolute top-1/2 -right-3 w-6 h-px z-10"
                                        style={{ background: "var(--cg-border-strong)" }}
                                    />
                                )}
                                <div className="text-4xl mb-4">{item.icon}</div>
                                <div
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-black mb-3"
                                    style={{
                                        background: `${item.color}20`,
                                        color: item.color,
                                        border: `1px solid ${item.color}40`,
                                    }}
                                >
                                    {item.step}
                                </div>
                                <h3 className="font-bold text-base mb-2" style={{ color: "var(--cg-text)" }}>
                                    {item.title}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: "var(--cg-text-muted)" }}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 6. CTA ── */}
                <section>
                    <div
                        className="rounded-2xl p-8 md:p-12 text-center"
                        style={{
                            background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(236,72,153,0.08) 100%)",
                            border: "1px solid rgba(99,102,241,0.2)",
                        }}
                    >
                        <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "var(--cg-text)" }}>
                            Start Protecting Your Investments
                        </h2>
                        <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: "var(--cg-text-muted)" }}>
                            Run a free token analysis right now — no wallet required.
                        </p>
                        <a
                            href="/"
                            className="inline-block px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 hover:scale-105"
                            style={{
                                background: "var(--cg-gradient-brand)",
                                color: "#fff",
                                boxShadow: "0 4px 32px rgba(99,102,241,0.4)",
                            }}
                        >
                            Analyze a Token Free →
                        </a>
                    </div>
                </section>
            </div>

            {/* ── Footer ── */}
            <footer className="text-center py-10">
                <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
                    © 2026 ChainGuard — $CGT is a utility token, not a financial instrument. DYOR.
                </p>
            </footer>
        </main>
    );
}
