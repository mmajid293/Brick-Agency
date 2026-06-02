#!/bin/bash
# Start PostgreSQL for Smart Bhatha ERP (avoids docker-compose v1 ContainerConfig bug)
set -e
cd "$(dirname "$0")/.."

CONTAINER="smart-bhatha-db"
PORT="5434"
VOLUME="smart_bhatha_pg_data"

echo "Stopping old containers if any..."
docker rm -f "$CONTAINER" ba72d2ea1dfc_smart-bhatha-db 2>/dev/null || true

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  docker start "$CONTAINER" 2>/dev/null || docker rm -f "$CONTAINER"
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "Starting PostgreSQL on localhost:${PORT}..."
  docker run -d \
    --name "$CONTAINER" \
    -e POSTGRES_USER=bhatha \
    -e POSTGRES_PASSWORD=bhatha123 \
    -e POSTGRES_DB=smart_bhatha \
    -p "${PORT}:5432" \
    -v "${VOLUME}:/var/lib/postgresql/data" \
    postgres:16-alpine
fi

echo "Waiting for database..."
for i in $(seq 1 30); do
  if docker exec "$CONTAINER" pg_isready -U bhatha -d smart_bhatha >/dev/null 2>&1; then
    echo "PostgreSQL is ready on port ${PORT}"
    echo ""
    echo "DATABASE_URL=postgresql://bhatha:bhatha123@localhost:${PORT}/smart_bhatha?schema=public"
    exit 0
  fi
  sleep 1
done

echo "Database did not become ready in time."
exit 1
