import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/modules/shared/components/ui/use-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

interface ContratoTemplate {
  id: string;
  nome: string;
  created_at: string;
}

export default function ContratosTemplatesPage() {
  const { token } = useAuth();
  const [contratos, setContratos] = useState<ContratoTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContratos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/adm/contratos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setContratos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar contratos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContratos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover este contrato? Ação irreversível.")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/adm/contratos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast({ title: "Sucesso", description: "Contrato removido com sucesso." });
        setContratos((prev) => prev.filter((c) => c.id !== id));
      } else {
        throw new Error("Falha ao deletar");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover contrato.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Meus Contratos
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie os modelos de contratos do sistema.</p>
        </div>
        <Link
          to="/adm/contratos/novo"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" />
          Novo Contrato
        </Link>
      </div>

      {loading ? (
        <div className="flex py-20 items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : contratos.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">Nenhum contrato criado ainda.</p>
          <Link
            to="/adm/contratos/novo"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            <Plus className="h-4 w-4" /> Criar o primeiro contrato
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 font-medium text-sm">Nome do Contrato</th>
                <th className="p-4 font-medium text-sm">Criado Em</th>
                <th className="p-4 font-medium text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contratos.map((contrato) => (
                <tr key={contrato.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm font-medium">{contrato.nome}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(contrato.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      to={`/adm/contratos/${contrato.id}`}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-transparent hover:bg-muted transition text-primary"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(contrato.id)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-transparent hover:bg-red-500/10 transition text-red-500"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
