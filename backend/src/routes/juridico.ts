import { Router } from 'express'
import JuridicoController from '../controllers/JuridicoController'

const juridico = Router()

// =============================================
// ROTAS DE FUNCIONÁRIOS
// =============================================

// Lista todos os funcionários do jurídico
juridico.get('/funcionarios', JuridicoController.getFuncionarios.bind(JuridicoController))

// Buscar funcionário por ID
juridico.get('/funcionario/:funcionarioId', JuridicoController.getFuncionarioById.bind(JuridicoController))

// =============================================
// ROTAS DE PROCESSOS
// =============================================

// Lista todos os processos
juridico.get('/processos', JuridicoController.getProcessos.bind(JuridicoController))

// Lista processos sem responsável (vagos)
juridico.get('/processos/vagos', JuridicoController.getProcessosVagos.bind(JuridicoController))

// =============================================
// ROTAS DE CLIENTES
// =============================================

// Lista todos os clientes com seus responsáveis
juridico.get('/clientes', JuridicoController.getAllClientes.bind(JuridicoController))

// Lista clientes sem responsável (vagos)
juridico.get('/clientes/vagos', JuridicoController.getClientesVagos.bind(JuridicoController))

// Lista clientes de um responsável específico
juridico.get('/clientes/por-responsavel/:responsavelId', JuridicoController.getClientesByResponsavel.bind(JuridicoController))

// Buscar cliente específico com dados do responsável
juridico.get('/cliente/:clienteId', JuridicoController.getClienteComResponsavel.bind(JuridicoController))

juridico.post('/atribuir-responsavel', JuridicoController.atribuirResponsavel.bind(JuridicoController))

juridico.get('/estatisticas', JuridicoController.getEstatisticas.bind(JuridicoController))

export default juridico
