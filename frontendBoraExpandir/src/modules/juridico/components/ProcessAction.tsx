
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '../../../contexts/AuthContext';
import { 
    FileText, 
    ExternalLink, 
    Files, 
    LayoutDashboard, 
    Eye, 
    ShieldCheck, 
    DollarSign, 
    Calendar,
    FileSearch,
    Languages,
    FileCheck
} from 'lucide-react';
import { toast } from '@/modules/shared/components/ui/sonner';

interface ProcessActionProps {
    clienteId: string;
    processoId?: string;
    client?: any; // Objeto completo do cliente para ações complexas
    responsavel?: { id: string, nome: string };
    areaFilter?: 'todos' | 'juridico' | 'comercial' | 'administrativo';
    onActionClick?: (action: string, ids: { clienteId: string, processoId?: string }) => void;
    onSolicitarDocumentos?: () => void;
    onSolicitarFormulario?: () => void;
    onSolicitarApostilagem?: () => void;
    onSolicitarTraducao?: () => void;
    onGerarFatura?: () => void;
    onSetTab?: (tab: string) => void;
    localProcessoId?: string;
}

export function ProcessAction({
    clienteId,
    processoId,
    client,
    responsavel,
    areaFilter = 'todos',
    onActionClick,
    onSolicitarDocumentos,
    onSolicitarFormulario,
    onSolicitarApostilagem,
    onSolicitarTraducao,
    onGerarFatura,
    onSetTab,
    localProcessoId
}: ProcessActionProps) {
    const navigate = useNavigate();
    const { activeProfile } = useAuth();

    const ALL_BUTTONS = [
        {
            id: 'solicitar_documentos',
            name: 'Solicitar Documento',
            icon: FileText,
            color: 'blue',
            description: 'Registrar pendência de arquivo no sistema',
            roles: ['super_admin', 'juridico', 'administrativo'],
            area: 'juridico',
            isJuridico: true
        },
        {
            id: 'solicitar_apostilagem',
            name: 'Solicitar Apostilagem',
            icon: FileCheck,
            color: 'blue',
            description: 'Solicitar orçamento de apostilamento de documentos',
            roles: ['super_admin', 'comercial'],
            area: 'comercial',
            isJuridico: false
        },
        {
            id: 'solicitar_traducao',
            name: 'Solicitar Tradução',
            icon: Languages,
            color: 'indigo',
            description: 'Solicitar orçamento para tradução juramentada',
            roles: ['super_admin', 'comercial'],
            area: 'comercial',
            isJuridico: false
        },
        {
            id: 'solicitar_formulario',
            name: 'Enviar Formulário',
            icon: Files,
            color: 'orange',
            description: 'Coletar dados via formulário PDF',
            roles: ['super_admin', 'juridico'],
            area: 'juridico',
            isJuridico: true
        },
        {
            id: 'ver_documentos',
            name: 'Analisar Documentos',
            icon: FileSearch,
            color: 'indigo',
            description: 'Acessar fila de análise deste cliente',
            roles: ['super_admin', 'juridico'],
            area: 'juridico',
            isJuridico: true
        },
        {
            id: 'comercial_agenda',
            name: 'Agendamento',
            icon: Calendar,
            color: 'blue',
            description: activeProfile?.role === 'comercial' ? 'Agendar consultoria inicial' : 'Marcar reunião comercial',
            roles: ['comercial', 'super_admin'],
            area: 'comercial',
            isJuridico: false
        },
        {
            id: 'financeiro_fatura',
            name: 'Gerar Fatura',
            icon: DollarSign,
            color: 'green',
            description: 'Emitir cobrança administrativa',
            roles: ['administrativo', 'super_admin'],
            area: 'administrativo',
            isJuridico: false
        }
    ];

    const handleAction = (actionId: string) => {
        console.log(`[ProcessAction] handleAction: ${actionId}`, { client, clienteId, processoId });

        switch (actionId) {
            case 'solicitar_documentos':
                onSolicitarDocumentos?.();
                break;
            case 'solicitar_formulario':
                onSolicitarFormulario?.();
                break;
            case 'solicitar_apostilagem':
                console.log('[ProcessAction] solicitar_apostilagem clicked', { onSolicitarApostilagem });
                if (onSolicitarApostilagem) {
                    onSolicitarApostilagem();
                } else {
                    console.warn('[ProcessAction] onSolicitarApostilagem callback not provided');
                }
                break;
            case 'solicitar_traducao':
                console.log('[ProcessAction] solicitar_traducao clicked', { onSolicitarTraducao });
                if (onSolicitarTraducao) {
                    onSolicitarTraducao();
                } else {
                    console.warn('[ProcessAction] onSolicitarTraducao callback not provided');
                }
                break;
            case 'comercial_agenda':
                console.log('[ProcessAction] comercial_agenda clicked', { client, clienteId });
                if (client) {
                    console.log('[ProcessAction] Navigating to /comercial/servicos with client:', client);
                    navigate('/comercial/servicos', {
                        state: {
                            preSelectedClient: client
                        }
                    });
                } else {
                    toast.error('Cliente não encontrado. Não é possível agendar.');
                    console.error('[ProcessAction] client is undefined or null');
                }
                break;
            case 'ver_processo':
                const pidProcesso = client?.processo_id || processoId;
                if (pidProcesso) {
                    navigate(`/juridico/processos?expand=${pidProcesso}`);
                } else {
                    toast.error('Este cliente ainda não possui um processo jurídico vinculado.');
                }
                break;
            case 'ver_documentos':
                const pidDocs = localProcessoId || client?.processo_id || processoId;
                if (pidDocs) {
                    navigate(`/juridico/analise?processoId=${pidDocs}`);
                } else {
                    toast.error('Este cliente ainda não possui um processo jurídico aberto.');
                }
                break;
            case 'financeiro_fatura':
                if (onGerarFatura) {
                    onGerarFatura();
                } else {
                    onSetTab?.('contrato_comprovantes');
                    toast.info('Redirecionado para aba de contratos. Selecione um contrato para gerenciar o financeiro.');
                }
                break;
            default:
                console.log('Action triggered:', actionId);
        }

        if (onActionClick) {
            onActionClick(actionId, { clienteId, processoId });
        }
    };

    const ACTION_BUTTONS = ALL_BUTTONS.filter(btn => {
        const hasRole = !activeProfile?.role || btn.roles.includes(activeProfile.role);
        const matchesArea = areaFilter === 'todos' || btn.area === areaFilter;
        return hasRole && matchesArea;
    });

    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                Ações Rápidas ({activeProfile?.full_name || 'Visitante'})
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
                {ACTION_BUTTONS.map((btn) => {
                    const Icon = btn.icon;
                    const colorMap: Record<string, string> = {
                        blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600',
                        purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600',
                        orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-600',
                        green: 'bg-green-100 text-green-600 group-hover:bg-green-600',
                        indigo: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600',
                        slate: 'bg-slate-100 text-slate-600 group-hover:bg-slate-600'
                    };

                    return (
                        <button 
                            key={btn.id}
                            onClick={() => handleAction(btn.id)}
                            className="group w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-border rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-left active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-3 rounded-xl transition-all duration-300 group-hover:text-white group-hover:scale-110 shadow-sm",
                                    colorMap[btn.color]
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                                        {btn.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground opacity-60 mt-0.5 leading-none font-medium">
                                        {btn.description}
                                    </span>
                                </div>
                            </div>
                            <div className="p-2 rounded-full border border-border group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
