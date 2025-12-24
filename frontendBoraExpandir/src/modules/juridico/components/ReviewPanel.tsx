import { useState } from "react";
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from '../../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DocumentViewer } from "./DocumentViewer";
import { ReviewActions } from "./ReviewActions";

// Dados mockados - Em produção viriam do Supabase
const mockDocuments = [
  { id: "1", name: "Passaporte", status: "approved" as const, filePath: "joao-silva/passaporte.pdf" },
  { id: "2", name: "Antecedentes Criminais", status: "pending" as const, filePath: "joao-silva/antecedentes.pdf" },
  { id: "3", name: "Contrato de Trabalho", status: "rejected" as const, filePath: "joao-silva/contrato.pdf" },
  { id: "4", name: "Comprovante de Residência", status: "pending" as const, filePath: "joao-silva/residencia.pdf" },
];

interface ReviewPanelProps {
  clientName: string;
  visaType: string;
}

export function ReviewPanel({ clientName, visaType }: ReviewPanelProps) {
  const [selectedDoc, setSelectedDoc] = useState(mockDocuments[1]); // Começa com doc pendente
  const [documents, setDocuments] = useState(mockDocuments);

  const handleStatusChange = (docId: string, newStatus: "approved" | "rejected") => {
    setDocuments(prev =>
      prev.map(doc => (doc.id === docId ? { ...doc, status: newStatus } : doc))
    );

    // Auto-seleciona o próximo documento pendente
    const nextPending = documents.find(
      doc => doc.id !== docId && doc.status === "pending"
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

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{clientName}</h1>
        <p className="text-muted-foreground mt-1">{visaType}</p>
      </div>

      {/* Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6 h-[calc(100vh-200px)]">
        {/* Painel Esquerdo - Checklist (30%) */}
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
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedDoc.id === doc.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(doc.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{doc.name}</p>
                        <div className="mt-2">{getStatusBadge(doc.status)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Painel Direito - Visualizador (70%) */}
        <div className="flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Visualizando: {selectedDoc.name}.pdf</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <DocumentViewer filePath={selectedDoc.filePath} />
            </CardContent>
          </Card>

          {/* Ações de Revisão */}
          <ReviewActions
            docId={selectedDoc.id}
            currentStatus={selectedDoc.status}
            onStatusChange={(newStatus) => handleStatusChange(selectedDoc.id, newStatus)}
          />
        </div>
      </div>
    </div>
  );
}
