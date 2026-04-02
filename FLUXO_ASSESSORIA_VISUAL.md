# 📊 Fluxo Visual: Criação de Assessoria Jurídica

## 1️⃣ Fluxo Simplificado (Happy Path)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTE EXISTENTE                            │
│                   (já tem conta no app)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  [FRONTEND] Página: AssessoriaJuridica.tsx                      │
│                                                                 │
│  1. Seleciona cliente na listagem                             │
│  2. Preenche formulário com 8 seções:                         │
│     ✓ Dados do caso (serviço, titular, dependentes)          │
│     ✓ Onde será o pedido (consulado/país)                    │
│     ✓ Resumo consultoria                                      │
│     ✓ Documentos e orientações                                │
│     ✓ Dúvidas e respostas                                    │
│     ✓ Pontos fracos e prazos                                  │
│     ✓ Próximos passos (cliente/equipe)                        │
│     ✓ Resumo 1 linha (obrigatório)                           │
│  3. Clica em "Finalizar Assessoria"                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  [handleSubmit] juridicoService.createAssessoria({...})        │
│                                                                 │
│  Payload Enviado:                                              │
│  {                                                              │
│    clienteId: string                                           │
│    respostas: {...} ← Dados de todos os campos                │
│    observacoes?: string                                        │
│    responsavelId?: string                                      │
│    servicoId?: string                                          │
│  }                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  [BACKEND] POST /juridico/assessoria                            │
│  JuridicoController.createAssessoria()                          │
│                                                                 │
│  ETAPA 1: Validação                                            │
│  ✓ clienteId não é null                                        │
│  ✓ respostas não é null                                        │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 2: Criar Assessoria                                     │
│                                                                 │
│  JuridicoRepository.createAssessoria({                         │
│    clienteId,                                                  │
│    responsavelId,  ← do middleware auth                        │
│    respostas,                                                  │
│    servicoId,                                                  │
│    observacoes                                                 │
│  })                                                             │
│                                                                 │
│  → INSERT INTO juridico_assessorias (...)                      │
│  → Retorna: { id, cliente_id, respostas, ... }               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 3: Buscar Serviço (se servicoId fornecido)             │
│                                                                 │
│  AdmRepository.getServiceById(servicoId)                      │
│  → Retorna: { nome, requisitos: [...] }                       │
│                                                                 │
│  Mapear requisitos para documentos:                           │
│  [                                                              │
│    { id, nome, etapa, obrigatorio, status: 'pendente' },    │
│    { id, nome, etapa, obrigatorio, status: 'pendente' },    │
│    ...                                                         │
│  ]                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 4: Sincronizar com Processos                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Cliente JÁ tem processo?                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│           │                                                     │
│      ┌────┴────┐                                               │
│      │          │                                               │
│      ▼          ▼                                               │
│    ✅ SIM       ❌ NÃO                                          │
│      │          │                                               │
│      ▼          ▼                                               │
│  UPDATE        INSERT                                          │
│  processo      processo                                        │
│                                                                 │
│  Update params:        New params:                             │
│  - tipoServico         - clienteId                             │
│  - assessoriaId        - tipoServico                           │
│  - servicoId           - status: 'formularios'                 │
│  - responsavelId       - etapaAtual: 1                         │
│  - documentos          - responsavelId                         │
│                        - assessoriaId                          │
│                        - servicoId                             │
│                        - documentos                            │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 5: Retornar Sucesso (201 Created)                       │
│                                                                 │
│  {                                                              │
│    message: "Assessoria jurídica criada com sucesso...",     │
│    data: {                                                     │
│      id: "ass-uuid-...",                                       │
│      cliente_id: "...",                                        │
│      responsavel_id: "...",                                    │
│      respostas: {...},                                         │
│      criado_em: "2026-04-02T10:30:00Z"                        │
│    }                                                            │
│  }                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  [FRONTEND] Após sucesso                                       │
│                                                                 │
│  1. Marcar assessoria como em andamento:                       │
│     juridicoService.marcarAssessoriaEmAndamento(agendId)      │
│     POST /juridico/agendamentos/{id}/assessoria-em-andamento  │
│                                                                 │
│  2. Buscar processo atualizado:                               │
│     juridicoService.getProcessoByCliente(clienteId)           │
│     GET /juridico/processo-cliente/{clienteId}                │
│                                                                 │
│  3. Mostrar sucesso:                                           │
│     "Assessoria salva com sucesso!" ✓                          │
│                                                                 │
│  4. Redirecionar ou atualizar UI                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Fluxo Completo com Estados do Cliente

```
CLIENTE
┌────────────────────────────────────┐
│  ID: client-123                    │
│  Nome: João Silva                  │
│  Email: joao@example.com           │
│  Stage: pendente_agendamento       │ ◄─── ANTES
│  Status: ativo                     │
└────────────────────────────────────┘
         │
         │ 1. CRIAR ASSESSORIA
         │ (POST /juridico/assessoria)
         │
         ▼
┌────────────────────────────────────┐
│  juridico_assessorias              │
│  ├─ id: ass-456                    │
│  ├─ cliente_id: client-123         │
│  ├─ responsavel_id: user-789       │
│  ├─ respostas: {...}               │ ◄─── NOVA LINHA
│  ├─ criado_em: 2026-04-02          │
│  └─ atualizado_em: 2026-04-02      │
└────────────────────────────────────┘
         │
         │ 2. SINCRONIZAR PROCESSO
         │ (CREATE ou UPDATE)
         │
         ▼
┌────────────────────────────────────┐
│  juridico_processos                │
│  ├─ id: proc-789                   │
│  ├─ cliente_id: client-123         │
│  ├─ assessoria_id: ass-456         │ ◄─── NOVO/ATUALIZADO
│  ├─ tipo_servico: "Viagem ES"      │
│  ├─ status: 'formularios'          │
│  ├─ etapa_atual: 1                 │
│  ├─ documentos: [...]              │ ◄─── MAPEADO DE REQUISITOS
│  └─ responsavel_id: user-789       │
└────────────────────────────────────┘
         │
         │ 3. MARCAR EM ANDAMENTO (opcional)
         │ (POST /juridico/agendamentos/{id}/assessoria-em-andamento)
         │
         ▼
┌────────────────────────────────────┐
│  CLIENTE ATUALIZADO                │
│  Stage: assessoria_andamento       │ ◄─── MUDOU
│  Status: em_consultoria            │
│                                    │
│  Agendamento associado:            │
│  ├─ Status: em_andamento           │
│  ├─ Data: 2026-04-05 10:00         │
│  └─ Jurídico: user-789             │
└────────────────────────────────────┘
```

---

## 3️⃣ Mapeamento de Requisitos → Documentos

```
SERVIÇO SELECIONADO: "Viagem para Espanha"
├─ Id: subserv-123
├─ Nome: "Viagem para Espanha"
│
└─ Requisitos (do catálogo de serviços):
   ├─ { nome: "Passaporte", etapa: 1, obrigatorio: true }
   ├─ { nome: "Extrato Bancário", etapa: 1, obrigatorio: true }
   ├─ { nome: "Contrato de Trabalho", etapa: 1, obrigatorio: false }
   └─ { nome: "Comprovante de Residência", etapa: 2, obrigatorio: true }
      │
      │ MAPEAMENTO
      │
      ▼
DOCUMENTOS NO PROCESSO:
├─ { id: doc-1, nome: "Passaporte", etapa: 1, status: 'pendente', obrigatorio: true }
├─ { id: doc-2, nome: "Extrato Bancário", etapa: 1, status: 'pendente', obrigatorio: true }
├─ { id: doc-3, nome: "Contrato de Trabalho", etapa: 1, status: 'pendente', obrigatorio: false }
└─ { id: doc-4, nome: "Comprovante de Residência", etapa: 2, status: 'pendente', obrigatorio: true }

Cliente pode então:
1. Upload dos documentos
2. Sistema marca como 'enviado'
3. Jurídico revisa e marca como 'aprovado' ou 'rejeitado'
```

---

## 4️⃣ Fluxo de Erros

```
POST /juridico/assessoria
│
├─ VALIDAÇÃO
│  │
│  ├─ clienteId vazio?
│  │  └─ ❌ 400: "clienteId e respostas são obrigatórios"
│  │
│  └─ respostas vazio?
│     └─ ❌ 400: "clienteId e respostas são obrigatórios"
│
├─ CRIAÇÃO DE ASSESSORIA
│  │
│  ├─ Cliente não existe?
│  │  └─ ❌ 500: "Cliente não encontrado"
│  │
│  └─ Erro no banco?
│     └─ ❌ 500: "Erro ao criar assessoria jurídica"
│
├─ SINCRONIZAÇÃO (não falha requisição)
│  │
│  ├─ Serviço não encontrado?
│  │  └─ ⚠️  Log: "Erro ao sincronizar processo..." (mas assessoria foi criada)
│  │
│  └─ Erro ao criar processo?
│     └─ ⚠️  Log: "Erro ao sincronizar processo..." (mas assessoria foi criada)
│
└─ SUCESSO ✅
   └─ 201: Assessoria criada e sincronizada
```

---

## 5️⃣ Tabelas Envolvidas

```
┌─────────────────────────────────────────────────────────────────┐
│                    TABELAS RELACIONADAS                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│   clientes               │
├──────────────────────────┤
│ id (UUID) PK             │
│ nome                     │
│ email                    │
│ stage                    │ ◄─── Muda quando assessoria é criada
│ responsavel_id (FK)      │
└──────────────────────────┘
         △
         │ 1:1
         │
┌──────────────────────────────────────┐
│   juridico_assessorias               │
├──────────────────────────────────────┤
│ id (UUID) PK                         │
│ cliente_id (FK) ─────┐               │
│ responsavel_id (FK)  │               │
│ respostas (JSON)     │               │
│ observacoes          │               │
│ servico_id (FK) ┐    │               │
│ criado_em       │    │               │
│ atualizado_em   │    │               │
└──────────────────────────────────────┘
         │                    │
         │ 1:1                │ FK
         │                    ▼
         │            ┌──────────────────────────┐
         │            │   adm_servicos           │
         │            ├──────────────────────────┤
         │            │ id (UUID) PK             │
         │            │ nome                     │
         │            │ requisitos (JSON)        │
         │            └──────────────────────────┘
         │
         └──────────────────┐
                            │
         ┌──────────────────▼──────────────────┐
         │   juridico_processos                │
         ├─────────────────────────────────────┤
         │ id (UUID) PK                        │
         │ cliente_id (FK)                     │
         │ assessoria_id (FK) ────┐            │
         │ servico_id (FK)        │ Vinculado │
         │ tipo_servico           │            │
         │ status                 │            │
         │ etapa_atual            │            │
         │ responsavel_id (FK)    │            │
         │ documentos (JSON)      │            │
         │ requerimentos (JSON)   │            │
         │ criado_em              │            │
         │ atualizado_em          │            │
         └─────────────────────────────────────┘
              │
              │ 1:N
              │
         ┌────▼──────────────────────┐
         │   agendamentos            │
         ├───────────────────────────┤
         │ id (UUID) PK              │
         │ processo_id (FK)          │
         │ cliente_id (FK)           │
         │ responsavel_id (FK)       │
         │ data_hora                 │
         │ status                    │
         │ tipo: 'assessoria'        │
         └───────────────────────────┘
```

---

## 6️⃣ Estados Possíveis do Processo

```
STATUS: 'formularios'
├─ Significado: Esperando cliente preencher formulários
├─ Etapa: 1
└─ Próxima ação: Cliente envia documentos

    ↓ (após cliente enviar documentos)

STATUS: 'em_andamento'
├─ Significado: Jurídico está analisando
├─ Etapa: 2-3
└─ Próxima ação: Jurídico finaliza

    ↓ (após jurídico finalizar)

STATUS: 'concluido'
├─ Significado: Processo finalizado
├─ Etapa: final
└─ Próxima ação: Arquivo

    ↓ (após longo tempo)

STATUS: 'arquivado'
├─ Significado: Processo arquivado
└─ Próxima ação: Nenhuma
```

---

## 7️⃣ Fluxo de Dados: JSON Respostas

```json
{
  "servico_contratado": "Viagem para Espanha",
  "titular_nome": "João Silva",
  "dependentes_info": "Esposa Maria, Filhos Pedro e Ana",
  "pedido_para": "titular_dependentes",
  "pedido_para_detalhe": "Visto de residência",
  "local_solicitacao": "espanha",
  "consulado_cidade": "Madri",
  "cidade_protocolo": "Madri",
  "cidade_chegada": "Barcelona",
  "data_chegada": "2026-06-15",
  "resumo_executivo": "Perfil baixo risco, documentação completa",
  "docs_titular": "Passaporte, Extrato, Contrato",
  "docs_dependentes": "Passaportes, Certidões",
  "orientacoes_praticas": "Comparecer pessoalmente com originais",
  "duvidas_cliente": "Qual prazo? Quanto custa?",
  "respostas_dadas": "30 dias, €500 por pessoa",
  "pontos_fracos": "Documentação de renda poderia ser mais forte",
  "prazos_delicados": "Passaporte vence em 10 meses",
  "proximos_cliente": "Preparar documentação",
  "proximos_equipe": "Revisar e agendar entrevista",
  "resumo_1_linha": "Viagem familiar para Barcelona, aprovação esperada em 45 dias"
}
        │
        │ ARMAZENADO EM:
        ▼
juridico_assessorias.respostas (JSON)
```

---

## 8️⃣ Checklist: O que Deve Acontecer

- [ ] **Assessoria criada** em `juridico_assessorias`
- [ ] **Processo criado OU atualizado** em `juridico_processos`
- [ ] **Documentos mapeados** a partir de requisitos do serviço
- [ ] **Cliente vinculado** à assessoria
- [ ] **Responsável vinculado** à assessoria
- [ ] **Status do cliente atualizado** para `assessoria_andamento`
- [ ] **Resposta HTTP 201** com dados da assessoria
- [ ] **Transição de etapas** funciona corretamente
- [ ] **Agendamento vinculado** (se aplicável)
- [ ] **Notificações enviadas** (se implementado)

