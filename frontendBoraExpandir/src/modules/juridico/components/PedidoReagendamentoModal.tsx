import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/modules/shared/components/ui/dialog';
import { Textarea } from '@/modules/shared/components/ui/textarea';
import juridicoService from '../services/juridicoService';

interface PedidoReagendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendamento: any;
  onSucesso: () => void;
}

export function PedidoReagendamentoModal({ isOpen, onClose, agendamento, onSucesso }: PedidoReagendamentoModalProps) {
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async () => {
    if (!mensagem.trim()) {
      toast.error('Informe o motivo do reagendamento.');
      return;
    }
    try {
      setEnviando(true);
      await juridicoService.pedidoReagendamento(agendamento.id, mensagem.trim());
      toast.success('Pedido de reagendamento enviado ao comercial.');
      setMensagem('');
      onSucesso();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar pedido de reagendamento.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="z-[60] sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 pb-4 border-b border-gray-100 dark:border-neutral-700">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <CalendarClock className="h-5 w-5 text-amber-500" />
            Pedido de Reagendamento
          </DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Informe o motivo pelo qual o agendamento precisa ser reagendado. O comercial sera notificado.
          </p>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">
              Motivo do Reagendamento <span className="text-rose-500">*</span>
            </label>
            <Textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Descreva o motivo pelo qual este agendamento precisa ser reagendado..."
              className="w-full min-h-[120px] resize-none"
              disabled={enviando}
            />
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={enviando}
            className="px-5 py-2.5 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleEnviar}
            disabled={enviando || !mensagem.trim()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {enviando ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CalendarClock className="h-4 w-4" />
            )}
            Enviar Pedido
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PedidoReagendamentoModal;
