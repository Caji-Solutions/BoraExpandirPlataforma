
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/edge.js')


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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/home/joaov/Documents/BoraExpandirPLataforma/BoraExpandirPlataforma/backend/src/generated/src/generated/prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "/home/joaov/Documents/BoraExpandirPLataforma/BoraExpandirPlataforma/backend/src/generated/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": "../../../../../.env",
    "schemaEnvPath": "../../../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "datasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/prisma\"\n}\n\n// 1. Enumeração para tipos de usuário\nenum TipoUsuario {\n  CLIENTE\n  FINANCEIRO\n  JURIDICO\n  SUPER_ADMIN\n}\n\nmodel Usuario {\n  // ID vem do Supabase Auth (UUID). Não geramos default aqui.\n  id             String      @id @db.Uuid\n  email          String      @unique\n  nome           String?\n  tipo           TipoUsuario @default(CLIENTE)\n  bucketRootPath String?     @map(\"bucket_root_path\")\n\n  notificacoes Notificacao[]\n  agendamentos Agendamento[]\n\n  criadoEm     DateTime @default(now()) @map(\"criado_em\")\n  atualizadoEm DateTime @updatedAt @map(\"atualizado_em\")\n\n  @@map(\"usuarios\")\n}\n\nmodel Notificacao {\n  id        String    @id @default(uuid()) // Gerado pelo Prisma\n  titulo    String\n  mensagem  String\n  lida      Boolean   @default(false)\n  tipo      String    @default(\"info\")\n  dataPrazo DateTime? @map(\"data_prazo\")\n  criadoEm  DateTime  @default(now()) @map(\"criado_em\")\n\n  clienteId String? @map(\"cliente_id\") @db.Uuid\n  criadorId String? @map(\"criador_id\") @db.Uuid\n\n  usuarioId String?  @map(\"usuario_id\") @db.Uuid\n  usuario   Usuario? @relation(fields: [usuarioId], references: [id], onDelete: Cascade)\n\n  @@map(\"notificacoes\")\n}\n\n// Enumeração para status do documento\nenum StatusDocumento {\n  PENDING // Aguardando análise\n  ANALYZING // Em análise técnica\n  WAITING_APOSTILLE // Aguardando apostilamento (cliente)\n  ANALYZING_APOSTILLE // Validando apostilamento (jurídico)\n  WAITING_TRANSLATION // Aguardando tradução (cliente)\n  ANALYZING_TRANSLATION // Validando tradução (jurídico)\n  WAITING_TRANSLATION_QUOTE // Aguardando orçamento de tradução\n  WAITING_QUOTE_APPROVAL // Aguardando aprovação de orçamento\n  APPROVED // Aprovado\n  REJECTED // Rejeitado\n}\n\n// Modelo para Processos\nmodel Processo {\n  id String @id @default(uuid()) @db.Uuid\n\n  documentos Documento[]\n\n  @@map(\"processos\")\n}\n\n// Modelo para Dependentes (Membros da Família)\nmodel Dependente {\n  id String @id @default(uuid()) @db.Uuid\n\n  documentos Documento[]\n\n  @@map(\"dependentes\")\n}\n\n// Modelo para Requerimentos estruturados\nmodel Requerimento {\n  id          String  @id @default(uuid()) @db.Uuid\n  clienteId   String  @map(\"cliente_id\") @db.Uuid\n  processoId  String? @map(\"processo_id\") @db.Uuid\n  tipo        String\n  status      String  @default(\"pendente\")\n  observacoes String?\n  criadorId   String? @map(\"criador_id\") @db.Uuid\n\n  documentos Documento[]\n\n  createdAt  DateTime @default(now()) @map(\"created_at\")\n  updated_at DateTime @default(now()) @updatedAt @map(\"updated_at\")\n\n  @@map(\"requerimentos\")\n}\n\n// Modelo para armazenar documentos dos clientes\nmodel Documento {\n  id String @id @default(uuid()) @db.Uuid\n\n  // Relacionamento com o cliente (UUID do Supabase)\n  clienteId String @map(\"cliente_id\") @db.Uuid\n\n  // Novos relacionamentos\n  processoId String?   @map(\"processo_id\") @db.Uuid\n  processo   Processo? @relation(fields: [processoId], references: [id], onDelete: SetNull, onUpdate: Cascade)\n\n  dependenteId String?     @map(\"dependente_id\") @db.Uuid\n  dependente   Dependente? @relation(fields: [dependenteId], references: [id], onDelete: SetNull)\n\n  requerimentoId String?       @map(\"requerimento_id\") @db.Uuid\n  requerimento   Requerimento? @relation(fields: [requerimentoId], references: [id], onDelete: SetNull)\n\n  // Informações do arquivo\n  tipo         String // Tipo do documento (passport, identity, proof_of_address, etc.)\n  nomeOriginal String  @map(\"nome_original\") // Nome original do arquivo\n  nomeArquivo  String  @map(\"nome_arquivo\") // Nome salvo no storage\n  storagePath  String  @map(\"storage_path\") // Caminho completo no Supabase Storage\n  publicUrl    String? @map(\"public_url\") // URL pública do arquivo\n  contentType  String? @map(\"content_type\") // MIME type do arquivo\n  tamanho      Int? // Tamanho em bytes\n\n  // Status e análise\n  status                  StatusDocumento @default(PENDING)\n  apostilado              Boolean         @default(false)\n  traduzido               Boolean         @default(false)\n  motivoRejeicao          String?         @map(\"motivo_rejeicao\")\n  analisadoPor            String?         @map(\"analisado_por\") @db.Uuid // ID do usuário que analisou\n  analisadoEm             DateTime?       @map(\"analisado_em\")\n  solicitadoPeloJuridico  Boolean         @default(false) @map(\"solicitado_pelo_juridico\")\n  dataSolicitacaoJuridico DateTime?       @map(\"data_solicitacao_juridico\")\n\n  // Timestamps\n  criadoEm     DateTime @default(now()) @map(\"criado_em\")\n  atualizadoEm DateTime @updatedAt @map(\"atualizado_em\")\n\n  apostilamento Apostilamento?\n\n  @@index([clienteId])\n  @@index([tipo])\n  @@index([status])\n  @@index([processoId])\n  @@index([dependenteId])\n  @@index([requerimentoId])\n  @@map(\"documentos\")\n}\n\nmodel Configuracao {\n  chave        String   @id\n  valor        String\n  criadoEm     DateTime @default(now()) @map(\"criado_em\")\n  atualizadoEm DateTime @updatedAt @map(\"atualizado_em\")\n\n  @@map(\"configuracoes\")\n}\n\nmodel Agendamento {\n  id             String   @id @default(uuid()) @db.Uuid\n  nome           String\n  email          String\n  telefone       String\n  dataHora       DateTime @map(\"data_hora\")\n  produtoId      String   @map(\"produto_id\")\n  duracaoMinutos Int      @default(60) @map(\"duracao_minutos\")\n  status         String   @default(\"agendado\")\n\n  usuarioId String?  @map(\"usuario_id\") @db.Uuid\n  usuario   Usuario? @relation(fields: [usuarioId], references: [id])\n\n  clienteId String? @map(\"cliente_id\") @db.Uuid\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n  updatedAt DateTime @default(now()) @updatedAt @map(\"updated_at\")\n\n  @@map(\"agendamentos\")\n}\n\nmodel CatalogoServico {\n  id              String  @id @default(uuid()) @db.Uuid\n  nome            String\n  valor           Decimal @default(0.00) @db.Decimal(10, 2)\n  duracao         String?\n  exibirComercial Boolean @default(true) @map(\"exibir_comercial\")\n\n  requisitos ServicoRequisito[]\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n  updatedAt DateTime @default(now()) @updatedAt @map(\"updated_at\")\n\n  @@map(\"catalogo_servicos\")\n}\n\nmodel ServicoRequisito {\n  id        String          @id @default(uuid()) @db.Uuid\n  servicoId String          @map(\"servico_id\") @db.Uuid\n  servico   CatalogoServico @relation(fields: [servicoId], references: [id], onDelete: Cascade)\n\n  nome        String\n  etapa       String\n  obrigatorio Boolean @default(true)\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n  updatedAt DateTime @default(now()) @updatedAt @map(\"updated_at\")\n\n  @@map(\"servico_requisitos\")\n}\n\nmodel AssessoriaJuridica {\n  id            String   @id @default(uuid()) @db.Uuid\n  clienteId     String   @map(\"cliente_id\") @db.Uuid\n  responsavelId String   @map(\"responsavel_id\") @db.Uuid\n  servicoId     String?  @map(\"servico_id\") @db.Uuid\n  respostas     Json\n  observacoes   String?\n  criadoEm      DateTime @default(now()) @map(\"criado_em\")\n\n  @@map(\"assessorias_juridico\")\n}\n\nmodel Apostilamento {\n  id           String    @id @default(uuid()) @db.Uuid\n  documentoId  String    @unique @map(\"documento_id\") @db.Uuid\n  documento    Documento @relation(fields: [documentoId], references: [id])\n  status       String    @default(\"pendente\") // pendente, em_processamento, concluido, erro\n  observacoes  String?\n  solicitadoEm DateTime  @default(now()) @map(\"solicitado_em\")\n  concluidoEm  DateTime? @map(\"concluido_em\")\n\n  @@map(\"apostilamentos\")\n}\n",
  "inlineSchemaHash": "4955b720775a6d53b53cd7d8cf13b90af4be42a112896ef7b760d9a415b3aace",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Usuario\":{\"dbName\":\"usuarios\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"TipoUsuario\",\"default\":\"CLIENTE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bucketRootPath\",\"dbName\":\"bucket_root_path\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notificacoes\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Notificacao\",\"relationName\":\"NotificacaoToUsuario\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"agendamentos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Agendamento\",\"relationName\":\"AgendamentoToUsuario\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criadoEm\",\"dbName\":\"criado_em\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"atualizadoEm\",\"dbName\":\"atualizado_em\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Notificacao\":{\"dbName\":\"notificacoes\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"titulo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mensagem\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lida\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"info\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dataPrazo\",\"dbName\":\"data_prazo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criadoEm\",\"dbName\":\"criado_em\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clienteId\",\"dbName\":\"cliente_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criadorId\",\"dbName\":\"criador_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"usuarioId\",\"dbName\":\"usuario_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"usuario\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Usuario\",\"relationName\":\"NotificacaoToUsuario\",\"relationFromFields\":[\"usuarioId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Processo\":{\"dbName\":\"processos\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"documentos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Documento\",\"relationName\":\"DocumentoToProcesso\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Dependente\":{\"dbName\":\"dependentes\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"documentos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Documento\",\"relationName\":\"DependenteToDocumento\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Requerimento\":{\"dbName\":\"requerimentos\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clienteId\",\"dbName\":\"cliente_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processoId\",\"dbName\":\"processo_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"pendente\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"observacoes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criadorId\",\"dbName\":\"criador_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"documentos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Documento\",\"relationName\":\"DocumentoToRequerimento\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Documento\":{\"dbName\":\"documentos\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clienteId\",\"dbName\":\"cliente_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processoId\",\"dbName\":\"processo_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Processo\",\"relationName\":\"DocumentoToProcesso\",\"relationFromFields\":[\"processoId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dependenteId\",\"dbName\":\"dependente_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dependente\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dependente\",\"relationName\":\"DependenteToDocumento\",\"relationFromFields\":[\"dependenteId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requerimentoId\",\"dbName\":\"requerimento_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requerimento\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Requerimento\",\"relationName\":\"DocumentoToRequerimento\",\"relationFromFields\":[\"requerimentoId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nomeOriginal\",\"dbName\":\"nome_original\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nomeArquivo\",\"dbName\":\"nome_arquivo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storagePath\",\"dbName\":\"storage_path\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicUrl\",\"dbName\":\"public_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contentType\",\"dbName\":\"content_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tamanho\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"StatusDocumento\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"apostilado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"traduzido\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"motivoRejeicao\",\"dbName\":\"motivo_rejeicao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"analisadoPor\",\"dbName\":\"analisado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"analisadoEm\",\"dbName\":\"analisado_em\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"solicitadoPeloJuridico\",\"dbName\":\"solicitado_pelo_juridico\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dataSolicitacaoJuridico\",\"dbName\":\"data_solicitacao_juridico\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criadoEm\",\"dbName\":\"criado_em\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"atualizadoEm\",\"dbName\":\"atualizado_em\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"apostilamento\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Apostilamento\",\"relationName\":\"ApostilamentoToDocumento\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Configuracao\":{\"dbName\":\"configuracoes\",\"fields\":[{\"name\":\"chave\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"valor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criadoEm\",\"dbName\":\"criado_em\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"atualizadoEm\",\"dbName\":\"atualizado_em\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Agendamento\":{\"dbName\":\"agendamentos\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"telefone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dataHora\",\"dbName\":\"data_hora\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"produtoId\",\"dbName\":\"produto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"duracaoMinutos\",\"dbName\":\"duracao_minutos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":60,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"agendado\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"usuarioId\",\"dbName\":\"usuario_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"usuario\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Usuario\",\"relationName\":\"AgendamentoToUsuario\",\"relationFromFields\":[\"usuarioId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clienteId\",\"dbName\":\"cliente_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"CatalogoServico\":{\"dbName\":\"catalogo_servicos\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"valor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"duracao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"exibirComercial\",\"dbName\":\"exibir_comercial\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requisitos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ServicoRequisito\",\"relationName\":\"CatalogoServicoToServicoRequisito\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ServicoRequisito\":{\"dbName\":\"servico_requisitos\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"servicoId\",\"dbName\":\"servico_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"servico\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CatalogoServico\",\"relationName\":\"CatalogoServicoToServicoRequisito\",\"relationFromFields\":[\"servicoId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"etapa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"obrigatorio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AssessoriaJuridica\":{\"dbName\":\"assessorias_juridico\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clienteId\",\"dbName\":\"cliente_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"responsavelId\",\"dbName\":\"responsavel_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"servicoId\",\"dbName\":\"servico_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"respostas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"observacoes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criadoEm\",\"dbName\":\"criado_em\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Apostilamento\":{\"dbName\":\"apostilamentos\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"documentoId\",\"dbName\":\"documento_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"documento\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Documento\",\"relationName\":\"ApostilamentoToDocumento\",\"relationFromFields\":[\"documentoId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"pendente\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"observacoes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"solicitadoEm\",\"dbName\":\"solicitado_em\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"concluidoEm\",\"dbName\":\"concluido_em\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"TipoUsuario\":{\"values\":[{\"name\":\"CLIENTE\",\"dbName\":null},{\"name\":\"FINANCEIRO\",\"dbName\":null},{\"name\":\"JURIDICO\",\"dbName\":null},{\"name\":\"SUPER_ADMIN\",\"dbName\":null}],\"dbName\":null},\"StatusDocumento\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"ANALYZING\",\"dbName\":null},{\"name\":\"WAITING_APOSTILLE\",\"dbName\":null},{\"name\":\"ANALYZING_APOSTILLE\",\"dbName\":null},{\"name\":\"WAITING_TRANSLATION\",\"dbName\":null},{\"name\":\"ANALYZING_TRANSLATION\",\"dbName\":null},{\"name\":\"WAITING_TRANSLATION_QUOTE\",\"dbName\":null},{\"name\":\"WAITING_QUOTE_APPROVAL\",\"dbName\":null},{\"name\":\"APPROVED\",\"dbName\":null},{\"name\":\"REJECTED\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

