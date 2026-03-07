import { MetadataRoute } from "next";

const WEB_URL = "https://chainguard-beryl.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${WEB_URL}/sitemap.xml`,
  };
}
