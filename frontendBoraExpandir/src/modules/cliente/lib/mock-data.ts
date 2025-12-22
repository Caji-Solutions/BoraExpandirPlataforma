import { Client, Document, Process, Notification, RequiredDocument, ApprovedDocument, TranslatedDocument } from '../types'
import { PartnerMetrics, Referral } from '../types';

// Mock data for development
export const mockClient: Client = {
  id: '1',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '+55 11 99999-9999',
  serviceType: 'Visto de Trabalho - Canadá',
  paymentStatus: 'confirmed', 
  accessGranted: true,
  isPartner: false,
  isClient: true,
  createdAt: new Date('2024-12-22'),
}

export const mockDocuments: Document[] = [
  {
    id: '1',
    clientId: '1',
    name: 'Passaporte',
    type: 'passport',
    status: 'approved',
    uploadDate: new Date('2024-01-20'),
    fileName: 'passaporte-joao.pdf',
    fileSize: 2048000,
  },
  {
    id: '2',
    clientId: '1',
    name: 'Diploma Universitário',
    type: 'education',
    status: 'analyzing',
    uploadDate: new Date('2024-01-22'),
    fileName: 'diploma-joao.pdf',
    fileSize: 1024000,
  },
  {
    id: '3',
    clientId: '1',
    name: 'Comprovante de Experiência',
    type: 'experience',
    status: 'rejected',
    uploadDate: new Date('2024-01-18'),
    rejectionReason: 'Documento ilegível. Por favor, escaneie novamente com melhor qualidade.',
    fileName: 'experiencia-joao.jpg',
    fileSize: 512000,
  },
  {
    id: '4',
    clientId: '1',
    name: 'Certificado de Inglês',
    type: 'language',
    status: 'pending',
    uploadDate: new Date(),
  },
]

export const mockProcess: Process = {
  id: '1',
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
    approvalDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    clientId: mockClient.id,
    name: 'Diploma Universitário',
    originalLanguage: 'PT',
    targetLanguages: ['EN', 'FR'],
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
    type: 'passport',
    name: 'Passaporte',
    description: 'Passaporte válido com pelo menos 6 meses de validade',
    required: true,
    examples: ['Todas as páginas do passaporte', 'Foto nítida e legível'],
  },
  {
    type: 'education',
    name: 'Diploma/Certificado de Educação',
    description: 'Comprovante de formação acadêmica',
    required: true,
    examples: ['Diploma universitário', 'Certificado técnico', 'Histórico escolar'],
  },
  {
    type: 'experience',
    name: 'Comprovante de Experiência Profissional',
    description: 'Documentos que comprovem experiência de trabalho',
    required: true,
    examples: ['Carta de referência', 'Carteira de trabalho', 'Contrato de trabalho'],
  },
  {
    type: 'language',
    name: 'Certificado de Idioma',
    description: 'Comprovante de proficiência em inglês ou francês',
    required: false,
    examples: ['IELTS', 'TOEFL', 'CELPIP', 'TEF'],
  },
]
