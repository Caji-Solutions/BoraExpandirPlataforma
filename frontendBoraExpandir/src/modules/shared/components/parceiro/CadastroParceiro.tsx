import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

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
  
  // Redirecionamento após sucesso
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
    setError(null); // Limpa erro ao digitar
  };

  // Máscaras de formatação
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
      // CPF: 000.000.000-00
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
    }
    // CNPJ: 00.000.000/0000-00
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
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
          telefone: data.telefone.replace(/\D/g, ""),
          documento: data.documento.replace(/\D/g, ""),
          senha: data.senha,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Erro ao cadastrar" }));
        throw new Error(errorData.message || "Falha ao cadastrar parceiro");
      }

      const json = await res.json();
      setSuccess(true);
      setData(initial);
      
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Logo e Header */}
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

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-5 border border-gray-100"
        >
          {/* Nome Completo */}
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

          {/* Email */}
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

          {/* Telefone e Documento - Grid em telas maiores */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Telefone */}
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

            {/* CPF/CNPJ */}
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
              {data.documento && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                  {isCPF(data.documento)
                    ? "CPF detectado"
                    : isCNPJ(data.documento)
                    ? "CNPJ detectado"
                    : "Formato inválido"}
                </p>
              )}
            </div>
          </div>

          {/* Senha */}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {data.senha && data.confirmacaoSenha && (
              <p
                className={`text-xs flex items-center gap-1 ${
                  data.senha === data.confirmacaoSenha
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {data.senha === data.confirmacaoSenha ? "✓ Senhas conferem" : "✗ Senhas não conferem"}
              </p>
            )}
          </div>

          {/* Mensagens de Erro/Sucesso */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2 animate-shake">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-start gap-2 animate-pulse">
              <span className="text-lg">✓</span>
              <div>
                <p className="font-semibold">Cadastro realizado com sucesso!</p>
                <p className="text-xs mt-1">Redirecionando para o login...</p>
              </div>
            </div>
          )}

          {/* Botão de Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cadastrando...
              </span>
            ) : success ? (
              "Cadastrado com sucesso!"
            ) : (
              "Cadastrar como Parceiro"
            )}
          </button>

          {/* Link para Login */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Já possui cadastro?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
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