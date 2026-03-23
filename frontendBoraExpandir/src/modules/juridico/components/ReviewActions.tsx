import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { updateFormularioClienteStatus } from "../services/juridicoService";

interface ReviewActionsProps {
  docId: string;
  responseId: string | null;
  currentStatus: "approved" | "pending" | "rejected";
  onStatusChange: (status: "approved" | "rejected") => void;
}

export function ReviewActions({
  responseId,
  currentStatus,
  onStatusChange,
}: ReviewActionsProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApostilled, setIsApostilled] = useState(false);
  const [message, setMessage] = useState<null | { type: "success" | "error"; title: string; description?: string }>(null);

  // Reset state when doc changes
  useEffect(() => {
    setIsRejecting(false);
    setReason("");
    setIsApostilled(false);
    setMessage(null);
  }, [docId]);

  // Auto-clear transient messages
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const handleApprove = async () => {
    if (!responseId) return;
    setIsProcessing(true);
    try {
      await updateFormularioClienteStatus(responseId, 'aprovado');
      onStatusChange("approved");
      setMessage({
        type: "success",
        title: "Documento aprovado com sucesso!",
        description: "Avançando para o próximo documento...",
      });
    } catch (err: any) {
      setMessage({ type: "error", title: "Erro ao aprovar", description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setMessage({ type: "error", title: "Motivo obrigatório", description: "Indique o motivo da rejeição." });
      return;
    }
    if (!responseId) return;
    setIsProcessing(true);
    try {
      await updateFormularioClienteStatus(responseId, 'rejeitado', reason);
      onStatusChange("rejected");
      setMessage({
        type: "error",
        title: "Documento rejeitado",
        description: "O cliente será notificado automaticamente.",
      });
      setIsRejecting(false);
      setReason("");
    } catch (err: any) {
      setMessage({ type: "error", title: "Erro ao rejeitar", description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Se já foi aprovado ou rejeitado, mostra status apenas
  if (currentStatus !== "pending") {
    return (
      <div className="flex items-center justify-center gap-3 py-4">
        {currentStatus === "approved" ? (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Documento já aprovado</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Documento já rejeitado</span>
          </div>
        )}
      </div>
    );
  }

  if (isRejecting) {
    return (
      <div className="space-y-4 p-4 bg-destructive-light border-2 border-destructive/20 rounded-lg">
        {message && (
          <div
            className={`rounded-md p-3 text-sm flex flex-col gap-1 ${message.type === "success"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
              }`}
          >
            <strong>{message.title}</strong>
            {message.description && <span className="text-muted-foreground text-xs">{message.description}</span>}
          </div>
        )}
        <div>
          <label className="text-sm font-semibold text-destructive block mb-2">
            Motivo da Rejeição
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: O documento está ilegível. Por favor, envie uma cópia com melhor qualidade..."
            className="min-h-[100px] bg-background"
            disabled={isProcessing}
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button
            onClick={() => {
              setIsRejecting(false);
              setReason("");
            }}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleReject}
            disabled={isProcessing}
            className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <XCircle className="h-4 w-4" />
            Confirmar Rejeição
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {message && (
        <div
          className={`rounded-md p-3 text-sm flex flex-col gap-1 ${message.type === "success"
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive"
            }`}
        >
          <strong>{message.title}</strong>
          {message.description && <span className="text-muted-foreground text-xs">{message.description}</span>}
        </div>
      )}
      <div className="flex gap-4 justify-end items-center">
        <div className="flex items-center space-x-2 mr-4">
          <Checkbox
            id="apostilled"
            checked={isApostilled}
            onCheckedChange={(checked) => setIsApostilled(checked as boolean)}
          />
          <label
            htmlFor="apostilled"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Documento já apostilado?
          </label>
        </div>

        <Button
          className="border-destructive/30 text-destructive hover:bg-destructive-light gap-2"
          onClick={() => setIsRejecting(true)}
          disabled={isProcessing}
        >
          Rejeitar Documento
        </Button>
        <Button
          className="bg-success hover:bg-success/90 text-success-foreground gap-2 shadow-md"
          onClick={handleApprove}
          disabled={isProcessing || !responseId}
        >
          <CheckCircle className="h-4 w-4" />
          Aprovar Documento
        </Button>
      </div>
    </div>
  );
}
