import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, User, Mail, Phone, Clock, CheckCircle, Loader2, Briefcase, CheckSquare, ExternalLink } from 'lucide-react';
import assessoriaDiretaJuridicoService, { AssessoriaDiretaDetail as DetailType } from '../services/assessoriaDiretaService';
import { AssessoriaFormModal } from '../components/AssessoriaFormModal';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  em_espera: { label: 'Em Espera', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10 border-yellow-500/20' },
  em_andamento: { label: 'Em Andamento', color: 'text-blue-500', bgColor: 'bg-blue-500/10 border-blue-500/20' },
  realizado: { label: 'Realizado', color: 'text-green-500', bgColor: 'bg-green-500/10 border-green-500/20' },
};

export function AssessoriaDiretaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<DetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingEmAndamento, setIsMarkingEmAndamento] = useState(false);
  const [isMarkingRealizada, setIsMarkingRealizada] = useState(false);
  const [isAssessoriaFormModalOpen, setIsAssessoriaFormModalOpen] = useState(false);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await assessoriaDiretaJuridicoService.getAssessoriaDiretaDetail(id!);
      setDetail(data);
    } catch (err) {
      console.error('Erro ao buscar detalhe:', err);
      setError('Nao foi possivel carregar os detalhes.');
    } finally {
      setLoading(false);
    }
  };

  // Same flow as MeusAgendamentos "Iniciar Atendimento":
  // 1. Call iniciar (updates stage to assessoria_andamento)
  // 2. Open AssessoriaFormModal
  const handleIniciarAtendimento = async () => {
    if (!id || isMarkingEmAndamento) return;
    try {
      setIsMarkingEmAndamento(true);
      await assessoriaDiretaJuridicoService.iniciarAssessoriaDireta(id);
      setDetail(prev => prev ? { ...prev, statusAssessoria: 'em_andamento' } : prev);
      setIsAssessoriaFormModalOpen(true);
    } catch (err) {
      console.error('Erro ao iniciar atendimento:', err);
    } finally {
      setIsMarkingEmAndamento(false);
    }
  };

  // Same flow as MeusAgendamentos "Realizada":
  // Calls finalizar (updates stage to assessoria_finalizada)
  const handleRealizada = async () => {
    if (!id || isMarkingRealizada) return;
    try {
      setIsMarkingRealizada(true);
      await assessoriaDiretaJuridicoService.finalizarAssessoriaDireta(id);
      await fetchDetail();
    } catch (err) {
      console.error('Erro ao finalizar assessoria:', err);
    } finally {
      setIsMarkingRealizada(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse">
        <p className="text-muted-foreground">Carregando detalhes...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-8">
        <button onClick={() => navigate('/juridico/assessoria-direta')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="text-center text-red-500 py-8">
          <p>{error || 'Detalhes nao encontrados.'}</p>
        </div>
      </div>
    );
  }

  const status = detail.statusAssessoria || 'em_espera';
  const config = statusConfig[status] || statusConfig.em_espera;
  const hasAssessoria = !!detail.assessoria;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <button
        onClick={() => navigate('/juridico/assessoria-direta')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para lista
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {detail.cliente?.nome || detail.cliente_nome || 'Cliente'}
          </h1>
          <p className="text-muted-foreground mt-1">{detail.servico_nome || 'Servico'}</p>
        </div>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${config.bgColor} ${config.color}`}>
          {status === 'em_espera' && <Clock className="h-4 w-4" />}
          {status === 'em_andamento' && <Loader2 className="h-4 w-4" />}
          {status === 'realizado' && <CheckCircle className="h-4 w-4" />}
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Client & Comercial info */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="p-6 bg-card rounded-2xl border border-border">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <User className="h-4 w-4" /> Cliente
            </h3>
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{detail.cliente?.nome || detail.cliente_nome}</p>
              {detail.cliente?.email && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> {detail.cliente.email}
                </p>
              )}
              {detail.cliente?.whatsapp && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> {detail.cliente.whatsapp}
                </p>
              )}
            </div>
          </div>

          {/* Comercial Info */}
          {detail.comercial && (
            <div className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Comercial</h3>
              <p className="text-sm font-medium text-foreground">{detail.comercial.full_name}</p>
              <p className="text-sm text-muted-foreground">{detail.comercial.email}</p>
            </div>
          )}

          {/* Contract Info */}
          <div className="p-6 bg-card rounded-2xl border border-border">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Contrato
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Valor: <span className="font-semibold text-foreground">
                  {(detail.valorCalculado ?? detail.servico_valor) ? `€ ${Number(detail.valorCalculado ?? detail.servico_valor).toFixed(2)}` : 'N/A'}
                </span>
              </p>
              {detail.contrato_assinado_url && (
                <a
                  href={detail.contrato_assinado_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Ver contrato assinado
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Actions & Assessoria data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action buttons - replicates MeusAgendamentos flow */}
          <div className="p-6 bg-card rounded-2xl border border-border">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Ações</h3>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* "Iniciar Atendimento" / "Abrir Formulário" - same as MeusAgendamentos assessoria tab */}
              {status !== 'realizado' && (
                <button
                  onClick={status === 'em_espera' ? handleIniciarAtendimento : () => setIsAssessoriaFormModalOpen(true)}
                  disabled={isMarkingEmAndamento}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Briefcase className="h-4 w-4" />
                  {isMarkingEmAndamento
                    ? 'Iniciando...'
                    : status === 'em_espera'
                      ? 'Iniciar Atendimento'
                      : hasAssessoria
                        ? 'Editar Formulário'
                        : 'Abrir Formulário'}
                </button>
              )}

              {/* "Realizada" - visible after form has been filled (assessoria exists) */}
              {status === 'em_andamento' && hasAssessoria && (
                <button
                  onClick={handleRealizada}
                  disabled={isMarkingRealizada}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                >
                  <CheckSquare className="h-4 w-4" />
                  {isMarkingRealizada ? 'Salvando...' : 'Realizada'}
                </button>
              )}

              {status === 'realizado' && (
                <p className="text-sm text-green-500 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Assessoria finalizada com sucesso.
                </p>
              )}
            </div>
          </div>

          {/* Assessoria data if exists */}
          {detail.assessoria && (
            <div className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Dados da Assessoria</h3>
              {detail.assessoria.respostas ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(detail.assessoria.respostas as Record<string, unknown>).map(([key, value]) => {
                    if (value === null || value === undefined || value === '') return null;
                    return (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-foreground">
                          {typeof value === 'boolean'
                            ? (value ? 'Sim' : 'Não')
                            : typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum dado de assessoria disponivel.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AssessoriaFormModal - same modal used in MeusAgendamentos */}
      {isAssessoriaFormModalOpen && detail && (
        <AssessoriaFormModal
          clienteId={detail.cliente_id || detail.cliente?.id || ''}
          clienteNome={detail.cliente?.nome || detail.cliente_nome || 'Cliente'}
          agendamentoId={id!}
          produtoId={detail.servico_id}
          onClose={() => setIsAssessoriaFormModalOpen(false)}
          onSuccess={() => {
            setIsAssessoriaFormModalOpen(false);
            fetchDetail();
          }}
        />
      )}
    </div>
  );
}

export default AssessoriaDiretaDetail;
