"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function ShieldAlertIcon({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M12 3L4 6.5v5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5v-5L12 3z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

export default function NotFound() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="mesh-bg opacity-30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <div className="bento-card max-w-lg w-full p-8 md:p-12 flex flex-col items-center text-center animate-slide-up relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                    <ShieldAlertIcon size={28} />
                </div>

                <h1 className="text-4xl font-black mb-3 tracking-tight" style={{ color: "var(--cg-text)", textShadow: "0 0 20px rgba(255,255,255,0.1)" }}>
                    404 - Sayfa Bulunamadı
                </h1>
                <p className="text-sm font-medium mb-8 leading-relaxed max-w-sm" style={{ color: "var(--cg-text-dim)" }}>
                    Aradığınız sayfa taşınmış veya silinmiş olabilir. Aramaya ana sayfadan devam edebilirsiniz.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg"
                        style={{ background: "var(--cg-surface)", color: "var(--cg-text)", border: "1px solid var(--cg-border-strong)" }}
                    >
                        Geri Dön
                    </button>
                    <button
                        onClick={() => router.push("/")}
                        className="cta-button px-6 py-3 text-sm font-bold w-full sm:w-auto"
                    >
                        Ana Sayfaya Git
                    </button>
                </div>
            </div>
        </main>
    );
}
