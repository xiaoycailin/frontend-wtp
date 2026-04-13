#!/usr/bin/env bash
set -e

cd /home/www/frontend-wtp

git fetch origin
git reset --hard origin/main
npm ci
npm run build
pm2 restart frontendwtp || pm2 start frontendwtp