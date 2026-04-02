# 🔍 Como Coletar os IDs Necessários para Teste

## 📋 Você precisa de 3 IDs essenciais

```
1. JWT_TOKEN        → Token de autenticação
2. CLIENTE_ID       → Cliente existente no banco
3. RESPONSAVEL_ID   → Seu ID como usuário jurídico
4. (Opcional) SERVICO_ID  → ID do subserviço para testar mapeamento de requisitos
5. (Opcional) AGENDAMENTO_ID → ID do agendamento para testar transição de status
```

---

## 1️⃣ Coletar JWT_TOKEN

### Opção A: Via Frontend

1. Abra o app (`http://localhost:3000`)
2. Faça login como usuário jurídico
3. Abra DevTools (F12)
4. Vá para **Application** → **Local Storage**
5. Procure por `token` ou `jwt`
6. Copie o valor completo

```javascript
// Ou execute no console do browser:
localStorage.getItem('token')
// Copie o resultado
```

### Opção B: Via API Backend

```bash
# Login via API
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@example.com",
    "password": "sua-senha"
  }' | jq '.token'
```

### Opção C: Direto no Banco

```sql
-- Gere um token manualmente para testes (NÃO USE EM PRODUÇÃO)
-- Você precisa ter a chave secreta do JWT
-- Use uma ferramenta como: https://jwt.io

-- Ou execute uma query para ver usuários:
SELECT id, email, full_name FROM usuarios WHERE role = 'juridico' LIMIT 5;
```

**Resultado esperado:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3J...
```

---

## 2️⃣ Coletar CLIENTE_ID

### Opção A: Via Frontend

1. Vá para página de clientes (Juridico → Clientes)
2. Procure por um cliente
3. Clique nele para abrir perfil
4. Verifique a URL: `http://localhost:3000/juridico/cliente/[CLIENTE_ID]`
5. Copie o ID da URL

### Opção B: Via API

```bash
# Listar clientes
curl -X GET "http://localhost:3000/api/juridico/clientes" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[0].id'
```

**Resultado:**
```json
"123e4567-e89b-12d3-a456-426614174000"
```

### Opção C: Via SQL

```sql
-- Buscar clientes ativos
SELECT id, nome, email FROM clientes 
WHERE status = 'ativo' 
LIMIT 10;

-- Ou clientes com ou sem processo
SELECT 
  c.id,
  c.nome,
  COUNT(p.id) as tem_processo
FROM clientes c
LEFT JOIN juridico_processos p ON p.cliente_id = c.id
GROUP BY c.id, c.nome
LIMIT 10;
```

**Resultado:**
```
                   id                   | nome          | tem_processo
----------------------------------------|---------------|---------------
123e4567-e89b-12d3-a456-426614174000   | João Silva    | 0
123e4567-e89b-12d3-a456-426614174001   | Maria Santos  | 1
```

---

## 3️⃣ Coletar RESPONSAVEL_ID

### Opção A: Do Token JWT

Se você tiver o token, decodifique-o:

```bash
# Decodifique o JWT (use site: https://jwt.io)
# Ou via terminal:
echo "seu_token" | cut -d'.' -f2 | base64 -d | jq .

# Procure por: "sub" ou "id" ou "user_id"
```

**Resultado esperado:**
```json
{
  "sub": "usr-123-juridico",
  "email": "seu-email@example.com",
  "role": "juridico",
  "name": "Seu Nome"
}
```

### Opção B: Via Frontend

1. Após fazer login, vá para seu perfil
2. Copie seu ID de usuário
3. Ou verifique em qualquer request no DevTools Network

### Opção C: Via API

```bash
# Get current user (precisa estar autenticado)
curl -X GET "http://localhost:3000/api/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.id'
```

### Opção D: Via SQL

```sql
-- Buscar usuários jurídicos
SELECT id, email, full_name FROM usuarios 
WHERE role = 'juridico' OR role = 'advogado' 
ORDER BY created_at DESC LIMIT 5;
```

**Resultado:**
```
                   id                   | email                  | full_name
----------------------------------------|------------------------|------------------
usr-123-juridico                        | joao@empresa.com       | João Silva
usr-456-juridico                        | maria@empresa.com      | Maria Santos
```

---

## 4️⃣ Coletar SERVICO_ID (Opcional)

### Para testar mapeamento de requisitos

### Opção A: Via Frontend

1. Vá para Admin → Catálogo de Serviços
2. Selecione um serviço que tenha "Subserviços"
3. Copie o ID do subserviço
4. Verifique se tem "Requisitos" configurados

### Opção B: Via API

```bash
# Listar todos os serviços
curl -X GET "http://localhost:3000/api/adm/catalog" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[0]'

# Buscar serviço específico
curl -X GET "http://localhost:3000/api/adm/catalog/servico-id" \
  -H "Authorization: Bearer $TOKEN" | jq '.requisitos'
```

**Resultado esperado:**
```json
{
  "id": "subserv-123",
  "nome": "Viagem para Espanha",
  "requisitos": [
    {
      "nome": "Passaporte",
      "etapa": 1,
      "obrigatorio": true
    },
    {
      "nome": "Extrato Bancário",
      "etapa": 1,
      "obrigatorio": true
    }
  ]
}
```

### Opção C: Via SQL

```sql
-- Buscar serviços com requisitos
SELECT 
  id,
  nome,
  requisitos,
  jsonb_array_length(requisitos) as num_requisitos
FROM adm_servicos 
WHERE requisitos IS NOT NULL 
AND requisitos != '[]'::jsonb
LIMIT 10;

-- Ver detalhes de um serviço
SELECT id, nome, requisitos 
FROM adm_servicos 
WHERE id = 'seu-servico-id';
```

---

## 5️⃣ Coletar AGENDAMENTO_ID (Opcional)

### Para testar transição de status

### Opção A: Via API

```bash
# Listar agendamentos
curl -X GET "http://localhost:3000/api/comercial/agendamentos" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[0].id'

# Ou agendamentos de um cliente específico
curl -X GET "http://localhost:3000/api/juridico/agendamentos/por-responsavel/$RESPONSAVEL_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[0].id'
```

### Opção B: Via SQL

```sql
-- Buscar agendamentos
SELECT id, cliente_id, data_hora, status 
FROM agendamentos 
WHERE status IN ('pendente', 'agendado', 'em_andamento')
LIMIT 10;

-- Agendamentos de um cliente
SELECT id, data_hora, status FROM agendamentos 
WHERE cliente_id = 'CLIENTE_ID'
ORDER BY data_hora DESC LIMIT 5;
```

---

## 🛠️ Script para Coletar Todos os IDs

Crie um arquivo `collect-ids.sh`:

```bash
#!/bin/bash

echo "=========================================="
echo "  COLETA DE IDs PARA TESTE DE ASSESSORIA"
echo "=========================================="
echo ""

# 1. JWT Token
echo "1. JWT Token"
echo "   Cole seu token JWT:"
read -p "   > " TOKEN
export JWT_TOKEN=$TOKEN
echo ""

# 2. Cliente ID
echo "2. Cliente ID"
echo "   Obtendo lista de clientes..."
curl -s -X GET "http://localhost:3000/api/juridico/clientes" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {id: .id, nome: .nome}' | head -20
echo ""
echo "   Cole o Cliente ID:"
read -p "   > " CLIENTE_ID
export CLIENTE_ID=$CLIENTE_ID
echo ""

# 3. Responsável ID
echo "3. Responsável ID"
echo "   Obtendo seu ID..."
RESPONSAVEL_ID=$(curl -s -X GET "http://localhost:3000/api/me" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.id')
export RESPONSAVEL_ID=$RESPONSAVEL_ID
echo "   ID: $RESPONSAVEL_ID"
echo ""

# 4. Serviço ID (opcional)
echo "4. Serviço ID (opcional)"
echo "   Obtendo lista de serviços..."
curl -s -X GET "http://localhost:3000/api/adm/catalog" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {id: .id, nome: .nome}' | head -10
echo ""
echo "   Cole o Serviço ID (deixe em branco para pular):"
read -p "   > " SERVICO_ID
export SERVICO_ID=$SERVICO_ID
echo ""

# Exibir resumo
echo "=========================================="
echo "  RESUMO DOS IDs"
echo "=========================================="
echo "JWT_TOKEN:      ${TOKEN:0:20}..."
echo "CLIENTE_ID:     $CLIENTE_ID"
echo "RESPONSAVEL_ID: $RESPONSAVEL_ID"
echo "SERVICO_ID:     ${SERVICO_ID:-'(vazio)'}"
echo ""
echo "Copie e use:"
echo "export JWT_TOKEN='$TOKEN'"
echo "export CLIENTE_ID='$CLIENTE_ID'"
echo "export RESPONSAVEL_ID='$RESPONSAVEL_ID'"
echo "export SERVICO_ID='$SERVICO_ID'"
```

Use assim:
```bash
chmod +x collect-ids.sh
./collect-ids.sh
```

---

## 🗂️ Armazenar IDs em Arquivo

Crie um arquivo `.env.local.test`:

```bash
# .env.local.test
JWT_TOKEN=seu_token_completo_aqui
CLIENTE_ID=123e4567-e89b-12d3-a456-426614174000
RESPONSAVEL_ID=usr-123-juridico
SERVICO_ID=subserv-456-789  # opcional
AGENDAMENTO_ID=agnd-789-012  # opcional
API_BASE=http://localhost:3000/api
VERBOSE=true
```

Use assim:
```bash
source .env.local.test
npx ts-node tests/test-assessoria-fluxo.ts
```

---

## ✅ Validar IDs Coletados

Depois de coletar, valide:

```bash
# 1. Validar TOKEN
curl -X GET "http://localhost:3000/api/me" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

# Deve retornar seu usuário

# 2. Validar CLIENTE_ID
curl -X GET "http://localhost:3000/api/cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.data.nome'

# Deve retornar o nome do cliente

# 3. Validar RESPONSAVEL_ID
curl -X GET "http://localhost:3000/api/usuarios/$RESPONSAVEL_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.data.full_name'

# Deve retornar seu nome

# 4. Validar SERVICO_ID (se informado)
curl -X GET "http://localhost:3000/api/adm/servicos/$SERVICO_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.data.nome'

# Deve retornar o nome do serviço
```

---

## 🚨 Erros Comuns ao Coletar IDs

| Erro | Causa | Solução |
|------|-------|---------|
| "Invalid token" | Token expirado | Gere novo token |
| "Unauthorized" | Token inválido | Verifique se copiar completo |
| "Not found" | ID não existe | Verifique ID no banco |
| "Invalid UUID" | Formato errado | UUID deve ter 36 caracteres |

---

## 💾 Próxima Etapa

Depois de coletar os IDs, execute:

```bash
# Quick Start
QUICK-START-TESTE.md

# Ou diretamente:
npx ts-node tests/test-assessoria-fluxo.ts

# Ou com curl (veja exemplos em):
TESTE_ASSESSORIA_FLUXO.md
```

