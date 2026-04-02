# Guia Completo: Teste do Fluxo de Criação de Assessoria Jurídica

## 📋 Visão Geral do Fluxo

```
Cliente Existente
    ↓
1. [Frontend] Selecionar cliente + Preencher formulário de assessoria
    ↓
2. [POST /juridico/assessoria] Criar assessoria jurídica
    ↓
3. [Backend] Sincronizar com tabela de processos
    ├─ Se processo existe → Atualiza
    └─ Se não existe → Cria novo
    ↓
4. [Marcar em andamento] POST /juridico/agendamentos/{id}/assessoria-em-andamento
    ↓
5. [Atualizar stage do cliente] Cliente entra em estado de consultoria
```

---

## 🔧 Estrutura de Dados

### Tabela: `juridico_assessorias`
```sql
{
  id: string (UUID),
  cliente_id: string,
  responsavel_id: string (usuário jurídico criador),
  respostas: JSON {
    servico_contratado: string,
    titular_nome: string,
    dependentes_info: string,
    pedido_para: 'titular_somente' | 'titular_dependentes',
    pedido_para_detalhe: string,
    local_solicitacao: 'consulado' | 'espanha',
    consulado_cidade: string,
    cidade_protocolo: string,
    cidade_chegada: string,
    data_chegada: string,
    resumo_executivo: string,
    docs_titular: string,
    docs_dependentes: string,
    orientacoes_praticas: string,
    duvidas_cliente: string,
    respostas_dadas: string,
    pontos_fracos: string,
    prazos_delicados: string,
    proximos_cliente: string,
    proximos_equipe: string,
    resumo_1_linha: string
  },
  observacoes: string (opcional),
  servico_id: string (opcional - ID do subserviço),
  criado_em: timestamp,
  atualizado_em: timestamp
}
```

### Tabela: `juridico_processos` (sincronizada)
```sql
{
  id: string,
  cliente_id: string,
  assessoria_id: string (FK para juridico_assessorias),
  servico_id: string (opcional),
  tipo_servico: string,
  status: 'formularios' | 'em_andamento' | 'concluido',
  etapa_atual: number,
  responsavel_id: string,
  documentos: JSON [],
  requerimentos: JSON [],
  criado_em: timestamp,
  atualizado_em: timestamp
}
```

---

## 🧪 Testes com CURL

### Pré-requisitos
```bash
# 1. Você precisa estar autenticado
TOKEN="seu_token_jwt_aqui"

# 2. IDs necessários:
CLIENTE_ID="uuid-do-cliente"
RESPONSAVEL_ID="uuid-do-usuario-juridico"
SERVICO_ID="uuid-do-subservico" # opcional
```

### Teste 1: Criar Assessoria Simples (Cliente Existente, sem Subserviço)

```bash
curl -X POST "http://localhost:3000/api/juridico/assessoria" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "123e4567-e89b-12d3-a456-426614174000",
    "respostas": {
      "servico_contratado": "Viagem para Espanha",
      "titular_nome": "João Silva",
      "dependentes_info": "Esposa Maria Silva, filho Pedro Silva (10 anos)",
      "pedido_para": "titular_dependentes",
      "pedido_para_detalhe": "Visto de residência para a família",
      "local_solicitacao": "espanha",
      "consulado_cidade": "Madri",
      "cidade_protocolo": "Madri",
      "cidade_chegada": "Barcelona",
      "data_chegada": "2026-06-15",
      "resumo_executivo": "Família com perfil baixo risco. Documentação completa. Aprovação prevista em 30 dias.",
      "docs_titular": "Passaporte válido, extrato bancário, contrato de trabalho",
      "docs_dependentes": "Passaportes válidos, certidão de nascimento",
      "orientacoes_praticas": "Comparecer pessoalmente. Levar originals + 2 cópias simples.",
      "duvidas_cliente": "Qual é o prazo exato? Quanto custa?",
      "respostas_dadas": "Prazo: 30 dias corridos. Custo: €500 por pessoa",
      "pontos_fracos": "Documentação de renda poderia ser mais forte",
      "prazos_delicados": "Vencimento do passaporte em 8 meses",
      "proximos_cliente": "Preparar documentação até 10/06",
      "proximos_equipe": "Revisar documentação, agendar entrevista",
      "resumo_1_linha": "Viagem familiar para Barcelona com aprovação esperada em 30 dias"
    },
    "observacoes": "Cliente muito organizado, sugerir expedited processing",
    "responsavelId": "usr-123-juridico"
  }'
```

**Resposta Esperada (201):**
```json
{
  "message": "Assessoria jurídica criada com sucesso e processo sincronizado",
  "data": {
    "id": "ass-uuid-1234",
    "cliente_id": "123e4567-e89b-12d3-a456-426614174000",
    "responsavel_id": "usr-123-juridico",
    "respostas": { ... },
    "observacoes": "Cliente muito organizado...",
    "servico_id": null,
    "criado_em": "2026-04-02T10:30:00Z",
    "atualizado_em": "2026-04-02T10:30:00Z"
  }
}
```

---

### Teste 2: Criar Assessoria com Subserviço

```bash
curl -X POST "http://localhost:3000/api/juridico/assessoria" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "123e4567-e89b-12d3-a456-426614174001",
    "servicoId": "subserv-789-xyz",
    "respostas": {
      "servico_contratado": "Viagem para Portugal",
      "titular_nome": "Ana Costa",
      "dependentes_info": "Nenhum",
      "pedido_para": "titular_somente",
      "pedido_para_detalhe": "Visto D (atividade independente)",
      "local_solicitacao": "consulado",
      "consulado_cidade": "Lisboa",
      "cidade_protocolo": "Lisboa",
      "cidade_chegada": "Porto",
      "data_chegada": "2026-07-01",
      "resumo_executivo": "Candidata com perfil empreendedor. Plano de negócios sólido.",
      "docs_titular": "Certificado de capacidade técnica, plano de negócios, extratos bancários",
      "docs_dependentes": "N/A",
      "orientacoes_praticas": "Agendamento consular online. Trazer original + 1 cópia.",
      "duvidas_cliente": "Precisa de comprovante de residência?",
      "respostas_dadas": "Sim, contrato de aluguel ou escritura do imóvel",
      "pontos_fracos": "Nenhum identificado",
      "prazos_delicados": "Nenhum",
      "proximos_cliente": "Agendar entrevista consular",
      "proximos_equipe": "Verificar aprovação de formulários",
      "resumo_1_linha": "Visto D para Portugal aprovado, aguardando entrevista consular"
    },
    "observacoes": "Candidata independente, alto potencial",
    "responsavelId": "usr-456-juridico"
  }'
```

**Resposta Esperada (201):**
```json
{
  "message": "Assessoria jurídica criada com sucesso e processo sincronizado",
  "data": {
    "id": "ass-uuid-5678",
    "cliente_id": "123e4567-e89b-12d3-a456-426614174001",
    "responsavel_id": "usr-456-juridico",
    "servico_id": "subserv-789-xyz",
    "respostas": { ... },
    "criado_em": "2026-04-02T10:35:00Z"
  }
}
```

**O que acontece no Backend:**
1. Cria registro em `juridico_assessorias`
2. Busca serviço em `adm_servicos` para obter `requisitos`
3. Mapeia requisitos para documentos (`status: 'pendente'`)
4. Verifica se cliente já tem processo:
   - ✅ SIM → Atualiza tipo_servico, assessoria_id, documentos
   - ❌ NÃO → Cria novo processo com `status: 'formularios'`

---

### Teste 3: Obter Última Assessoria de um Cliente

```bash
curl -X GET "http://localhost:3000/api/juridico/assessoria/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta (200):**
```json
{
  "data": {
    "id": "ass-uuid-1234",
    "cliente_id": "123e4567-e89b-12d3-a456-426614174000",
    "responsavel_id": "usr-123-juridico",
    "respostas": { ... },
    "observacoes": "Cliente muito organizado...",
    "criado_em": "2026-04-02T10:30:00Z"
  }
}
```

---

### Teste 4: Marcar Assessoria como Em Andamento (após agendamento)

```bash
# Após criar a assessoria, marcar como em andamento
AGENDAMENTO_ID="agnd-uuid-1234"

curl -X POST "http://localhost:3000/api/juridico/agendamentos/$AGENDAMENTO_ID/assessoria-em-andamento" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**O que muda:**
- `cliente.stage` → `'assessoria_andamento'`
- `processo.status` → `'em_andamento'` (opcional, depende da implementação)
- Notificação enviada ao cliente

---

### Teste 5: Obter Processo Sincronizado

```bash
curl -X GET "http://localhost:3000/api/juridico/processo-cliente/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta:**
```json
{
  "data": {
    "id": "proc-uuid-1234",
    "cliente_id": "123e4567-e89b-12d3-a456-426614174000",
    "assessoria_id": "ass-uuid-1234",
    "tipo_servico": "Viagem para Espanha",
    "status": "formularios",
    "etapa_atual": 1,
    "responsavel_id": "usr-123-juridico",
    "servico_id": null,
    "documentos": [
      {
        "id": "doc-1",
        "nome": "Passaporte",
        "etapa": 1,
        "obrigatorio": true,
        "status": "pendente",
        "enviado": false
      },
      {
        "id": "doc-2",
        "nome": "Extrato Bancário",
        "etapa": 1,
        "obrigatorio": true,
        "status": "pendente",
        "enviado": false
      }
    ],
    "criado_em": "2026-04-02T10:30:00Z",
    "atualizado_em": "2026-04-02T10:30:00Z"
  }
}
```

---

## 🚨 Cenários de Erro

### Erro 1: Cliente não existe
```bash
curl -X POST "http://localhost:3000/api/juridico/assessoria" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "cliente-inexistente",
    "respostas": { ... }
  }'
```
**Resposta (500):**
```json
{
  "message": "Erro ao criar assessoria jurídica",
  "error": "Cliente não encontrado"
}
```

---

### Erro 2: Campos obrigatórios faltando
```bash
curl -X POST "http://localhost:3000/api/juridico/assessoria" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "123e4567-e89b-12d3-a456-426614174000"
    # FALTA: respostas
  }'
```
**Resposta (400):**
```json
{
  "message": "clienteId e respostas são obrigatórios"
}
```

---

## 💡 Pontos de Melhoria no Fluxo Atual

### 1. **Validação de Respostas** ❌
- **Problema:** Qualquer JSON é aceito em `respostas`
- **Sugestão:** Validar schema de respostas esperado
```typescript
// Adicionar no controller
const schema = {
  servico_contratado: { required: true, type: 'string' },
  titular_nome: { required: true, type: 'string' },
  resumo_1_linha: { required: true, type: 'string', minLength: 10 },
  local_solicitacao: { required: true, enum: ['consulado', 'espanha'] },
  // ... outros campos
};

const validation = validatePayload(req.body.respostas, schema);
if (!validation.valid) {
  return res.status(400).json({ message: 'Validation error', errors: validation.errors });
}
```

---

### 2. **Sincronização com Falha Silenciosa** ⚠️
- **Problema:** Se a criação de processo falhar, a assessoria é criada mesmo assim
- **Código:**
```typescript
// Linha 916-918 do controller
} catch (procError) {
  console.error('Erro ao sincronizar processo com assessoria:', procError)
  // Não falha a requisição da assessoria se o processo falhar ← SILENCIADO
}
```
- **Risco:** Inconsistência entre assessoria e processo
- **Sugestão:** Transação no banco ou pelo menos retornar warning
```typescript
try {
  // ... criar processo
} catch (procError) {
  return res.status(500).json({
    message: 'Erro ao sincronizar processo',
    warning: 'Assessoria criada mas processo não foi sincronizado',
    error: procError.message
  });
}
```

---

### 3. **Rastreamento de Mudanças** ❌
- **Problema:** Não há log de quem criou/modificou a assessoria
- **Sugestão:** Adicionar campos de auditoria
```typescript
{
  // ... campos existentes
  criado_por: string (FK usuarios),
  criado_em: timestamp,
  atualizado_por: string (FK usuarios),
  atualizado_em: timestamp,
  versao: number // para rastreamento de mudanças
}
```

---

### 4. **Notificação ao Cliente** ❌
- **Problema:** Cliente não é notificado que assessoria foi criada
- **Sugestão:** Enviar email/SMS
```typescript
// Após criar assessoria com sucesso
await NotificationService.send({
  clienteId: clienteId,
  type: 'ASSESSORIA_CRIADA',
  message: `Sua assessoria jurídica foi criada. Próximos passos: ${nextSteps}`,
  channels: ['email', 'whatsapp']
});
```

---

### 5. **Falta de Etapas Intermediárias** ⚠️
- **Problema:** Vai direto de `formularios` para `em_andamento`
- **Sugestão:** Adicionar etapas como `revisao_documentos`, `aguardando_cliente`
```typescript
const PROCESSO_STAGES = {
  'formularios': 'Preenchendo formulários',
  'analise_preliminar': 'Análise preliminar',
  'coleta_documentos': 'Coleta de documentos',
  'revisao_documentos': 'Revisão de documentos',
  'em_andamento': 'Em andamento',
  'concluido': 'Concluído',
  'arquivado': 'Arquivado'
};
```

---

### 6. **Relacionamento entre Assessoria e Agendamento** ⚠️
- **Problema:** `assessoria_id` é criada manualmente, sem garantir consistência
- **Sugestão:** Criar fluxo automático:
  1. Cliente agenda consultoria → Cria `agendamento`
  2. Consultoria realizada → Status muda para `avaliacao_pos_consultoria`
  3. Jurídico cria assessoria → Automaticamente vincula ao `agendamento`
  4. Assessoria em andamento → Muda status para `assessoria_andamento`

---

## 📊 Cenário Completo de Teste (End-to-End)

### Setup
```bash
# 1. Preparar variáveis
TOKEN="seu_jwt_token"
CLIENTE_ID="client-123"
RESPONSAVEL_ID="resp-456"
AGENDAMENTO_ID="agnd-789"
```

### Fluxo
```bash
# Step 1: Criar assessoria
ASSESSORIA=$(curl -s -X POST "http://localhost:3000/api/juridico/assessoria" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "'$CLIENTE_ID'",
    "respostas": { ... dados completos ... },
    "responsavelId": "'$RESPONSAVEL_ID'"
  }')

echo "Assessoria criada: $ASSESSORIA"

# Step 2: Buscar assessoria criada
curl -s -X GET "http://localhost:3000/api/juridico/assessoria/$CLIENTE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Step 3: Buscar processo sincronizado
curl -s -X GET "http://localhost:3000/api/juridico/processo-cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Step 4: Marcar como em andamento
curl -s -X POST "http://localhost:3000/api/juridico/agendamentos/$AGENDAMENTO_ID/assessoria-em-andamento" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 🔍 Como Debugar

### Ver logs do backend
```bash
# No terminal onde o backend está rodando
# Procure por mensagens como:
# "Erro ao sincronizar processo com assessoria:"
# "Erro ao criar assessoria juridica no controller:"
```

### Verificar banco diretamente
```sql
-- Ver assessorias
SELECT * FROM juridico_assessorias 
WHERE cliente_id = 'client-123';

-- Ver processo sincronizado
SELECT * FROM juridico_processos 
WHERE cliente_id = 'client-123';

-- Ver relacionamento
SELECT 
  a.id as assessoria_id,
  a.cliente_id,
  p.id as processo_id,
  p.assessoria_id
FROM juridico_assessorias a
LEFT JOIN juridico_processos p ON p.assessoria_id = a.id
WHERE a.cliente_id = 'client-123';
```

---

## ✅ Checklist para Teste Completo

- [ ] Criar assessoria para cliente SEM processo anterior
- [ ] Criar assessoria para cliente COM processo anterior
- [ ] Verificar se processo foi criado/atualizado
- [ ] Verificar documentos foram mapeados corretamente
- [ ] Marcar como em andamento
- [ ] Obter processo sincronizado
- [ ] Testar validações (campos faltando)
- [ ] Verificar logs de erro
- [ ] Testar com diferentes subserviços
- [ ] Verificar stage do cliente foi atualizado

---

## 🎯 Próximos Passos Sugeridos

1. **Implementar validação rigorosa** de respostas
2. **Adicionar transações** no banco para garantir consistência
3. **Implementar notificações** ao cliente
4. **Criar endpoints de auditoria** (quem criou, quando, mudanças)
5. **Adicionar testes automatizados** para este fluxo
6. **Documentar** stages e transições possíveis

