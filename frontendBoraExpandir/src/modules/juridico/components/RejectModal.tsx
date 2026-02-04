import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

interface RejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  title?: string;
  description?: string;
  loading?: boolean;
  reasons?: { value: string; label: string }[];
}

const DEFAULT_REASONS = [
  { value: 'ilegivel', label: 'Documento Ilegível' },
  { value: 'invalido', label: 'Documento Inválido/Expirado' },
  { value: 'incompleto', label: 'Documento Incompleto' },
  { value: 'errado', label: 'Documento Incorreto (Outro tipo enviado)' },
  { value: 'outros', label: 'Outros (Especificar)' }
];

export function RejectModal({
  open,
  onOpenChange,
  onConfirm,
  title = 'Rejeitar',
  description = 'Por favor, informe o motivo da rejeição.',
  loading = false,
  reasons = DEFAULT_REASONS,
}: RejectModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const handleConfirm = () => {
    const finalReason = selectedReason === 'outros' 
      ? customReason 
      : reasons.find(r => r.value === selectedReason)?.label || selectedReason;
    
    onConfirm(finalReason);
    
    // Reset state after confirm
    setSelectedReason('');
    setCustomReason('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setSelectedReason('');
      setCustomReason('');
    }
    onOpenChange(newOpen);
  };

  const isConfirmDisabled = !selectedReason || (selectedReason === 'outros' && !customReason.trim()) || loading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da Rejeição</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um motivo" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map(reason => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReason === 'outros' && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Descreva o motivo</Label>
              <Textarea 
                id="custom-reason"
                placeholder="Digite o motivo detalhado..."
                value={customReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Rejeição
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
