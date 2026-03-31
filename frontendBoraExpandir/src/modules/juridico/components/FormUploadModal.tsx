import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/modules/shared/components/ui/dialog';
import { Button } from '@/modules/shared/components/ui/button';
import { Label } from '@/modules/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/modules/shared/components/ui/select';
import { FileUp, Loader2, Upload, CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from '@/modules/shared/components/ui/sonner';
import { cn } from '@/lib/utils';

interface FormUploadModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    clienteId: string;
    processoId?: string;
    members?: { id: string, name: string, type: string, isTitular: boolean }[];
    onSuccess?: () => void;
}

export function FormUploadModal({
    isOpen,
    onOpenChange,
    clienteId,
    processoId,
    members = [],
    onSuccess
}: FormUploadModalProps) {
    const [membroId, setMembroId] = useState<string>(members.find(m => m.isTitular)?.id || clienteId);
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notificar, setNotificar] = useState<boolean>(true);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                toast.error('Por favor, selecione apenas arquivos PDF');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!file) {
            toast.error('Selecione um arquivo PDF para enviar');
            return;
        }

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('clienteId', clienteId);
            formData.append('processoId', processoId || '');
            formData.append('memberId', membroId === clienteId ? '' : membroId);
            formData.append('notificar', String(notificar));

            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
            const token = localStorage.getItem('auth_token');

            const response = await fetch(`${baseUrl}/juridico/formularios`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Falha ao enviar formulário');
            }
            
            toast.success('Formulário enviado com sucesso!');
            onOpenChange(false);
            setFile(null);
            if (onSuccess) onSuccess();
            
        } catch (error: any) {
            console.error('Erro ao enviar formulário:', error);
            toast.error(error.message || 'Erro ao enviar formulário');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] rounded-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black">
                            <div className="p-2 bg-orange-100 dark:bg-orange-950/30 rounded-lg">
                                <FileUp className="h-5 w-5 text-orange-600" />
                            </div>
                            Enviar Formulário
                        </DialogTitle>
                        <DialogDescription className="font-medium">
                            Anexe um arquivo PDF que o cliente ou dependente deve preencher.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-6">
                        {/* Member Selection */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Destinatário
                            </Label>
                            <Select value={membroId} onValueChange={setMembroId}>
                                <SelectTrigger className="h-12 rounded-xl border-2 focus:ring-primary/20">
                                    <SelectValue placeholder="Selecione quem deve preencher..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.length > 0 ? members.map((member) => (
                                        <SelectItem key={member.id} value={member.id} className="rounded-lg">
                                            {member.name} ({member.type})
                                        </SelectItem>
                                    )) : (
                                        <SelectItem value={clienteId}>Titular</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* File Upload Area */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Arquivo PDF
                            </Label>
                            <div 
                                onClick={() => !file && fileInputRef.current?.click()}
                                className={cn(
                                    "relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group",
                                    file 
                                        ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10" 
                                        : "border-muted-foreground/20 hover:border-orange-500 hover:bg-orange-50/20 dark:hover:bg-orange-950/10"
                                )}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    onChange={handleFileChange}
                                    accept="application/pdf"
                                />
                                
                                {file ? (
                                    <div className="flex flex-col items-center gap-3 w-full animate-in zoom-in duration-300">
                                       <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-sm">
                                         <CheckCircle2 className="h-7 w-7" />
                                       </div>
                                       <div className="text-center">
                                         <p className="text-sm font-bold text-foreground truncate max-w-[240px]">
                                           {file.name}
                                         </p>
                                         <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                                           {(file.size / 1024 / 1024).toFixed(2)} MB
                                         </p>
                                       </div>
                                       <Button 
                                         type="button"
                                         variant="ghost"
                                         size="sm"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           setFile(null);
                                         }}
                                         className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg h-8 px-3"
                                       >
                                         <Trash2 className="h-3.5 w-3.5 mr-2" /> 
                                         Remover
                                       </Button>
                                    </div>
                                ) : (
                                    <>
                                      <div className="p-4 bg-muted group-hover:bg-orange-100 dark:group-hover:bg-orange-950/40 rounded-2xl text-muted-foreground group-hover:text-orange-600 transition-colors shadow-sm">
                                        <Upload className="h-7 w-7" />
                                      </div>
                                      <div className="text-center">
                                        <p className="text-[13px] font-bold text-foreground">Clique para selecionar</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Apenas arquivos PDF (Máx. 10MB)</p>
                                      </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-muted/40 rounded-2xl border border-border/50">
                            <input
                                type="checkbox"
                                id="notificar-form"
                                checked={notificar}
                                onChange={(e) => setNotificar(e.target.checked)}
                                className="h-5 w-5 rounded-lg border-2 border-muted-foreground/30 text-primary focus:ring-primary/20 cursor-pointer"
                            />
                            <Label htmlFor="notificar-form" className="cursor-pointer font-bold text-sm text-foreground/80">
                                Notificar cliente por e-mail?
                            </Label>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="rounded-xl h-12 font-bold"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || !file} 
                            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-12 px-8 font-black shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ENVIANDO...
                                </>
                            ) : (
                                'ENVIAR PARA CLIENTE'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
