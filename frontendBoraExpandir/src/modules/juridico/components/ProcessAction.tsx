import { FileText, ExternalLink, ClipboardCheck, FilePlus, Eye, GitBranch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

    return (
        <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                Ações do Processo
            </h4>
            
            <div className="grid grid-cols-1 gap-2">
                <button 
                    onClick={() => handleAction('solicitar_documentos')}
                    className="w-full text-left p-3 text-xs bg-card hover:bg-muted border border-border rounded-xl transition-all flex justify-between items-center group shadow-sm hover:shadow-md"
                >
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                            <FileText className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold">Solicitar Documentos</span>
                    </div>
                    <ExternalLink className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                </button>

                <button 
                    onClick={() => handleAction('solicitar_requerimento')}
                    className="w-full text-left p-3 text-xs bg-card hover:bg-muted border border-border rounded-xl transition-all flex justify-between items-center group shadow-sm hover:shadow-md"
                >
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                            <ClipboardCheck className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold">Solicitar Requerimento</span>
                    </div>
                    <ExternalLink className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                </button>

                <button 
                    onClick={() => handleAction('solicitar_formulario')}
                    className="w-full text-left p-3 text-xs bg-card hover:bg-muted border border-border rounded-xl transition-all flex justify-between items-center group shadow-sm hover:shadow-md"
                >
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                            <FilePlus className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold">Solicitar Formulário</span>
                    </div>
                    <ExternalLink className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                </button>

                <button 
                    onClick={() => handleAction('ver_documentos')}
                    className="w-full text-left p-3 text-xs bg-card hover:bg-muted border border-border rounded-xl transition-all flex justify-between items-center group shadow-sm hover:shadow-md"
                >
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 rounded-lg text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                            <Eye className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold">Ver Documentos</span>
                    </div>
                    <ExternalLink className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                </button>

                <button 
                    onClick={() => handleAction('ver_processo')}
                    className="w-full text-left p-3 text-xs bg-card hover:bg-muted border border-border rounded-xl transition-all flex justify-between items-center group shadow-sm hover:shadow-md"
                >
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600 transition-colors group-hover:bg-slate-600 group-hover:text-white">
                            <GitBranch className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold">Ver Processo</span>
                    </div>
                    <ExternalLink className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
        </div>
    );
}
