import JuridicoRepository from '../repositories/JuridicoRepository'

class JuridicoController {

    // =============================================
    // GESTÃO DE FUNCIONÁRIOS
    // =============================================

    // GET /juridico/funcionarios - Lista funcionários do jurídico
    async getFuncionarios(req: any, res: any) {
        try {
            const funcionarios = await JuridicoRepository.getFuncionarios()

            return res.status(200).json({
                message: 'Funcionários do jurídico recuperados com sucesso',
                data: funcionarios
            })
        } catch (error: any) {
            console.error('Erro ao buscar funcionários do jurídico:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar funcionários do jurídico', 
                error: error.message 
            })
        }
    }

    // GET /juridico/funcionario/:funcionarioId - Buscar funcionário por ID
    async getFuncionarioById(req: any, res: any) {
        try {
            const { funcionarioId } = req.params

            if (!funcionarioId) {
                return res.status(400).json({ message: 'funcionarioId é obrigatório' })
            }

            const funcionario = await JuridicoRepository.getFuncionarioById(funcionarioId)

            if (!funcionario) {
                return res.status(404).json({ message: 'Funcionário não encontrado' })
            }

            return res.status(200).json({
                message: 'Funcionário recuperado com sucesso',
                data: funcionario
            })
        } catch (error: any) {
            console.error('Erro ao buscar funcionário:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar funcionário', 
                error: error.message 
            })
        }
    }

    // =============================================
    // GESTÃO DE PROCESSOS
    // =============================================

    // GET /juridico/processos - Lista todos os processos
    async getProcessos(req: any, res: any) {
        try {
            const processos = await JuridicoRepository.getProcessos()

            return res.status(200).json({
                message: 'Processos recuperados com sucesso',
                data: processos,
                total: processos.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar processos:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar processos', 
                error: error.message 
            })
        }
    }

    // GET /juridico/processos/vagos - Lista processos sem responsável
    async getProcessosVagos(req: any, res: any) {
        try {
            const processos = await JuridicoRepository.getProcessosSemResponsavel()

            return res.status(200).json({
                message: 'Processos sem responsável recuperados com sucesso',
                data: processos,
                total: processos.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar processos sem responsável:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar processos sem responsável', 
                error: error.message 
            })
        }
    }

    // POST /juridico/atribuir-responsavel - Atribuir responsável a um processo
    async atribuirResponsavel(req: any, res: any) {
        try {
            const { processoId, responsavelId } = req.body // Ambos vêm do corpo da requisição

            if (!processoId) {
                return res.status(400).json({ message: 'processoId é obrigatório' })
            }

            // Se responsavelId foi fornecido, validar se é um funcionário do jurídico
            if (responsavelId) {
                const funcionario = await JuridicoRepository.getFuncionarioById(responsavelId)
                if (!funcionario) {
                    return res.status(400).json({ 
                        message: 'responsavelId inválido - funcionário não encontrado ou não é do jurídico' 
                    })
                }
            }

            const processo = await JuridicoRepository.atribuirResponsavel(processoId, responsavelId || null)

            return res.status(200).json({
                message: responsavelId 
                    ? 'Responsável jurídico atribuído com sucesso' 
                    : 'Responsável jurídico removido - processo agora está vago',
                data: processo
            })
        } catch (error: any) {
            console.error('Erro ao atribuir responsável jurídico:', error)
            return res.status(500).json({ 
                message: 'Erro ao atribuir responsável jurídico', 
                error: error.message 
            })
        }
    }

    // GET /juridico/clientes/vagos - Lista clientes sem responsável
    async getClientesVagos(req: any, res: any) {
        try {
            const clientes = await JuridicoRepository.getClientesSemResponsavel()

            return res.status(200).json({
                message: 'Clientes sem responsável recuperados com sucesso',
                data: clientes,
                total: clientes.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar clientes sem responsável:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar clientes sem responsável', 
                error: error.message 
            })
        }
    }

    // GET /juridico/clientes/por-responsavel/:responsavelId - Clientes de um responsável
    async getClientesByResponsavel(req: any, res: any) {
        try {
            const { responsavelId } = req.params

            if (!responsavelId) {
                return res.status(400).json({ message: 'responsavelId é obrigatório' })
            }

            const clientes = await JuridicoRepository.getClientesByResponsavel(responsavelId)

            return res.status(200).json({
                message: 'Clientes do responsável recuperados com sucesso',
                data: clientes,
                total: clientes.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar clientes do responsável:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar clientes do responsável', 
                error: error.message 
            })
        }
    }

    // GET /juridico/cliente/:clienteId - Buscar cliente com dados do responsável
    async getClienteComResponsavel(req: any, res: any) {
        try {
            const { clienteId } = req.params

            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' })
            }

            const cliente = await JuridicoRepository.getClienteComResponsavel(clienteId)

            if (!cliente) {
                return res.status(404).json({ message: 'Cliente não encontrado' })
            }

            return res.status(200).json({
                message: 'Cliente recuperado com sucesso',
                data: cliente
            })
        } catch (error: any) {
            console.error('Erro ao buscar cliente:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar cliente', 
                error: error.message 
            })
        }
    }

    // GET /juridico/clientes - Lista todos os clientes com seus responsáveis
    async getAllClientes(req: any, res: any) {
        try {
            const clientes = await JuridicoRepository.getAllClientesComResponsavel()

            return res.status(200).json({
                message: 'Clientes recuperados com sucesso',
                data: clientes,
                total: clientes.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar clientes:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar clientes', 
                error: error.message 
            })
        }
    }

    // =============================================
    // ESTATÍSTICAS
    // =============================================

    // GET /juridico/estatisticas - Estatísticas por responsável
    async getEstatisticas(req: any, res: any) {
        try {
            const estatisticas = await JuridicoRepository.getEstatisticasPorResponsavel()

            return res.status(200).json({
                message: 'Estatísticas recuperadas com sucesso',
                data: estatisticas
            })
        } catch (error: any) {
            console.error('Erro ao buscar estatísticas:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar estatísticas', 
                error: error.message 
            })
        }
    }
}

export default new JuridicoController()
