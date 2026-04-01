Reestruturação do Catálogo de Serviços e Contratos
A funcionalidade do catálogo de serviços será fortemente refatorada para integrar a gestão de subserviços, separar os tipos de documentos (titular vs dependente) e garantir que a configuração do preço seja flexível ao Comercial (C2), além de estritamente vincular cada serviço principal a um template de contrato (gerido pelo Super Admin).

User Review Required
WARNING

Este plano remove o botão isolado "Novo Subserviço" do topo da página. A partir de agora, subserviços serão criados de forma integrada na mesma tela onde o Serviço Principal é criado ou editado. Além disso, o Comercial (C2) não terá mais valores engessados, os valores descritos no catálogo deixarão de existir para os serviços fixo (contratos). Por favor, confirme se essa mudança de UI/UX está de acordo.

Proposed Changes
Supabase / Database
[MODIFY] database_migration_servicos.sql (Novo Arquivo)
Criaremos e rodaremos um script de migração no Supabase para as seguintes alterações:

Removemos a obrigatoriedade da coluna valor ou a ignoramos visualmente nos serviços do tipo fixo.
Adicionamos a coluna contrato_template_id (UUID) e possui_subservicos (BOOLEAN) à tabela catalogo_servicos.
Adicionamos a coluna tipo_documento (VARCHAR) padrão 'titular' à tabela servico_requisitos.
Backend (Repositórios e APIs)
[MODIFY] backend/src/repositories/AdmRepository.ts
Atualizar as funções getCatalogServices, createCatalogService e updateCatalogService para manipular as novas colunas (contrato_template_id, possui_subservicos).
Modificar o salvamento dos servico_requisitos para suportar o tipo_documento (Titular ou Dependente).
A lógica de vincular e editar N subserviços passará a operar em um único payload mestre durante a criação do contrato.
[MODIFY] backend/src/controllers/comercial/ComercialController.ts
Refatorar a chamada de geração do PDF do contrato. Atualmente, o sistema estava passando o ID do registro de venda de forma incorreta para o resgatador de templates. O sistema passará a consultar o produto_id associado, extrair o contrato_template_id vinculado dentro de catalogo_servicos e usar especificamente este template para gerar o PDF.
Frontend
[MODIFY] frontendBoraExpandir/src/modules/adm/services/catalogService.ts
Atualizar a tipagem de Service (adicionar contrato_template_id, possui_subservicos).
Atualizar a tipagem de DocumentRequirement (adicionar tipo_documento: 'titular' | 'dependente').
[MODIFY] frontendBoraExpandir/src/modules/adm/pages/admin/ServiceCatalog.tsx
UI de Criação: Removeremos o campo "Valor" para Serviços do tipo Fixo.
Adicionaremos um campo Dropdown chamado "Contrato Vinculado" puxando os modelos lá da aba "Meus Contratos".
Adicionaremos uma Chave: "Possui Subserviços?".
Se SIM: O modal abrirá um construtor de blocos, podendo adicionar Subserviço A, Subserviço B. Cada bloco de subserviço terá suas abas/botões para "Adicionar Doc Titular" e "Adicionar Doc Dependente".
Se NÃO: Exibiremos a gestão de documentos "Adicionar Doc Titular" / "Adicionar Doc Dependente" diretamente na raiz do serviço.
O botão desprendido de "Novo Subserviço" e as sub-tabelas soltas na UI atual provavelmente serão integradas.
Open Questions
IMPORTANT

Os serviços que NÃO SÃO do tipo Fixo (ex: Diversos ou Agendáveis) também precisarão selecionar "Contrato Vinculado" na tela ou é apenas para serviços fixos?
O preço do serviço no catálogo deve sumir para todos os tipos, ou ele continua sendo cadastrado para "Serviços Diversos" e não apenas no "Contrato" ?
Eu entendi corretamente que se houver Subserviço, os documentos ficam somente dentro dos subserviços e o Serviço "Pai" não pede documentos, certo?
Verification Plan
Manual Verification
No painel admin "Catálogo de Serviços", clicaremos em "Novo Serviço", marcaremos se há subserviços ou não. Vincularemos o modelo de contrato criado no passo anterior.
Em seguida, checaremos no banco de dados se os requisitos foram salvos com categoria (titular/dependente).
Iremos forçar a geração de um contrato via API do C2 e checar se o sistema pegou corretamente o texto do template recém vinculado.
1- em relação aos serviços vinculados aos contratos, sera uma opção vincular um contrato para aquele serivço ou  não, se é agendavel ou não pois teremos serivços que precisam de agendamento e tem contrato e serviços não preecisam de agendamento e tem contrato também, porém o contrato é diferente, enfim deixe tudo selecionalvel com tough e selecionavel.
2-pare definir se tem preço ou não deve ser editavel também se eu coloco preço fixo abre uma opção para add o preço (sempre em euros) se eu colo preço por contrato ai o valor daquele serviço é em branco pois é definido na hora que for gerar o contrato lá no c2 em serviços.
3- se o serviço principal for criado e já na criação eu selecionar que ele tem um subserviço todos os documentos são add nesses subserviços, mas se eu criar um serviço principal e não add um subserviço add os documentos diretamente no serviço principal ao clicar para editar serviço e depois criar um subserviço como ele já tem documentos vinculados deve abrir uma notificação avisando que o serviço principal tem documentos vinculados a ele e ai eu não se damos a opção de passar para o super add manter os documentros ou não e criar um subserviço com outros documentos
veja a melhor logica para isso
