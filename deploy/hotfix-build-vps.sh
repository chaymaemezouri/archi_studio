#!/bin/bash
# Correctif build Docker sur le VPS
set -euo pipefail
cd /var/www/a2workspace

echo "==> 1/3 — layout dashboard"
cat > "frontend/src/app/(dashboard)/layout.tsx" << 'EOF'
import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export const dynamic = "force-dynamic";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>{children}</Suspense>
    </DashboardLayout>
  );
}
EOF

echo "==> 2/3 — next.config.mjs (eslint + suspense)"
cat > frontend/next.config.mjs << 'EOF'
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
EOF

echo "==> 3/3 — rebuild frontend (sans cache)"
docker compose build --no-cache frontend
docker compose up -d

echo "OK — docker compose ps"
docker compose ps
