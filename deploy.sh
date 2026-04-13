#!/usr/bin/env bash
set -e

cd /home/www/frontend-wtp

git fetch origin
git reset --hard origin/master
npm ci
npm run build

echo "Restarting service..."

if pm2 describe frontendwtp >/dev/null 2>&1; then
  PORT=4173 pm2 restart frontendwtp --update-env
else
  PORT=4173 pm2 start build/index.js --name frontendwtp
fi