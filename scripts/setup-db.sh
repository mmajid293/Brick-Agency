#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "=== Smart Bhatha ERP — Database Setup ==="

chmod +x scripts/start-db.sh
./scripts/start-db.sh

echo ""
echo "Pushing schema..."
npm run db:push

echo ""
echo "Seeding demo data..."
npm run db:seed

echo ""
echo "=== Done ==="
echo "Run: npm run dev"
echo "Login: admin@bhatha.pk / admin123"
