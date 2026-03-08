import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import { LangToggle } from "@/components/LangToggle";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const WEB_URL = "https://chainguard-beryl.vercel.app";

export const metadata: Metadata = {
  title: "ChainGuard — Solana Token Risk Analizi",
  description:
    "Solana tokenlarını 9 metrikle gerçek zamanlı analiz edin. Wash trading, cüzdan kümeleme, Sybil attack ve manipülasyon tespiti.",
  keywords: [
    // English
    "solana token scanner",
    "rug pull checker",
    "solana token safety",
    "crypto risk analysis",
    "wash trading detection",
    "pump.fun token checker",
    // Turkish
    "solana token risk analizi",
    "memecoin dolandırıcılık",
    "rug pull tespit",
    "wash trading",
    "kripto güvenlik",
    "chainguard",
    "solana scam",
    "cüzdan kümeleme",
    "sybil attack",
    "token analiz",
  ],
  metadataBase: new URL(WEB_URL),
  openGraph: {
    title: "ChainGuard — Solana Token Risk Analizi",
    description:
      "Solana tokenlarını 9 metrikle gerçek zamanlı analiz edin. Manipülasyon tespiti.",
    type: "website",
    locale: "tr_TR",
    url: WEB_URL,
    siteName: "ChainGuard",
    images: [
      {
        url: `${WEB_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: "ChainGuard — Solana Token Risk Analizi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChainGuard — Solana Token Risk Analizi",
    description: "Solana tokenlarını 9 metrikle analiz et. Rug pull'lardan korun.",
    images: [`${WEB_URL}/api/og`],
  },
  alternates: {
    canonical: WEB_URL,
    languages: {
      "tr": WEB_URL,
      "en": WEB_URL,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ChainGuard",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "url": WEB_URL,
    "description": "Solana tokenlarını 9 metrikle gerçek zamanlı analiz eden risk değerlendirme platformu.",
    "inLanguage": ["tr", "en"],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Wash Trading Tespiti",
      "Cüzdan Kümeleme Analizi",
      "Sybil Attack Skoru",
      "Bundler Tespiti",
      "Kademeli Çıkış Analizi",
      "Bonding Curve Analizi",
    ],
  };

  return (
    <html lang="tr">
      <head>
        <link rel="alternate" hrefLang="tr" href={WEB_URL} />
        <link rel="alternate" hrefLang="en" href={WEB_URL} />
        <link rel="alternate" hrefLang="x-default" href={WEB_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrains.variable} antialiased min-h-screen grid-bg`}
      >
        {/* Subtle radial accent glow at top */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 100% 50% at 50% -10%, rgba(99,102,241,0.15) 0%, rgba(236,72,153,0.07) 45%, transparent 70%)",
          }}
        />
        <LangProvider>
          {/* Language toggle — fixed top-right, above all content */}
          <div
            style={{
              position: "fixed",
              top: "14px",
              right: "16px",
              zIndex: 100,
            }}
          >
            <LangToggle />
          </div>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
