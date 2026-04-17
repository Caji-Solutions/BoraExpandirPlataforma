#!/usr/bin/env bash
# ============================================
# setup-ec2.sh — Provisionamento inicial do servidor
# ============================================
# Rode UMA VEZ no EC2 Ubuntu 22.04 recém-criado.
# Uso: ssh ubuntu@<ip> "bash -s" < setup-ec2.sh
# Ou:  copie o arquivo para o EC2 e execute: bash setup-ec2.sh

set -euo pipefail

echo ">>> [1/7] Atualizando sistema..."
sudo apt-get update -y
sudo apt-get upgrade -y

echo ">>> [2/7] Instalando dependências básicas..."
sudo apt-get install -y \
  curl \
  git \
  build-essential \
  nginx \
  certbot \
  python3-certbot-nginx \
  ufw \
  unzip

echo ">>> [3/7] Instalando Node.js 20 via NodeSource..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version

echo ">>> [4/7] Instalando PM2 globalmente..."
sudo npm install -g pm2@latest
pm2 --version

echo ">>> [5/7] Configurando firewall (UFW)..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status

echo ">>> [6/7] Criando diretórios de logs..."
mkdir -p /home/ubuntu/logs
mkdir -p /home/ubuntu/BoraExpandirPlataforma

echo ">>> [7/7] Configurando PM2 para iniciar no boot..."
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash || true

echo ""
echo "============================================"
echo "✅ Servidor provisionado com sucesso!"
echo "============================================"
echo ""
echo "Próximos passos (você faz):"
echo "  1. Clonar o repo: git clone <url> /home/ubuntu/BoraExpandirPlataforma"
echo "  2. Criar /home/ubuntu/BoraExpandirPlataforma/backend/.env"
echo "  3. Rodar deploy-backend.sh"
echo "  4. Copiar deploy/nginx-boraexpandir-api.conf → /etc/nginx/sites-available/"
echo "  5. sudo certbot --nginx -d ebe-api.boraexpandir.com.br"
echo ""
