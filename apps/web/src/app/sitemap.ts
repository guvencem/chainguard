import { MetadataRoute } from "next";

const WEB_URL = "https://taranoid.app";

export default function sitemap(): MetadataRoute.Sitemap {
  // Define standard routes
  return [
    {
      url: WEB_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: {
          "en": `${WEB_URL}/en`,
          "tr": `${WEB_URL}/tr`,
        },
      },
    },
    {
      url: `${WEB_URL}/trending`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
      alternates: {
        languages: {
          "en": `${WEB_URL}/en/trending`,
          "tr": `${WEB_URL}/tr/trending`,
        },
      },
    },
    {
      url: `${WEB_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          "en": `${WEB_URL}/en/about`,
          "tr": `${WEB_URL}/tr/about`,
        },
      },
    },
    {
      url: `${WEB_URL}/token-info`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${WEB_URL}/learn`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          "en": `${WEB_URL}/en/learn`,
          "tr": `${WEB_URL}/tr/learn`,
        },
      },
    },
  ];
}
