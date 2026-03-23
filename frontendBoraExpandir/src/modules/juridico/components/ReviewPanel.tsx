import { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from '../../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DocumentViewer } from "./DocumentViewer";
import { ReviewActions } from "./ReviewActions";
import { getFormulariosWithStatus } from "../services/juridicoService";

interface ReviewDocument {
  id: string;
  name: string;
  status: "approved" | "pending" | "rejected";
  fileUrl: string;
  responseId: string | null;
  hasResponse: boolean;
}

interface ReviewPanelProps {
  clientName: string;
  visaType: string;
  clienteId: string;
}

export function ReviewPanel({ clientName, visaType, clienteId }: ReviewPanelProps) {
  const [documents, setDocuments] = useState<ReviewDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ReviewDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getFormulariosWithStatus(clienteId);
        const mapped: ReviewDocument[] = data.map((f: any) => ({
          id: f.id,
          name: f.name,
          status: f.responseStatus === 'aprovado' ? 'approved'
                : f.responseStatus === 'rejeitado' ? 'rejected'
                : 'pending',
          fileUrl: f.response?.downloadUrl || '',
          responseId: f.response?.id || null,
          hasResponse: f.status === 'received',
        }));
        setDocuments(mapped);
        const firstPending = mapped.find(d => d.status === 'pending' && d.hasResponse);
        setSelectedDoc(firstPending || mapped[0] || null);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar documentos');
      } finally {
        setLoading(false);
      }
    };

    if (clienteId) fetchDocuments();
  }, [clienteId]);

  const handleStatusChange = (docId: string, newStatus: "approved" | "rejected") => {
    setDocuments(prev =>
      prev.map(doc => (doc.id === docId ? { ...doc, status: newStatus } : doc))
    );

    // Auto-seleciona o próximo documento pendente
    const nextPending = documents.find(
      doc => doc.id !== docId && doc.status === "pending" && doc.hasResponse
    );
    if (nextPending) {
      setTimeout(() => setSelectedDoc(nextPending), 300);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-success" />;
      case "rejected": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Aprovado</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="warning">Pendente</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (!selectedDoc) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Nenhum documento encontrado para este cliente.</p>
      </div>
    );
  }

  // Captura como const para narrowing dentro de closures
  const currentDoc: ReviewDocument = selectedDoc;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{clientName}</h1>
        <p className="text-muted-foreground mt-1">{visaType}</p>
      </div>

      {/* Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6 h-[calc(100vh-200px)]">
        {/* Painel Esquerdo - Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Checklist de Documentos</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {documents.filter(d => d.status === "approved").length}/{documents.length} aprovados
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-340px)]">
              <div className="p-4 space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${currentDoc.id === doc.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:bg-accent/50"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(doc.hasResponse ? doc.status : 'waiting')}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{doc.name}</p>
                        <div className="mt-2">
                          {doc.hasResponse ? getStatusBadge(doc.status) : <Badge variant="secondary">Aguardando envio</Badge>}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Painel Direito - Visualizador */}
        <div className="flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Visualizando: {currentDoc.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <DocumentViewer fileUrl={currentDoc.fileUrl} />
            </CardContent>
          </Card>

          {/* Ações de Revisão */}
          {currentDoc.hasResponse ? (
            <ReviewActions
              docId={currentDoc.id}
              responseId={currentDoc.responseId}
              currentStatus={currentDoc.status}
              onStatusChange={(newStatus) => handleStatusChange(currentDoc.id, newStatus)}
            />
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground border rounded-lg">
              Aguardando o cliente enviar este documento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
