import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, Rocket, TrendingUp } from "lucide-react";
import { TERMO_PARCEIRO_TEXT } from "./TermoPadrao";
import { Badge } from "@/modules/shared/components/ui/badge";
import { cn } from "@/modules/cliente/lib/utils";

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  senha: string;
  confirmacaoSenha: string;
}

const initial: FormData = {
  nome: "",
  email: "",
  telefone: "",
  documento: "",
  senha: "",
  confirmacaoSenha: "",
};

export default function CadastroParceiro() {
  const navigate = useNavigate();
  const [data, setData] = useState<FormData>(initial);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermoModal, setShowTermoModal] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [aceitaTermoCheckbox, setAceitaTermoCheckbox] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      setHasScrolledToBottom(true);
    }
  };
  
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const logoUrl = "/assets/bora-logo.png";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((d) => ({ ...d, [name]: value }));
    setError(null);
  };

  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const formatDocumento = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
    }
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, "$1.$2.$3/$4-$5");
  };

  const isCPF = (doc: string) => doc.replace(/\D/g, "").length === 11;
  const isCNPJ = (doc: string) => doc.replace(/\D/g, "").length === 14;

  const validate = () => {
    if (!data.nome.trim()) return "Nome completo é obrigatório";
    if (data.nome.trim().split(" ").length < 2) return "Por favor, informe nome e sobrenome";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "E-mail inválido";
    if (data.telefone.replace(/\D/g, "").length < 10) return "Telefone incompleto (mínimo 10 dígitos)";
    const digits = data.documento.replace(/\D/g, "");
    if (!(digits.length === 11 || digits.length === 14)) return "CPF/CNPJ inválido";
    if (!data.senha || data.senha.length < 6) return "Senha deve ter no mínimo 6 caracteres";
    if (data.senha !== data.confirmacaoSenha) return "As senhas não conferem";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setShowTermoModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!hasScrolledToBottom || !aceitaTermoCheckbox) {
      console.log('Termos não aceitos ou scroll não finalizado');
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      console.log('Iniciando registro para:', data.email);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/parceiro/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone.replace(/\D/g, ""),
          documento: data.documento.replace(/\D/g, ""),
          senha: data.senha,
        }),
      });

      const result = await res.json().catch(() => ({ message: "Erro ao processar resposta do servidor" }));

      if (!res.ok) {
        throw new Error(result.message || "Falha ao cadastrar parceiro");
      }

      console.log('Registro bem sucedido:', result);
      setShowTermoModal(false);
      setSuccess(true);
      setData(initial);
      setAceitaTermoCheckbox(false);
      setHasScrolledToBottom(false);
      
    } catch (err: any) {
      console.error('Erro no fluxo de registro:', err);
      setError(err.message || "Erro ao cadastrar. Tente novamente.");
      setShowTermoModal(false); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8 flex items-center justify-center relative">
      
      {/* Modal de Termo */}
      {showTermoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in duration-300">
            
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Rocket className="text-white h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Termo de Parceria</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Bora Expandir • Versão 1.0</p>
                </div>
              </div>
              <Badge variant="outline" className="h-6 px-3 border-2 border-blue-500/20 text-blue-600 font-black text-[9px] uppercase tracking-widest">
                Ação Requerida
              </Badge>
            </div>

            <div 
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto bg-slate-50 dark:bg-gray-950 p-4 sm:p-8"
            >
              <div className="max-w-[700px] mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-sm p-6 sm:p-12 text-gray-800 dark:text-gray-200 min-h-[100vh] relative border border-gray-100 dark:border-gray-800">
                 <div className="flex flex-col items-center text-center mb-10 border-b pb-8 border-gray-100 dark:border-gray-800">
                    <h1 className="text-xl font-black tracking-tighter uppercase mb-2">Termos e Condições de Parceria Comercial</h1>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest leading-relaxed">Bora Expandir Ltda • CNPJ 55.218.947/0001-65</p>
                    <div className="w-16 h-1 bg-blue-600 mt-4 rounded-full" />
                 </div>

                 <div className="font-serif leading-relaxed text-[14px] text-justify whitespace-pre-wrap">
                    {TERMO_PARCEIRO_TEXT}
                 </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <div className="max-w-2xl mx-auto flex flex-col gap-4">
                
                {!hasScrolledToBottom && (
                  <div className="flex items-center justify-center gap-2 animate-bounce">
                    <TrendingUp className="text-blue-600 h-3 w-3 rotate-180" />
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Role até o final para habilitar</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border-2 transition-all flex-1 w-full text-left bg-white dark:bg-gray-800",
                    hasScrolledToBottom ? "border-blue-500/30" : "border-gray-200 dark:border-gray-700 opacity-50"
                  )}>
                    <input
                      type="checkbox"
                      id="aceita-termo-modal"
                      disabled={!hasScrolledToBottom}
                      checked={aceitaTermoCheckbox}
                      onChange={(e) => setAceitaTermoCheckbox(e.target.checked)}
                      className="mt-1 cursor-pointer accent-blue-600 w-5 h-5 rounded-lg disabled:cursor-not-allowed"
                    />
                    <label htmlFor="aceita-termo-modal" className={cn(
                      "text-xs font-bold cursor-pointer select-none leading-tight",
                      hasScrolledToBottom ? "text-gray-900 dark:text-white" : "text-gray-400"
                    )}>
                      Li e concordo integralmente com os termos da parceria comercial.
                    </label>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowTermoModal(false)}
                      className="px-6 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 uppercase text-[9px] tracking-widest"
                    >
                      Cancelar
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={!hasScrolledToBottom || !aceitaTermoCheckbox}
                      className={cn(
                        "px-6 py-4 font-black rounded-xl shadow-lg transition-all active:scale-95 uppercase text-[9px] tracking-widest flex items-center justify-center gap-2",
                        (hasScrolledToBottom && aceitaTermoCheckbox) 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed grayscale"
                      )}
                    >
                      <Check className="h-3 w-3" />
                      Aceitar e Cadastrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl relative z-10">
        <div className="mb-8 text-center">
          <img
            src={logoUrl}
            alt="Bora Expandir"
            className="mx-auto rounded-lg object-contain h-16 w-auto max-w-[200px] md:h-20 md:max-w-[250px] mb-4"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Seja um Parceiro
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Cadastre-se e tenha acesso à área de cliente como parceiro
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-5 border border-gray-100"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-red-500">*</span>
              Nome Completo
            </label>
            <input
              name="nome"
              value={data.nome}
              onChange={handleChange}
              placeholder="Ex: João Silva Santos"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-red-500">*</span>
              E-mail
            </label>
            <input
              name="email"
              type="email"
              value={data.email}
              onChange={handleChange}
              placeholder="seu.email@exemplo.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-red-500">*</span>
                Telefone
              </label>
              <input
                name="telefone"
                value={data.telefone}
                onChange={(e) => {
                  const formatted = formatTelefone(e.target.value);
                  setData((d) => ({ ...d, telefone: formatted }));
                }}
                placeholder="(11) 98888-7777"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                maxLength={15}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-red-500">*</span>
                CPF / CNPJ
              </label>
              <input
                name="documento"
                value={data.documento}
                onChange={(e) => {
                  const formatted = formatDocumento(e.target.value);
                  setData((d) => ({ ...d, documento: formatted }));
                }}
                placeholder="000.000.000-00"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                maxLength={18}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-red-500">*</span>
              Senha
            </label>
            <div className="relative">
              <input
                name="senha"
                type={showPassword ? "text" : "password"}
                value={data.senha}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-red-500">*</span>
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                name="confirmacaoSenha"
                type={showConfirmPassword ? "text" : "password"}
                value={data.confirmacaoSenha}
                onChange={handleChange}
                placeholder="Repita a senha"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}
          
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              ✓ Cadastro realizado com sucesso! Redirecionando...
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "Cadastrando..." : success ? "Cadastrado!" : "Cadastrar e Ver Termos"}
          </button>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Já possui cadastro?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}