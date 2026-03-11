"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import WalletConnect from "@/components/WalletConnect";
import { type ChainType } from "@/lib/wallets";

interface VerifiedWallet {
    address: string;
    chain: ChainType;
    tier: string;
    daily_limit: number;
    token_amount: number;
    usd_value: number;
}

export default function PricingView() {
    const [wallet, setWallet] = useState<VerifiedWallet | null>(null);
    const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "loading" | "qr" | "success" | "error">("idle");
    const [checkoutTier, setCheckoutTier] = useState<"pro" | "trader" | null>(null);
    const [payData, setPayData] = useState<any>(null);

    // Polling effect for checking status
    useEffect(() => {
        let interval: any;
        if (checkoutStatus === "qr" && payData?.reference) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch("/api/v1/pay/solana/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            reference: payData.reference,
                            tier: checkoutTier,
                            wallet_address: wallet?.address
                        })
                    });
                    const result = await res.json();
                    if (result.status === "success") {
                        setCheckoutStatus("success");
                        // Refresh wallet tier state if needed
                        setWallet(prev => prev ? { ...prev, tier: result.tier } : null);
                    }
                } catch (e) {
                    console.error("Payment check error:", e);
                }
            }, 3000); // Check every 3 seconds
        }
        return () => clearInterval(interval);
    }, [checkoutStatus, payData, checkoutTier, wallet?.address]);

    const handleBuy = async (tier: "pro" | "trader") => {
        if (!wallet) {
            alert("Lütfen önce cüzdanınızı bağlayın!");
            return;
        }
        setCheckoutTier(tier);
        setCheckoutStatus("loading");
        try {
            const res = await fetch("/api/v1/pay/solana", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tier })
            });
            const data = await res.json();
            if (data.pay_url) {
                setPayData(data);
                setCheckoutStatus("qr");
            } else {
                setCheckoutStatus("error");
            }
        } catch (e) {
            setCheckoutStatus("error");
        }
    };

    return (
        <div className="space-y-12">
            {/* Wallet Connect Section */}
            <div className="bento-card p-8 md:p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-2xl font-black mb-4 tracking-tight" style={{ color: "var(--cg-text)" }}>
                            CGT ile Tier Aktif Et
                        </h2>
                        <p className="text-sm md:text-base font-medium leading-relaxed mb-6" style={{ color: "var(--cg-text-dim)" }}>
                            Cüzdanını bağla, <strong className="text-white">$CGT</strong> bakiyeni doğrula — tier anında aktif edilir.
                            Özel API anahtarı satın almak için de önce cüzdan gereklidir.
                        </p>
                        <div className="p-4 rounded-xl border-l-2 border-emerald-500" style={{ background: "rgba(16,185,129,0.05)" }}>
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Fast-Track Onboarding</span>
                            <p className="text-[10px] uppercase font-black mt-1" style={{ color: "var(--cg-text-muted)" }}>Anlık Snapshot</p>
                        </div>
                    </div>
                    <div className="flex justify-center md:justify-end">
                        <div className="w-full max-w-sm">
                            <WalletConnect onVerified={setWallet} />
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
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-6 opacity-60 relative z-10" style={{ color: "var(--cg-text-dim)" }}>
                            CGT veya Solana
                        </p>
                        <ul className="space-y-4 flex-1 relative z-10 mb-6">
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
                        <button
                            onClick={() => handleBuy("pro")}
                            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                            style={{ background: "var(--cg-accent)", color: "white", boxShadow: "0 0 20px rgba(129,140,248,0.4)" }}
                        >
                            {wallet?.tier === "pro" || wallet?.tier === "trader" ? "Aktif" : "Pro Satın Al (SOL)"}
                        </button>
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
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-6 opacity-60 relative z-10" style={{ color: "var(--cg-text-dim)" }}>
                            CGT veya Solana
                        </p>
                        <ul className="space-y-4 flex-1 relative z-10 mb-6">
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
                        <button
                            onClick={() => handleBuy("trader")}
                            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                            style={{ background: "var(--cg-surface)", border: "1px solid rgba(236,72,153,0.5)", color: "#EC4899" }}
                        >
                            {wallet?.tier === "trader" ? "Aktif" : "Trader Satın Al (SOL)"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Solana Pay Modal Overlay */}
            {checkoutStatus !== "idle" && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
                    <div className="bento-card p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative">
                        <button
                            onClick={() => { setCheckoutStatus("idle"); setPayData(null); }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            ✕
                        </button>

                        {checkoutStatus === "loading" && (
                            <div className="space-y-4 py-8">
                                <div className="w-12 h-12 rounded-full border-4 border-t-indigo-500 border-gray-700 animate-spin mx-auto" />
                                <p className="font-bold text-indigo-400">İşlem oluşturuluyor...</p>
                            </div>
                        )}

                        {checkoutStatus === "error" && (
                            <div className="space-y-4 py-8">
                                <span className="text-5xl">❌</span>
                                <h3 className="text-xl font-bold text-red-400">Hata Oluştu</h3>
                                <p className="text-sm text-gray-400">İşlem başlatılırken bir hata oluştu veya SOL fiyatı alınamadı.</p>
                            </div>
                        )}

                        {checkoutStatus === "qr" && payData && (
                            <div className="space-y-6 w-full">
                                <h3 className="text-2xl font-black tracking-tight" style={{ color: "var(--cg-accent)" }}>Solana ile Öde</h3>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                                    <div className="text-3xl font-black text-white">{payData.sol_amount} <span className="text-indigo-400">SOL</span></div>
                                    <div className="text-sm font-medium text-gray-400">≈ ${payData.usd_price}</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl flex justify-center w-full mx-auto aspect-square">
                                    <Image
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payData.pay_url)}&margin=10`}
                                        alt="Taranoid Risk Monitoring Engine - Pro API Solana Pay Secure Check-out QR"
                                        width={250}
                                        height={250}
                                        className="w-full h-full object-contain mix-blend-multiply"
                                        unoptimized
                                    />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-400 uppercase tracking-wider font-bold text-[10px]">
                                        Phantom veya Solflare ile Okut
                                    </p>
                                    <p className="text-xs text-indigo-300 animate-pulse">
                                        Ödeme bekleniyor... Ekranı kapatmayın.
                                    </p>
                                </div>
                                <a
                                    href={payData.pay_url}
                                    className="w-full block py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-colors"
                                >
                                    Cüzdan ile Onayla
                                </a>
                            </div>
                        )}

                        {checkoutStatus === "success" && (
                            <div className="space-y-4 py-8">
                                <span className="text-6xl drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">🎉</span>
                                <h3 className="text-2xl font-black text-emerald-400">Ödeme Başarılı!</h3>
                                <p className="text-sm text-gray-400">Tebrikler, {wallet?.address.slice(0, 6)}... isimli hesabınıza {checkoutTier?.toUpperCase()} yetkileri tanımlandı.</p>
                                <button
                                    onClick={() => { setCheckoutStatus("idle"); setPayData(null); }}
                                    className="w-full mt-4 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                                >
                                    Kapat
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
