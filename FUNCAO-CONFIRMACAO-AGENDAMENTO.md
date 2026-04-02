# 📌 Função de Confirmação de Agendamento de Assessoria

## 🎯 Resumo Executivo

Um agendamento de **assessoria é confirmado** quando:

```
1. O PAGAMENTO é aprovado (PIX, boleto, etc)
2. E O FORMULÁRIO foi preenchido
3. Então a função aprovarComprovante() é chamada
4. E o status muda para 'confirmado'
```

---

## 🔍 Onde Está a Função

### Backend
- **Arquivo:** `backend/src/controllers/financeiro/FinanceiroController.ts`
- **Linha:** 252
- **Função:** `async aprovarComprovante(req, res)`

### Rota
- **Método:** POST
- **Endpoint:** `/financeiro/comprovante/:id/aprovar`
- **Arquivo de rotas:** `backend/src/routes/financeiro.ts` (linha 10)

### Repository
- **Arquivo:** `backend/src/repositories/ComercialRepository.ts`
- **Função:** `updateAgendamentoStatus(id, status)`
- **Linha:** 58

---

## 📊 Fluxo Completo de Confirmação

```
┌────────────────────────────────────────────────────────┐
│ Cliente envia comprovante de pagamento (PIX/Boleto)    │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ Financeiro aprova o comprovante                        │
│ POST /financeiro/comprovante/:id/aprovar               │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ FinanceiroController.aprovarComprovante()              │
│                                                         │
│ 1. Busca o agendamento                                 │
│ 2. Verifica se formulário foi preenchido               │
│ 3. Verifica conflitos de horário                       │
│ 4. Define novo status:                                 │
│    - Se formulário = SIM → status = 'confirmado'       │
│    - Se formulário = NÃO → status = 'agendado'         │
│ 5. Atualiza status no banco                            │
└──────────────┬───────────────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
   ✅ SIM        ❌ NÃO
 confirmado     agendado
        │             │
        │        ┌────┴─────────┐
        │        │ Aguarda      │
        │        │ formulário   │
        │        │ ser          │
        │        │ preenchido   │
        │        └──────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────┐
│ Se status = 'confirmado':                              │
│                                                         │
│ 1. Gera link do Google Meet                            │
│ 2. Salva link no banco                                 │
│ 3. Envia email de boas-vindas ao cliente               │
│ 4. Gera nova senha temporária                          │
│ 5. Cria notificação para cliente                       │
└────────────────────────────────────────────────────────┘
```

---

## 🔧 Código da Função `aprovarComprovante`

**Localização:** `FinanceiroController.ts` linha 252

```typescript
async aprovarComprovante(req: any, res: any) {
    try {
        // 1. Extrai agendamento_id do request
        const { agendamento_id: id } = req.body
        
        if (!id) {
            return res.status(400).json({ 
                message: 'agendamento_id é obrigatório' 
            })
        }

        // 2. Busca agendamento no banco
        const { data: agendamento, error: agendamentoError } = await supabase
            .from('agendamentos')
            .select('*')
            .eq('id', id)
            .single()

        if (agendamentoError || !agendamento) {
            return res.status(404).json({ 
                message: 'Agendamento não encontrado' 
            })
        }

        // 3. Atualiza pagamento_status para 'aprovado'
        const { error: updatePaymentError } = await supabase
            .from('agendamentos')
            .update({ pagamento_status: 'aprovado' })
            .eq('id', id)

        // 4. Verifica se formulário foi preenchido
        const { data: formData } = await supabase
            .from('formularios_cliente')
            .select('id')
            .eq('agendamento_id', id)
            .maybeSingle()
        
        let formularioPreenchido = !!formData

        // 5. Define novo status
        let novoStatus = formularioPreenchido ? 'confirmado' : 'agendado'
        
        // 6. Atualiza status
        await ComercialRepository.updateAgendamentoStatus(id, novoStatus)
        
        // 7. SE STATUS = 'confirmado', faz mais coisas:
        if (novoStatus === 'confirmado') {
            // 7a. Gera Google Meet link
            const eventResult = await ComposioService.createCalendarEvent(...)
            
            // 7b. Salva link no banco
            await ComercialRepository.updateMeetLink(id, eventResult.eventLink)
            
            // 7c. Envia email de boas-vindas
            await EmailService.sendWelcomeEmail({
                to: agendamento.email,
                clientName: agendamento.nome,
                loginUrl: frontendUrl,
                email: agendamento.email,
                senha: senhaGerada
            })
            
            // 7d. Cria notificação
            return res.status(200).json({
                success: true,
                message: 'Comprovante aprovado e agendamento confirmado!'
            })
        }
        
        // Se status = 'agendado', retorna que formulário é necessário
        return res.status(200).json({
            success: true,
            message: 'Comprovante aprovado. Aguardando preenchimento do formulário.'
        })
        
    } catch (error: any) {
        console.error('Erro ao aprovar comprovante:', error)
        return res.status(500).json({
            message: 'Erro ao aprovar comprovante',
            error: error.message
        })
    }
}
```

---

## 🔑 Função Chave: `updateAgendamentoStatus`

**Localização:** `ComercialRepository.ts` linha 58

```typescript
async updateAgendamentoStatus(id: string, status: string) {
    // 1. Atualiza status no banco
    const { data, error } = await supabase
        .from('agendamentos')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw error
    }

    // 2. Se status for 'confirmado' E pagamento foi aprovado
    if (status === 'confirmado' && data?.pagamento_status === 'aprovado' && data.cliente_id) {
        try {
            // Cria notificação para cliente
            await NotificationService.createNotification({
                clienteId: data.cliente_id,
                titulo: 'Agendamento Confirmado',
                mensagem: `Seu agendamento de "${data.produto_nome}" 
                           para ${formatDate(data.data_hora)} foi confirmado!`,
                tipo: 'agendamento',
                dataPrazo: data.data_hora
            })
        } catch (notifError) {
            console.error('Erro ao criar notificação:', notifError)
        }
    }

    return data
}
```

---

## ⚙️ Conditions para Status = 'confirmado'

```
STATUS MUDA PARA 'confirmado' SE:

✅ Pagamento foi aprovado (pagamento_status = 'aprovado')
AND
✅ Formulário foi preenchido (existe registro em formularios_cliente)
AND
❌ Não há conflito de horário

SE ALGUMA DESSAS FALHAR:

❌ Pagamento NÃO aprovado
  → status = 'agendado'
  → aguarda pagamento ser aprovado

❌ Formulário NÃO preenchido
  → status = 'agendado'
  → aguarda cliente preencher formulário

✅ Conflito de horário detectado
  → status = 'Conflito'
  → agenda não pode confirmar
```

---

## 📋 Fluxo de Assessoria (Passo-a-Passo)

### Passo 1: Cliente Agenda Assessoria
```
POST /comercial/agendamentos
├─ nome: "João Silva"
├─ email: "joao@email.com"
├─ produto_id: "assessoria-xxx"
├─ data_hora: "2026-04-15T10:00:00"
└─ status: 'agendado'  ← Status inicial
```

### Passo 2: Cliente Envia Comprovante de Pagamento
```
POST /comercial/agendamentos/:id/comprovante
├─ comprovante_url: "https://..."
├─ metodo_pagamento: "pix"
└─ status agendamento: muda para 'aguardando_verificacao'
```

### Passo 3: Financeiro Aprova Comprovante
```
POST /financeiro/comprovante/:agendamento_id/aprovar
├─ Valida comprovante
├─ pagamento_status: 'aprovado'
├─ Verifica formulário preenchido
└─ Status agendamento: muda para?
```

### Passo 4: Status Muda para Confirmado (Se Formulário Preenchido)

**SE formulário PREENCHIDO:**
```
POST /formulario/cliente
├─ Formulário preenchido pelo cliente
├─ Status agendamento: muda para 'agendado'
└─ Próximo: Financeiro aprova comprovante
    └─ Status muda para 'confirmado' ✅
```

**ENTÃO (status = 'confirmado'):**
```
1. Gera Google Meet link
2. Envia email de boas-vindas
3. Gera senha temporária
4. Cliente recebe notificação
5. Pode acessar plataforma e participar da assessoria
```

---

## 🔄 Transições de Status para Assessoria

```
AGENDADO
    │
    ├─ Cliente preenche formulário
    │
    ▼
AGENDADO (com formulário)
    │
    ├─ Cliente envia comprovante de pagamento
    │
    ▼
AGUARDANDO_VERIFICACAO
    │
    ├─ Financeiro aprova comprovante
    │
    ▼
CONFIRMADO ✅
    │
    ├─ Data/hora do agendamento chega
    │
    ▼
REALIZADO
    │
    └─ Assessoria foi feita com sucesso
```

---

## 📱 Chamadas da API para Confirmar Agendamento

### Via CURL

```bash
# 1. Obter agendamento_id
curl -X GET "http://localhost:3000/api/comercial/agendamentos" \
  -H "Authorization: Bearer TOKEN" | jq '.data[] | select(.status == "aguardando_verificacao")'

# 2. Aprovar comprovante (confirma o agendamento)
curl -X POST "http://localhost:3000/api/financeiro/comprovante/AGENDAMENTO_ID/aprovar" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Via Frontend (se existir)

```typescript
// Chamar a função de aprovação
const aprovarAgendamento = async (agendamentoId: string) => {
  const response = await fetch(
    `/api/financeiro/comprovante/${agendamentoId}/aprovar`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    }
  );
  return response.json();
};
```

---

## 📊 Estados Possíveis do Agendamento

| Status | Significado | Próximo Passo |
|--------|-------------|---------------|
| `agendado` | Cliente agendou | Cliente paga |
| `aguardando_verificacao` | Pagamento enviado | Financeiro aprova |
| `confirmado` | Tudo ok, assessoria confirmada | Realizar assessoria |
| `em_consultoria` | Assessoria em andamento | Finalizar |
| `realizado` | Assessoria realizada | Finalizar |
| `cancelado` | Cancelado | Nada |
| `Conflito` | Conflito de horário | Agendar nova data |

---

## 📧 Email Enviado ao Confirmar

**Quando status muda para 'confirmado', email enviado contém:**

```
Assunto: Bem-vindo ao [Empresa]!

Conteúdo:
- Confirmação do agendamento
- Data e hora da assessoria
- Link do Google Meet
- Credenciais de acesso (email + senha temporária)
- Instruções de como participar
```

---

## 🔔 Notificações Criadas

**Quando agendamento é confirmado:**

```javascript
{
  clienteId: "cliente-123",
  titulo: "Agendamento Confirmado",
  mensagem: "Seu agendamento de 'Assessoria Jurídica' para 15/04/2026 às 10:00 foi confirmado com sucesso!",
  tipo: "agendamento",
  dataPrazo: "2026-04-15T10:00:00",
  lido: false
}
```

---

## 🎯 Checklist: O que Acontece quando Agendamento é Confirmado

- [ ] Status muda de 'agendado' para 'confirmado'
- [ ] Google Meet link é gerado
- [ ] Meet link é salvo no banco de dados
- [ ] Nova senha temporária é gerada
- [ ] Email de boas-vindas é enviado
- [ ] Notificação é criada no painel do cliente
- [ ] Cliente pode fazer login com nova senha
- [ ] Cliente vê link do Google Meet
- [ ] Timeline do cliente é atualizada
- [ ] Agendamento aparece como "confirmado" na plataforma

---

## ❌ Motivos pelos Quais Status NÃO Muda para 'confirmado'

1. **Pagamento não aprovado**
   - Status continua: `agendado`
   - Aguarda: Financeiro aprovar comprovante

2. **Formulário não preenchido**
   - Status fica: `agendado`
   - Aguarda: Cliente preencher formulário
   - **Depois** financeiro aprova e status muda para `confirmado`

3. **Conflito de horário**
   - Status fica: `Conflito`
   - Motivo: Outro agendamento no mesmo horário
   - Ação: Cliente precisa agendar nova hora

4. **Erro no processamento**
   - Status fica: `aguardando_verificacao`
   - Motivo: Erro ao processar (banco indisponível, etc)
   - Ação: Financeiro tenta aprovar novamente

---

## 🔗 Arquivos Relacionados

| Arquivo | Função | Responsabilidade |
|---------|--------|-----------------|
| `FinanceiroController.ts` | `aprovarComprovante` | Aprova pagamento e muda status |
| `ComercialRepository.ts` | `updateAgendamentoStatus` | Atualiza status no banco |
| `financeiro.ts` (rotas) | POST `/comprovante/:id/aprovar` | Define endpoint |
| `ComercialController.ts` | `createAgendamento` | Cria agendamento inicial |
| `FormularioController.ts` | `submitFormulario` | Marca que formulário foi preenchido |
| `NotificationService.ts` | `createNotification` | Envia notificação ao cliente |

---

## 📚 Resumo de Fluxo para Assessoria

```
1. CLIENTE AGENDA
   └─ POST /comercial/agendamentos
      └─ Status: 'agendado'

2. CLIENTE PREENCHE FORMULÁRIO
   └─ POST /formulario/cliente
      └─ Status: 'agendado' (com formulário)

3. CLIENTE ENVIA COMPROVANTE
   └─ POST /comercial/agendamentos/:id/comprovante
      └─ Status: 'aguardando_verificacao'

4. FINANCEIRO APROVA
   └─ POST /financeiro/comprovante/:id/aprovar
      └─ Status: 'confirmado' ✅ (SE formulário foi preenchido)

5. GERA GOOGLE MEET + EMAIL
   └─ Email de boas-vindas
   └─ Google Meet link gerado
   └─ Notificação criada

6. CLIENTE PARTICIPA
   └─ Faz login com credenciais
   └─ Acessa Google Meet
   └─ Participa da assessoria

7. FINALIZANDO
   └─ Assessoria realizada
   └─ Status: 'realizado'
```

---

## 🎯 Para Testar a Confirmação

```bash
# 1. Criar agendamento
curl -X POST "http://localhost:3000/api/comercial/agendamentos" \
  -H "Authorization: Bearer TOKEN" \
  -d '{ "nome": "Teste", "email": "teste@email.com", "produto_id": "xxx", "data_hora": "2026-06-15T10:00:00", "status": "agendado" }'

# 2. Preencher formulário
curl -X POST "http://localhost:3000/api/formulario/cliente" \
  -H "Authorization: Bearer TOKEN" \
  -d '{ "agendamento_id": "AGENDAMENTO_ID", "respostas": {...} }'

# 3. Enviar comprovante
curl -X POST "http://localhost:3000/api/comercial/agendamentos/AGENDAMENTO_ID/comprovante" \
  -H "Authorization: Bearer TOKEN" \
  -F "comprovante_url=http://..." \
  -F "metodo_pagamento=pix"

# 4. Aprovar comprovante (CONFIRMA O AGENDAMENTO)
curl -X POST "http://localhost:3000/api/financeiro/comprovante/AGENDAMENTO_ID/aprovar" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# 5. Verificar se foi confirmado
curl -X GET "http://localhost:3000/api/comercial/agendamentos/AGENDAMENTO_ID" \
  -H "Authorization: Bearer TOKEN" | jq '.status'
# Deve retornar: "confirmado"
```

