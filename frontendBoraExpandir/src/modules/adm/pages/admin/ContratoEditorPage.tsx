import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Save, ArrowLeft, Upload, FileText } from "lucide-react";
import mammoth from "mammoth";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/modules/shared/components/ui/use-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["clean"],
  ],
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "color",
  "background",
  "align",
];

export default function ContratoEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const isNew = id === "novo";

  const [nome, setNome] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  // DEBUG - REMOVE BEFORE PROD
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const quillRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertTag = (tag: string) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const selection = editor.getSelection(true);
      const cursorPosition = selection ? selection.index : editor.getLength() - 1;

      editor.insertText(cursorPosition, tag);
      editor.setSelection(cursorPosition + tag.length, 0);

      toast({ title: "Adicionado", description: `Tag ${tag} inserida no texto.` });
    }
  };

  useEffect(() => {
    if (!isNew) {
      loadContrato();
    }
  }, [id]);

  const loadContrato = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/adm/contratos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNome(data.nome);
        setConteudo(data.conteudo_html);
      } else {
        toast({ title: "Erro", description: "Contrato não encontrado", variant: "destructive" });
        navigate("/adm/contratos");
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Falha na conexão", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      return toast({ title: "Aviso", description: "O contrato precisa de um nome.", variant: "destructive" });
    }
    if (!conteudo.trim() || conteudo === "<p><br></p>") {
      return toast({ title: "Aviso", description: "O conteúdo do contrato não pode estar vazio.", variant: "destructive" });
    }

    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const url = `${BACKEND_URL}/adm/contratos${isNew ? "" : `/${id}`}`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          conteudo_html: conteudo
        })
      });

      if (res.ok) {
        toast({ title: "Sucesso", description: `Contrato ${isNew ? "criado" : "atualizado"} com sucesso!` });
        navigate("/adm/contratos");
      } else {
        throw new Error("Erro ao salvar");
      }
    } catch (err) {
      toast({ title: "Erro", description: "Ocorreu um erro ao salvar o contrato.", variant: "destructive" });
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".docx")) {
      toast({ title: "Erro", description: "Apenas arquivos DOCX são aceitos.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer }, {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Normal'] => p:fresh",
        ],
      });

      setConteudo(result.value);
      toast({ title: "Sucesso", description: "DOCX convertido para HTML com sucesso!" });
    } catch (err) {
      console.error("Erro ao converter DOCX:", err);
      toast({ title: "Erro", description: "Falha ao converter o arquivo DOCX.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // DEBUG - REMOVE BEFORE PROD
  const handlePreviewPdf = async () => {
    if (!id || isNew) {
      toast({ title: "Aviso", description: "Salve o contrato primeiro para testar o preview.", variant: "destructive" });
      return;
    }

    setGeneratingPdf(true);
    try {
      const res = await fetch(`${BACKEND_URL}/adm/contratos/${id}/preview-pdf`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Falha ao gerar PDF");

      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
        toast({ title: "Sucesso", description: "Preview aberto em nova aba." });
      }
    } catch (err) {
      console.error("Erro ao gerar preview:", err);
      toast({ title: "Erro", description: "Falha ao gerar o preview do PDF.", variant: "destructive" });
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) return <div className="p-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin rounded-full"></div></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/adm/contratos")}
            className="p-2 hover:bg-muted rounded-md transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold">
            {isNew ? "Novo Contrato" : "Editar Contrato"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleDocxUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-secondary border border-border text-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Convertendo..." : "Importar DOCX"}
          </button>
          {/* DEBUG BUTTON - REMOVE BEFORE PROD */}
          {!isNew && (
            <button
              onClick={handlePreviewPdf}
              disabled={generatingPdf}
              className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition disabled:opacity-50"
              title="DEBUG: Gerar PDF para testar (REMOVER ANTES DO LANCAMENTO)"
            >
              <FileText className="h-4 w-4" />
              {generatingPdf ? "Gerando..." : "Debug PDF"}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Contrato"}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nome de Identificação (Ex: Assessoria Premium)</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite o nome do contrato..."
          className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex-1 flex gap-6 min-h-[400px]">
        <div className="flex-1 border border-input rounded-md overflow-hidden bg-background">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={conteudo}
            onChange={setConteudo}
            modules={modules}
            formats={formats}
            className="h-full compose-editor"
            placeholder="Cole aqui o texto do seu contrato..."
          />
        </div>

        <div className="w-64 flex flex-col shrink-0">
          <div className="bg-muted p-4 rounded-md border border-border flex-1">
            <h3 className="font-semibold text-sm mb-2">Variáveis Mágicas</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Clique em uma tag abaixo para inseri-la automaticamente onde o cursor estiver piscando.
            </p>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-320px)] pr-1 custom-scrollbar">
              {[
                { tag: "{{nome}}", desc: "Nome do cliente" },
                { tag: "{{documento}}", desc: "CPF ou Passaporte" },
                { tag: "{{nacionalidade}}", desc: "Nacionalidade" },
                { tag: "{{estado_civil}}", desc: "Estado Civil" },
                { tag: "{{profissao}}", desc: "Profissão" },
                { tag: "{{endereco}}", desc: "Endereço" },
                { tag: "{{email}}", desc: "E-mail" },
                { tag: "{{telefone}}", desc: "Telefone" },
                { tag: "{{tipo_servico}}", desc: "Nome do serviço em si" },
                { tag: "{{descricao_pessoas}}", desc: "Quem está no pacote" },
                { tag: "{{valor_pavao}}", desc: "Preço bruto da tabela" },
                { tag: "{{valor_desconto}}", desc: "Valor com descontos" },
                { tag: "{{valor_consultoria}}", desc: "Valor da consultoria" },
                { tag: "{{forma_pagamento}}", desc: "Método de pagamento" },
                { tag: "{{data}}", desc: "Data da geração" },
              ].map((v) => (
                <button
                  key={v.tag}
                  onClick={() => insertTag(v.tag)}
                  className="flex flex-col items-start px-3 py-2 bg-background rounded border border-border hover:border-primary hover:bg-primary/5 transition text-left"
                >
                  <span className="font-mono text-xs font-bold text-primary">{v.tag}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{v.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* We need some CSS to fix ReactQuill height inside flex container */}
      <style>{`
        .compose-editor .ql-container {
          height: calc(100% - 42px);
          font-family: inherit;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
