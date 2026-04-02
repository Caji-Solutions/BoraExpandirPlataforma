# ⚡ Quick Test: Timeline de Stages do Cliente

## 🎯 Execute em 10 Minutos

### Setup

```bash
# Terminal 1: Backend rodando
npm run dev

# Terminal 2: Defina as variáveis
export JWT_TOKEN="seu_token"
export CLIENTE_ID="uuid-cliente"
export RESPONSAVEL_ID="uuid-usuario"
export VERBOSE=true
```

---

## 🚀 Teste Rápido: Um Script

```bash
# Execute o teste de timeline completo
npx ts-node tests/test-stage-timeline.ts
```

**Resultado será:**
```
✓ Stage inicial: "pendente_agendamento"
✓ Após criar assessoria: "consultoria_pendente"
✓ Após marcar em andamento: "assessoria_andamento"
✓ Após finalizar: "assessoria_finalizada"
```

---

## 🔄 Testes Individuais (Passo a Passo)

### Passo 1: Ver Stage Inicial
```bash
curl -s "http://localhost:3000/api/cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.data.stage'
```
**Esperado:** `"pendente_agendamento"` ou semelhante

---

### Passo 2: Criar Assessoria (Muda Stage)
```bash
curl -s -X POST "http://localhost:3000/api/juridico/assessoria" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "'$CLIENTE_ID'",
    "responsavelId": "'$RESPONSAVEL_ID'",
    "respostas": {
      "servico_contratado": "Teste",
      "titular_nome": "Teste",
      "dependentes_info": "Teste",
      "pedido_para": "titular_somente",
      "pedido_para_detalhe": "Teste",
      "local_solicitacao": "espanha",
      "consulado_cidade": "Madrid",
      "cidade_protocolo": "Madrid",
      "cidade_chegada": "Barcelona",
      "data_chegada": "2026-06-15",
      "resumo_executivo": "Teste",
      "docs_titular": "Teste",
      "docs_dependentes": "Teste",
      "orientacoes_praticas": "Teste",
      "duvidas_cliente": "Teste?",
      "respostas_dadas": "Teste",
      "pontos_fracos": "Nenhum",
      "prazos_delicados": "Nenhum",
      "proximos_cliente": "Teste",
      "proximos_equipe": "Teste",
      "resumo_1_linha": "Teste"
    }
  }' | jq '.data.id'

# Depois verificar stage
curl -s "http://localhost:3000/api/cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.data.stage'
```
**Esperado:** `"consultoria_pendente"` ou `"assessoria_andamento"`

---

### Passo 3: Marcar Em Andamento (Muda Stage)
```bash
# Encontrar agendamento
AGENDAMENTO=$(curl -s "http://localhost:3000/api/juridico/agendamentos/por-responsavel/$RESPONSAVEL_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | \
  jq -r ".data[] | select(.cliente_id == \"$CLIENTE_ID\") | .id" | head -1)

echo "Agendamento: $AGENDAMENTO"

# Marcar em andamento
curl -s -X POST "http://localhost:3000/api/juridico/agendamentos/$AGENDAMENTO/assessoria-em-andamento" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Verificar novo stage
curl -s "http://localhost:3000/api/cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.data.stage'
```
**Esperado:** `"assessoria_andamento"`

---

### Passo 4: Finalizar Assessoria (Muda Stage)
```bash
curl -s -X POST "http://localhost:3000/api/juridico/cliente/$CLIENTE_ID/finalizar-assessoria" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Verificar stage final
curl -s "http://localhost:3000/api/cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.data | {stage, status}'
```
**Esperado:**
```json
{
  "stage": "assessoria_finalizada",
  "status": "assessoria_finalizada"
}
```

---

## 📱 Ver na Plataforma

1. Abra: `http://localhost:3000`
2. Vá para: **Jurídico → Clientes**
3. Procure pelo cliente que testou
4. Veja o stage evoluindo em tempo real

**Timeline esperada:**
```
┌─ Pendente Agendamento
├─ Consultoria Pendente (após criar assessoria)
├─ Assessoria Em Andamento (após marcar em andamento)
└─ Assessoria Finalizada (após finalizar)
```

---

## 🔍 Verificar Tudo de Uma Vez

```bash
# Script completo para verificar status
echo "=== CLIENTE ===" && \
curl -s "http://localhost:3000/api/cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | \
  jq '.data | {stage, status, atualizado_em}' && \

echo -e "\n=== PROCESSO ===" && \
curl -s "http://localhost:3000/api/juridico/processo-cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | \
  jq '.data | {status, etapa_atual, assessoria_id}' && \

echo -e "\n=== ASSESSORIA ===" && \
curl -s "http://localhost:3000/api/juridico/assessoria/$CLIENTE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | \
  jq '.data | {id, cliente_id, criado_em}'
```

---

## ❌ Se Algo Falhar

### "Erro: Cliente não encontrado"
```bash
# Liste clientes válidos
curl -s "http://localhost:3000/api/juridico/clientes" \
  -H "Authorization: Bearer $JWT_TOKEN" | \
  jq '.data[] | {id, nome}' | head -10
```

### "Erro: Token inválido"
```bash
# Verifique seu token
curl -s "http://localhost:3000/api/me" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.email'
```

### "Erro: Rota não encontrada (404)"
```bash
# Verifique se rota foi adicionada
grep "finalizar-assessoria" backend/src/routes/juridico.ts
```

---

## 📊 Resultado Final

Se tudo deu certo, você verá:

```
TIMELINE DE STAGES:

1. Criar Assessoria
   "pendente_agendamento" → "consultoria_pendente"
   ✓ Stage foi atualizado

2. Marcar Em Andamento
   "consultoria_pendente" → "assessoria_andamento"
   ✓ Stage foi atualizado

3. Finalizar
   "assessoria_andamento" → "assessoria_finalizada"
   ✓ Stage foi atualizado

🎉 Todos os 3 stages foram atualizados com sucesso!
```

---

## 📚 Próximos Passos

1. ✅ Teste automático: `npx ts-node tests/test-stage-timeline.ts`
2. ✅ Teste manual: Execute os passos 1-4 acima
3. ✅ Verifique na plataforma: `http://localhost:3000`
4. ✅ Veja documentação completa: `MUDANCAS-STAGE-TIMELINE.md`

---

## 🎯 Checklist Final

- [ ] Backend rodando
- [ ] JWT_TOKEN válido
- [ ] CLIENTE_ID válido
- [ ] RESPONSAVEL_ID válido
- [ ] Executou teste automático
- [ ] Viu mudanças de stage na plataforma
- [ ] Todos os 3 stages mudaram corretamente

Pronto! Seu fluxo de stages está funcionando! 🚀

