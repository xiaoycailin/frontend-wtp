#!/usr/bin/env bash
set -e

cd /home/www/frontend-wtp

git fetch origin
git reset --hard origin/master
npm ci
npm run build
echo "Restarting service..."
pm2 restart frontendwtp || pm2 start node --name "frontendwtp" -- build/index.js