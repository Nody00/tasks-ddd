#!/usr/bin/env bash
set -e

echo "→ Generating Prisma client..."
pnpm prisma generate

echo "→ Starting Docker services..."
docker compose up -d

echo "→ Waiting for PostgreSQL to be ready..."
until [ "$(docker inspect --format='{{.State.Health.Status}}' everything_api_postgres 2>/dev/null)" = "healthy" ]; do
  printf '.'
  sleep 1
done
echo " ready!"

echo "→ Resetting database (drops all data, applies all migrations)..."
pnpm prisma migrate reset --force

echo ""
echo "Setup complete."
pnpm start:watch
