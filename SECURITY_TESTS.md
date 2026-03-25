# 🔐 Testes de Segurança - Validação das Correções

Este documento contém testes de segurança que você pode executar para validar que as correções foram implementadas corretamente.

## 📋 Testes Manuais com cURL

### Teste 1: Acesso sem Autenticação (Deve falhar com 401)

```bash
# ❌ DEVE RETORNAR: 401 Unauthorized
curl -X GET http://localhost:3000/api/cliente/any-uuid/documentos

# Resposta esperada:
# {
#   "error": "Token não fornecido"
# }
```

### Teste 2: Acesso com Token Inválido (Deve falhar com 401)

```bash
# ❌ DEVE RETORNAR: 401 Unauthorized
curl -X GET http://localhost:3000/api/cliente/any-uuid/documentos \
  -H "Authorization: Bearer invalid-token-here"

# Resposta esperada:
# {
#   "error": "Token inválido ou expirado"
# }
```

### Teste 3: Cliente Vendo Documentos de Outro Cliente (Deve falhar com 403)

```bash
# Primeiro, obtenha um token de um cliente (alice)
# Token para: user-alice-uuid

# Depois tente acessar documentos de outro cliente (bob)
# ❌ DEVE RETORNAR: 403 Forbidden
curl -X GET http://localhost:3000/api/cliente/user-bob-uuid/documentos \
  -H "Authorization: Bearer token-of-alice"

# Resposta esperada:
# {
#   "message": "Sem permissão para acessar documentos de outro cliente"
# }
```

### Teste 4: Cliente Tentando Atualizar Status (Deve falhar com 403)

```bash
# Cliente NÃO tem permissão para atualizar status
# ❌ DEVE RETORNAR: 403 Forbidden
curl -X PATCH http://localhost:3000/api/cliente/documento/doc-123/status \
  -H "Authorization: Bearer token-of-cliente" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REJECTED",
    "motivoRejeicao": "Teste de segurança"
  }'

# Resposta esperada:
# {
#   "message": "Apenas jurídico ou admin conseguem atualizar status"
# }
```

### Teste 5: Tentar Falsificar analisado_por (Deve ser ignorado)

```bash
# Enviar analisado_por fake no body
# ❌ NÃO DEVE SER USADO - Sistema usará userId autenticado

curl -X PATCH http://localhost:3000/api/cliente/documento/doc-123/status \
  -H "Authorization: Bearer token-of-juridico" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REJECTED",
    "motivoRejeicao": "Teste",
    "analisadoPor": "fake-admin-uuid-12345"
  }'

# Campo analisado_por será IGNORADO
# O banco receberá o userId real do token autenticado
# ✅ VERIFICAR NO BANCO: SELECT analisado_por FROM documentos WHERE id='doc-123'
```

---

## 🧪 Testes Automatizados

### Adicionar ao arquivo `DocumentFlow.test.ts`

```typescript
describe('Segurança: Autenticação e Autorização', () => {

  // Teste 1: Sem token
  it('rejeita requisição sem Bearer token (401)', async () => {
    const res = await request(app)
      .get('/api/cliente/any-uuid/documentos')

    expect(res.status).toBe(401)
    expect(res.body.error).toContain('Token não fornecido')
  })

  // Teste 2: Token inválido
  it('rejeita token inválido (401)', async () => {
    const res = await request(app)
      .get('/api/cliente/any-uuid/documentos')
      .set('Authorization', 'Bearer invalid-token')

    expect(res.status).toBe(401)
    expect(res.body.error).toContain('Token inválido')
  })

  // Teste 3: Acesso não-autorizado
  it('rejeita cliente vendo documentos de outro (403)', async () => {
    // Simular token do user-alice
    const token = generateToken('user-alice-uuid', { role: 'cliente' })

    const res = await request(app)
      .get('/api/cliente/user-bob-uuid/documentos')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(res.body.message).toContain('Sem permissão')
  })

  // Teste 4: Cliente não consegue atualizar status
  it('cliente não consegue atualizar status de documento (403)', async () => {
    const token = generateToken('cliente-uuid', { role: 'cliente' })

    const res = await request(app)
      .patch('/api/cliente/documento/doc-123/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'REJECTED' })

    expect(res.status).toBe(403)
    expect(res.body.message).toContain('juridico ou admin')
  })

  // Teste 5: Admin consegue ver documentos de qualquer cliente
  it('admin consegue ver documentos de qualquer cliente (200)', async () => {
    const token = generateToken('admin-uuid', { role: 'admin' })

    const res = await request(app)
      .get('/api/cliente/any-client-uuid/documentos')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })

  // Teste 6: Auditoria registra usuário real
  it('analisado_por registra usuário autenticado (não req.body)', async () => {
    const juridico_id = 'juridico-uuid-123'
    const token = generateToken(juridico_id, { role: 'juridico' })

    // Tentar enviar analisadoPor fake
    await request(app)
      .patch('/api/cliente/documento/doc-456/status')
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'REJECTED',
        analisadoPor: 'fake-uuid-9999'  // ❌ Será ignorado
      })

    // Verificar no banco que foi registrado o userId real
    const doc = await ClienteRepository.getDocumentoById('doc-456')

    expect(doc.analisado_por).toBe(juridico_id)  // ✅ ID real
    expect(doc.analisado_por).not.toBe('fake-uuid-9999')  // ✅ Não fake
  })

  // Teste 7: Acesso por processo restrito
  it('cliente não consegue acessar documentos por processo (403)', async () => {
    const token = generateToken('cliente-uuid', { role: 'cliente' })

    const res = await request(app)
      .get('/api/cliente/processo/process-123/documentos')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  // Teste 8: Juridico consegue acessar por processo
  it('juridico consegue acessar documentos por processo (200)', async () => {
    const token = generateToken('juridico-uuid', { role: 'juridico' })

    const res = await request(app)
      .get('/api/cliente/processo/process-123/documentos')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })
})
```

### Executar testes de segurança

```bash
cd backend
npm test -- src/controllers/__tests__/DocumentFlow.test.ts --reporter=verbose
```

---

## 🔍 Verificação no Banco de Dados

### Verificar que analisado_por é real

```sql
-- Verificar que analisado_por contém UUID real, não fake
SELECT
  id,
  status,
  analisado_por,
  analisado_em
FROM documentos
WHERE id = 'doc-123'
ORDER BY atualizado_em DESC
LIMIT 5;

-- Esperado:
-- id        | status   | analisado_por                        | analisado_em
-- doc-123   | REJECTED | 550e8400-e29b-41d4-a716-446655440000 | 2026-03-25...
--            (UUID real de um jurídico, não fake)
```

### Verificar permissões sendo aplicadas

```sql
-- Histórico de atualizações (auditoria)
SELECT
  id,
  cliente_id,
  status,
  analisado_por,
  analisado_em
FROM documentos
WHERE cliente_id = 'client-uuid-123'
ORDER BY atualizado_em DESC;

-- Todos os registros devem ter analisado_por válidos
-- (não devem ter UUIDs fake/inventados)
```

---

## ✅ Checklist de Validação

### Segurança de Autenticação
- [ ] Requisição sem token retorna 401
- [ ] Token inválido retorna 401
- [ ] Token expirado retorna 401
- [ ] Bearer prefix é obrigatório

### Segurança de Autorização
- [ ] Cliente vê só seus documentos
- [ ] Cliente não consegue atualizar status
- [ ] Cliente não consegue acessar por processo
- [ ] Admin consegue ver tudo
- [ ] Juridico consegue ver tudo

### Auditoria
- [ ] analisado_por é sempre um UUID real
- [ ] analisado_por nunca é UUID fake de req.body
- [ ] analisado_em é sempre preenchido
- [ ] Usuario que atualizou é rastreável

### Performance
- [ ] Tempo de resposta < 500ms
- [ ] Nenhum erro 500 interno
- [ ] Logs não contêm sensíveis

---

## 🚨 Problemas Encontrados?

Se algum teste falhar:

### Teste 1 falha (sem token)
```bash
# Verificar que authMiddleware está em routes/cliente.ts
grep -n "authMiddleware" backend/src/routes/cliente.ts
grep -n "cliente.use" backend/src/routes/cliente.ts
```

### Teste 3 falha (acesso não-autorizado)
```bash
# Verificar validação nos controllers
grep -n "userId !== clienteId" backend/src/controllers/cliente/ClienteDocumentController.ts
grep -n "role !== 'admin'" backend/src/controllers/cliente/ClienteDocumentController.ts
```

### Teste 6 falha (auditoria fake)
```bash
# Verificar que removeu req.body analisadoPor
grep -n "req.body.analisadoPor" backend/src/controllers/cliente/ClienteDocumentController.ts
# Não deve retornar nada

# Verificar que usa req.user.id
grep -n "req.user.id" backend/src/controllers/cliente/ClienteDocumentController.ts
# Deve retornar algo
```

---

## 📊 Relatório de Teste

Salve este relatório ao completar os testes:

```
Data: _______
Ambiente: [ ] Local [ ] Staging [ ] Produção

TESTES MANUAIS
[ ] Teste 1: Sem token (401) ✅/❌
[ ] Teste 2: Token inválido (401) ✅/❌
[ ] Teste 3: Acesso não-autorizado (403) ✅/❌
[ ] Teste 4: Cliente não atualiza status (403) ✅/❌
[ ] Teste 5: Fake analisado_por ignorado ✅/❌

TESTES AUTOMATIZADOS
[ ] Suite inteira rodou ✅/❌
[ ] 29 testes passaram ✅/❌

BANCO DE DADOS
[ ] analisado_por é real ✅/❌
[ ] Nenhum UUID fake ✅/❌

VALIDAÇÃO FINAL
Segurança: [ ] Melhorou significativamente
Compliance: [ ] Atende LGPD/GDPR
Confiança: [ ] Alta
```

---

## 🎓 Referências

- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
