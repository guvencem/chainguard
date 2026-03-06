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
        className={`${inter.variable} ${jetbrains.variable} antialiased min-h-screen`}
      >
        {/* Background decorative blobs */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Top-left purple blob */}
          <div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] animate-float"
            style={{
              background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)",
            }}
          />
          {/* Top-right coral blob */}
          <div
            className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full opacity-[0.05]"
            style={{
              background: "radial-gradient(circle, #FF6B6B 0%, transparent 70%)",
              animationDelay: "2s",
            }}
          />
          {/* Bottom teal blob */}
          <div
            className="absolute -bottom-40 left-1/3 w-[700px] h-[500px] rounded-full opacity-[0.04] animate-float"
            style={{
              background: "radial-gradient(circle, #06D6A0 0%, transparent 70%)",
              animationDelay: "4s",
            }}
          />
          {/* Center amber glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.03]"
            style={{
              background: "radial-gradient(ellipse, #FFB703 0%, transparent 70%)",
            }}
          />
        </div>

        {children}
      </body>
    </html>
  );
}
