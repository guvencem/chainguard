import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TokenAnalysis, api } from "@/lib/api";

export const revalidate = 86400; // ISR: Yeniden oluşturma süresi 24 saat (86400 saniye)

export async function generateStaticParams() {
    // Build anında en trend olan tokenları statik HTML olarak derle
    try {
        const trending = await api.getTrending();
        const topTokens = trending.tokens.slice(0, 20); // İlk 20 token

        const params: { lang: string; address: string }[] = [];
        for (const t of topTokens) {
            params.push({ lang: "tr", address: t.token.address });
            params.push({ lang: "en", address: t.token.address });
        }
        return params;
    } catch {
        return [];
    }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://web-production-b704c.up.railway.app";
const WEB_URL = "https://taranoid.com";

async function getAnalysis(address: string): Promise<TokenAnalysis | null> {
    try {
        const res = await fetch(`${API_URL}/api/v1/token/${address}`, {
            next: { revalidate: 3600 * 24 }, // Cache for 24h for the article
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; address: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const analysis = await getAnalysis(resolvedParams.address);
    if (!analysis) return { title: "Token Not Found | Taranoid Report" };

    const { token, score } = analysis;
    const isTr = resolvedParams.lang === "tr";

    const title = isTr
        ? `${token.name || token.symbol} ($${token.symbol}) Detaylı Güvenlik ve Risk Analiz Raporu | Taranoid`
        : `${token.name || token.symbol} ($${token.symbol}) Security Audit & Risk Report | Taranoid`;

    const desc = isTr
        ? `${token.symbol} token incelendi. Risk Skoru: ${Math.round(score.total)}/100. Wash trading, cüzdan kümeleme ve rug pull potansiyeli raporunu okuyun.`
        : `${token.symbol} token audited. Risk Score: ${Math.round(score.total)}/100. Read the full report on wash trading, wallet clustering, and rug pull potential.`;

    return {
        title,
        description: desc,
        alternates: {
            canonical: `${WEB_URL}/${resolvedParams.lang}/token/${resolvedParams.address}/report`,
        },
        openGraph: {
            type: "article",
            title,
            description: desc,
        }
    };
}

export default async function ReportPage({ params }: { params: Promise<{ lang: string; address: string }> }) {
    const resolvedParams = await params;
    const analysis = await getAnalysis(resolvedParams.address);
    if (!analysis) return notFound();

    const { token, score, metrics, report_tr } = analysis;
    const isTr = resolvedParams.lang === "tr";
    // eslint-disable-next-line react-hooks/purity
    const dateStr = new Date(analysis.analyzed_at || Date.now()).toLocaleDateString(isTr ? "tr-TR" : "en-US", { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <article className="max-w-4xl mx-auto py-12 px-6 lg:px-8 min-h-screen text-gray-200" style={{ background: "var(--cg-bg)" }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": isTr ? `${token.symbol} Detaylı Güvenlik Analizi` : `${token.symbol} Security Audit`,
                        "datePublished": analysis.analyzed_at || new Date().toISOString(),
                        "author": { "@type": "Organization", "name": "Taranoid" },
                        "publisher": { "@type": "Organization", "name": "Taranoid" }
                    })
                }}
            />

            <header className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight" style={{ color: "var(--cg-text)" }}>
                    {token.name || token.symbol} (<span style={{ color: "var(--cg-accent)" }}>${token.symbol}</span>) {isTr ? "Güvenlik ve Risk Raporu" : "Security & Risk Report"}
                </h1>
                <p className="text-lg mb-6" style={{ color: "var(--cg-text-dim)" }}>
                    {isTr ? "Tarih:" : "Date:"} <span style={{ color: "var(--cg-text-muted)" }}>{dateStr}</span> &bull; {isTr ? "Ağ:" : "Network:"} Solana
                </p>
                <div className="inline-block px-6 py-4 rounded-xl shadow-lg border border-white/10" style={{ background: `rgba(255,255,255,0.02)` }}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "var(--cg-text-dim)" }}>{isTr ? "Taranoid Güvenlik Skoru" : "Taranoid Security Score"}</p>
                    <div className="text-6xl font-black tabular-nums" style={{ color: score.color }}>
                        {Math.round(score.total)}<span className="text-xl" style={{ color: "var(--cg-text-dim)" }}>/100</span>
                    </div>
                    <p className="mt-2 text-sm max-w-sm whitespace-pre-wrap" style={{ color: "var(--cg-text-muted)" }}>{isTr ? score.label_tr : score.label_en}</p>
                </div>
            </header>

            <div className="space-y-12 leading-relaxed" style={{ color: "var(--cg-text)" }}>
                {/* Kontrat Bilgileri */}
                <section>
                    <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">{isTr ? "Kontrat ve Temel Bilgiler" : "Contract & Basic Info"}</h2>
                    <p style={{ color: "var(--cg-text-muted)" }}>
                        {isTr
                            ? `${token.symbol} tokenı Solana ağında ${token.address} adresiyle işlem görmektedir. Analiz zamanı itibarıyla genel risk profili ${score.level} seviyesindedir.`
                            : `${token.symbol} token is deployed on the Solana network at address ${token.address}. As of the analysis time, the general risk profile is ${score.level}.`
                        }
                    </p>
                </section>

                {/* AI Yorumu */}
                {report_tr && isTr && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">Yapay Zeka Analiz Özeti</h2>
                        <blockquote className="p-4 border-l-4 rounded-r-lg italic whitespace-pre-wrap" style={{ borderColor: "var(--cg-accent)", background: "rgba(99,102,241,0.05)", color: "var(--cg-text-muted)" }}>
                            {report_tr}
                        </blockquote>
                    </section>
                )}

                {/* Detaylı Metrikler */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-2">{isTr ? "Teknik Değerlendirme" : "Technical Assessment"}</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold mb-2">{isTr ? "Cüzdan Kümeleme (Clustering)" : "Wallet Clustering"}</h3>
                            <p style={{ color: "var(--cg-text-muted)" }}>{isTr
                                ? `Taranoid AI, ağdaki işlemleri analiz ederek ${metrics.cluster?.cluster_count || 0} adet yapılandırılmış cüzdan kümesi tespit etmiştir. Bu kümeler toplamda arzın %${Math.round(metrics.cluster?.largest_pct || 0)} kadarını kontrol etmektedir. ${metrics.cluster?.label_tr || ''}`
                                : `Taranoid AI detected ${metrics.cluster?.cluster_count || 0} structured wallet clusters organizing transactions. These clusters control approximately ${Math.round(metrics.cluster?.largest_pct || 0)}% of the supply.`}</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-2">{isTr ? "Hacim Manipülasyonu (Wash Trading)" : "Wash Trading"}</h3>
                            <p style={{ color: "var(--cg-text-muted)" }}>{isTr
                                ? `Suni hacim oluşturma faaliyetleri incelendiğinde ${metrics.wash?.cycles_found || 0} döngü (cycle) saptanmıştır. İşlem hacminin yapaylık oranı %${(metrics.wash?.fake_volume_pct || 0).toFixed(2)} olarak hesaplanmaktadır. ${metrics.wash?.label_tr || ''}`
                                : `Analysis of artificial volume activities found ${metrics.wash?.cycles_found || 0} wash trading cycles. The fake volume percentage is calculated at ${(metrics.wash?.fake_volume_pct || 0).toFixed(2)}%.`}</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-2">{isTr ? "Likidite ve Satış Baskısı" : "Liquidity & Sell Pressure"}</h3>
                            <p style={{ color: "var(--cg-text-muted)" }}>{isTr
                                ? `Gerçek Likidite Skoru (RLS) analiziyle projeden toplu çıkış yapılabilecek reel değer değerlendirilmiştir. ${metrics.rls?.label_tr || ''} Ayrıca kademeli satıcılı çıkış paternleri izlenmiş olup, durum: ${metrics.exit?.label_tr || ''}.`
                                : `Real Liquidity Score (RLS) has assessed the actual exitable value from the project. Gradual exit patterns also indicate: ${metrics.exit?.detected ? "High Risk" : "Normal"}.`}</p>
                        </div>
                    </div>
                </section>

                <section className="mt-16 text-center border-t border-white/10 pt-8">
                    <Link href={`/${resolvedParams.lang}/token/${resolvedParams.address}`} className="inline-block font-bold py-3 px-8 rounded-full transition-colors" style={{ background: "var(--cg-accent)", color: "white", textDecoration: "none" }}>
                        {isTr ? "Canlı Dashboard'u Görüntüle" : "View Live Dashboard"}
                    </Link>
                </section>
            </div>
        </article>
    );
}
