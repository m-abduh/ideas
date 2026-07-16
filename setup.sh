#!/bin/bash
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Install dependencies ==="
apt update && apt install -y curl git

if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs
fi

if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
fi

cd "$APP_DIR"

echo "=== Install npm packages ==="
npm install

echo "=== Setup .env ==="
if [ ! -f .env ]; then
  cat > .env <<EOF
DATABASE_URL="file:./dev.db"
GROQ_API_KEY=isi_groq_api_key_disini
PORT=3000
EOF
  echo ".env created. Edit GROQ_API_KEY di $APP_DIR/.env"
fi

echo "=== Setup database ==="
npx prisma generate
npx prisma db push --accept-data-loss

echo "=== Start with PM2 ==="
pm2 delete ideas 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo "=== Done ==="
echo "App: http://localhost:3000"
echo "PM2: pm2 logs ideas"
