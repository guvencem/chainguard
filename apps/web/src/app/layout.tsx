import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import { LangToggle } from "@/components/LangToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

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

const WEB_URL = "https://taranoid-beryl.vercel.app";

export const metadata: Metadata = {
  title: "Taranoid — Solana Token Risk Analizi",
  description:
    "Solana tokenlarını 9 metrikle gerçek zamanlı analiz edin. Wash trading, cüzdan kümeleme, Sybil attack ve manipülasyon tespiti.",
  keywords: [
    "solana token scanner",
    "rug pull checker",
    "solana token safety",
    "crypto risk analysis",
    "wash trading detection",
    "pump.fun token checker",
    "solana token risk analizi",
    "memecoin dolandırıcılık",
    "rug pull tespit",
    "wash trading",
    "kripto güvenlik",
    "taranoid",
    "solana scam",
    "cüzdan kümeleme",
    "sybil attack",
    "token analiz",
  ],
  metadataBase: new URL(WEB_URL),
  openGraph: {
    title: "Taranoid — Solana Token Risk Analizi",
    description:
      "Solana tokenlarını 9 metrikle gerçek zamanlı analiz edin. Manipülasyon tespiti.",
    type: "website",
    locale: "tr_TR",
    url: WEB_URL,
    siteName: "Taranoid",
    images: [
      {
        url: `${WEB_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: "Taranoid — Solana Token Risk Analizi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taranoid — Solana Token Risk Analizi",
    description: "Solana tokenlarını 9 metrikle analiz et. Rug pull'lardan korun.",
    images: [`${WEB_URL}/api/og`],
  },
  alternates: {
    canonical: WEB_URL,
    languages: { "tr": WEB_URL, "en": WEB_URL },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Taranoid",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "url": WEB_URL,
    "description": "Solana tokenlarını 9 metrikle gerçek zamanlı analiz eden risk değerlendirme platformu.",
    "inLanguage": ["tr", "en"],
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
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
        {/* ── Anti-flash: theme applied before React hydration ── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('cg_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        <link rel="alternate" hrefLang="tr" href={WEB_URL} />
        <link rel="alternate" hrefLang="en" href={WEB_URL} />
        <link rel="alternate" hrefLang="x-default" href={WEB_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable} antialiased min-h-screen grid-bg`}>
        {/* Hero gradient */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{ background: "var(--cg-hero-gradient)" }}
        />
        <ThemeProvider>
          <LangProvider>
            {/* Controls — fixed top-right */}
            <div
              style={{
                position: "fixed",
                top: "14px",
                right: "16px",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ThemeToggle />
              <LangToggle />
            </div>
            {children}
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
