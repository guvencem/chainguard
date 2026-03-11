import { Metadata } from "next";

type Props = {
  params: Promise<{ lang: string; address: string }>;
  children: React.ReactNode;
};

// Next.js dynamic metadata generation
export async function generateMetadata(
  { params }: { params: Promise<{ lang: string; address: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  const address = resolvedParams.address;
  const isTr = lang === "tr";

  // Attempt to fetch basic token data from the backend to populate the title
  let tokenSymbol = "Token";
  let tokenName = "Unknown Token";

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/v1/token/analyze/${address}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.token) {
        tokenSymbol = data.token.symbol || tokenSymbol;
        tokenName = data.token.name || tokenName;
      }
    }
  } catch (error) {
    // Silently fall back to generic title if API is down during SSR
  }

  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
  const title = isTr
    ? `${tokenName} ($${tokenSymbol}) Güvenlik Testi ve Risk Analizi - Taranoid`
    : `${tokenName} ($${tokenSymbol}) Audit, Wash Trading & Risk Score - Taranoid`;

  const description = isTr
    ? `${address} adresli ${tokenName} tokeninin Taranoid yapay zeka analiz raporu. Wash trading, Sybil attack ve rug pull test sonuçlarını inceleyin.`
    : `Taranoid AI analysis report for ${tokenName} (${address}). View wash trading, Sybil attack, and rug pull audit results instantly.`;

  const WEB_URL = "https://taranoid.app";

  return {
    title,
    description,
    alternates: {
      canonical: `${WEB_URL}/${lang}/token/${address}`,
      languages: {
        tr: `${WEB_URL}/tr/token/${address}`,
        en: `${WEB_URL}/en/token/${address}`,
        "x-default": `${WEB_URL}/en/token/${address}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${WEB_URL}/${lang}/token/${address}`,
      siteName: "Taranoid",
      images: [
        {
          url: `${WEB_URL}/api/og?token=${address}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${WEB_URL}/api/og?token=${address}`],
    },
  };
}

export default async function TokenLayout({ children, params }: Props) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  const address = resolvedParams.address;
  const isTr = lang === "tr";

  let tokenSymbol = "Token";
  let tokenName = "Unknown Token";

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/v1/token/analyze/${address}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.token) {
        tokenSymbol = data.token.symbol || tokenSymbol;
        tokenName = data.token.name || tokenName;
      }
    }
  } catch (error) { }

  const WEB_URL = "https://taranoid.app";

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": isTr ? `${tokenName} ($${tokenSymbol}) Risk Analizi Raporu` : `${tokenName} ($${tokenSymbol}) Risk Analysis Report`,
    "description": isTr
      ? `${address} adresli ${tokenName} tokeninin Taranoid yapay zeka analiz raporu. Wash trading, Sybil attack ve rug pull test sonuçları.`
      : `Taranoid AI analysis report for ${tokenName} (${address}). View wash trading, Sybil attack, and rug pull audit results.`,
    "creditText": "Taranoid Risk Monitoring Engine",
    "creator": {
      "@type": "Organization",
      "name": "Taranoid",
      "url": WEB_URL
    },
    "url": `${WEB_URL}/${lang}/token/${address}`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      {children}
    </>
  );
}
