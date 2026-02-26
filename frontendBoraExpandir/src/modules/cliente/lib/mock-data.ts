import { Client, Document, Process, Notification, RequiredDocument, ApprovedDocument, TranslatedDocument, PendingAction } from '../types'
import { PartnerMetrics, Referral, Reminders } from '../types';

// Mock data for development
export const mockClient: Client = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // UUID válido para teste
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '+55 11 99999-9999',
  serviceType: 'Visto de Trabalho - Canadá',
  paymentStatus: 'confirmed',
  accessGranted: true,
  isPartner: false,
  isClient: true,
  clientId: '',
  createdAt: new Date('2024-12-22'),
}

export const mockFamilyMembers = [
  { id: 'f1e2d3c4-b5a6-7890-9876-543210fedcba', name: 'João Silva', type: 'Titular' },
  { id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', name: 'Maria Silva', type: 'Cônjuge' },
  { id: '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', name: 'Pedro Silva', type: 'Filho' },
  { id: '0f1e2d3c-4b5a-6789-0987-654321fedcba', name: 'Ana Silva', type: 'Filha' }
]

export const mockDocuments: Document[] = [
  {
    id: '1',
    clientId: '1',
    memberId: '1', // João Silva
    name: 'Passaporte',
    type: 'passaporte',
    status: 'approved',
    isApostilled: true,
    isTranslated: true,
    uploadDate: new Date('2024-01-20'),
    fileName: 'passaporte-joao.pdf',
    fileSize: 2048000,
  },
  {
    id: '2',
    clientId: '1',
    memberId: '1', // João Silva
    name: 'Diploma Universitário',
    type: 'educacao',
    status: 'analyzing',
    uploadDate: new Date('2024-01-22'),
    fileName: 'diploma-joao.pdf',
    fileSize: 1024000,
  },
  {
    id: '3',
    clientId: '1',
    memberId: '1', // João Silva
    name: 'Comprovante de Experiência',
    type: 'experiencia',
    status: 'rejected',
    uploadDate: new Date('2024-01-18'),
    rejectionReason: 'Documento ilegível. Por favor, escaneie novamente com melhor qualidade.',
    fileName: 'experiencia-joao.jpg',
    fileSize: 512000,
  },
  {
    id: '4',
    clientId: '1',
    memberId: '2', // Maria Silva (Cônjuge) - Deixando pendente para teste visual
    name: 'Certificado de Inglês',
    type: 'idioma',
    status: 'pending',
    uploadDate: new Date(),
  },
  {
    id: '5',
    clientId: '1',
    memberId: '1',
    name: 'Certidão de Nascimento',
    type: 'certidao_nascimento',
    status: 'approved',
    isApostilled: false,
    // isTranslated implicitly undefined/false
    uploadDate: new Date('2024-01-15'),
    fileName: 'certidao-nascimento-joao.pdf',
    fileSize: 1500000,
  },
  {
    id: '6',
    clientId: '1',
    memberId: '1',
    name: 'Antecedentes Criminais',
    type: 'antecedentes',
    status: 'approved',
    isApostilled: true,
    isTranslated: false,
    uploadDate: new Date('2024-01-16'),
    fileName: 'antecedentes-joao.pdf',
    fileSize: 1200000,
  },
]

export const mockProcess: Process = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  clientId: '1',
  serviceType: 'Visto de Trabalho - Canadá',
  currentStep: 2,
  steps: [
    {
      id: 1,
      name: 'Coleta de Documentos',
      status: 'completed',
      completedAt: new Date('2024-01-25'),
      description: 'Todos os documentos foram coletados e verificados.',
    },
    {
      id: 2,
      name: 'Análise Jurídica',
      status: 'in_progress',
      description: 'Nossa equipe está analisando seus documentos.',
    },
    {
      id: 3,
      name: 'Submissão',
      status: 'pending',
      description: 'Submissão do processo para as autoridades competentes.',
    },
    {
      id: 4,
      name: 'Concluído',
      status: 'pending',
      description: 'Processo finalizado e documentos entregues.',
    },
  ],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-26'),
}

export const mockPartnerMetrics: PartnerMetrics = {
  referrals: 18,
  conversions: 7,
  revenue: 12450.75,
  last30Days: {
    referrals: 6,
    conversions: 3,
    revenue: 5320.0,
  },
  referralLink: 'https://boraexpandir.com/ref/joao-silva-2024',
  referralList: [
    {
      id: 'ref_001',
      name: 'Maria Oliveira',
      email: 'maria.oliveira@example.com',
      status: 'confirmado',
      service: 'Visto de Trabalho - Canadá',
      referredDate: new Date('2024-11-20'),
      conversionDate: new Date('2024-12-05'),
    },
    {
      id: 'ref_002',
      name: 'Pedro Santos',
      email: 'pedro.santos@example.com',
      status: 'em-processo',
      service: 'Visto de Estudante - UK',
      referredDate: new Date('2024-12-01'),
    },
    {
      id: 'ref_003',
      name: 'Ana Costa',
      email: 'ana.costa@example.com',
      status: 'prospect',
      service: 'Imigração - Austrália',
      referredDate: new Date('2024-12-10'),
    },
    {
      id: 'ref_004',
      name: 'Carlos Ferreira',
      email: 'carlos.ferreira@example.com',
      status: 'concluido',
      service: 'Visto de Trabalho - Canadá',
      referredDate: new Date('2024-10-15'),
      conversionDate: new Date('2024-11-10'),
    },
    {
      id: 'ref_005',
      name: 'Juliana Lima',
      email: 'juliana.lima@example.com',
      status: 'em-processo',
      service: 'Visto de Trabalho - Irlanda',
      referredDate: new Date('2024-11-05'),
    },
  ],
};

export const mockApprovedDocuments: ApprovedDocument[] = [
  {
    id: '1',
    clientId: mockClient.id,
    name: 'Certidão de Casamento',
    originalLanguage: 'PT',
    targetLanguages: ['EN', 'ES', 'IT'],
    isApostilled: true,
    approvalDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    clientId: mockClient.id,
    name: 'Diploma Universitário',
    originalLanguage: 'PT',
    targetLanguages: ['EN', 'FR'],
    isApostilled: true,
    approvalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    clientId: mockClient.id,
    name: 'Histórico Escolar',
    originalLanguage: 'PT',
    targetLanguages: ['EN', 'ES'],
    approvalDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
]

export const mockTranslatedDocuments: TranslatedDocument[] = [
  {
    id: '1',
    clientId: mockClient.id,
    approvedDocumentId: '1',
    documentName: 'Certidão de Casamento',
    sourceLanguage: 'PT',
    targetLanguage: 'EN',
    fileName: 'certidao-casamento-en.pdf',
    fileSize: 245000,
    uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
]

export const mockNotifications: Notification[] = [
  {
    id: '1',
    clientId: '1',
    type: 'error',
    title: 'Documento Rejeitado',
    message: 'Seu comprovante de experiência precisa ser reenviado. Motivo: Documento ilegível.',
    read: false,
    createdAt: new Date('2024-01-26'),
  },
  {
    id: '2',
    clientId: '1',
    type: 'success',
    title: 'Documento Aprovado',
    message: 'Seu passaporte foi aprovado e está sendo processado.',
    read: true,
    createdAt: new Date('2024-01-25'),
  },
  {
    id: '3',
    clientId: '1',
    type: 'info',
    title: 'Processo Atualizado',
    message: 'Seu processo avançou para a etapa de Análise Jurídica.',
    read: true,
    createdAt: new Date('2024-01-24'),
  },
]

export const mockRequiredDocuments: RequiredDocument[] = [
  {
    type: 'passaporte',
    name: 'Passaporte',
    description: 'Passaporte válido com pelo menos 6 meses de validade',
    required: true,
    examples: ['Todas as páginas do passaporte', 'Foto nítida e legível'],
    processoId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',  // UUID válido do processo
    processoTipo: 'Visto de Trabalho - Canadá',
  },
  {
    type: 'educacao',
    name: 'Diploma/Certificado de Educação',
    description: 'Comprovante de formação acadêmica',
    required: true,
    examples: ['Diploma universitário', 'Certificado técnico', 'Histórico escolar'],
    processoId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',  // UUID válido do processo
    processoTipo: 'Visto de Trabalho - Canadá',
  },
  {
    type: 'experiencia',
    name: 'Comprovante de Experiência Profissional',
    description: 'Documentos que comprovem experiência de trabalho',
    required: true,
    examples: ['Carta de referência', 'Carteira de trabalho', 'Contrato de trabalho'],
    processoId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',  // UUID válido do processo
    processoTipo: 'Visto de Trabalho - Canadá',
  },
  {
    type: 'idioma',
    name: 'Certificado de Idioma',
    description: 'Comprovante de proficiência em inglês ou francês',
    required: false,
    examples: ['IELTS', 'TOEFL', 'CELPIP', 'TEF'],
    processoId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',  // UUID válido do processo
    processoTipo: 'Visto de Trabalho - Canadá',
  },
  {
    type: 'certidao_nascimento',
    name: 'Certidão de Nascimento',
    description: 'Cópia simples ou autenticada',
    required: true,
    examples: [],
    processoId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    processoTipo: 'Visto de Trabalho - Canadá',
  },
  {
    type: 'antecedentes',
    name: 'Antecedentes Criminais',
    description: 'Atestado de antecedentes criminais federal',
    required: true,
    examples: [],
    processoId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    processoTipo: 'Visto de Trabalho - Canadá',
  },
]

export const mockReminders: Reminders = {
  admin: [
    {
      id: '1',
      title: 'Fatura em Aberto',
      message: 'Sua fatura de Janeiro vence em 5 dias.',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      type: 'warning',
      actionLink: '/financeiro'
    },
    {
      id: '2',
      title: 'Atualização de Contrato',
      message: 'Houve uma atualização nos termos de serviço.',
      date: new Date(),
      type: 'info'
    }
  ],
  legal: [
    {
      id: '3',
      title: 'Documento Pendente',
      message: 'Precisamos da sua assinatura na procuração.',
      date: new Date(),
      type: 'urgent',
      actionLink: '/juridico'
    }
  ],
  commercial: [
    {
      id: '4',
      title: 'Nova Parceria',
      message: 'Confira nossos novos parceiros de câmbio com taxas exclusivas.',
      date: new Date(),
      type: 'success'
    }
  ]
}

export const mockPendingActions: PendingAction[] = [
  {
    id: '1',
    title: 'Assinatura de Contrato',
    description: 'Assinar termo de responsabilidade jurídica.',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000), // 2 days and 10 mins from now
    priority: 'high'
  },
  {
    id: '2',
    title: 'Envio de Documentos Complementares',
    description: 'Enviar cópia autenticada do RG.',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    priority: 'medium'
  }
]
