# Guia de Deploy — BoraExpandir

> Deploy completo de produção: **Frontend na Vercel** + **Backend em AWS EC2** + **DNS no Registro.br** + **Banco Supabase (já ativo)**.

## Arquitetura final

```
Usuário final
     │
     ├── https://bei.boraexpandir.com.br        → Vercel (React + Vite)
     │
     └── https://ebe-api.boraexpandir.com.br    → AWS EC2 (Express + Prisma + cron)
                                                  │
                                                  └── Supabase (PostgreSQL + Auth + Storage)
```

| Componente | Onde | Custo estimado |
|---|---|---|
| Frontend | Vercel Hobby | **$0** |
| Backend | AWS EC2 `t3.small` (sa-east-1) | ~**$20–25/mês** |
| Banco | Supabase Free | **$0** (até 500MB) |
| DNS | Registro.br (já pago) | — |
| SSL | Let's Encrypt + Vercel | **$0** |
| **Total** | | **~$20–25/mês** |

## ⚠️ Antes de começar — rotacione secrets expostos

Durante a configuração alguns secrets apareceram em conversas/arquivos. Por segurança, **rotacione antes de ir pra produção**:

| Secret | Onde rotacionar |
|---|---|
| Stripe Secret Key | https://dashboard.stripe.com/apikeys → Roll key |
| Supabase Service Role | Dashboard Supabase → Settings → API → Reset |
| SMTP senha Gmail | Conta Google → Senhas de app → gerar nova |
| Autentique Token | Painel Autentique → API → regenerar |

---

## Fase 0 — Pré-requisitos

### Ferramentas locais (você instala 1x)

```bash
# AWS CLI — gerenciar EC2 via terminal
# Windows: baixar em https://aws.amazon.com/cli/
aws --version

# Vercel CLI
npm install -g vercel
vercel --version

# GitHub CLI (se ainda não tem)
gh --version
```

### Contas necessárias

- [ ] **AWS** (https://console.aws.amazon.com) — cartão vinculado
- [ ] **Vercel** (https://vercel.com) — login com GitHub
- [ ] **Registro.br** — acesso ao painel de `boraexpandir.com.br`
- [ ] **GitHub** — repo `BoraExpandirPlataforma` já existe

### Decisões já tomadas

- **Subdomínios:**
  - Frontend: `bei.boraexpandir.com.br`
  - Backend: `ebe-api.boraexpandir.com.br`
- **Região AWS:** `sa-east-1` (São Paulo — menor latência no Brasil)
- **Instância EC2:** `t3.small` (2 vCPU, 2GB RAM — PDF + Chromium precisam disso)
- **OS:** Ubuntu 22.04 LTS

---

## Fase 1 — Configurar AWS CLI

### 1.1. Criar IAM User
1. AWS Console → **IAM** → Users → Create user
2. Nome: `boraexpandir-deploy`
3. Anexar policy: **AmazonEC2FullAccess** (depois você restringe)
4. Gerar access key → Command Line Interface → baixar CSV

### 1.2. Configurar localmente
```bash
aws configure
# AWS Access Key ID: <cole do CSV>
# AWS Secret Access Key: <cole do CSV>
# Default region: sa-east-1
# Default output format: json

# Testar
aws sts get-caller-identity
```

---

## Fase 2 — Criar infraestrutura EC2

### 2.1. Criar Key Pair (SSH)
```bash
aws ec2 create-key-pair \
  --region sa-east-1 \
  --key-name boraexpandir-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/boraexpandir-key.pem

chmod 400 ~/.ssh/boraexpandir-key.pem
# Windows (Git Bash): já ok. PowerShell: icacls para restringir.
```

### 2.2. Criar Security Group
```bash
# Criar o SG
aws ec2 create-security-group \
  --region sa-east-1 \
  --group-name boraexpandir-sg \
  --description "Security group for BoraExpandir API"

# Pegar o SG ID (anote)
SG_ID=$(aws ec2 describe-security-groups --region sa-east-1 --group-names boraexpandir-sg --query 'SecurityGroups[0].GroupId' --output text)
echo $SG_ID

# Abrir portas (HTTP, HTTPS pra todo mundo; SSH só pro seu IP)
MEU_IP=$(curl -s https://checkip.amazonaws.com)

aws ec2 authorize-security-group-ingress --region sa-east-1 --group-id $SG_ID --protocol tcp --port 22 --cidr ${MEU_IP}/32
aws ec2 authorize-security-group-ingress --region sa-east-1 --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --region sa-east-1 --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0
```

### 2.3. Lançar EC2 Ubuntu 22.04
```bash
# AMI Ubuntu 22.04 LTS em sa-east-1 (verificar versão atualizada se der erro)
AMI=$(aws ec2 describe-images --region sa-east-1 \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
            "Name=state,Values=available" \
  --query 'sort_by(Images,&CreationDate)[-1].ImageId' --output text)
echo "AMI: $AMI"

aws ec2 run-instances \
  --region sa-east-1 \
  --image-id $AMI \
  --instance-type t3.small \
  --key-name boraexpandir-key \
  --security-group-ids $SG_ID \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":20,"VolumeType":"gp3"}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=boraexpandir-api}]' \
  --count 1
```

Pegar o instance ID e IP público:
```bash
INSTANCE_ID=$(aws ec2 describe-instances --region sa-east-1 \
  --filters "Name=tag:Name,Values=boraexpandir-api" "Name=instance-state-name,Values=running,pending" \
  --query 'Reservations[0].Instances[0].InstanceId' --output text)
echo "Instance: $INSTANCE_ID"
```

### 2.4. Criar e associar Elastic IP (IP fixo)
```bash
# Alocar
ALLOC_ID=$(aws ec2 allocate-address --region sa-east-1 --domain vpc --query 'AllocationId' --output text)
echo "Allocation: $ALLOC_ID"

# Aguardar instância rodar
aws ec2 wait instance-running --region sa-east-1 --instance-ids $INSTANCE_ID

# Associar
aws ec2 associate-address --region sa-east-1 --instance-id $INSTANCE_ID --allocation-id $ALLOC_ID

# Pegar o IP final
EIP=$(aws ec2 describe-addresses --region sa-east-1 --allocation-ids $ALLOC_ID --query 'Addresses[0].PublicIp' --output text)
echo "==> ANOTE ESTE IP: $EIP"
```

### 2.5. Testar SSH
```bash
ssh -i ~/.ssh/boraexpandir-key.pem ubuntu@$EIP
# Aceite o fingerprint (yes)
# Se logar, está ok. Saia com `exit`.
```

---

## Fase 3 — DNS no Registro.br

> Faça essa fase **agora** — DNS demora para propagar, então inicie enquanto configura o servidor.

### 3.1. Acessar painel
1. https://registro.br → Login
2. Escolher `boraexpandir.com.br`
3. **DNS → Editar Zona**

### 3.2. Adicionar registros

| Nome (hostname) | Tipo | Valor | TTL |
|---|---|---|---|
| `bei` | CNAME | `cname.vercel-dns.com` (ou target custom da Vercel) | 3600 |
| `ebe-api` | A | `<EIP do passo 2.4>` | 3600 |

> ⚠️ **Não remova** os registros que apontam para o WordPress atual (raiz `@` e `www`). Esses mantém o site institucional funcionando.

### 3.3. Salvar e aguardar
- Registro.br costuma propagar em **15–60 minutos**
- Verificar:
```bash
# Windows (PowerShell)
nslookup ebe-api.boraexpandir.com.br
nslookup bei.boraexpandir.com.br

# Linux/Mac/WSL
dig ebe-api.boraexpandir.com.br +short
dig bei.boraexpandir.com.br +short
```

Quando `ebe-api` resolver para o EIP e `bei` resolver para algo `*.vercel-dns.com`, o DNS está OK.

---

## Fase 4 — Provisionar o servidor EC2

### 4.1. Copiar script de setup
```bash
# No seu computador, do diretório do projeto:
scp -i ~/.ssh/boraexpandir-key.pem \
  deploy/setup-ec2.sh \
  ubuntu@$EIP:~/

# SSH no servidor
ssh -i ~/.ssh/boraexpandir-key.pem ubuntu@$EIP
```

### 4.2. Executar setup (dentro do EC2)
```bash
chmod +x setup-ec2.sh
./setup-ec2.sh
# Aguardar ~5min: instala Node 20, Nginx, Certbot, PM2, UFW
```

### 4.3. Clonar o repositório (dentro do EC2)
```bash
cd /home/ubuntu
# Se repo é privado, use deploy key ou token:
git clone https://github.com/Factoria-new/BoraExpandirPlataforma.git
# Alternativa com SSH:
# git clone git@github.com:Factoria-new/BoraExpandirPlataforma.git
```

### 4.4. Criar `.env` de produção (dentro do EC2)
```bash
cd /home/ubuntu/BoraExpandirPlataforma/backend
cp .env.example .env
nano .env   # colar os valores reais (secrets rotacionados!)
```

**⚠️ Valores críticos a garantir no .env de produção:**
```env
NODE_ENV=production
PORT=4000
BACKEND_URL=https://ebe-api.boraexpandir.com.br
FRONTEND_URL=https://bei.boraexpandir.com.br
CORS_ORIGINS=https://bei.boraexpandir.com.br,https://ebe.boraexpandir.com.br
# ... demais secrets
```

### 4.5. Deploy inicial do backend
```bash
# Dar permissão ao script
chmod +x /home/ubuntu/BoraExpandirPlataforma/deploy/deploy-backend.sh

# Executar
/home/ubuntu/BoraExpandirPlataforma/deploy/deploy-backend.sh
```

Se tudo correr bem, `pm2 status` mostra `boraexpandir-api` como `online`.

### 4.6. Configurar Nginx
```bash
# Copiar config
sudo cp /home/ubuntu/BoraExpandirPlataforma/deploy/nginx-boraexpandir-api.conf \
        /etc/nginx/sites-available/boraexpandir-api

# Ativar
sudo ln -s /etc/nginx/sites-available/boraexpandir-api /etc/nginx/sites-enabled/

# Remover site default (que responde na raiz por padrão)
sudo rm -f /etc/nginx/sites-enabled/default

# Testar sintaxe e recarregar
sudo nginx -t
sudo systemctl reload nginx
```

### 4.7. Teste via HTTP (antes do SSL)
```bash
curl http://ebe-api.boraexpandir.com.br/
# Deve retornar: {"ok":true,"message":"API BoraExpandir","env":"production"}
```

Se retornar 502: PM2 não subiu (`pm2 logs boraexpandir-api`).
Se retornar 404 do Nginx: config não ativou.
Se connection refused: DNS ainda não propagou.

---

## Fase 5 — SSL com Let's Encrypt

**Só rodar depois que `ebe-api.boraexpandir.com.br` já esteja resolvendo para o EIP no DNS.**

```bash
# Dentro do EC2:
sudo certbot --nginx -d ebe-api.boraexpandir.com.br

# Quando pedir:
#   Email: seu email pessoal (usado só pra avisos de renovação)
#   Termos: A (agree)
#   Newsletter: N (opcional)
#   Redirect HTTP → HTTPS: 2 (Yes)
```

Certbot edita o Nginx automaticamente e injeta as linhas de certificado. Renova sozinho a cada 60 dias via cron.

### Verificar SSL
```bash
curl https://ebe-api.boraexpandir.com.br/
# Deve retornar o JSON da API
```

Abra no browser: `https://ebe-api.boraexpandir.com.br` → deve mostrar cadeado 🔒.

---

## Fase 6 — Deploy frontend na Vercel

### 6.1. CLI login
```bash
cd C:\Users\Bruno\ Porto\Desktop\BoraExpandirPlataforma\frontendBoraExpandir
vercel login
```

### 6.2. Primeiro deploy (link + config)
```bash
vercel
# Perguntas:
#   Set up and deploy? Y
#   Scope: sua conta
#   Link to existing? N
#   Project name: boraexpandir-frontend
#   Directory: ./ (current)
#   Override settings? N (vercel.json já define tudo)
```

### 6.3. Configurar env vars na Vercel

Via CLI:
```bash
vercel env add VITE_BACKEND_URL production
# valor: https://ebe-api.boraexpandir.com.br

vercel env add VITE_API_URL production
# valor: https://ebe-api.boraexpandir.com.br

vercel env add VITE_URL_BACKEND production
# valor: https://ebe-api.boraexpandir.com.br
```

Ou via Dashboard: Project → Settings → Environment Variables → adicionar as 3.

### 6.4. Deploy de produção
```bash
vercel --prod
```

### 6.5. Adicionar domínio custom
```bash
vercel domains add bei.boraexpandir.com.br
# Ou via Dashboard: Project → Settings → Domains → Add
```

A Vercel valida o DNS, emite SSL e ativa. Em ~2 min `https://bei.boraexpandir.com.br` está no ar.

---

## Fase 7 — Ajustes no Supabase

1. Acesse https://supabase.com/dashboard → projeto `rtuxziaxeegbaaihpjni`
2. **Authentication → URL Configuration**:
   - **Site URL:** `https://bei.boraexpandir.com.br`
   - **Redirect URLs (adicionar todas):**
     - `https://bei.boraexpandir.com.br/**`
     - `https://ebe-api.boraexpandir.com.br/**`
     - `http://localhost:3010/**` (para dev)

---

## Fase 8 — Webhooks

Alguns serviços externos apontam para o backend via webhook. Atualize as URLs de callback:

| Serviço | URL antiga (ngrok) | URL nova |
|---|---|---|
| Autentique | `https://antoinette-*.ngrok-free.dev/webhooks/autentique` | `https://ebe-api.boraexpandir.com.br/webhooks/autentique` |
| Stripe | — | `https://ebe-api.boraexpandir.com.br/webhooks/stripe` (se usar) |

---

## Fase 9 — Smoke tests

Confirme cada um:

- [ ] `curl https://ebe-api.boraexpandir.com.br/` → retorna JSON OK
- [ ] `curl https://ebe-api.boraexpandir.com.br/api/ping` → retorna ping
- [ ] Browser: `https://bei.boraexpandir.com.br` carrega login
- [ ] Login funciona → redireciona por role
- [ ] Abrir uma tela que faz fetch → DevTools → sem erro de CORS
- [ ] PM2 logs sem erro: `pm2 logs boraexpandir-api --lines 50`
- [ ] Cron logs: aguardar 30 min e conferir logs (procure `[CRON]`)

---

## Operação diária

### Atualizar backend após push no main
```bash
ssh -i ~/.ssh/boraexpandir-key.pem ubuntu@<EIP>
cd /home/ubuntu/BoraExpandirPlataforma
./deploy/deploy-backend.sh
```

### Atualizar frontend
Push no `main` do GitHub → **Vercel faz deploy automático**. Nada a fazer.

### Logs
```bash
pm2 logs boraexpandir-api --lines 100         # logs da app
pm2 monit                                      # dashboard realtime
sudo tail -f /var/log/nginx/error.log          # erros do Nginx
sudo tail -f /var/log/nginx/access.log         # requests
```

### Restart manual
```bash
pm2 restart boraexpandir-api
sudo systemctl reload nginx
```

---

## Troubleshooting

| Sintoma | Causa provável | Ação |
|---|---|---|
| 502 Bad Gateway | Express caiu | `pm2 logs`, `pm2 restart boraexpandir-api` |
| 504 Gateway Timeout | Requisição longa | Aumentar `proxy_read_timeout` no Nginx |
| CORS error no browser | Origin não listado | Editar `CORS_ORIGINS` no `.env`, `pm2 reload` |
| "Certificate not trusted" | Certbot não rodou | Verificar DNS, rodar `sudo certbot --nginx -d ebe-api...` |
| Login infinito | Supabase URL errada | Revisar Fase 7 |
| `ENOSPC` no EC2 | Disco cheio | `sudo du -sh /var/log/* /tmp/*`, limpar |
| Cron não roda | PM2 caiu no boot | `pm2 startup` de novo, `pm2 save` |

---

## Custo mensal detalhado (AWS sa-east-1)

| Item | Quantidade | Preço |
|---|---|---|
| EC2 t3.small (on-demand) | 720h | ~$18 |
| EBS gp3 20GB | 20GB | ~$2 |
| Elastic IP (em uso) | 1 | $0 |
| Transferência de saída | ~10GB | ~$2 |
| **Total AWS** | | **~$22/mês** |

**Dica de economia (até 40% off):** após 1 mês rodando, compre **Savings Plan 1 ano** → cai pra ~$12/mês.

---

## Rollback rápido (se algo quebrar em produção)

```bash
# Voltar para commit anterior
cd /home/ubuntu/BoraExpandirPlataforma
git log --oneline -5              # ver últimos 5 commits
git reset --hard <commit-anterior>
cd backend && npm ci && npm run build
pm2 reload boraexpandir-api
```

Frontend: Vercel Dashboard → Deployments → clicar em um deploy antigo → **Promote to Production**.

---

## Checklist final pré-produção

- [ ] Secrets rotacionados (Supabase, Stripe, SMTP, Autentique)
- [ ] `.env` de produção criado no EC2 (NÃO comitado)
- [ ] Frontend build ok localmente (`npm run build` no `frontendBoraExpandir/`)
- [ ] Backend build ok localmente (`npm run build` no `backend/`)
- [ ] DNS propagado (ambos subdomínios resolvem)
- [ ] SSL ativo em ambos (🔒 no browser)
- [ ] Login E2E funcionando
- [ ] Webhook do Autentique atualizado no painel deles
- [ ] Backup do Supabase configurado (Dashboard → Database → Backups)
- [ ] Snapshot AMI do EC2 criado depois de estabilizado (via Console)

---

**Dúvidas ou erros?** Me chame que eu te guio no ponto específico.
