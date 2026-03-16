# Walkthrough: Servicos Comerciais

## Overview
Implementa a tipagem de servicos no catalogo e adiciona uma nova pagina de Servicos no comercial.
Organiza a navegacao por servicos fixos, agendaveis e diversos, e habilita o fluxo completo de contratos fixos.
Inclui envio de contrato (PDF mock), uploads, aprovacao/recusa, comprovantes e liberacao de agendamento pago.

## Objective
- Documentar a logica estrutural da feature.
- Registrar o fluxo principal de execucao.
- Permitir que um agente retome manutencao futura sem precisar redescobrir tudo no codigo.

## Scope
- Cobre o catalogo de servicos com campo tipo (fixo, agendavel, diverso).
- Cobre a pagina Comercial > Servicos e o fluxo de contratos fixos (comercial, cliente e financeiro).
- Nao cobre regras de contratos reais nem integracoes juridicas adicionais.
- Modulos: Adm (catalogo), Comercial (servicos, contratos), Cliente (contratos), Financeiro (comprovantes), DNA.

## Entry Points
- Endpoint(s):
- `GET /adm/catalog`
- `POST /adm/catalog`
- `PATCH /adm/catalog/:id`
- `POST /comercial/contratos`
- `GET /comercial/contratos`
- `GET /comercial/contratos/:id`
- `POST /comercial/contratos/:id/upload`
- `POST /comercial/contratos/:id/aprovar`
- `POST /comercial/contratos/:id/recusar`
- `POST /comercial/contratos/:id/comprovante`
- `GET /cliente/contratos`
- `POST /cliente/contratos/:id/upload`
- `POST /cliente/contratos/:id/comprovante`
- `GET /financeiro/contratos/comprovantes/pendentes`
- `POST /financeiro/contratos/comprovante/:id/aprovar`
- `POST /financeiro/contratos/comprovante/:id/recusar`

- Tela(s):
- `/adm/services` (Configurar Servicos)
- `/comercial/servicos`
- `/comercial/contratos`
- `/comercial/contratos/:id`
- `/cliente/contratos`
- `/financeiro/comprovantes`
- DNA do Cliente > aba "Comprovantes/Contratos"

- Evento(s):
- Nao aplicavel (fluxo iniciado por acao do usuario).

- Job(s):
- Nao aplicavel.

- Command(s):
- Nao aplicavel.

- Trigger(s) internos:
- Envio de email no momento da criacao do contrato fixo.

## Main Flow
1. O usuario comercial acessa a pagina de Servicos e escolhe um servico.
2. Para agendaveis, o sistema direciona para agendamento com produto pre-selecionado e passo do lead.
3. Para fixos, o usuario seleciona o lead/cliente e cria um contrato fixo.
4. O backend persiste o contrato em `contratos_servicos`, envia email com link e PDF mock.
5. O cliente faz upload do contrato assinado na area do cliente; o comercial aprova ou recusa.
6. Contratos aprovados aparecem no DNA e liberam upload de comprovante de pagamento.
7. O financeiro aprova/recusa o comprovante; ao aprovar, o comercial pode agendar com pagamento confirmado.

## Business Rules
- Somente servicos com `tipo = fixo` podem gerar contratos.
- Servicos sem tipo sao tratados como `agendavel`.
- Upload de comprovante so e permitido apos assinatura aprovada.
- Contratos aprovados aparecem no DNA e exibem PDF/Comprovante quando disponiveis.
- Agendamento pos-contrato nasce com `pagamento_status = aprovado` e `status = confirmado`.
- Diversos sao exibidos como mock (sem acao).

## Data Contract
### Inputs
- Campo: `tipo` em `catalogo_servicos`
- Origem: Admin "Configurar Servicos"
- Obrigatorio: Nao (default `agendavel`)
- Validacao: deve ser `fixo` | `agendavel` | `diverso`

- Campo: `cliente_id`, `servico_id`
- Origem: Comercial > Servicos (fixos)
- Obrigatorio: Sim
- Validacao: servico precisa ser `fixo`

- Campo: arquivo de contrato assinado
- Origem: Cliente ou Comercial
- Obrigatorio: Sim
- Validacao: PDF ou imagem

- Campo: arquivo de comprovante
- Origem: Cliente ou Comercial
- Obrigatorio: Sim
- Validacao: PDF ou imagem

### Outputs
- Campo: `contrato_assinado_url`
- Destino: UI Comercial/Cliente e DNA
- Formato: URL publica
- Impacto: habilita aprovacao e exibicao

- Campo: `pagamento_status`
- Destino: UI Comercial/Cliente/Financeiro
- Formato: `pendente` | `em_analise` | `aprovado` | `recusado`
- Impacto: libera agendamento quando aprovado

## Side Effects
- Escrita em banco: `catalogo_servicos.tipo`, `contratos_servicos`, updates de status.
- Publicacao em fila: Nao aplicavel.
- Envio de e-mail/notificacao: email de contrato com PDF mock anexado.
- Cache: Nao aplicavel.
- Logs: controllers logam erros e status de uploads.
- Integracoes externas: Supabase Storage (bucket `documentos`).

## Error Handling
- Erro de validacao: faltam IDs/arquivo ou servico nao e fixo.
- Erro de dependencia externa: falha no upload do Supabase ou envio de email.
- Erro de persistencia: falha ao inserir/atualizar contratos.
- Fallback: contrato criado mesmo se envio de email falhar (logado).
- Retry: Nao aplicavel.
- Idempotencia: Nao aplicavel.

## Code Map
- Arquivo principal: `backend/src/controllers/ComercialController.ts`
- Servico principal: `backend/src/repositories/ContratoServicoRepository.ts`
- Controller / handler: `ClienteController`, `FinanceiroController`, `AdmController`
- Modelos / entidades: tabela `contratos_servicos`, coluna `catalogo_servicos.tipo`
- Helpers relevantes: `backend/src/services/EmailService.ts`
- Testes relacionados: Nao aplicavel (nao ha testes automatizados neste fluxo).

## Invariants
- Contrato fixo nao deve existir para servico `agendavel` ou `diverso`.
- Upload de comprovante nao deve ocorrer antes da assinatura aprovada.
- Contrato aprovado deve manter `contrato_assinado_url` valido.
- Agendamento pos-contrato deve sair como pago/confirmado.

## Observability
- Logs esperados: erros de upload, erros de email, criacao de contrato.
- Metricas uteis: quantidade de contratos por status, tempo entre assinatura e aprovacao.
- Alertas: falhas recorrentes de upload no bucket `documentos`.
- Como diagnosticar falhas nesta feature: verificar logs do controller e estado em `contratos_servicos`.

## How to Test
1. Criar/editar servico com cada tipo e validar agrupamento na pagina Servicos.
2. Agendavel: clicar no servico e cair em agendamento com produto pre-selecionado e passo de lead.
3. Fixo: criar contrato, validar email com link + PDF, contrato aparece no comercial e no cliente.
4. Cliente faz upload do contrato, comercial aprova/recusa, motivo aparece no cliente.
5. Contrato aprovado aparece no DNA em "Comprovantes/Contratos".
6. Upload de comprovante (cliente/comercial) cai no financeiro e e aprovado/recusado.
7. Apos aprovacao, botao "Agendar servico" cria agendamento ja pago/confirmado.
8. Regressao: fluxo atual de agendamentos e comprovantes segue funcionando.

## Known Limitations
- PDF do contrato e mockado em `backend/assets/contrato-mock.pdf`.
- Nao ha assinatura digital real; fluxo e baseado em upload/avaliacao manual.
- O agendamento criado apos pagamento nao fica vinculado ao contrato (sem FK).

## Change Log
### 2026-03-16
- Mudanca: adicionada tipagem de servicos e fluxo completo de contratos fixos.
- Motivo: separar servicos por tipo e habilitar contratos comerciais.
- Impacto: novas telas, endpoints e tabela `contratos_servicos`.
- Arquivos alterados: backend/controllers, backend/routes, backend/migrations, frontend/modulos comercial/cliente/financeiro, docs/features/servicos-comerciais.md.
