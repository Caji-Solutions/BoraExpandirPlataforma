import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/modules/shared/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/modules/shared/components/ui/input';
import { Label } from '@/modules/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/modules/shared/components/ui/select';
import { FilePlus, Loader2 } from 'lucide-react';
import { requestDocument } from '../services/juridicoService';
import { toast } from '@/modules/shared/components/ui/sonner';

interface DocumentRequestModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    clienteId: string;
    processoId?: string;
    members?: { id: string, name: string, type: string, isTitular: boolean }[];
    initialRequerimentoId?: string;
    onSuccess?: () => void;
}

const DOCUMENT_TYPES = [
    { value: 'passaporte', label: 'Passaporte' },
    { value: 'rg', label: 'RG / Documento de Identidade' },
    { value: 'cpf', label: 'CPF' },
    { value: 'certidao_nascimento', label: 'Certidão de Nascimento' },
    { value: 'certidao_casamento', label: 'Certidão de Casamento' },
    { value: 'comprovante_residencia', label: 'Comprovante de Residência' },
    { value: 'procuracao', label: 'Procuração' },
    { value: 'outro', label: 'Outro' },
];

export function DocumentRequestModal({
    isOpen,
    onOpenChange,
    clienteId,
    processoId,
    members = [],
    initialRequerimentoId,
    onSuccess
}: DocumentRequestModalProps) {
    const [tipo, setTipo] = useState<string>('');
    const [outroTipo, setOutroTipo] = useState<string>('');
    const [membroId, setMembroId] = useState<string>(members.find(m => m.isTitular)?.id || clienteId);
    const [notificar, setNotificar] = useState<boolean>(false);
    const [prazo, setPrazo] = useState<string>('7');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update selected member if members list changes
    React.useEffect(() => {
        if (members.length > 0 && !membroId) {
            setMembroId(members.find(m => m.isTitular)?.id || members[0].id);
        }
    }, [members]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const tipoFinal = tipo === 'outro' ? outroTipo : DOCUMENT_TYPES.find(d => d.value === tipo)?.label || tipo;
        
        if (!tipoFinal) {
            toast.error('Selecione ou informe o tipo de documento');
            return;
        }

        try {
            setIsSubmitting(true);
            await requestDocument({
                clienteId,
                tipo: tipoFinal,
                processoId,
                membroId,
                requerimentoId: initialRequerimentoId,
                notificar,
                prazo: notificar ? parseInt(prazo) : undefined
            });
            
            toast.success('Solicitação de documento criada com sucesso!');
            onOpenChange(false);
            if (onSuccess) onSuccess();
            
            // Reset form
            setTipo('');
            setOutroTipo('');
        } catch (error) {
            console.error('Erro ao solicitar documento:', error);
            toast.error('Falha ao criar solicitação de documento');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] rounded-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FilePlus className="h-5 w-5 text-blue-600" />
                            </div>
                            Solicitar Documento
                        </DialogTitle>
                        <DialogDescription>
                            Selecione o membro da família e o documento necessário.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-5 py-6">
                        {/* Member Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="membro" className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                Para quem é este documento?
                            </Label>
                            <Select value={membroId} onValueChange={setMembroId}>
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue placeholder="Selecione o membro..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.length > 0 ? members.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.name} ({member.type})
                                        </SelectItem>
                                    )) : (
                                        <SelectItem value={clienteId}>Titular (Padrão)</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Document Type Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="tipo" className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                Tipo de Documento
                            </Label>
                            <Select value={tipo} onValueChange={setTipo}>
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue placeholder="Selecione o tipo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map((doc) => (
                                        <SelectItem key={doc.value} value={doc.value}>
                                            {doc.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {tipo === 'outro' && (
                            <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <Label htmlFor="outro" className="text-xs font-bold">Especifique o tipo</Label>
                                <Input 
                                    id="outro" 
                                    placeholder="Ex: Certificado de Conclusão" 
                                    value={outroTipo}
                                    onChange={(e) => setOutroTipo(e.target.value)}
                                    className="h-11 rounded-xl"
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="bg-muted/30 p-4 rounded-xl space-y-4 border border-border/50">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="notificar"
                                    checked={notificar}
                                    onChange={(e) => setNotificar(e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                />
                                <Label htmlFor="notificar" className="cursor-pointer font-bold text-sm">Notificar</Label>
                            </div>

                            {notificar && (
                                <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-200 pl-8">
                                    <Label htmlFor="prazo" className="text-xs text-muted-foreground">Prazo para entrega (em dias)</Label>
                                    <Input 
                                        id="prazo" 
                                        type="number"
                                        min="1"
                                        value={prazo}
                                        onChange={(e) => setPrazo(e.target.value)}
                                        className="h-10 w-24 rounded-lg"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Solicitando...
                                </>
                            ) : (
                                'Enviar Solicitação'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
