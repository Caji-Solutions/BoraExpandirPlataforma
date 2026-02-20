export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  serviceType: string;
  paymentStatus: 'pending' | 'confirmed' | 'failed';
  accessGranted: boolean;
  isPartner?: boolean;
  isClient?: boolean;
  createdAt: Date;
  avatarUrl?: string;
  clientId?: string;
}

export interface Referral {
  id: string;
  name: string;
  email: string;
  status: 'prospect' | 'em-processo' | 'confirmado' | 'concluido';
  service: string;
  referredDate: Date;
  conversionDate?: Date;
}

export interface PartnerMetrics {
  referrals: number;
  conversions: number;
  revenue: number; // em BRL
  last30Days: {
    referrals: number;
    conversions: number;
    revenue: number;
  };
  referralLink: string;
  referralList: Referral[];
}

export interface Reminder {
  id: string;
  title: string;
  message: string;
  date: Date;
  type: 'info' | 'warning' | 'urgent' | 'success';
  actionLink?: string;
}

export interface Reminders {
  admin: Reminder[];
  legal: Reminder[];
  commercial: Reminder[];
}

export interface PendingAction {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  priority: 'high' | 'medium' | 'low';
}

export interface Document {
  id: string;
  clientId: string;
  memberId?: string;
  name: string;
  type: string;
  status: 'pending' | 'analyzing' | 'waiting_apostille' | 'analyzing_apostille' | 'waiting_translation' | 'analyzing_translation' | 'waiting_translation_quote' | 'waiting_quote_approval' | 'approved' | 'rejected' | 'sent_for_apostille';
  isApostilled?: boolean;
  isTranslated?: boolean;
  uploadDate: Date;
  rejectionReason?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  updatedAt?: Date;
}

export interface ProcessStep {
  id: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'analyzing' | 'waiting';
  completedAt?: Date;
  description?: string;
}

export interface Process {
  id: string;
  clientId: string;
  serviceType: string;
  currentStep: number;
  steps: ProcessStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  // legacy/frontend fields
  clientId?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message?: string;
  read?: boolean;
  createdAt?: Date | string;
  
  // backend fields (snake_case)
  usuario_id?: string;
  cliente_id?: string;
  titulo?: string;
  mensagem?: string;
  tipo?: 'info' | 'success' | 'warning' | 'error';
  lida?: boolean;
  data_prazo?: string;
  criado_em?: string;
}

export interface RequiredDocument {
  type: string;
  name: string;
  description: string;
  required: boolean;
  examples?: string[];
  processoId?: string;     // ID do processo ao qual este documento pertence
  processoTipo?: string;   // Tipo do processo (ex: "Visto de Trabalho - Canadá")
}

export interface ApprovedDocument {
  id: string;
  clientId: string;
  name: string;
  originalLanguage: string;
  targetLanguages: string[];
  isApostilled?: boolean;
  approvalDate: Date;
  fileUrl?: string;
}

export interface TranslatedDocument {
  id: string;
  clientId: string;
  approvedDocumentId: string;
  documentName: string;
  sourceLanguage: string;
  targetLanguage: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  fileUrl?: string;
}

export interface QuoteRequest {
  id: string;
  clientId: string;
  approvedDocumentIds: string[];
  targetLanguages: string[];
  status: 'pendente' | 'respondido' | 'aceito' | 'recusado';
  createdAt: Date;
  responseDate?: Date;
}

export interface TranslationOrcamento {
  id: string;
  clientId: string;
  documentName: string;
  sourceLanguage: string;
  targetLanguage: string;
  value?: number;
  deliveryDate?: Date;
  notes?: string;
  status: 'pendente' | 'respondido' | 'aceito' | 'recusado';
  createdAt: Date;
  updatedAt: Date;
}
