import MetaComercialRepository from '../repositories/MetaComercialRepository'
import ComissaoRepository from '../repositories/ComissaoRepository'
import CambioService from './CambioService'
import type { MetaComercial } from '../repositories/MetaComercialRepository'

class ComissaoService {
  private normalizeCargo(rawCargo: string | undefined | null): 'C1' | 'C2' | 'HEAD' {
    const cargo = String(rawCargo || '').trim().toUpperCase()

    if (cargo.includes('HEAD') || cargo.includes('SUPERVISOR')) {
      return 'HEAD'
    }

    if (cargo.includes('C2')) {
      return 'C2'
    }

    if (cargo.includes('C1')) {
      return 'C1'
    }

    return 'C1'
  }

  private findMetaAtingida(metas: MetaComercial[], totalVendas: number): MetaComercial | null {
    // Percorre as metas de cima para baixo para encontrar a maior atingida
    const sorted = [...metas].sort((a, b) => b.meta_num - a.meta_num)
    for (const meta of sorted) {
      if (totalVendas >= meta.min_vendas) {
        return meta
      }
    }
    return null
  }

  private findMetaFaturamento(metas: MetaComercial[], totalFaturado: number): MetaComercial | null {
    const sorted = [...metas].sort((a, b) => b.meta_num - a.meta_num)
    for (const meta of sorted) {
      if (totalFaturado >= meta.min_faturamento_eur) {
        return meta
      }
    }
    return null
  }

  /**
   * Calcula comissao C1: Consultoria + Diversos + Assessoria Direta (nao_agendavel)
   * Regra: Soma vendas. Se total_vendas atinge Meta X, valor_total = total_vendas * valor_meta_X
   * Adiciona calculo de faturamento: total_faturado * pct_meta_faturamento_X
   * Inclui contratos de servicos nao agendaveis (Assessoria Direta) no total de vendas.
   */
  async calcularComissaoC1(userId: string, mes: number, ano: number) {
    const metas = await MetaComercialRepository.getByNivel('C1')
    const vendas = await ComissaoRepository.getVendasMes(userId, mes, ano)
    const contratos = await ComissaoRepository.getContratosAssinados(userId, mes, ano)
    const taxa = await CambioService.getCotacaoAtual()

    // Contratos de servicos nao agendaveis (Assessoria Direta) contam como venda para C1
    const contratosNaoAgendaveis = contratos.filter((c: any) => c.servico?.nao_agendavel === true)

    console.error(`[ComissaoFix] calcularComissaoC1 - agendamentos: ${vendas.length}, contratos nao_agendaveis: ${contratosNaoAgendaveis.length}`)

    const totalVendasAgendamentos = vendas.length
    const totalVendasContratos = contratosNaoAgendaveis.length
    const totalVendas = totalVendasAgendamentos + totalVendasContratos

    const faturadoAgendamentos = vendas.reduce((acc, v) => acc + (parseFloat(v.valor) || 0), 0)
    const faturadoContratos = contratosNaoAgendaveis.reduce((acc: number, c: any) => acc + (parseFloat(c.servico_valor) || 0), 0)
    const totalFaturadoEur = faturadoAgendamentos + faturadoContratos

    // Comissao por vendas
    const metaVendas = this.findMetaAtingida(metas, totalVendas)
    const comissaoVendasEur = metaVendas
      ? totalVendas * metaVendas.valor_comissao_eur
      : 0

    // Comissao por faturamento
    const metaFaturamento = this.findMetaFaturamento(metas, totalFaturadoEur)
    const comissaoFaturamentoEur = metaFaturamento
      ? totalFaturadoEur * (metaFaturamento.pct_comissao_faturamento / 100)
      : 0

    const totalComissaoEur = comissaoVendasEur + comissaoFaturamentoEur
    const totalComissaoBrl = CambioService.convertEurToBrl(totalComissaoEur, taxa)

    // Salvar resultado
    await ComissaoRepository.saveComissao({
      usuario_id: userId,
      mes,
      ano,
      tipo: 'vendas',
      total_vendas: totalVendas,
      total_faturado_eur: totalFaturadoEur,
      meta_atingida: metaVendas?.meta_num || null,
      valor_comissao_eur: totalComissaoEur,
      valor_comissao_brl: totalComissaoBrl,
      taxa_cambio: taxa
    })

    return {
      nivel: 'C1',
      totalVendas,
      totalFaturadoEur,
      metaVendasAtingida: metaVendas?.meta_num || 0,
      metaFaturamentoAtingida: metaFaturamento?.meta_num || 0,
      comissaoVendasEur,
      comissaoFaturamentoEur,
      totalComissaoEur,
      totalComissaoBrl,
      taxaCambio: taxa
    }
  }

  /**
   * Calcula comissao C2: Consultoria/Diversos (igual C1) + Assessoria
   * Assessoria: Meta definida por contratos assinados, valor pago por membros no contrato
   */
  async calcularComissaoC2(userId: string, mes: number, ano: number) {
    // Parte 1: Igual C1 (Consultoria/Diversos)
    const resultadoBase = await this.calcularComissaoC1(userId, mes, ano)

    // Parte 2: Assessoria
    const metasC2 = await MetaComercialRepository.getByNivel('C2')
    // checkDelegacao=true: exclui contratos de clientes delegados a outro usuario C2
    const contratos = await ComissaoRepository.getContratosAssinados(userId, mes, ano, true)
    const taxa = await CambioService.getCotacaoAtual()

    // Filtrar contratos de assessoria de imigracao (fixo/assessoria agendavel).
    // Exclui nao_agendaveis pois ja foram contados no calculo base C1.
    const contratosAssessoria = contratos.filter(
      (c: any) => (c.servico?.tipo === 'fixo' || c.servico?.tipo === 'assessoria') && !c.servico?.nao_agendavel
    )

    const totalContratosAssessoria = contratosAssessoria.length

    // Calcular valor por membros
    let totalMembrosValor = 0
    for (const contrato of contratosAssessoria) {
      const membrosData = await ComissaoRepository.getMembrosContrato(contrato.id)
      const membros = membrosData.membros_count || 1
      const valorPorMembro = contrato.servico_valor / membros
      totalMembrosValor += membros * valorPorMembro
    }

    // Aplicar meta de assessoria (usa mesma tabela, mas por contratos)
    const metaAssessoria = this.findMetaAtingida(metasC2, totalContratosAssessoria)
    const comissaoAssessoriaEur = metaAssessoria
      ? totalContratosAssessoria * metaAssessoria.valor_comissao_eur
      : 0

    const totalComissaoEur = resultadoBase.totalComissaoEur + comissaoAssessoriaEur
    const totalComissaoBrl = CambioService.convertEurToBrl(totalComissaoEur, taxa)

    // Salvar resultado de assessoria separado
    await ComissaoRepository.saveComissao({
      usuario_id: userId,
      mes,
      ano,
      tipo: 'assessoria',
      total_vendas: totalContratosAssessoria,
      total_faturado_eur: totalMembrosValor,
      meta_atingida: metaAssessoria?.meta_num || null,
      valor_comissao_eur: comissaoAssessoriaEur,
      valor_comissao_brl: CambioService.convertEurToBrl(comissaoAssessoriaEur, taxa),
      taxa_cambio: taxa
    })

    return {
      ...resultadoBase,
      nivel: 'C2',
      contratosAssessoria: totalContratosAssessoria,
      totalMembrosValor,
      metaAssessoriaAtingida: metaAssessoria?.meta_num || 0,
      comissaoAssessoriaEur,
      totalComissaoEur,
      totalComissaoBrl,
      taxaCambio: taxa
    }
  }

  /**
   * Calcula comissao HEAD/Supervisor:
   * Soma vendas de todos os subordinados. Aplica faixas do HEAD sobre o montante da equipe.
   */
  async calcularComissaoHEAD(headId: string, mes: number, ano: number) {
    const metas = await MetaComercialRepository.getByNivel('HEAD')
    const subordinados = await ComissaoRepository.getSubordinados(headId)
    const taxa = await CambioService.getCotacaoAtual()

    const subordinadoIds = subordinados.map(s => s.id)
    const vendasEquipe = await ComissaoRepository.getVendasEquipe(subordinadoIds, mes, ano)

    const totalVendasEquipe = vendasEquipe.length
    const totalFaturadoEur = vendasEquipe.reduce((acc, v) => acc + (parseFloat(v.valor) || 0), 0)

    // Comissao por vendas da equipe
    const metaVendas = this.findMetaAtingida(metas, totalVendasEquipe)
    const comissaoVendasEur = metaVendas
      ? totalVendasEquipe * metaVendas.valor_comissao_eur
      : 0

    // Comissao por faturamento da equipe
    const metaFaturamento = this.findMetaFaturamento(metas, totalFaturadoEur)
    const comissaoFaturamentoEur = metaFaturamento
      ? totalFaturadoEur * (metaFaturamento.pct_comissao_faturamento / 100)
      : 0

    const totalComissaoEur = comissaoVendasEur + comissaoFaturamentoEur
    const totalComissaoBrl = CambioService.convertEurToBrl(totalComissaoEur, taxa)

    // Salvar resultado
    await ComissaoRepository.saveComissao({
      usuario_id: headId,
      mes,
      ano,
      tipo: 'vendas',
      total_vendas: totalVendasEquipe,
      total_faturado_eur: totalFaturadoEur,
      meta_atingida: metaVendas?.meta_num || null,
      valor_comissao_eur: totalComissaoEur,
      valor_comissao_brl: totalComissaoBrl,
      taxa_cambio: taxa
    })

    return {
      nivel: 'HEAD',
      totalSubordinados: subordinados.length,
      subordinados: subordinados.map(s => ({ id: s.id, nome: s.full_name, cargo: s.cargo })),
      totalVendasEquipe,
      totalFaturadoEur,
      metaVendasAtingida: metaVendas?.meta_num || 0,
      metaFaturamentoAtingida: metaFaturamento?.meta_num || 0,
      comissaoVendasEur,
      comissaoFaturamentoEur,
      totalComissaoEur,
      totalComissaoBrl,
      taxaCambio: taxa
    }
  }

  /**
   * Calcula comissao automaticamente baseado no cargo do usuario
   */
  async calcularComissao(userId: string, cargo: string, mes: number, ano: number) {
    const cargoNormalizado = this.normalizeCargo(cargo)

    switch (cargoNormalizado) {
      case 'HEAD':
        return this.calcularComissaoHEAD(userId, mes, ano)
      case 'C2':
        return this.calcularComissaoC2(userId, mes, ano)
      case 'C1':
      default:
        return this.calcularComissaoC1(userId, mes, ano)
    }
  }

  /**
   * Gera relatorio de comissoes para um mes/ano (admin)
   */
  async gerarRelatorio(mes: number, ano: number) {
    return ComissaoRepository.getComissoesRelatorio(mes, ano)
  }

  /**
   * Busca historico de comissoes de um usuario
   */
  async getHistoricoUsuario(usuarioId: string, ano?: number) {
    return ComissaoRepository.getComissoesByUsuario(usuarioId, ano)
  }
}

export default new ComissaoService()
