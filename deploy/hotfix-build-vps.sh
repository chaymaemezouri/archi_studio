#!/bin/bash
# Après git pull — rebuild frontend sans cache
set -euo pipefail
cd /var/www/a2workspace

echo "==> git pull"
git pull origin main

echo "==> rebuild"
docker compose build --no-cache frontend
docker compose up -d

echo "==> seed (si première fois)"
docker compose exec backend node prisma/seed.prod.js || true

docker compose ps
