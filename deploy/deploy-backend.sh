#!/usr/bin/env bash
# ============================================
# deploy-backend.sh — Deploy incremental do backend
# ============================================
# Rode no EC2 sempre que quiser atualizar o backend com o último código.
# Requer: setup-ec2.sh já executado + .env configurado.

set -euo pipefail

APP_DIR="/home/ubuntu/BoraExpandirPlataforma"
BACKEND_DIR="$APP_DIR/backend"

echo ">>> [1/6] Entrando no diretório do projeto..."
cd "$APP_DIR"

echo ">>> [2/6] Baixando último código..."
git fetch --all
git reset --hard origin/main

echo ">>> [3/6] Instalando dependências do backend..."
cd "$BACKEND_DIR"
npm ci --legacy-peer-deps  # legacy-peer-deps: conflito entre @composio/openai-agents e @openai/agents

echo ">>> [4/6] Gerando Prisma client..."
npx prisma generate

echo ">>> [5/6] Compilando TypeScript..."
npm run build

echo ">>> [6/6] Reiniciando PM2..."
if pm2 describe boraexpandir-api > /dev/null 2>&1; then
  pm2 reload boraexpandir-api --update-env
else
  pm2 start ecosystem.config.js
  pm2 save
fi

pm2 status

echo ""
echo "✅ Deploy concluído!"
echo "   Health: curl https://ebe-api.boraexpandir.com.br/api/ping"
echo ""
