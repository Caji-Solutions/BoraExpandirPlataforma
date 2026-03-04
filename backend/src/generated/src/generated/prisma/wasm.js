
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UsuarioScalarFieldEnum = {
  id: 'id',
  email: 'email',
  nome: 'nome',
  tipo: 'tipo',
  bucketRootPath: 'bucketRootPath',
  criadoEm: 'criadoEm',
  atualizadoEm: 'atualizadoEm'
};

exports.Prisma.NotificacaoScalarFieldEnum = {
  id: 'id',
  titulo: 'titulo',
  mensagem: 'mensagem',
  lida: 'lida',
  tipo: 'tipo',
  dataPrazo: 'dataPrazo',
  criadoEm: 'criadoEm',
  clienteId: 'clienteId',
  criadorId: 'criadorId',
  usuarioId: 'usuarioId'
};

exports.Prisma.ProcessoScalarFieldEnum = {
  id: 'id'
};

exports.Prisma.DependenteScalarFieldEnum = {
  id: 'id'
};

exports.Prisma.RequerimentoScalarFieldEnum = {
  id: 'id',
  clienteId: 'clienteId',
  processoId: 'processoId',
  tipo: 'tipo',
  status: 'status',
  observacoes: 'observacoes',
  criadorId: 'criadorId',
  createdAt: 'createdAt',
  updated_at: 'updated_at'
};

exports.Prisma.DocumentoScalarFieldEnum = {
  id: 'id',
  clienteId: 'clienteId',
  processoId: 'processoId',
  dependenteId: 'dependenteId',
  requerimentoId: 'requerimentoId',
  tipo: 'tipo',
  nomeOriginal: 'nomeOriginal',
  nomeArquivo: 'nomeArquivo',
  storagePath: 'storagePath',
  publicUrl: 'publicUrl',
  contentType: 'contentType',
  tamanho: 'tamanho',
  status: 'status',
  apostilado: 'apostilado',
  traduzido: 'traduzido',
  motivoRejeicao: 'motivoRejeicao',
  analisadoPor: 'analisadoPor',
  analisadoEm: 'analisadoEm',
  solicitadoPeloJuridico: 'solicitadoPeloJuridico',
  dataSolicitacaoJuridico: 'dataSolicitacaoJuridico',
  criadoEm: 'criadoEm',
  atualizadoEm: 'atualizadoEm'
};

exports.Prisma.ConfiguracaoScalarFieldEnum = {
  chave: 'chave',
  valor: 'valor',
  criadoEm: 'criadoEm',
  atualizadoEm: 'atualizadoEm'
};

exports.Prisma.AgendamentoScalarFieldEnum = {
  id: 'id',
  nome: 'nome',
  email: 'email',
  telefone: 'telefone',
  dataHora: 'dataHora',
  produtoId: 'produtoId',
  duracaoMinutos: 'duracaoMinutos',
  status: 'status',
  usuarioId: 'usuarioId',
  clienteId: 'clienteId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CatalogoServicoScalarFieldEnum = {
  id: 'id',
  nome: 'nome',
  valor: 'valor',
  duracao: 'duracao',
  exibirComercial: 'exibirComercial',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ServicoRequisitoScalarFieldEnum = {
  id: 'id',
  servicoId: 'servicoId',
  nome: 'nome',
  etapa: 'etapa',
  obrigatorio: 'obrigatorio',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AssessoriaJuridicaScalarFieldEnum = {
  id: 'id',
  clienteId: 'clienteId',
  responsavelId: 'responsavelId',
  servicoId: 'servicoId',
  respostas: 'respostas',
  observacoes: 'observacoes',
  criadoEm: 'criadoEm'
};

exports.Prisma.ApostilamentoScalarFieldEnum = {
  id: 'id',
  documentoId: 'documentoId',
  status: 'status',
  observacoes: 'observacoes',
  solicitadoEm: 'solicitadoEm',
  concluidoEm: 'concluidoEm'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.TipoUsuario = exports.$Enums.TipoUsuario = {
  CLIENTE: 'CLIENTE',
  FINANCEIRO: 'FINANCEIRO',
  JURIDICO: 'JURIDICO',
  SUPER_ADMIN: 'SUPER_ADMIN'
};

exports.StatusDocumento = exports.$Enums.StatusDocumento = {
  PENDING: 'PENDING',
  ANALYZING: 'ANALYZING',
  WAITING_APOSTILLE: 'WAITING_APOSTILLE',
  ANALYZING_APOSTILLE: 'ANALYZING_APOSTILLE',
  WAITING_TRANSLATION: 'WAITING_TRANSLATION',
  ANALYZING_TRANSLATION: 'ANALYZING_TRANSLATION',
  WAITING_TRANSLATION_QUOTE: 'WAITING_TRANSLATION_QUOTE',
  WAITING_QUOTE_APPROVAL: 'WAITING_QUOTE_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.Prisma.ModelName = {
  Usuario: 'Usuario',
  Notificacao: 'Notificacao',
  Processo: 'Processo',
  Dependente: 'Dependente',
  Requerimento: 'Requerimento',
  Documento: 'Documento',
  Configuracao: 'Configuracao',
  Agendamento: 'Agendamento',
  CatalogoServico: 'CatalogoServico',
  ServicoRequisito: 'ServicoRequisito',
  AssessoriaJuridica: 'AssessoriaJuridica',
  Apostilamento: 'Apostilamento'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
