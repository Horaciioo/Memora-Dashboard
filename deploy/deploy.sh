# Pull, build, migrate, restart
set -euo pipefail

cd "$(dirname "$0")"

git -C .. pull --ff-only
docker compose build app
docker compose --profile tools run --rm migrate
docker compose up -d
docker image prune -f
