import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { LangProvider } from "@/components/LangProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial", "sans-serif"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
});

const WEB_URL = "https://taranoid.app";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  const isTr = lang === "tr";

  return {
    title: isTr ? "Taranoid — Solana Token Risk Analizi" : "Taranoid — Solana Token Analyzer & Rug Pull Checker",
    description: isTr
      ? "Solana tokenlarını 9 metrikle gerçek zamanlı analiz edin. Wash trading, cüzdan kümeleme, Sybil attack ve manipülasyon tespiti."
      : "Audit and analyze Solana tokens instantly with 9 metrics. Detect wash trading, wallet clustering, Sybil attacks, and rug pulls.",
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
      title: isTr ? "Taranoid — Solana Token Risk Analizi" : "Taranoid — Solana Token Analyzer",
      description: isTr
        ? "Solana tokenlarını 9 metrikle gerçek zamanlı analiz edin. Manipülasyon tespiti."
        : "Real-time Solana token analysis with 9 metrics. Detect manipulation.",
      type: "website",
      locale: isTr ? "tr_TR" : "en_US",
      url: `${WEB_URL}/${lang}`,
      siteName: "Taranoid",
      images: [
        {
          url: `${WEB_URL}/api/og`,
          width: 1200,
          height: 630,
          alt: isTr ? "Taranoid — Solana Token Risk Analizi" : "Taranoid — Solana Token Analyzer",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isTr ? "Taranoid — Solana Token Risk Analizi" : "Taranoid — Solana Token Analyzer",
      description: isTr ? "Solana tokenlarını 9 metrikle analiz et. Rug pull'lardan korun." : "Analyze Solana tokens with 9 metrics. Protect against rug pulls.",
      images: [`${WEB_URL}/api/og`],
    },
    alternates: {
      canonical: `${WEB_URL}/${lang}`,
      languages: {
        tr: `${WEB_URL}/tr`,
        en: `${WEB_URL}/en`,
        "x-default": `${WEB_URL}/en`,
      },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || "en";
  const isTr = lang === "tr";

  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${WEB_URL}/#organization`,
        "name": "Taranoid",
        "url": WEB_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${WEB_URL}/api/og`, // Fallback logo using og image
          "width": 1200,
          "height": 630
        },
        "description": isTr
          ? "Taranoid, Solana ağındaki tokenlar için yapay zeka destekli risk analizi, wash trading tespiti ve güvenlik denetimi sağlayan lider platformdur."
          : "Taranoid is a leading AI-powered risk assessment, wash trading detection, and security audit platform for tokens on the Solana network.",
        "sameAs": [
          "https://t.me/taranoid_bot"
        ]
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${WEB_URL}/${lang}/#webapp`,
        "name": "Taranoid Risk Scanner",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web",
        "url": `${WEB_URL}/${lang}`,
        "description": isTr
          ? "Solana tokenlarını 9 metrikle gerçek zamanlı analiz eden yapay zeka destekli risk değerlendirme platformu."
          : "AI-powered risk assessment platform analyzing Solana tokens in real-time with 9 metrics.",
        "inLanguage": ["tr", "en"],
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "featureList": isTr
          ? ["Wash Trading Tespiti", "Cüzdan Kümeleme Analizi", "Sybil Attack Skoru", "Bundler Tespiti", "Kademeli Çıkış Analizi", "Rug Pull Checker"]
          : ["Wash Trading Detection", "Wallet Clustering Analysis", "Sybil Attack Score", "Bundler Detection", "Gradual Exit Analysis", "Rug Pull Checker"],
        "publisher": { "@id": `${WEB_URL}/#organization` }
      },
      {
        "@type": "WebSite",
        "@id": `${WEB_URL}/#website`,
        "url": WEB_URL,
        "name": "Taranoid",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${WEB_URL}/${lang}/token/{search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* ── Anti-flash: theme applied before React hydration ── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('cg_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable} antialiased min-h-screen grid-bg`} suppressHydrationWarning>
        {/* Hero gradient */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{ background: "var(--cg-hero-gradient)" }}
        />
        <ThemeProvider>
          <LangProvider initialLang={lang as any}>
            {children}
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
