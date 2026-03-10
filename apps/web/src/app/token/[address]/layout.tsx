import type { Metadata } from "next";

const WEB_URL = "https://taranoid-beryl.vercel.app";
const API_URL = "https://web-production-b704c.up.railway.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  const shortAddr = `${address.slice(0, 8)}...${address.slice(-4)}`;
  const pageUrl = `${WEB_URL}/token/${address}`;

  // Token verisini çekmeyi dene — OG image'a score/name/symbol geçmek için
  let ogUrl = `${WEB_URL}/api/og?address=${address}`;
  try {
    const res = await fetch(`${API_URL}/api/v1/token/${address}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      const score = Math.round(data?.score?.total ?? 50);
      const name = encodeURIComponent(data?.token?.name || shortAddr);
      const symbol = encodeURIComponent(data?.token?.symbol || "");
      ogUrl = `${WEB_URL}/api/og?address=${address}&score=${score}&name=${name}&symbol=${symbol}`;
    }
  } catch {
    // fallback: score parametresiz OG
  }

  const title = `${shortAddr} Risk Analizi — Taranoid`;
  const description = `Solana token ${shortAddr} için 9 metrikli risk analizi. Wash trading, cüzdan kümeleme, Sybil attack tespiti.`;

  return {
    title,
    description,
    openGraph: {
      title: `${shortAddr} — Taranoid Risk Analizi`,
      description: "Bu Solana tokenının risk skorunu gör. 9 metrikle analiz edildi.",
      type: "website",
      url: pageUrl,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${shortAddr} — Taranoid Risk Analizi`,
      description: "Bu Solana tokenının risk skorunu gör.",
      images: [ogUrl],
    },
  };
}

export default function TokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
