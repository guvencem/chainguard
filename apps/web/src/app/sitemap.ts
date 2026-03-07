import { MetadataRoute } from "next";

const WEB_URL = "https://chainguard-beryl.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: WEB_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${WEB_URL}/trending`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${WEB_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
