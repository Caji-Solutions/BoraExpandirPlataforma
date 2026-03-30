import ComissaoService from '../../services/ComissaoService'
import CambioService from '../../services/CambioService'
import MetaComercialRepository from '../../repositories/MetaComercialRepository'

class ComissaoController {
  private resolveNivelComercial(rawNivel?: string | null, rawCargo?: string | null): 'C1' | 'C2' | 'HEAD' {
    const nivel = String(rawNivel || '').trim().toUpperCase()
    const cargo = String(rawCargo || '').trim().toUpperCase()

    const normalizar = (value: string): 'C1' | 'C2' | 'HEAD' | null => {
      if (value.includes('HEAD') || value.includes('SUPERVISOR')) return 'HEAD'
      if (value.includes('C2')) return 'C2'
      if (value.includes('C1')) return 'C1'
      return null
    }

    return normalizar(nivel) || normalizar(cargo) || 'C1'
  }

  // GET /comercial/comissao/calcular?mes=3&ano=2026
  async calcularMinhaComissao(req: any, res: any) {
    try {
      const userId = req.userId
      const cargo = this.resolveNivelComercial(req.user?.nivel, req.user?.cargo)
      const mes = parseInt(req.query.mes) || new Date().getMonth() + 1
      const ano = parseInt(req.query.ano) || new Date().getFullYear()

      const resultado = await ComissaoService.calcularComissao(userId, cargo, mes, ano)

      return res.status(200).json({
        message: 'Comissao calculada com sucesso',
        data: resultado
      })
    } catch (error: any) {
      console.error('[ComissaoController] Erro ao calcular comissao:', error)
      return res.status(500).json({ message: 'Erro ao calcular comissao', error: error.message })
    }
  }

  // GET /comercial/comissao/historico?ano=2026
  async getHistoricoComissao(req: any, res: any) {
    try {
      const userId = req.userId
      const ano = req.query.ano ? parseInt(req.query.ano) : undefined

      const historico = await ComissaoService.getHistoricoUsuario(userId, ano)

      return res.status(200).json({
        message: 'Historico de comissoes recuperado',
        data: historico
      })
    } catch (error: any) {
      console.error('[ComissaoController] Erro ao buscar historico:', error)
      return res.status(500).json({ message: 'Erro ao buscar historico', error: error.message })
    }
  }

  // GET /comercial/comissao/cotacao
  async getCotacao(_req: any, res: any) {
    try {
      const cotacao = await CambioService.getCotacaoAtual()
      const historico = await CambioService.getHistorico(7)

      return res.status(200).json({
        message: 'Cotacao recuperada',
        data: { cotacao, historico }
      })
    } catch (error: any) {
      console.error('[ComissaoController] Erro ao buscar cotacao:', error)
      return res.status(500).json({ message: 'Erro ao buscar cotacao', error: error.message })
    }
  }

  // GET /comercial/comissao/relatorio?mes=3&ano=2026 (admin)
  async getRelatorioComissoes(req: any, res: any) {
    try {
      const mes = parseInt(req.query.mes) || new Date().getMonth() + 1
      const ano = parseInt(req.query.ano) || new Date().getFullYear()

      const relatorio = await ComissaoService.gerarRelatorio(mes, ano)

      return res.status(200).json({
        message: 'Relatorio de comissoes gerado',
        data: relatorio
      })
    } catch (error: any) {
      console.error('[ComissaoController] Erro ao gerar relatorio:', error)
      return res.status(500).json({ message: 'Erro ao gerar relatorio', error: error.message })
    }
  }

  // GET /configuracoes/metas
  async getMetas(_req: any, res: any) {
    try {
      const metas = await MetaComercialRepository.getAll()
      return res.status(200).json({ message: 'Metas recuperadas', data: metas })
    } catch (error: any) {
      console.error('[ComissaoController] Erro ao buscar metas:', error)
      return res.status(500).json({ message: 'Erro ao buscar metas', error: error.message })
    }
  }

  // GET /configuracoes/metas/:nivel
  async getMetasByNivel(req: any, res: any) {
    try {
      const { nivel } = req.params
      const metas = await MetaComercialRepository.getByNivel(nivel)
      return res.status(200).json({ message: 'Metas recuperadas', data: metas })
    } catch (error: any) {
      console.error('[ComissaoController] Erro ao buscar metas por nivel:', error)
      return res.status(500).json({ message: 'Erro ao buscar metas', error: error.message })
    }
  }

  // POST /configuracoes/metas
  async upsertMeta(req: any, res: any) {
    try {
      const meta = req.body
      if (!meta.nivel || !meta.meta_num) {
        return res.status(400).json({ message: 'nivel e meta_num sao obrigatorios' })
      }

      const data = await MetaComercialRepository.upsert(meta)
      return res.status(200).json({ message: 'Meta salva com sucesso', data })
    } catch (error: any) {
      console.error('[ComissaoController] Erro ao salvar meta:', error)
      return res.status(500).json({ message: 'Erro ao salvar meta', error: error.message })
    }
  }

  // PUT /configuracoes/metas/batch
  async upsertMetasBatch(req: any, res: any) {
    try {
      const { metas } = req.body
      if (!Array.isArray(metas) || metas.length === 0) {
        return res.status(400).json({ message: 'Array de metas e obrigatorio' })
      }

      const data = await MetaComercialRepository.upsertBatch(metas)
      return res.status(200).json({ message: 'Metas salvas com sucesso', data })
    } catch (error: any) {
      console.error('[ComissaoController] Erro ao salvar metas em batch:', error)
      return res.status(500).json({ message: 'Erro ao salvar metas', error: error.message })
    }
  }

  // DELETE /configuracoes/metas/:id
  async deleteMeta(req: any, res: any) {
    try {
      const { id } = req.params
      await MetaComercialRepository.delete(id)
      return res.status(200).json({ message: 'Meta deletada com sucesso' })
    } catch (error: any) {
      console.error('[ComissaoController] Erro ao deletar meta:', error)
      return res.status(500).json({ message: 'Erro ao deletar meta', error: error.message })
    }
  }
}

export default new ComissaoController()
