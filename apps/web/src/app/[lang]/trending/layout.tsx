import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const isTr = resolvedParams.lang === "tr";
    return {
        title: isTr ? "Trending Analizler & Arama Trendleri | Taranoid" : "Trending Audits & Search Trends | Taranoid",
        description: isTr
            ? "Taranoid'da son 24 saatte en çok analiz edilen Solana tokenları ve yapay zeka tarafından hesaplanan risk skorları."
            : "Most analyzed Solana tokens in the last 24 hours on Taranoid, along with their AI-calculated risk scores.",
    };
}

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
