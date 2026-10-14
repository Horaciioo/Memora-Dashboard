# Build, migrate, restart, from files already sent with rsync
set -euo pipefail

cd "$(dirname "$0")"

docker compose build app
docker compose --profile tools run --rm --build migrate
docker compose up -d
docker image prune -f
