import { FileText } from "lucide-react";

interface DocumentViewerProps {
  fileUrl: string;
}

export function DocumentViewer({ fileUrl }: DocumentViewerProps) {
  if (!fileUrl) {
    return (
      <div className="h-[600px] border-2 border-dashed rounded-lg bg-muted/30 flex flex-col items-center justify-center gap-4">
        <FileText className="h-12 w-12 text-muted-foreground opacity-40" />
        <p className="text-sm text-muted-foreground">Nenhum arquivo disponível</p>
      </div>
    );
  }

  const isPdf = fileUrl.toLowerCase().includes('.pdf') || fileUrl.toLowerCase().includes('pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(fileUrl);

  if (isPdf) {
    return (
      <div className="h-[600px] rounded-lg overflow-hidden border">
        <iframe
          src={fileUrl}
          className="w-full h-full"
          title="Visualizador de documento"
        />
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="h-[600px] border rounded-lg overflow-hidden flex items-center justify-center bg-muted/20">
        <img
          src={fileUrl}
          alt="Documento"
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  // Fallback para outros tipos: link de download
  return (
    <div className="h-[600px] border-2 border-dashed rounded-lg bg-muted/30 flex flex-col items-center justify-center gap-4">
      <FileText className="h-16 w-16 text-primary" />
      <p className="text-sm text-muted-foreground">Tipo de arquivo não suportado para visualização</p>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary underline hover:opacity-80"
      >
        Abrir arquivo
      </a>
    </div>
  );
}
