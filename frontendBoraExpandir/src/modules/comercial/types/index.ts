// Re-export main types from shared modules
export type { Cliente, ClienteFormData, Contrato, ContratoFormData, LinkPagamento, AssinaturaDigital } from '@/types/comercial';

// Comercial-specific types
export interface AgendamentoComercial {
  id: string;
  usuarioId: string;
  clienteId: string;
  dataAgendamento: string;
  status: 'agendado' | 'realizado' | 'cancelado' | 'remarcado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}
