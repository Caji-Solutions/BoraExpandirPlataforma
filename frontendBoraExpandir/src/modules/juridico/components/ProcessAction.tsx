import { FileText, ExternalLink, ClipboardCheck, Files, LayoutDashboard, GitBranch, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ProcessActionProps {
    clienteId: string;
    processoId?: string;
    onActionClick?: (action: string, ids: { clienteId: string, processoId?: string }) => void;
}

export function ProcessAction({
    clienteId,
    processoId,
    onActionClick
}: ProcessActionProps) {
    const navigate = useNavigate();

    const handleAction = (action: string) => {
        if (action === 'ver_processo' && processoId) {
            navigate(`/juridico/processos?expand=${processoId}`);
            return;
        }

        if (action === 'ver_documentos' && processoId) {
            navigate(`/juridico/analise?processoId=${processoId}`);
            return;
        }

        if (onActionClick) {
            onActionClick(action, { clienteId, processoId });
        }
    };

    const ACTION_BUTTONS = [
        {
            id: 'solicitar_documentos',
            name: 'Solicitar Documento',
            icon: FileText,
            color: 'blue',
            description: 'Registrar pendência de arquivo no sistema'
        },
        {
            id: 'solicitar_formulario',
            name: 'Enviar Formulário',
            icon: Files,
            color: 'orange',
            description: 'Coletar dados via formulário PDF'
        },
        {
            id: 'ver_documentos',
            name: 'Analisar Documentos',
            icon: Eye,
            color: 'green',
            description: 'Verificar envios e aprovar etapas'
        },
        {
            id: 'ver_processo',
            name: 'Dados do Processo',
            icon: LayoutDashboard,
            color: 'slate',
            description: 'Acessar painel completo do caso'
        }
    ];

    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                Ações Rápidas
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
