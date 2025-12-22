import React, { useState } from "react";

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  documento: string; // cpf ou cnpj
}

const initial: FormData = {
  nome: "",
  email: "",
  telefone: "",
  documento: "",
};

export default function CadastroParceiro() {
  const [data, setData] = useState<FormData>(initial);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setData((d) => ({ ...d, [name]: value }));
  };
 const logoUrl = "/assets/bora-logo.png" 

  const isCPF = (doc: string) =>
    doc.replace(/\D/g, "").length === 11;

  const isCNPJ = (doc: string) =>
    doc.replace(/\D/g, "").length === 14;

  const validate = () => {
    if (!data.nome.trim()) return "Nome obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      return "E-mail inválido";
    if (data.telefone.replace(/\D/g, "").length < 10)
      return "Telefone incompleto";
    const digits = data.documento.replace(/\D/g, "");
    if (!(digits.length === 11 || digits.length === 14))
      return "CPF/CNPJ inválido";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/parceiro/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          documento: data.documento,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Falha ao cadastrar");
      }
      const json = await res.json();
      setSuccess(true);
      setData(initial);
    } catch (err: any) {
      setError("Falha ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 px-4 py-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <img
            src={logoUrl}
            alt="Bora Expandir"
            className="mx-auto rounded-sm object-contain h-14 w-auto max-w-[180px] md:h-16 md:max-w-[220px]"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        </div>

       
       
        
        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-xl p-5 shadow-sm">
         <h1 className="text-2xl font-semibold mb-1 text-foreground">Cadastro de Parceiro</h1>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <input
              name="nome"
              value={data.nome}
              onChange={handleChange}
              placeholder="Ex: João Silva"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">E-mail</label>
            <input
              name="email"
              type="email"
              value={data.email}
              onChange={handleChange}
              placeholder="email@dominio.com"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              placeholder="Sua senha"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              onInput={(e) => {
                const confirm = document.getElementById("confirmacaoSenha") as HTMLInputElement | null;
                if (confirm) {
                  confirm.setCustomValidity(confirm.value && confirm.value !== (e.currentTarget as HTMLInputElement).value ? "As senhas não conferem" : "");
                }
              }}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmar Senha</label>
            <input
              id="confirmacaoSenha"
              name="confirmacaoSenha"
              type="password"
              placeholder="Repita a senha"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              onInput={(e) => {
                const senha = document.getElementById("senha") as HTMLInputElement | null;
                const value = (e.currentTarget as HTMLInputElement).value;
                if (senha) {
                  (e.currentTarget as HTMLInputElement).setCustomValidity(value && value !== senha.value ? "As senhas não conferem" : "");
                }
              }}
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              As senhas devem ser iguais e ter ao menos 6 caracteres.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Telefone</label>
            <input
              name="telefone"
              value={data.telefone}
              onChange={handleChange}
              placeholder="(11) 98888-7777"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">CPF / CNPJ</label>
            <input
              name="documento"
              value={data.documento}
              onChange={handleChange}
              placeholder="Somente números"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Detectado: {data.documento
                ? isCPF(data.documento)
                  ? 'CPF'
                  : isCNPJ(data.documento)
                    ? 'CNPJ'
                    : 'Formato inválido'
                : '—'}
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              Parceiro cadastrado com sucesso!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Cadastrar Parceiro'}
          </button>
        </form>
      </div>
    </div>
  );
}