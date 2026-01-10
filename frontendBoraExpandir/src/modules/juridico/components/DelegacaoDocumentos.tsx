import { useState } from "react";
import { 
  FileText, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Filter,
  Search,
  UserPlus,
  Eye
} from "lucide-react";

// Tipos
interface DocumentoCliente {
  id: string;
  clienteNome: string;
  clienteId: string;
  tipoServico: string;
  documentos: {
    nome: string;
    tipo: string;
    dataUpload: string;
    status: 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado';
  }[];
  dataSubmissao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  delegadoPara: string | null;
  status: 'aguardando_delegacao' | 'delegado' | 'em_analise' | 'concluido';
}

interface MembroEquipe {
  id: string;
  nome: string;
  cargo: string;
  processosAtivos: number;
  disponibilidade: 'disponivel' | 'ocupado' | 'ausente';
  avatar?: string;
}

// Mock de documentos enviados por clientes aguardando delegação
const mockDocumentosClientes: DocumentoCliente[] = [
  {
    id: "DOC-001",
    clienteNome: "João Pedro Silva",
    clienteId: "CLI-2025-001",
    tipoServico: "Visto D7",
    documentos: [
      { nome: "Passaporte.pdf", tipo: "Identificação", dataUpload: "2026-01-08", status: 'pendente' },
      { nome: "Comprovante_Renda.pdf", tipo: "Financeiro", dataUpload: "2026-01-08", status: 'pendente' },
      { nome: "Extrato_Bancario.pdf", tipo: "Financeiro", dataUpload: "2026-01-08", status: 'pendente' },
    ],
    dataSubmissao: "2026-01-08",
    prioridade: 'alta',
    delegadoPara: null,
    status: 'aguardando_delegacao',
  },
  {
    id: "DOC-002",
    clienteNome: "Maria Costa Oliveira",
    clienteId: "CLI-2025-002",
    tipoServico: "Cidadania Portuguesa",
    documentos: [
      { nome: "Certidao_Nascimento.pdf", tipo: "Civil", dataUpload: "2026-01-07", status: 'pendente' },
      { nome: "Certidao_Casamento.pdf", tipo: "Civil", dataUpload: "2026-01-07", status: 'pendente' },
    ],
    dataSubmissao: "2026-01-07",
    prioridade: 'media',
    delegadoPara: null,
    status: 'aguardando_delegacao',
  },
  {
    id: "DOC-003",
    clienteNome: "Carlos Eduardo Santos",
    clienteId: "CLI-2025-003",
    tipoServico: "Autorização de Residência",
    documentos: [
      { nome: "Contrato_Trabalho.pdf", tipo: "Trabalho", dataUpload: "2026-01-06", status: 'em_analise' },
      { nome: "NIF.pdf", tipo: "Fiscal", dataUpload: "2026-01-06", status: 'aprovado' },
    ],
    dataSubmissao: "2026-01-06",
    prioridade: 'baixa',
    delegadoPara: "Ana Lucia",
    status: 'delegado',
  },
  {
    id: "DOC-004",
    clienteNome: "Fernanda Lima",
    clienteId: "CLI-2025-004",
    tipoServico: "Renovação Visto",
    documentos: [
      { nome: "Passaporte_Atual.pdf", tipo: "Identificação", dataUpload: "2026-01-09", status: 'pendente' },
      { nome: "Comprovante_Residencia.pdf", tipo: "Residência", dataUpload: "2026-01-09", status: 'pendente' },
      { nome: "Seguro_Saude.pdf", tipo: "Seguro", dataUpload: "2026-01-09", status: 'pendente' },
    ],
    dataSubmissao: "2026-01-09",
    prioridade: 'alta',
    delegadoPara: null,
    status: 'aguardando_delegacao',
  },
];

// Mock de membros da equipe jurídica
const mockMembrosEquipe: MembroEquipe[] = [
  { id: "MEM-001", nome: "Ana Lucia", cargo: "Advogada Sênior", processosAtivos: 8, disponibilidade: 'disponivel' },
  { id: "MEM-002", nome: "Ricardo Mendes", cargo: "Advogado Pleno", processosAtivos: 12, disponibilidade: 'ocupado' },
  { id: "MEM-003", nome: "Juliana Ferreira", cargo: "Advogada Júnior", processosAtivos: 5, disponibilidade: 'disponivel' },
  { id: "MEM-004", nome: "Pedro Almeida", cargo: "Paralegal", processosAtivos: 3, disponibilidade: 'disponivel' },
  { id: "MEM-005", nome: "Mariana Costa", cargo: "Advogada Pleno", processosAtivos: 10, disponibilidade: 'ausente' },
];

// Componente de Badge de Prioridade
function PrioridadeBadge({ prioridade }: { prioridade: 'alta' | 'media' | 'baixa' }) {
  const config = {
    alta: { bg: 'bg-red-100', text: 'text-red-700', label: 'Alta' },
    media: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Média' },
    baixa: { bg: 'bg-green-100', text: 'text-green-700', label: 'Baixa' },
  };
  const { bg, text, label } = config[prioridade];
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${bg} ${text}`}>
      {label}
    </span>
  );
}

// Componente de Status
function StatusBadge({ status }: { status: DocumentoCliente['status'] }) {
  const config = {
    aguardando_delegacao: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Aguardando Delegação' },
    delegado: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Delegado' },
    em_analise: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Em Análise' },
    concluido: { bg: 'bg-green-100', text: 'text-green-700', label: 'Concluído' },
  };
  const { bg, text, label } = config[status];
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${bg} ${text}`}>
      {label}
    </span>
  );
}

// Componente de Disponibilidade
function DisponibilidadeBadge({ disponibilidade }: { disponibilidade: MembroEquipe['disponibilidade'] }) {
  const config = {
    disponivel: { bg: 'bg-green-500', label: 'Disponível' },
    ocupado: { bg: 'bg-yellow-500', label: 'Ocupado' },
    ausente: { bg: 'bg-gray-400', label: 'Ausente' },
  };
  const { bg } = config[disponibilidade];
  return (
    <span className={`w-2.5 h-2.5 rounded-full ${bg}`} title={config[disponibilidade].label} />
  );
}

export function DelegacaoDocumentos() {
  const [documentos, setDocumentos] = useState(mockDocumentosClientes);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentoCliente | null>(null);
  const [showDelegacaoModal, setShowDelegacaoModal] = useState(false);

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    const matchStatus = filtroStatus === 'todos' || doc.status === filtroStatus;
    const matchSearch = doc.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        doc.tipoServico.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Estatísticas
  const aguardandoDelegacao = documentos.filter(d => d.status === 'aguardando_delegacao').length;
  const delegados = documentos.filter(d => d.status === 'delegado').length;
  const emAnalise = documentos.filter(d => d.status === 'em_analise').length;

  // Delegar documento
  const delegarDocumento = (docId: string, membroId: string) => {
    const membro = mockMembrosEquipe.find(m => m.id === membroId);
    if (membro) {
      setDocumentos(prev => prev.map(doc => 
        doc.id === docId 
          ? { ...doc, delegadoPara: membro.nome, status: 'delegado' as const }
          : doc
      ));
      setShowDelegacaoModal(false);
      setSelectedDoc(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-orange-600 mb-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Área exclusiva para Supervisores</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Delegação de Documentos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie e delegue os documentos enviados pelos clientes para a equipe jurídica
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aguardando Delegação</p>
              <p className="text-2xl font-bold text-orange-600">{aguardandoDelegacao}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Delegados</p>
              <p className="text-2xl font-bold text-blue-600">{delegados}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Análise</p>
              <p className="text-2xl font-bold text-purple-600">{emAnalise}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Documentos</p>
              <p className="text-2xl font-bold text-gray-700">{documentos.length}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="aguardando_delegacao">Aguardando Delegação</option>
              <option value="delegado">Delegado</option>
              <option value="em_analise">Em Análise</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Documentos</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioridade</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delegado Para</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documentosFiltrados.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{doc.clienteNome}</p>
                      <p className="text-sm text-gray-500">{doc.clienteId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{doc.tipoServico}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{doc.documentos.length} arquivo(s)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {new Date(doc.dataSubmissao).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <PrioridadeBadge prioridade={doc.prioridade} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-6 py-4">
                    {doc.delegadoPara ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {doc.delegadoPara.charAt(0)}
                          </span>
                        </div>
                        <span className="text-gray-700">{doc.delegadoPara}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Não delegado</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setShowDelegacaoModal(true);
                        }}
                        disabled={doc.status !== 'aguardando_delegacao'}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          doc.status === 'aguardando_delegacao'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <UserPlus className="h-4 w-4" />
                        Delegar
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {documentosFiltrados.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum documento encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </div>

      {/* Equipe Disponível */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipe Jurídica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockMembrosEquipe.map((membro) => (
            <div 
              key={membro.id} 
              className={`p-4 border rounded-lg ${
                membro.disponibilidade === 'disponivel' ? 'border-green-200 bg-green-50/50' :
                membro.disponibilidade === 'ocupado' ? 'border-yellow-200 bg-yellow-50/50' :
                'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {membro.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{membro.nome}</p>
                      <DisponibilidadeBadge disponibilidade={membro.disponibilidade} />
                    </div>
                    <p className="text-sm text-gray-500">{membro.cargo}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">Processos ativos:</span>
                <span className={`font-semibold ${
                  membro.processosAtivos > 10 ? 'text-red-600' :
                  membro.processosAtivos > 6 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {membro.processosAtivos}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Delegação */}
      {showDelegacaoModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowDelegacaoModal(false);
              setSelectedDoc(null);
            }}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5">
              <h3 className="font-bold text-white text-lg">Delegar Documento</h3>
              <p className="text-blue-100 text-sm mt-1">
                Selecione um membro da equipe para analisar os documentos
              </p>
            </div>

            {/* Info do Documento */}
            <div className="p-5 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border">
                  <FileText className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedDoc.clienteNome}</p>
                  <p className="text-sm text-gray-500">{selectedDoc.tipoServico} • {selectedDoc.documentos.length} documento(s)</p>
                </div>
              </div>
            </div>

            {/* Lista de Membros */}
            <div className="p-5 max-h-80 overflow-y-auto">
              <p className="text-sm font-medium text-gray-700 mb-3">Selecione o responsável:</p>
              <div className="space-y-2">
                {mockMembrosEquipe
                  .filter(m => m.disponibilidade !== 'ausente')
                  .map((membro) => (
                    <button
                      key={membro.id}
                      onClick={() => delegarDocumento(selectedDoc.id, membro.id)}
                      className="w-full p-3 border rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {membro.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{membro.nome}</p>
                            <DisponibilidadeBadge disponibilidade={membro.disponibilidade} />
                          </div>
                          <p className="text-sm text-gray-500">{membro.cargo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          membro.processosAtivos > 10 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {membro.processosAtivos} processos
                        </p>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors ml-auto" />
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setShowDelegacaoModal(false);
                  setSelectedDoc(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DelegacaoDocumentos;
