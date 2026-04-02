# ⚡ Quick Start: Teste Fluxo de Assessoria Jurídica

## 🎯 O que você precisa fazer em 5 minutos

### 1. Preparar Ambiente
```bash
# Terminal 1: Inicie o backend (se não estiver rodando)
cd backend
npm run dev

# Terminal 2: Pegue seus IDs
# Você precisa de 3 coisas:
# 1. JWT_TOKEN (do seu usuário jurídico)
# 2. CLIENTE_ID (de um cliente existente)
# 3. RESPONSAVEL_ID (seu ID de usuário)
```

### 2. Opção A: Testar com CURL (Mais simples)

```bash
# Defina as variáveis
export TOKEN="seu_jwt_token_aqui"
export CLIENTE_ID="uuid-do-cliente"
export RESPONSAVEL_ID="uuid-do-usuario-juridico"

# Execute o curl abaixo
curl -X POST "http://localhost:3000/api/juridico/assessoria" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "'$CLIENTE_ID'",
    "respostas": {
      "servico_contratado": "Viagem para Espanha",
      "titular_nome": "João Silva",
      "dependentes_info": "Esposa e 2 filhos",
      "pedido_para": "titular_dependentes",
      "pedido_para_detalhe": "Visto de residência",
      "local_solicitacao": "espanha",
      "consulado_cidade": "Madri",
      "cidade_protocolo": "Madri",
      "cidade_chegada": "Barcelona",
      "data_chegada": "2026-06-15",
      "resumo_executivo": "Família organizada, documentação completa",
      "docs_titular": "Passaporte, Extrato, Contrato",
      "docs_dependentes": "Passaportes, Certidões",
      "orientacoes_praticas": "Comparecer pessoalmente",
      "duvidas_cliente": "Prazo e custo?",
      "respostas_dadas": "30 dias, €500",
      "pontos_fracos": "Nenhum",
      "prazos_delicados": "Nenhum",
      "proximos_cliente": "Preparar documentação",
      "proximos_equipe": "Revisar",
      "resumo_1_linha": "Viagem para Barcelona, 45 dias"
    },
    "responsavelId": "'$RESPONSAVEL_ID'"
  }' | jq .
```

**Se der sucesso, você verá:**
```json
{
  "message": "Assessoria jurídica criada com sucesso e processo sincronizado",
  "data": {
    "id": "ass-uuid-xxx",
    "cliente_id": "...",
    "criado_em": "2026-04-02T..."
  }
}
```

### 3. Opção B: Testar com Script Automatizado (Mais completo)

```bash
# Vá para o diretório raiz do projeto
cd BoraExpandirPlataforma

# Execute o script com suas variáveis
JWT_TOKEN="seu_token" \
CLIENTE_ID="uuid-cliente" \
RESPONSAVEL_ID="uuid-usuario" \
VERBOSE=true \
npx ts-node tests/test-assessoria-fluxo.ts
```

---

## 📋 Verificações Rápidas

Depois de criar a assessoria, execute estes comandos para validar:

### 1️⃣ Verificar Assessoria Criada
```bash
curl -X GET "http://localhost:3000/api/juridico/assessoria/$CLIENTE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.id'
```
Deve retornar um UUID

### 2️⃣ Verificar Processo Sincronizado
```bash
curl -X GET "http://localhost:3000/api/juridico/processo-cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {id, status, etapa_atual, documentos_count: (.documentos | length)}'
```
Deve retornar:
```json
{
  "id": "proc-uuid",
  "status": "formularios",
  "etapa_atual": 1,
  "documentos_count": 0  // ou número de documentos se servicoId foi informado
}
```

### 3️⃣ Verificar Documentos Mapeados (Se tiver servicoId)
```bash
curl -X GET "http://localhost:3000/api/juridico/processo-cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.documentos'
```

---

## 🔧 Troubleshooting Rápido

| Erro | Causa | Solução |
|------|-------|---------|
| `ECONNREFUSED` | Backend não rodando | Execute `npm run dev` no backend |
| `Unauthorized` | Token JWT inválido | Gere um novo token |
| `Cliente não encontrado` | ID inválido | Use um cliente_id que existe |
| `clienteId e respostas são obrigatórios` | Falta campo | Verifique se enviou clienteId e respostas |
| `erro ao sincronizar processo` | Log de aviso | Assessoria foi criada, mas verifique logs do backend |

---

## 🎨 Cenários de Teste

### Cenário 1: Cliente SEM processo anterior
```bash
# Resultado esperado:
# - Assessoria criada ✓
# - Novo processo criado ✓
# - Status do processo: 'formularios' ✓
```

### Cenário 2: Cliente COM processo anterior
```bash
# Resultado esperado:
# - Assessoria criada ✓
# - Processo existente ATUALIZADO ✓
# - Documentos SUBSTITUÍDOS pelos novos ✓
```

### Cenário 3: Com serviço específico (subserviço)
```bash
curl -X POST "http://localhost:3000/api/juridico/assessoria" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "'$CLIENTE_ID'",
    "servicoId": "uuid-do-subservico",  # ← Adicione isto
    "respostas": { ... }
  }'

# Resultado esperado:
# - Assessoria criada ✓
# - Processo sincronizado ✓
# - Documentos MAPEADOS de requisitos do serviço ✓
```

---

## 🛑 Problemas Comuns

### Problema 1: "Respostas vazias"
**Sintoma:** Assessoria criada mas sem dados
```json
{
  "respostas": {}
}
```

**Solução:** Preencha todos os 17 campos em `respostas`:
1. servico_contratado
2. titular_nome
3. dependentes_info
4. pedido_para
5. pedido_para_detalhe
6. local_solicitacao
7. consulado_cidade
8. cidade_protocolo
9. cidade_chegada
10. data_chegada
11. resumo_executivo
12. docs_titular
13. docs_dependentes
14. orientacoes_praticas
15. duvidas_cliente
16. respostas_dadas
17. pontos_fracos
18. prazos_delicados
19. proximos_cliente
20. proximos_equipe
21. resumo_1_linha

### Problema 2: "Documentos não aparecem"
**Sintoma:** Processo criado mas sem documentos
```json
{
  "documentos": []
}
```

**Causa:** `servicoId` não fornecido ou não encontrado

**Solução:**
1. Forneça um `servicoId` válido
2. Verifique se o serviço tem requisitos configurados no banco

```bash
# Verificar serviço
SELECT * FROM adm_servicos WHERE id = 'seu-servico-id';

# Verificar requisitos
SELECT requisitos FROM adm_servicos WHERE id = 'seu-servico-id';
```

### Problema 3: "Processo não foi sincronizado"
**Sintoma:** Assessoria criada, mas GET /processo-cliente retorna erro

**Causa:** Erro silencioso na sincronização

**Solução:**
1. Verifique logs do backend para erro específico
2. Tente criar manualmente o processo:
```bash
curl -X POST "http://localhost:3000/api/juridico/processo" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "'$CLIENTE_ID'",
    "tipoServico": "Assessoria Jurídica",
    "responsavelId": "'$RESPONSAVEL_ID'"
  }'
```

---

## 📊 Dados Esperados no Banco

Depois de testar, execute estas queries para validar:

```sql
-- 1. Ver assessoria criada
SELECT id, cliente_id, responsavel_id, criado_em 
FROM juridico_assessorias 
WHERE cliente_id = 'CLIENTE_ID'
ORDER BY criado_em DESC LIMIT 1;

-- 2. Ver processo sincronizado
SELECT id, cliente_id, assessoria_id, tipo_servico, status, etapa_atual
FROM juridico_processos
WHERE cliente_id = 'CLIENTE_ID'
ORDER BY criado_em DESC LIMIT 1;

-- 3. Ver documentos mapeados
SELECT id, nome, status, obrigatorio 
FROM jsonb_to_recordset(
  (SELECT documentos FROM juridico_processos 
   WHERE cliente_id = 'CLIENTE_ID' 
   ORDER BY criado_em DESC LIMIT 1)
) AS t(id text, nome text, status text, obrigatorio boolean);

-- 4. Ver relacionamento
SELECT 
  a.id as assessoria_id,
  p.id as processo_id,
  p.assessoria_id,
  CASE WHEN p.assessoria_id = a.id THEN 'OK ✓' ELSE 'ERRO ✗' END as vinculo
FROM juridico_assessorias a
LEFT JOIN juridico_processos p ON p.assessoria_id = a.id
WHERE a.cliente_id = 'CLIENTE_ID'
ORDER BY a.criado_em DESC LIMIT 1;
```

---

## 📚 Documentação Completa

Para mais detalhes, veja:

1. **TESTE_ASSESSORIA_FLUXO.md** - Guia completo (50+ exemplos)
2. **FLUXO_ASSESSORIA_VISUAL.md** - Diagramas e fluxogramas
3. **tests/README-ASSESSORIA-TESTS.md** - Como rodar testes automatizados
4. **tests/test-assessoria-fluxo.ts** - Script de teste em TypeScript

---

## ✅ Checklist Rápido

- [ ] Backend rodando em `http://localhost:3000`
- [ ] Tenho um JWT_TOKEN válido
- [ ] Tenho um CLIENTE_ID (cliente existente)
- [ ] Tenho um RESPONSAVEL_ID (meu ID de usuário jurídico)
- [ ] Executei o curl ou script de teste
- [ ] Recebi resposta 201 (sucesso)
- [ ] Verifiquei assessoria foi criada (GET)
- [ ] Verifiquei processo foi sincronizado (GET)
- [ ] Documentos foram mapeados (se aplicável)

---

## 🚀 Próximos Passos

1. **Testar com dados reais** - Use clientes verdadeiros
2. **Testar casos de erro** - Veja TESTE_ASSESSORIA_FLUXO.md
3. **Implementar melhorias** - Veja seção "Pontos de Melhoria"
4. **Adicionar notificações** - Envie email/SMS ao cliente
5. **Criar testes automatizados** - CI/CD com GitHub Actions

---

## 💡 Dicas Pro

### Dica 1: Usar jq para filtrar JSON
```bash
# Ver só o ID da assessoria criada
curl ... | jq '.data.id'

# Ver estrutura do processo
curl ... | jq '.data | keys'

# Contar documentos
curl ... | jq '.data.documentos | length'
```

### Dica 2: Salvar resposta em arquivo
```bash
curl ... > response.json
jq . response.json | less
```

### Dica 3: Debugar com verbose
```bash
curl -v ... 2>&1 | grep -A5 "HTTP"
```

### Dica 4: Usar insomnia/postman
- Import collection do projeto
- Salve variáveis de ambiente
- Reutilize em múltiplos testes

---

## 🤝 Precisa de Ajuda?

1. Verifique TESTE_ASSESSORIA_FLUXO.md seção "Troubleshooting"
2. Veja logs do backend para error messages específicas
3. Rode com `VERBOSE=true` para mais detalhes
4. Verifique dados no banco com SQL queries

