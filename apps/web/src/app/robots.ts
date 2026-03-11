import { MetadataRoute } from "next";

const WEB_URL = "https://taranoid.com"; // Update this to production domain when ready

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/keys/", "/private/"],
      },
      // Block known bad scraping bots
      {
        userAgent: ["AhrefsBot", "SemrushBot", "DotBot", "MJ12bot", "PetalBot", "Baiduspider", "YandexBot"],
        disallow: "/",
      },
    ],
    sitemap: [
      `${WEB_URL}/sitemap.xml`,
      `${WEB_URL}/api/sitemap-tokens`, // dynamic token sitemaps
    ],
  };
}
