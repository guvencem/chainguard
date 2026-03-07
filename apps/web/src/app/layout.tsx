import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "ChainGuard — Solana Token Risk Analizi",
  description:
    "Solana tokenlarını 9 metrikle gerçek zamanlı analiz edin. Wash trading, cüzdan kümeleme, Sybil attack ve manipülasyon tespiti.",
  keywords: [
    "solana",
    "token",
    "risk analizi",
    "kripto",
    "wash trading",
    "rug pull",
    "scam",
    "chainguard",
    "cüzdan kümeleme",
    "sybil",
  ],
  openGraph: {
    title: "ChainGuard — Solana Token Risk Analizi",
    description:
      "Solana tokenlarını 9 metrikle gerçek zamanlı analiz edin. Manipülasyon tespiti.",
    type: "website",
    locale: "tr_TR",
    url: "https://chainguard.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${inter.variable} ${jetbrains.variable} antialiased min-h-screen grid-bg`}
      >
        {/* Subtle radial accent glow at top */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(59, 130, 246, 0.07) 0%, transparent 70%)",
          }}
        />
        {children}
      </body>
    </html>
  );
}
