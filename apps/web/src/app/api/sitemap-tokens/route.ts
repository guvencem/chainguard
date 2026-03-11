import { NextResponse } from "next/server";

export async function GET() {
    const WEB_URL = "https://taranoid.app";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    let validTokens: string[] = [];

    try {
        // Attempt to fetch trending tokens from the backend
        const res = await fetch(`${apiUrl}/api/v1/token/trending`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            // Handle potential API response structures
            const items = Array.isArray(data) ? data : data.trending || data.items || [];

            validTokens = items.map((item: any) => item.token_address || item.address).filter(Boolean);
        }
    } catch (error) {
        console.warn("Could not fetch trending tokens for sitemap generation. Generating fallback.");
    }

    // Fallback to Solana Native Token if API is unreachable during build
    if (validTokens.length === 0) {
        validTokens = ["So11111111111111111111111111111111111111112"];
    }

    const urls = validTokens.map((addr) => {
        return `
  <url>
    <loc>${WEB_URL}/token/${addr}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join("");

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new NextResponse(sitemapXml, {
        headers: {
            "Content-Type": "text/xml",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
        },
    });
}
