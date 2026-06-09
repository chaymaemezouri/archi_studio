/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const apiOrigin = apiUrl.replace(/\/api\/?$/, "");

const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  async rewrites() {
    return [
      {
        source: "/api/uploads/files/:path*",
        destination: `${apiOrigin}/api/uploads/files/:path*`,
      },
    ];
  },
};

export default nextConfig;
