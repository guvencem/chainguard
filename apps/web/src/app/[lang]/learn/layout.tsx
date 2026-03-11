import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const isTr = resolvedParams.lang === "tr";

  return {
    title: {
      template: isTr ? "%s — Taranoid Eğitim" : "%s — Taranoid Academy",
      default: isTr ? "Eğitim Merkezi — Taranoid" : "Academy — Taranoid",
    },
    description: isTr
      ? "Memecoin dolandırıcılıklarını, rug pull'ları ve wash trading'i Türkçe öğren. Gerçek vakalar, adım adım analizler."
      : "Learn how to spot memecoin scams, rug pulls, and wash trading. Read real-world case studies and step-by-step risk audits.",
    keywords: [
      "memecoin dolandırıcılık",
      "rug pull nedir",
      "wash trading nedir",
      "solana scam nasıl anlaşılır",
      "kripto güvenlik eğitim",
      "taranoid",
      "web3 security",
      "crypto auditing course"
    ],
    openGraph: {
      siteName: "Taranoid",
      locale: isTr ? "tr_TR" : "en_US",
      type: "article",
    },
  };
}

export default async function LearnLayout({ children, params }: { children: React.ReactNode, params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  const isTr = lang === "tr";
  const WEB_URL = "https://taranoid.com";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": isTr ? "Ana Sayfa" : "Home",
        "item": `${WEB_URL}/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": isTr ? "Eğitim Merkezi" : "Academy",
        "item": `${WEB_URL}/${lang}/learn`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
