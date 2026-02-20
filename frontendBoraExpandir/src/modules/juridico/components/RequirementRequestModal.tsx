import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from './ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { 
    ClipboardCheck, 
    Loader2, 
    Plus, 
    Trash2, 
    FileText, 
    User,
    ChevronRight,
    Upload,
    X
} from 'lucide-react';
import { requestRequirement, requestDocument } from '../services/juridicoService';
import { toast } from './ui/sonner';
import { ScrollArea } from './ui/scroll-area';

interface RequirementRequestModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    clienteId: string;
    processoId?: string;
    members?: { id: string, name: string, type: string, isTitular: boolean }[];
    onSuccess?: () => void;
}

const REQUIREMENT_TYPES = [
    { value: 'apostilamento', label: 'Apostilamento' },
    { value: 'traducao_juramentada', label: 'Tradução Juramentada' },
    { value: 'buscas_certidao', label: 'Buscas de Certidão' },
    { value: 'montagem_pasta', label: 'Montagem de Pasta' },
    { value: 'outro', label: 'Outro' },
];

const DOCUMENT_TYPES = [
    { value: 'passaporte', label: 'Passaporte' },
    { value: 'rg', label: 'RG / Identidade' },
    { value: 'certidao_nascimento', label: 'Certidão de Nascimento' },
    { value: 'certidao_casamento', label: 'Certidão de Casamento' },
    { value: 'comprovante_residencia', label: 'Comprovante de Residência' },
    { value: 'outro', label: 'Outro' },
];

export function RequirementRequestModal({
    isOpen,
    onOpenChange,
    clienteId,
    processoId,
    members = [],
    onSuccess
}: RequirementRequestModalProps) {
    const [identificador, setIdentificador] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    // List of documents to request within this requirement
    const [documentsToRequest, setDocumentsToRequest] = useState<{ id: string, type: string, memberId: string }[]>([]);
    const [newDocType, setNewDocType] = useState('');
    const [newDocMemberId, setNewDocMemberId] = useState(members.find(m => m.isTitular)?.id || clienteId);

    const handleAddDocument = () => {
        if (!newDocType) {
            toast.error('Selecione o tipo de documento');
            return;
        }
        
        const docLabel = DOCUMENT_TYPES.find(d => d.value === newDocType)?.label || newDocType;
        const memberName = members.find(m => m.id === newDocMemberId)?.name || 'Membro';

        setDocumentsToRequest([
            ...documentsToRequest,
            { id: Math.random().toString(36).substr(2, 9), type: docLabel, memberId: newDocMemberId }
        ]);
        setNewDocType('');
    };

    const handleRemoveDocument = (id: string) => {
        setDocumentsToRequest(documentsToRequest.filter(d => d.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setIsSubmitting(true);
            
            const finalNome = identificador || (documentsToRequest.length > 0 ? `Requerimento: ${documentsToRequest[0].type}` : 'Novo Requerimento');

            // Construct FormData for file upload and data
            const formData = new FormData();
            formData.append('clienteId', clienteId);
            formData.append('tipo', finalNome);
            if (processoId) formData.append('processoId', processoId);
            
            // Send documentosAcoplados as a JSON string
            if (documentsToRequest.length > 0) {
                const coupledDocs = documentsToRequest.map(doc => ({
                    type: doc.type,
                    memberId: doc.memberId
                }));
                formData.append('documentosAcoplados', JSON.stringify(coupledDocs));
            }

            // Append each file
            files.forEach(file => {
                formData.append('files', file);
            });

            // 1. Create Requirement Entity and handle everything in backend
            await requestRequirement(formData);
            
            toast.success('Requerimento e solicitações criados com sucesso!');
            onOpenChange(false);
            if (onSuccess) onSuccess();
            
            // Reset form
            setIdentificador('');
            setFiles([]);
            setDocumentsToRequest([]);
        } catch (error) {
            console.error('Erro ao solicitar requerimento:', error);
            toast.error('Falha ao criar requerimento');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-background">
                <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                    <DialogHeader className="p-8 bg-gradient-to-br from-purple-600/10 to-blue-600/5 border-b border-border/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-border/50">
                                <ClipboardCheck className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
                                    Solicitação de Requerimento
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground font-medium">
                                    Adicione documentos à solicitação e faça o upload de arquivos necessários.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <ScrollArea className="flex-1 p-8">
                        <div className="grid gap-8">
                            {/* Main Info Section */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <ChevronRight className="h-3 w-3 text-purple-500" />
                                    Identificador do Requerimento
                                </Label>
                                <Input 
                                    placeholder="Ex: Documentação Adicional - Processo 123" 
                                    value={identificador}
                                    onChange={(e) => setIdentificador(e.target.value)}
                                    className="h-12 rounded-xl bg-muted/30 border-none shadow-inner focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Document Request Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <FileText className="h-3 w-3 text-blue-500" />
                                        Solicitações Acopladas ({documentsToRequest.length})
                                    </Label>
                                </div>

                                <div className="bg-muted/30 border border-dashed border-border p-4 rounded-2xl">
                                    <div className="flex gap-2">
                                        <div className="w-[180px]">
                                            <Select value={newDocMemberId} onValueChange={setNewDocMemberId}>
                                                <SelectTrigger className="h-10 rounded-lg text-xs bg-white border-border/50">
                                                    <SelectValue placeholder="Membro..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {members.map(m => (
                                                        <SelectItem key={m.id} value={m.id} className="text-xs">
                                                            {m.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1">
                                            <Select value={newDocType} onValueChange={setNewDocType}>
                                                <SelectTrigger className="h-10 rounded-lg text-xs bg-white border-border/50">
                                                    <SelectValue placeholder="Documento a solicitar..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DOCUMENT_TYPES.map(d => (
                                                        <SelectItem key={d.value} value={d.value} className="text-xs">
                                                            {d.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button 
                                            type="button" 
                                            size="sm" 
                                            onClick={handleAddDocument}
                                            className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10"
                                        >
                                            <Plus className="h-4 w-4 mr-1" /> Add
                                        </Button>
                                    </div>

                                    {documentsToRequest.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {documentsToRequest.map((doc) => {
                                                const m = members.find(m => m.id === doc.memberId);
                                                return (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 bg-card rounded-xl border border-border animate-in slide-in-from-left-2"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                                                                <FileText className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-xs font-bold leading-none">{doc.type}</span>
                                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                                                    <User className="h-2 w-2" />
                                                                    {m?.name} ({m?.type})
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleRemoveDocument(doc.id)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upload Area */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Upload className="h-3 w-3 text-green-500" />
                                    Upload de Arquivos (Opcional)
                                </Label>
                                
                                <div 
                                    className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer group"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (e.dataTransfer.files) {
                                            setFiles([...files, ...Array.from(e.dataTransfer.files)]);
                                        }
                                    }}
                                >
                                    <input 
                                        type="file" 
                                        id="file-upload" 
                                        multiple 
                                        className="hidden" 
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setFiles([...files, ...Array.from(e.target.files)]);
                                            }
                                        }}
                                    />
                                    <div className="flex flex-col items-center">
                                        <div className="h-12 w-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-border group-hover:scale-110 transition-transform">
                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="mt-4 text-sm font-bold text-foreground">Clique ou arraste arquivos aqui</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-tighter mt-1 font-black">Sugerido: PDF, JPG, PNG (Max 10MB)</p>
                                    </div>
                                </div>

                                {files.length > 0 && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {files.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-border shadow-sm animate-in zoom-in-95">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold truncate max-w-[200px]">{file.name}</span>
                                                        <span className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFiles(files.filter((_, i) => i !== idx));
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-8 bg-muted/10 border-t border-border/50">
                        <div className="flex items-center justify-between w-full">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                                className="rounded-xl px-6 font-bold text-muted-foreground hover:bg-muted"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || documentsToRequest.length === 0}
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-10 shadow-xl shadow-purple-500/20 py-6 transition-all active:scale-95 disabled:grayscale"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCheck className="mr-2 h-5 w-5" />
                                        Criar Requerimento
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
