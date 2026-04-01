# Retomar: Reestruturação do Catálogo de Serviços e Contratos

**Branch:** `feat/catalog-restructure-contratos`
**Spec:** `docs/superpowers/specs/2026-03-31-catalogo-servicos-contratos-design.md`
**Plano:** `docs/superpowers/plans/2026-03-31-catalogo-servicos-contratos.md`

---

## Como retomar

Diga ao Claude:

> "Leia o arquivo RETOMAR_CATALOG_REFACTOR.md e continue a implementação de onde paramos, usando Subagent-Driven Development."

---

## Status das Tasks

| # | Task | Status | Commit |
|---|---|---|---|
| 1 | Database Migration (SQL file) | ✅ CONCLUÍDO | `0bd360d` |
| 2 | AdmRepository — `derivarTipo` + `createCatalogService` | ✅ CONCLUÍDO | `c358a75` |
| 3 | AdmRepository — `updateCatalogService` refactor | ⏳ PENDENTE | — |
| 4 | ContratoServicoRepository — estender join | ⏳ PENDENTE | — |
| 5 | AdmController — null-safety + novos campos | ⏳ PENDENTE | — |
| 6 | ComercialController — fix bug PDF template | ⏳ PENDENTE | — |
| 7 | catalogService.ts — novos tipos frontend | ⏳ PENDENTE | — |
| 8 | ServiceCatalog.tsx — refactor completo do modal | ⏳ PENDENTE | — |

---

## ⚠️ AÇÃO MANUAL NECESSÁRIA (antes de continuar)

**A migração SQL ainda precisa ser executada no Supabase:**

1. Abrir o Supabase Dashboard → SQL Editor
2. Copiar o conteúdo de `backend/database_migration_servicos.sql`
3. Executar
4. Verificar com:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'catalogo_servicos'
  AND column_name IN ('contrato_template_id','possui_subservicos','tipo_preco','is_agendavel');
-- Deve retornar 4 linhas

SELECT column_name FROM information_schema.columns
WHERE table_name = 'servico_requisitos' AND column_name = 'tipo_documento';
-- Deve retornar 1 linha
```

---

## Detalhes das Tasks Pendentes

---

### Task 3: AdmRepository — `updateCatalogService` refactor

**Arquivo:** `backend/src/repositories/AdmRepository.ts`

**O que fazer:**

1. Substituir o bloco de destructuring no início de `updateCatalogService`:
```typescript
// NOVO
const {
  name, value, duration, showInCommercial, showToClient, requiresLegalDelegation,
  documents, subservices,
  isAgendavel, tipoPreco, contratoTemplateId, possuiSubservicos
} = data;

const tipoDerivado = this.derivarTipo({ contratoTemplateId, isAgendavel });
const valorFinal = tipoPreco === 'fixo' ? (value || null) : null;
```

2. Substituir o `updatePayload` (remover o bloco `if (type || data.tipo) {...}`):
```typescript
const updatePayload: any = {
  nome: name,
  valor: valorFinal,
  duracao: duration,
  tipo: tipoDerivado,  // SEMPRE derivado, nunca de data.tipo
  exibir_comercial: showInCommercial,
  exibir_cliente: showToClient,
  requer_delegacao_juridico: requiresLegalDelegation,
  contrato_template_id: contratoTemplateId ?? null,
  possui_subservicos: possuiSubservicos ?? false,
  tipo_preco: tipoPreco ?? 'por_contrato',
  is_agendavel: isAgendavel ?? false,
  atualizado_em: new Date().toISOString(),
};
// REMOVER: if (type || data.tipo) { updatePayload.tipo = type || data.tipo }
```

3. Adicionar `tipo_documento` nos dois blocos de INSERT em `servico_requisitos` dentro de `updateCatalogService`:
```typescript
tipo_documento: doc.tipoDocumento ?? 'titular',
```

4. Rodar testes: `cd backend && npx vitest run src/repositories/__tests__/AdmRepository.test.ts`
5. Commit: `feat(adm): updateCatalogService uses derivarTipo, adds tipo_documento`

---

### Task 4: ContratoServicoRepository — Estender join

**Arquivo:** `backend/src/repositories/ContratoServicoRepository.ts`

**O que fazer:**

Localizar em `getContratoById` (~linha 79):
```typescript
// ANTES
servico:catalogo_servicos(id, nome, valor, tipo)

// DEPOIS
servico:catalogo_servicos(id, nome, valor, tipo, contrato_template_id)
```

Commit: `feat(contratos): include contrato_template_id in servico join`

---

### Task 5: AdmController — null-safety + novos campos

**Arquivo:** `backend/src/controllers/adm/AdmController.ts`

**O que fazer:**

Substituir o bloco `mapped` em `getCatalog` (linha ~12):
```typescript
const mapped = services.map((s: any) => ({
  id: s.id,
  name: s.nome,
  value: s.valor != null ? s.valor.toString() : '',  // null-safe
  duration: s.duracao,
  type: s.tipo || 'agendavel',
  isAgendavel: s.is_agendavel ?? false,
  tipoPreco: s.tipo_preco ?? 'por_contrato',
  contratoTemplateId: s.contrato_template_id ?? null,
  possuiSubservicos: s.possui_subservicos ?? false,
  showInCommercial: s.exibir_comercial,
  showToClient: s.exibir_cliente,
  requiresLegalDelegation: s.requer_delegacao_juridico || false,
  documents: (s.requisitos || [])
    .filter((r: any) => !r.subservico_id)
    .map((r: any) => ({
      id: r.id,
      name: r.nome,
      stage: r.etapa,
      required: r.obrigatorio,
      tipoDocumento: r.tipo_documento ?? 'titular',
    })),
  subservices: (s.subservicos || []).map((sub: any) => ({
    id: sub.id,
    name: sub.nome,
    documents: (sub.requisitos || []).map((r: any) => ({
      id: r.id,
      name: r.nome,
      stage: r.etapa,
      required: r.obrigatorio,
      tipoDocumento: r.tipo_documento ?? 'titular',
    }))
  }))
}));
```

Commit: `fix(adm): null-safe valor + expose new catalog fields in getCatalog`

---

### Task 6: ComercialController — Fix bug PDF template

**Arquivos:**
- `backend/src/controllers/comercial/ComercialController.ts`
- `backend/src/controllers/__tests__/ComercialController.test.ts`

**O que fazer:**

1. Nos testes (~linha 68 e ~539), atualizar `mockServico`:
```typescript
// ANTES
const mockServico = { id: 'servico-1', tipo: 'fixo', nome: 'Assessoria' };
// DEPOIS
const mockServico = { id: 'servico-1', tipo: 'fixo', nome: 'Assessoria', contrato_template_id: 'template-uuid-1' };
```

2. Em `gerarContratoPdf` (~linha 1377), substituir:
```typescript
// ANTES
const pdfResult = await HtmlPdfService.gerarContratoAssessoria(id, contrato.draft_dados)

// DEPOIS
const templateId = (contrato.servico as any)?.contrato_template_id ?? null
const pdfResult = await HtmlPdfService.gerarContratoAssessoria(templateId, contrato.draft_dados)
```

3. Rodar testes: `cd backend && npx vitest run src/controllers/__tests__/ComercialController.test.ts`
4. Commit: `fix(pdf): use contrato_template_id from servico join for PDF generation`

---

### Task 7: catalogService.ts — Novos tipos frontend

**Arquivo:** `frontendBoraExpandir/src/modules/adm/services/catalogService.ts`

**O que fazer:**

Substituir as interfaces e o export object:
```typescript
export interface DocumentRequirement {
  id: string;
  name: string;
  stage: string;
  required: boolean;
  tipoDocumento: 'titular' | 'dependente';  // NOVO
}

export interface Subservice {
  id: string;
  name: string;
  servicoId?: string;
  servicoNome?: string;
  documents: DocumentRequirement[];
}

export type ServiceType = 'fixo' | 'agendavel' | 'diverso';
export type TipoPreco = 'fixo' | 'por_contrato';  // NOVO

export interface Service {
  id: string;
  name: string;
  value: string;
  duration: string;
  type: ServiceType;
  isAgendavel: boolean;           // NOVO
  tipoPreco: TipoPreco;           // NOVO
  contratoTemplateId: string | null; // NOVO
  possuiSubservicos: boolean;     // NOVO
  showInCommercial: boolean;
  showToClient: boolean;
  requiresLegalDelegation: boolean;
  documents: DocumentRequirement[];
  subservices: Subservice[];
}
```

Remover as funções `getSubservices`, `createSubservice`, `updateSubservice`, `deleteSubservice` e suas entradas no export object `catalogService`.

Commit: `feat(types): add TipoPreco, tipoDocumento, new Service fields, remove standalone subservice APIs`

---

### Task 8: ServiceCatalog.tsx — Refactor completo do modal

**Arquivo:** `frontendBoraExpandir/src/modules/adm/pages/admin/ServiceCatalog.tsx`

Esta é a maior task. Ver o plano completo em:
`docs/superpowers/plans/2026-03-31-catalogo-servicos-contratos.md` — seção "Task 8"

**Resumo das mudanças:**

**REMOVER:**
- Estado: `allSubservices`, `isSubDialogOpen`, `editingSubservice`, `isSavingSub`, `subFormData`, `linkedSubIds`, `subSearchTerm`, `subservicesExpanded`
- Handlers: `handleOpenAddSubservice`, `handleOpenEditSubservice`, `handleSaveSubservice`, `handleDeleteSubservice`
- UI: Botão "Novo Subserviço" no cabeçalho
- UI: Seção inteira "SECAO 2: SUBSERVICOS" (Card com tabela)
- UI: Dialog standalone de subserviço

**ADICIONAR:**
- Import: `useAuth` de `@/contexts/AuthContext`
- Import: `TipoPreco, DocumentRequirement` de `catalogService`
- Estado: `contratoTemplates`, `showSubActivationWarning`, `showSubDeactivationWarning`
- `const { token } = useAuth()` no topo do componente
- Campos em `formData`: `isAgendavel`, `tipoPreco`, `contratoTemplateId`, `possuiSubservicos`
- `fetchAll` busca templates via `/adm/contratos` usando `token`
- Toggle "É Agendável?" (substitui o Select de tipo)
- Toggle "Tipo de Preço" (Por Contrato / Preço Fixo com campo €)
- Dropdown "Contrato Vinculado" (opcional, carrega `contratoTemplates`)
- Toggle "Possui Subserviços?" com `handleTogglePossuiSubservicos`
- Construtor inline de subserviços (se `possuiSubservicos=true`)
- Seção de docs diretos no serviço (se `possuiSubservicos=false`)
- Botões "Doc Titular" e "Doc Dependente" com badge colorido
- Dialog de aviso: ativação de subserviços (quando serviço já tem docs)
- Dialog de aviso: desativação de subserviços (quando subserviços já têm docs)
- Coluna "Valor" na tabela mostra "Por Contrato" quando valor está vazio
- Badge de "Contrato vinculado" na coluna de tipo da tabela

**Handlers novos necessários:**
- `handleTogglePossuiSubservicos(value: boolean)` — com lógica de aviso
- `handleAddDocToService(tipo)` / `handleUpdateServiceDoc` / `handleRemoveServiceDoc`
- `handleAddSubservice()` / `handleUpdateSubserviceName` / `handleRemoveSubservice`
- `handleAddDocToSubservice(subIdx, tipo)` / `handleUpdateSubDoc` / `handleRemoveSubDoc`

Ver código completo no plano: `docs/superpowers/plans/2026-03-31-catalogo-servicos-contratos.md`

Commit: `feat(catalog): refactor service modal with inline subservices, tipo_preco, contrato dropdown, doc titular/dependente`

---

## Verificação Final (Task 9)

Após todas as tasks:

```bash
# Testes backend
cd backend && npx vitest run

# Type check frontend
cd frontendBoraExpandir && npx tsc --noEmit
```

Verificação no Supabase após criar um serviço com contrato e subserviços:
```sql
SELECT id, nome, tipo, tipo_preco, is_agendavel, contrato_template_id, possui_subservicos, valor
FROM catalogo_servicos ORDER BY criado_em DESC LIMIT 1;
```

---

## Contexto Importante

- **Campo `tipo`** não pode ser removido — usado por 18 arquivos (ComercialController, FinanceiroController, ComissaoService, DelegacaoFila, MeusAgendamentos, ServicosComerciais, etc.)
- **`tipo` é derivado** no backend via `derivarTipo()`: `contratoTemplateId IS NOT NULL` → `'fixo'`; `isAgendavel=true` → `'agendavel'`; default → `'diverso'`
- **Bug PDF**: `gerarContratoAssessoria` recebia o ID da venda em vez do ID do template — Task 6 corrige isso
- **Token auth**: usar `useAuth()` do contexto, não `localStorage`
