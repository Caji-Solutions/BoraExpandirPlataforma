import { useState, useEffect } from 'react';
import { Loader2, UserCheck } from 'lucide-react';
import { Button } from '@/modules/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/modules/shared/components/ui/dialog';
import juridicoService, { FuncionarioJuridico } from '../services/juridicoService';

interface ModalSelecionarSupervisorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (supervisorId: string) => void;
  loading?: boolean;
}

export function ModalSelecionarSupervisor({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: ModalSelecionarSupervisorProps) {
  const [supervisores, setSupervisores] = useState<FuncionarioJuridico[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loadingSupervisores, setLoadingSupervisores] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchSupervisores = async () => {
      setLoadingSupervisores(true);
      try {
        const data = await juridicoService.getSupervisores();
        setSupervisores(data);
      } catch (error) {
        console.error('Erro ao buscar supervisores:', error);
      } finally {
        setLoadingSupervisores(false);
      }
    };

    fetchSupervisores();
  }, [open]);

  const handleConfirm = () => {
    if (!selectedId) return;
    onConfirm(selectedId);
    setSelectedId('');
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) setSelectedId('');
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Supervisor</DialogTitle>
          <DialogDescription>
            Escolha o supervisor que receberá este processo para protocolação.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto">
          {loadingSupervisores ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : supervisores.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum supervisor encontrado.
            </p>
          ) : (
            supervisores.map((sup) => (
              <button
                key={sup.id}
                onClick={() => setSelectedId(sup.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                  selectedId === sup.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/30 hover:bg-muted/30'
                }`}
              >
                <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                  selectedId === sup.id ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <UserCheck className={`h-4 w-4 ${
                    selectedId === sup.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {sup.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {sup.email}
                  </p>
                </div>
                {selectedId === sup.id && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedId || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Confirmar Envio'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
