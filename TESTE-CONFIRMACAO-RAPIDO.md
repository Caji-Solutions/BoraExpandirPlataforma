# ⚡ Teste Rápido: Confirmação de Pagamento

## 🎯 Você tem 3 Opções para Testar

### Opção 1: Teste COM Backend Rodando (5 min)

```bash
# Terminal 1: Inicie o backend
npm run dev

# Terminal 2: Execute o teste de integração
JWT_TOKEN="seu_token" npx ts-node tests/test-confirmacao-pagamento.ts
```

**O que testa:**
- ✅ Cria um agendamento real no banco
- ✅ Preenche formulário real
- ✅ Aprova pagamento (chama `/financeiro/comprovante/:id/aprovar`)
- ✅ Verifica se status mudou para `aguardando_assessoria`

**Resultado esperado:**
```
✓ Agendamento criado: test-agendamento-1712162400000
✓ Status inicial: "agendado"
✓ Formulário preenchido com sucesso
✓ Status atual: "agendado"
✓ Comprovante aprovado
✓ Status após confirmação: "aguardando_assessoria"
```

---

### Opção 2: Teste SEM Backend (Instantâneo - Recomendado)

```bash
# Execute os testes com Jest (sem backend)
npm test -- test-confirmacao-pagamento-mock.spec.ts

# Ou com modo watch (atualiza conforme edita)
npm test -- test-confirmacao-pagamento-mock.spec.ts --watch
```

**O que testa:**
- ✅ Transições de status sem banco de dados real
- ✅ Validações de lógica
- ✅ Performance
- ✅ Fluxo completo simulado

**Resultado esperado:**
```
 PASS  tests/test-confirmacao-pagamento-mock.spec.ts
  Confirmação de Pagamento - Transição de Status
    Transição 1: Pagamento Aprovado → aguardando_assessoria
      ✓ deve mudar status para "aguardando_assessoria" quando pagamento é aprovado
      ✓ deve atualizar timestamp quando pagamento é aprovado
      ✓ deve preservar outros campos ao mudar status
      ✓ deve lançar erro se agendamento não existe
    Transição 2: Formulário Preenchido → confirmado
      ✓ deve mudar status para "confirmado" quando formulário é preenchido
      ...
    ✓ 28 testes passaram
```

---

### Opção 3: Teste Manual (Validar na UI)

```bash
# 1. Abra a plataforma
http://localhost:3010

# 2. Crie um agendamento via UI
Comercial → Agendamentos → Novo

# 3. Preencha o formulário
Formulário → Preencher

# 4. Envie comprovante de pagamento
Agendamento → Adicionar Comprovante

# 5. Vá para Financeiro
Financeiro → Comprovantes Pendentes

# 6. Aprove o comprovante
Clique em "Aprovar"

# 7. Verifique se status mudou
Volte para o agendamento e confirme: status = "aguardando_assessoria"
```

---

## 📊 Comparação das 3 Opções

| Aspecto | Opção 1 | Opção 2 | Opção 3 |
|---------|---------|---------|---------|
| **Tempo** | 5-10 min | < 1 seg | 10-15 min |
| **Precisa Backend** | ✅ SIM | ❌ NÃO | ✅ SIM |
| **Testa Banco Real** | ✅ SIM | ❌ NÃO | ✅ SIM |
| **Testa API Real** | ✅ SIM | ❌ NÃO | ✅ SIM |
| **Valida UI** | ❌ NÃO | ❌ NÃO | ✅ SIM |
| **Rápido Feedback** | ❌ NÃO | ✅ SIM | ❌ NÃO |
| **Para CI/CD** | ✅ SIM | ✅ SIM | ❌ NÃO |

---

## 🚀 Recomendação

**Para desenvolvimento rápido:**
```bash
# Opção 2: Testa código sem backend
npm test -- test-confirmacao-pagamento-mock.spec.ts --watch
```

**Antes de fazer commit:**
```bash
# Opção 1: Valida fluxo completo
JWT_TOKEN="token" npx ts-node tests/test-confirmacao-pagamento.ts
```

**Antes de deploy:**
```bash
# Opção 3: Valida manualmente na UI
# Ou configure ambos os testes na pipeline
```

---

## 📋 O que Está Sendo Testado

### Status Esperados no Fluxo

```
1. AGENDADO (inicial)
   └─ Cliente preenche formulário
   
2. AGENDADO (com formulário)
   └─ Cliente envia comprovante
   
3. AGUARDANDO_VERIFICACAO
   └─ Financeiro aprova pagamento
   
4. AGUARDANDO_ASSESSORIA ← ✅ TESTE AQUI
   └─ Cliente participa da assessoria
   
5. EM_ANDAMENTO
   └─ Assessoria está acontecendo
   
6. ASSESSORIA_FINALIZADA ← ✅ TESTE DO SEU OUTRO CÓDIGO
   └─ Fim do fluxo
```

---

## ✅ Checklist: O que Deve Mudar

Quando pagamento é aprovado:

- [ ] agendamento.status muda para `aguardando_assessoria`
- [ ] cliente.stage muda para `aguardando_assessoria`
- [ ] cliente.status muda para `aguardando_assessoria`
- [ ] atualizado_em é atualizado
- [ ] Notificação é enviada ao cliente
- [ ] Email é enviado ao cliente (opcional)

---

## 🐛 Troubleshooting

### Erro: "JWT_TOKEN não foi fornecido" (Opção 1)

```bash
# Solução: Forneça o token
JWT_TOKEN="seu_token_aqui" npx ts-node tests/test-confirmacao-pagamento.ts
```

Como obter o token:
```bash
# Faça login e copie do localStorage no browser
localStorage.getItem('token')
```

### Erro: "Jest não encontrado" (Opção 2)

```bash
# Solução: Instale as dependências de teste
npm install --save-dev jest @types/jest ts-jest

# Crie ou atualize jest.config.js
# Veja exemplo abaixo
```

### Erro: "Agendamento não encontrado" (Opção 1)

**Causa:** Agendamento foi criado mas API retornou erro
**Solução:** Verifique nos logs do backend

```bash
# Procure por mensagens de erro
grep -i "erro" backend.log
```

---

## 📝 Configurar Jest (se não tiver)

Crie `jest.config.js` na raiz:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts', '**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: [
    'backend/src/**/*.ts',
    '!backend/src/**/*.d.ts'
  ]
};
```

---

## 🎯 Exemplo: Teste Rápido (1 minuto)

```bash
# 1. Abra dois terminais

# Terminal 1: Backend
npm run dev

# Terminal 2: Teste com mock (não precisa token)
npm test -- test-confirmacao-pagamento-mock.spec.ts

# Resultado:
# PASS  tests/test-confirmacao-pagamento-mock.spec.ts (1.234 s)
#   ✓ 28 testes passaram
```

Pronto! Você testou sem fazer nada manualmente! 🎉

---

## 🔄 Integração Contínua

Para rodar os testes no GitHub Actions:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install
        run: npm install
      
      - name: Run Unit Tests (Mock)
        run: npm test -- test-confirmacao-pagamento-mock.spec.ts
      
      - name: Run Integration Tests
        if: success()
        env:
          JWT_TOKEN: ${{ secrets.TEST_JWT_TOKEN }}
        run: npx ts-node tests/test-confirmacao-pagamento.ts
```

---

## 📚 Próximos Passos

1. ✅ Rodar teste mock (Opção 2): `npm test`
2. ✅ Rodar teste com backend (Opção 1): `npx ts-node tests/test-confirmacao-pagamento.ts`
3. ✅ Validar na plataforma (Opção 3): Criar agendamento manualmente
4. ✅ Adicionar testes ao CI/CD
5. ✅ Documentar padrão de testes no projeto

---

## 💡 Dicas

**Sempre testar na ordem:**
```
Mock Tests → Integration Tests → Manual Validation
```

**Para debug rápido:**
```bash
VERBOSE=true npx ts-node tests/test-confirmacao-pagamento.ts
```

**Para ver logs detalhados:**
```bash
npm test -- test-confirmacao-pagamento-mock.spec.ts --verbose
```

