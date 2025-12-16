export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  serviceType: string;
  paymentStatus: 'pending' | 'confirmed' | 'failed';
  accessGranted: boolean;
  isPartner?: boolean;
  createdAt: Date;
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
  referralList?: Referral[];
  referralLink?: string;
}

export interface Document {
  id: string;
  clientId: string;
  name: string;
  type: string;
  status: 'pending' | 'analyzing' | 'approved' | 'rejected';
  uploadDate: Date;
  rejectionReason?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface ProcessStep {
  id: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
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
  clientId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface RequiredDocument {
  type: string;
  name: string;
  description: string;
  required: boolean;
  examples?: string[];
}

export interface ApprovedDocument {
  id: string;
  clientId: string;
  name: string;
  originalLanguage: string;
  targetLanguages: string[];
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
