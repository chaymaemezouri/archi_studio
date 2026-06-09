#!/bin/bash
# Corrige useSearchParams sur le VPS — à lancer depuis /var/www/a2workspace
set -euo pipefail

ROOT="${1:-/var/www/a2workspace}"
APP="$ROOT/frontend/src/app"

patch_page() {
  local dir="$1"
  local client_basename="$2"   # ex: ActivityClient
  local import_name="$3"       # ex: ActivityPage

  local page="$dir/page.tsx"
  local client="$dir/${client_basename}.tsx"

  if [ ! -d "$dir" ]; then
    echo "SKIP (dossier absent): $dir"
    return
  fi

  if [ ! -f "$client" ]; then
    if [ -f "$page" ] && grep -q '"use client"' "$page"; then
      echo "MOVE $page -> $client"
      mv "$page" "$client"
    else
      echo "ERREUR: $client manquant et $page n'est pas un client component"
      return 1
    fi
  fi

  echo "WRITE $page"
  cat > "$page" << EOF
import { Suspense } from "react";
import ${import_name} from "./${client_basename}";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <${import_name} />
    </Suspense>
  );
}
EOF
}

echo "==> Patch pages Suspense"
patch_page "$APP/(dashboard)/activity" "ActivityClient" "ActivityPage"
patch_page "$APP/(dashboard)/clients" "ClientsClient" "ClientsPage"
patch_page "$APP/(dashboard)/documents" "DocumentsClient" "DocumentsPage"
patch_page "$APP/(dashboard)/invoices" "InvoicesClient" "InvoicesPage"
patch_page "$APP/(dashboard)/plans-renders" "PlansRendersClient" "PlansRendersPage"
patch_page "$APP/(dashboard)/projects" "ProjectsClient" "ProjectsPage"
patch_page "$APP/(dashboard)/tasks" "TasksClient" "TasksPage"
patch_page "$APP/(dashboard)/finances/quotes-invoices" "QuotesInvoicesClient" "QuotesInvoicesPage"
# [id] — chemins avec crochets
if [ -f "$APP/(dashboard)/projects/[id]/page.tsx" ] && grep -q '"use client"' "$APP/(dashboard)/projects/[id]/page.tsx"; then
  mv "$APP/(dashboard)/projects/[id]/page.tsx" "$APP/(dashboard)/projects/[id]/ProjectDetailClient.tsx"
fi
if [ -f "$APP/(dashboard)/clients/[id]/page.tsx" ] && grep -q '"use client"' "$APP/(dashboard)/clients/[id]/page.tsx"; then
  mv "$APP/(dashboard)/clients/[id]/page.tsx" "$APP/(dashboard)/clients/[id]/ClientDetailClient.tsx"
fi
patch_page "$APP/(dashboard)/projects/[id]" "ProjectDetailClient" "ProjectDetailPage"
patch_page "$APP/(dashboard)/clients/[id]" "ClientDetailClient" "ClientDetailPage"

echo "==> next.config.mjs"
cat > "$ROOT/frontend/next.config.mjs" << 'EOF'
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

echo "==> Vérification"
head -3 "$APP/(dashboard)/activity/page.tsx"
ls -la "$APP/(dashboard)/activity/"

echo ""
echo "OK — lancez: docker compose build --no-cache frontend && docker compose up -d"
