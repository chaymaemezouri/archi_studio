#!/usr/bin/env bash
# Déploiement production — exécuté sur le VPS (manuellement ou via GitHub Actions).
# Prérequis : .env à la racine du repo, Docker, git remote origin → main.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BRANCH="${DEPLOY_BRANCH:-main}"

echo "==> Deploy Architecture Studio"
echo "    path:   $ROOT"
echo "    branch: $BRANCH"
echo "    date:   $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

if [[ ! -f .env ]]; then
  echo "ERROR: fichier .env manquant dans $ROOT" >&2
  exit 1
fi

echo "==> git fetch + reset"
git fetch origin "$BRANCH"
git checkout "$BRANCH" 2>/dev/null || git checkout -B "$BRANCH" "origin/$BRANCH"
git reset --hard "origin/$BRANCH"

echo "==> docker compose build"
# Frontend : --no-cache car NEXT_PUBLIC_API_URL est figée au build
docker compose build --no-cache frontend
docker compose build backend

echo "==> docker compose up"
docker compose up -d --remove-orphans

echo "==> prisma migrate deploy"
docker compose exec -T backend npx prisma migrate deploy

echo "==> status"
docker compose ps

echo "==> Deploy OK"
