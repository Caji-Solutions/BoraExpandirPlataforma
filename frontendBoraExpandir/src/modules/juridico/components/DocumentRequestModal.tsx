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
import { FilePlus, Loader2 } from 'lucide-react';
import { requestDocument } from '../services/juridicoService';
import { toast } from './ui/sonner';

interface DocumentRequestModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    clienteId: string;
    processoId?: string;
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
    onSuccess
}: DocumentRequestModalProps) {
    const [tipo, setTipo] = useState<string>('');
    const [outroTipo, setOutroTipo] = useState<string>('');
    const [notificar, setNotificar] = useState<boolean>(false);
    const [prazo, setPrazo] = useState<string>('7');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const tipoFinal = tipo === 'outro' ? outroTipo : tipo;
        
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
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FilePlus className="h-5 w-5 text-primary" />
                            Solicitar Documento
                        </DialogTitle>
                        <DialogDescription>
                            Crie uma solicitação de documento para o cliente. O registro ficará como pendente até que o cliente realize o upload.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tipo">Tipo de Documento</Label>
                            <Select value={tipo} onValueChange={setTipo}>
                                <SelectTrigger>
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
                                <Label htmlFor="outro">Especifique o tipo</Label>
                                <Input 
                                    id="outro" 
                                    placeholder="Ex: Certificado de Conclusão" 
                                    value={outroTipo}
                                    onChange={(e) => setOutroTipo(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="notificar"
                                checked={notificar}
                                onChange={(e) => setNotificar(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="notificar" className="cursor-pointer">Notificar Cliente?</Label>
                        </div>

                        {notificar && (
                            <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <Label htmlFor="prazo">Prazo para entrega (em dias)</Label>
                                <Input 
                                    id="prazo" 
                                    type="number"
                                    min="1"
                                    value={prazo}
                                    onChange={(e) => setPrazo(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Solicitando...
                                </>
                            ) : (
                                'Solicitar'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
