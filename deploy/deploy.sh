# Build, migrate, restart, from files already sent with rsync
set -euo pipefail

cd "$(dirname "$0")"

# Deploy window, status ignores checks (tolerated if status is older)
pause_status() {
  docker compose exec -T status node -e "fetch('http://127.0.0.1:3001/api/pause?minutes=$1',{method:'POST'})" >/dev/null 2>&1 || true
}

pause_status 20
trap 'pause_status 2' EXIT

docker compose build app
docker compose --profile tools run --rm --build migrate
docker compose up -d
docker image prune -f
