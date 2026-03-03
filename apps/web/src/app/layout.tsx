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
    "Solana tokenlarını gerçek zamanlı analiz edin. Wash trading, düşük likidite ve manipülasyon tespiti. Türkçe risk skoru ile kripto yatırımlarınızı koruyun.",
  keywords: [
    "solana",
    "token",
    "risk analizi",
    "kripto",
    "wash trading",
    "rug pull",
    "scam",
    "chainguard",
  ],
  openGraph: {
    title: "ChainGuard — Solana Token Risk Analizi",
    description:
      "Solana tokenlarını gerçek zamanlı analiz edin. Manipülasyon tespiti.",
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
    <html lang="tr" className="dark">
      <body
        className={`${inter.variable} ${jetbrains.variable} antialiased min-h-screen`}
      >
        {/* Background gradient overlay */}
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-[0.04]"
            style={{
              background:
                "radial-gradient(circle, var(--cg-accent) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full opacity-[0.03]"
            style={{
              background:
                "radial-gradient(circle, var(--cg-green) 0%, transparent 70%)",
            }}
          />
        </div>

        {children}
      </body>
    </html>
  );
}
