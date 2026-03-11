import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: '/chainguard/:path*',
        destination: '/:path*',
        permanent: true, // 301 Redirect for old links
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
    ],
  },
};

export default nextConfig;
