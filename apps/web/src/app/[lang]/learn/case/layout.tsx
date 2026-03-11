import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vaka Çalışmaları — Taranoid Eğitim",
  description: "Gerçek rug pull ve manipülasyon vakalarının blockchain analizi. PIPPINU gibi tokenların nasıl tespite edildiğini öğren.",
  keywords: ["rug pull analizi", "memecoin vaka", "blockchain dolandırıcılık", "kripto güvenlik", "PIPPINU"],
};

export default function CaseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
