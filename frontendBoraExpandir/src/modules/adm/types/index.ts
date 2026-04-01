// Catalog Service types
export interface DocumentRequirement {
  id: string;
  name: string;
  stage: string;
  required: boolean;
}

export interface Subservice {
  id: string;
  name: string;
  servicoId?: string;
  servicoNome?: string;
  documents: DocumentRequirement[];
}

export type ServiceType = 'fixo' | 'agendavel' | 'diverso';

export interface Service {
  id: string;
  name: string;
  value: string;
  duration: string;
  type: ServiceType;
  showInCommercial: boolean;
  showToClient: boolean;
  documents: DocumentRequirement[];
  subservices: Subservice[];
}

// AdminSidebar types
export interface SectorTeam {
  label: string;
  role: string;
  members: any[];
  loading: boolean;
  expanded: boolean;
}

export interface AdminSidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}
