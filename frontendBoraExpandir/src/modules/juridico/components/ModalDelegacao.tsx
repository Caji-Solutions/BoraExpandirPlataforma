import { useState } from "react";
import { FileText, ChevronRight, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { atribuirResponsavel } from "../services/juridicoService";

// Tipos
export interface DocumentoCliente {
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

export interface MembroEquipe {
  id: string;
  nome: string;
  cargo: string;
  processosAtivos: number;
  disponibilidade: 'disponivel' | 'ocupado' | 'ausente';
  avatar?: string;
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

// Props do Modal
interface ModalDelegacaoProps {
  isOpen: boolean;
  documento: DocumentoCliente | null;
  membrosEquipe: MembroEquipe[];
  onClose: () => void;
  onDelegar: (docId: string, membroId: string) => void;
}

export function ModalDelegacao({ 
  isOpen, 
  documento, 
  membrosEquipe, 
  onClose, 
  onDelegar 
}: ModalDelegacaoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedMembroId, setSelectedMembroId] = useState<string | null>(null);

  if (!isOpen || !documento) return null;

  const membrosDisponiveis = membrosEquipe.filter(m => m.disponibilidade !== 'ausente');

  const handleDelegar = async (membroId: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedMembroId(membroId);

    try {
      // Faz o POST para o backend com processoId (documento.id) e responsavelId (membroId)
      await atribuirResponsavel(documento.id, membroId);
      
      setSuccess(true);
      
      // Aguarda um momento para mostrar sucesso, depois chama o callback
      setTimeout(() => {
        onDelegar(documento.id, membroId);
        setSuccess(false);
        setSelectedMembroId(null);
      }, 1000);
      
    } catch (err: any) {
      console.error('Erro ao delegar documento:', err);
      setError(err.message || 'Erro ao atribuir responsável. Tente novamente.');
      setSelectedMembroId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSuccess(false);
      setSelectedMembroId(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
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
              <p className="font-medium text-gray-900">{documento.clienteNome}</p>
              <p className="text-xs text-blue-600 font-mono">{documento.clienteId}</p>
              <p className="text-sm text-gray-500">
                {documento.tipoServico} • {documento.documentos.length} documento(s)
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Mensagem de Sucesso */}
        {success && (
          <div className="mx-5 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">Responsável atribuído com sucesso!</p>
          </div>
        )}

        {/* Lista de Membros */}
        <div className="p-5 max-h-80 overflow-y-auto">
          <p className="text-sm font-medium text-gray-700 mb-3">Selecione o responsável:</p>
          <div className="space-y-2">
            {membrosDisponiveis.map((membro) => {
              const isSelected = selectedMembroId === membro.id;
              const isDisabled = isLoading || success;
              
              return (
                <button
                  key={membro.id}
                  onClick={() => handleDelegar(membro.id)}
                  disabled={isDisabled}
                  className={`w-full p-3 border rounded-lg transition-all flex items-center justify-between group
                    ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50'}
                    ${isSelected && success ? 'border-green-400 bg-green-50' : ''}
                  `}
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
                  <div className="text-right flex items-center gap-2">
                    {isSelected && isLoading ? (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    ) : isSelected && success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <>
                        <p className={`text-sm font-medium ${
                          membro.processosAtivos > 10 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {membro.processosAtivos} processos
                        </p>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {membrosDisponiveis.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p>Nenhum membro disponível no momento</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`px-4 py-2 font-medium transition-colors ${
              isLoading 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {success ? 'Fechar' : 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalDelegacao;
