import type { Metadata } from "next";

const WEB_URL = "https://chainguard-beryl.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;

  const ogUrl = `${WEB_URL}/api/og?address=${address}`;
  const pageUrl = `${WEB_URL}/token/${address}`;
  const shortAddr = `${address.slice(0, 8)}...${address.slice(-4)}`;

  return {
    title: `${shortAddr} Risk Analizi — ChainGuard`,
    description: `Solana token ${shortAddr} için 9 metrikli risk analizi. Wash trading, cüzdan kümeleme, Sybil attack tespiti.`,
    openGraph: {
      title: `${shortAddr} — ChainGuard Risk Analizi`,
      description: "Bu Solana tokenının risk skorunu gör. 9 metrikle analiz edildi.",
      type: "website",
      url: pageUrl,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: `ChainGuard Risk Analizi — ${shortAddr}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${shortAddr} — ChainGuard Risk Analizi`,
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
