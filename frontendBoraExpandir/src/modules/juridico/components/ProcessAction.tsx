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
} from 'lucide-react';

interface ProcessActionProps {
    clienteId: string;
    processoId?: string;
    responsavel?: { id: string, nome: string }; // Novo prop: Responsável pelo processo
    onActionClick?: (action: string, ids: { clienteId: string, processoId?: string }) => void;
}

export function ProcessAction({
    clienteId,
    processoId,
    responsavel,
    onActionClick
}: ProcessActionProps) {
    const navigate = useNavigate();
    const { activeProfile, profile, setImpersonatedProfile } = useAuth();

    const ALL_BUTTONS = [
        {
            id: 'solicitar_documentos',
            name: activeProfile?.role === 'comercial' ? 'Solicitar Orçamento Apostilagem' : 'Solicitar Documento',
            icon: FileText,
            color: 'blue',
            description: activeProfile?.role === 'comercial' ? 'Solicitar orçamento de apostilamento' : 'Registrar pendência de arquivo no sistema',
            roles: ['super_admin', 'juridico', 'comercial', 'administrativo', 'tradutor'],
            isJuridico: true
        },
        {
            id: 'solicitar_formulario',
            name: 'Enviar Formulário',
            icon: Files,
            color: 'orange',
            description: 'Coletar dados via formulário PDF',
            roles: ['super_admin', 'juridico'],
            isJuridico: true
        },
        {
            id: 'ver_documentos',
            name: 'Analisar Documentos',
            icon: Eye,
            color: 'green',
            description: 'Verificar envios e aprovar etapas',
            roles: ['super_admin', 'juridico'],
            isJuridico: true
        },
        {
            id: 'ver_processo',
            name: activeProfile?.role === 'comercial' ? 'Solicitar Orçamento Tradução' : 'Dados do Processo',
            icon: LayoutDashboard,
            color: 'slate',
            description: activeProfile?.role === 'comercial' ? 'Solicitar orçamento de tradução' : 'Acessar painel completo do caso',
            roles: ['super_admin', 'juridico', 'comercial', 'administrativo', 'tradutor'],
            isJuridico: true
        },
        {
            id: 'admin_config',
            name: 'Gestão de Permissões',
            icon: ShieldCheck,
            color: 'purple',
            description: 'Painel de controle administrativo',
            roles: ['super_admin'],
            isJuridico: false
        },
        {
            id: 'comercial_agenda',
            name: activeProfile?.role === 'comercial' ? 'Agendar Consultoria' : 'Agendar Reunião',
            icon: Calendar,
            color: 'blue',
            description: activeProfile?.role === 'comercial' ? 'Agendar consultoria inicial' : 'Marcar call de boas-vindas comercial',
            roles: ['comercial', 'super_admin'],
            isJuridico: false
        },
        {
            id: 'financeiro_fatura',
            name: 'Gerar Fatura',
            icon: DollarSign,
            color: 'green',
            description: 'Emitir cobrança administrativa',
            roles: ['administrativo', 'super_admin'],
            isJuridico: false
        }
    ];

    const handleAction = (actionId: string) => {
        // Mock buttons for commercial role
        if (activeProfile?.role === 'comercial') {
            if (actionId === 'solicitar_documentos' || actionId === 'ver_processo') {
                return; // Nothing happens
            }
        }

        const btn = ALL_BUTTONS.find(b => b.id === actionId);
        
        // Regra de Impersonation: Se for admin clicando em função jurídica e houver um responsável
        if (profile?.role === 'super_admin' && btn?.isJuridico && responsavel) {
            // Se já não estivermos visualizando como esse responsável
            if (activeProfile?.id !== responsavel.id) {
                setImpersonatedProfile({
                    id: responsavel.id,
                    full_name: responsavel.nome,
                    email: 'juridico@sistema.com',
                    role: 'juridico'
                });
            }
        }

        if (actionId === 'ver_processo' && processoId) {
            navigate(`/juridico/processos?expand=${processoId}`);
            return;
        }

        if (actionId === 'ver_documentos' && processoId) {
            navigate(`/juridico/analise?processoId=${processoId}`);
            return;
        }

        if (onActionClick) {
            onActionClick(actionId, { clienteId, processoId });
        }
    };

    const ACTION_BUTTONS = ALL_BUTTONS.filter(btn => 
        !activeProfile?.role || btn.roles.includes(activeProfile.role)
    );

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
