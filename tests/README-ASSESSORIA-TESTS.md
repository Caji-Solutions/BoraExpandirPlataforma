# 🧪 Testes do Fluxo de Assessoria Jurídica

## 📚 Documentação Completa

Veja o guia completo em: `TESTE_ASSESSORIA_FLUXO.md`

---

## 🚀 Executar Testes

### Pré-requisitos

1. **Node.js 18+** instalado
2. **Backend rodando** em `http://localhost:3000`
3. **Autenticado** e com um JWT token válido
4. **IDs válidos** de:
   - Cliente existente
   - Usuário jurídico (responsável)

### Setup Rápido

```bash
# 1. Ir para o diretório raiz do projeto
cd BoraExpandirPlataforma

# 2. Instalar dependências (se ainda não instalou)
npm install

# 3. Configurar variáveis de ambiente
export JWT_TOKEN="seu_token_jwt_aqui"
export CLIENTE_ID="uuid-do-cliente"
export RESPONSAVEL_ID="uuid-do-usuario-juridico"
export SERVICO_ID="uuid-do-subservico" # opcional
export AGENDAMENTO_ID="uuid-agendamento" # opcional
export VERBOSE=true # para ver detalhes
```

### Executar Script de Teste

```bash
# Executar os testes
npx ts-node tests/test-assessoria-fluxo.ts

# Ou com variáveis inline
JWT_TOKEN="token" CLIENTE_ID="id" RESPONSAVEL_ID="id" npx ts-node tests/test-assessoria-fluxo.ts

# Com saída detalhada
VERBOSE=true npx ts-node tests/test-assessoria-fluxo.ts
```

### Resultado Esperado

```
██████████████████████████████████████████████████████████████████
  TESTE DE FLUXO: ASSESSORIA JURÍDICA
██████████████████████████████████████████████████████████████████

Configurações:
  Base URL: http://localhost:3000/api
  Cliente ID: 123e4567-e89b-12d3-a456-426614174000
  Responsável ID: usr-123-juridico
  Serviço ID: Não informado
  Agendamento ID: Não informado
  Verbose: false

======================================================================
  TESTE 1: Criar Assessoria Jurídica
======================================================================

✓ Assessoria criada com sucesso

======================================================================
  TESTE 2: Obter Última Assessoria
======================================================================

✓ Assessoria recuperada com sucesso

======================================================================
  TESTE 3: Obter Processo Sincronizado
======================================================================

✓ Processo recuperado com sucesso

======================================================================
  TESTE 5: Validação de Campos
======================================================================

✓ Validação funcionando corretamente

──────────────────────────────────────────────────────────────────
Resumo: 4/4 testes passaram (100%)
──────────────────────────────────────────────────────────────────

🎉 Todos os testes passaram!
```

---

## 🎯 Testes Inclusos

### ✅ Teste 1: Criar Assessoria
- **O que testa:** Criação básica de assessoria para cliente existente
- **Payload:** Cliente ID + respostas completas + observações
- **Verificações:**
  - Status 201 (criado)
  - Retorna ID da assessoria
  - Processo foi sincronizado

### ✅ Teste 2: Obter Última Assessoria
- **O que testa:** Recuperação da assessoria criada
- **Endpoint:** GET `/juridico/assessoria/{clienteId}`
- **Verificações:**
  - Status 200 (sucesso)
  - Dados retornados correspondem ao criado

### ✅ Teste 3: Obter Processo Sincronizado
- **O que testa:** Sincronização automática com tabela de processos
- **Endpoint:** GET `/juridico/processo-cliente/{clienteId}`
- **Verificações:**
  - Processo foi criado/atualizado
  - Documentos foram mapeados
  - Status está correto

### ✅ Teste 4: Marcar Em Andamento (Opcional)
- **O que testa:** Transição de status da assessoria
- **Endpoint:** POST `/juridico/agendamentos/{id}/assessoria-em-andamento`
- **Requer:** `AGENDAMENTO_ID` configurado
- **Verificações:**
  - Status 200
  - Cliente stage foi atualizado

### ✅ Teste 5: Validação de Campos
- **O que testa:** Rejeição de payloads incompletos
- **Verificações:**
  - Status 400 para campos faltando
  - Mensagem de erro clara

---

## 🔍 Interpretando Resultados

### Todos os testes passaram ✅
```
🎉 Todos os testes passaram!
```
→ Fluxo está funcionando corretamente

### Alguns testes falharam ❌

#### Teste 1 falhou: Criar Assessoria
**Possíveis causas:**
- Cliente ID inválido
- JWT token expirado
- Backend não está rodando
- Payload inválido

**Como debugar:**
```bash
# Verifique o cliente
curl -X GET "http://localhost:3000/api/cliente/CLIENTE_ID" \
  -H "Authorization: Bearer TOKEN"

# Teste diretamente o endpoint
curl -X POST "http://localhost:3000/api/juridico/assessoria" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "clienteId": "...", "respostas": {...} }'
```

#### Teste 2 falhou: Obter Última Assessoria
**Possíveis causas:**
- Assessoria não foi criada no Teste 1
- Cliente ID está inválido
- Banco de dados não está sincronizado

**Como debugar:**
```bash
# Verifique no banco
SELECT * FROM juridico_assessorias 
WHERE cliente_id = 'CLIENTE_ID';

# Ou teste o endpoint manualmente
curl -X GET "http://localhost:3000/api/juridico/assessoria/CLIENTE_ID" \
  -H "Authorization: Bearer TOKEN"
```

#### Teste 3 falhou: Processo Sincronizado
**Possíveis causas:**
- Processo não foi criado automaticamente
- Sincronização falhou silenciosamente
- Banco não foi atualizado

**Como debugar:**
```bash
# Verifique se o processo foi criado
SELECT * FROM juridico_processos 
WHERE cliente_id = 'CLIENTE_ID';

# Verifique se assessoria_id está preenchida
SELECT assessoria_id FROM juridico_processos 
WHERE cliente_id = 'CLIENTE_ID';

# Veja os logs do backend para erros de sincronização
```

#### Teste 4 falhou: Marcar Em Andamento
**Possíveis causas:**
- `AGENDAMENTO_ID` inválido
- Agendamento não existe
- Status já é "em_andamento"

**Como debugar:**
```bash
# Verifique se o agendamento existe
SELECT * FROM agendamentos 
WHERE id = 'AGENDAMENTO_ID';

# Teste diretamente
curl -X POST "http://localhost:3000/api/juridico/agendamentos/AGENDAMENTO_ID/assessoria-em-andamento" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 💻 Executar com Docker

Se tiver Docker:

```bash
# Com Dockerfile apropriado
docker run -e JWT_TOKEN="..." \
           -e CLIENTE_ID="..." \
           -e RESPONSAVEL_ID="..." \
           seu-app:latest \
           npx ts-node tests/test-assessoria-fluxo.ts
```

---

## 📝 Adicionar Novo Teste

Adicione no arquivo `test-assessoria-fluxo.ts`:

```typescript
async function testNovoFluxo(): Promise<boolean> {
  Logger.section('TESTE X: Novo Teste');

  try {
    const response = await apiClient.post('/juridico/novo-endpoint', {
      // payload
    });

    Logger.info('Operação realizada com sucesso');
    return true;
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao fazer operação', err);
    return false;
  }
}

// Adicione no executarTodosOsTestes():
const resultX = await testNovoFluxo();
resultados.push({
  nome: 'Novo Teste',
  passou: resultX,
  tempo: Date.now() - tempo
});
```

---

## 🐛 Troubleshooting

### Erro: "ECONNREFUSED"
```
❌ Erro ao criar assessoria
Error: connect ECONNREFUSED 127.0.0.1:3000
```
**Solução:** Backend não está rodando. Inicie com `npm run dev`

### Erro: "JWT inválido"
```
❌ Erro ao criar assessoria
message: "Unauthorized"
```
**Solução:** Token JWT expirado. Gere um novo token

### Erro: "Cliente não encontrado"
```
❌ Erro ao criar assessoria
message: "Erro ao criar assessoria jurídica"
error: "Cliente não encontrado"
```
**Solução:** Use um cliente ID válido que existe no banco

### Erro: "campos obrigatórios faltando"
```
❌ Erro ao criar assessoria
message: "clienteId e respostas são obrigatórios"
```
**Solução:** Verifique se ambos estão sendo enviados

---

## 📊 Executar Testes em CI/CD

### GitHub Actions

```yaml
name: Test Assessoria

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install
        run: npm install
      
      - name: Start Backend
        run: npm run dev &
        env:
          DATABASE_URL: postgres://postgres:password@localhost:5432/test
      
      - name: Wait for Backend
        run: sleep 10
      
      - name: Run Tests
        run: |
          JWT_TOKEN=${{ secrets.TEST_JWT_TOKEN }} \
          CLIENTE_ID=${{ secrets.TEST_CLIENTE_ID }} \
          RESPONSAVEL_ID=${{ secrets.TEST_RESPONSAVEL_ID }} \
          npx ts-node tests/test-assessoria-fluxo.ts
```

---

## 📚 Arquivos Relacionados

- `TESTE_ASSESSORIA_FLUXO.md` - Guia completo com exemplos curl
- `test-assessoria-fluxo.ts` - Script automatizado
- `backend/src/controllers/juridico/JuridicoController.ts` - Lógica de criação
- `frontendBoraExpandir/src/modules/juridico/services/juridicoService.ts` - Cliente API

---

## ✅ Checklist de Testes

Antes de fazer deploy:

- [ ] Executar testes localmente com sucesso
- [ ] Verificar logs do backend para warnings
- [ ] Testar com diferentes tipos de clientes
- [ ] Testar com e sem subserviço
- [ ] Verificar se documentos foram mapeados corretamente
- [ ] Verificar se cliente stage foi atualizado
- [ ] Testar validações (campos faltando)
- [ ] Verificar se notificações foram enviadas

