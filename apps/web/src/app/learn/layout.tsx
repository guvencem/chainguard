import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — Taranoid Eğitim",
    default: "Eğitim Merkezi — Taranoid",
  },
  description:
    "Memecoin dolandırıcılıklarını, rug pull'ları ve wash trading'i Türkçe öğren. Gerçek vakalar, adım adım analizler.",
  keywords: [
    "memecoin dolandırıcılık",
    "rug pull nedir",
    "wash trading nedir",
    "solana scam nasıl anlaşılır",
    "kripto güvenlik eğitim",
    "taranoid",
  ],
  openGraph: {
    siteName: "Taranoid",
    locale: "tr_TR",
    type: "article",
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
