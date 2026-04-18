import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import '@/index.css'

import { ClienteApp } from '@/modules/cliente/ClienteApp'
import { FinanceiroApp } from '@/modules/financeiro/FinanceiroApp'
import { JuridicoApp } from '@/modules/juridico/JuridicoApp'
import AdmApp from '@/modules/adm/AdmApp'
import CadastroParceiro from './modules/shared/components/parceiro/CadastroParceiro'
import TelaIndicado from './modules/shared/components/parceiro/TelaIndicado'
import Comercial from './modules/comercial/pages/vendas/Comercial'
import TradutoraApp from './modules/tradutora/TradutoraApp'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { Toaster } from '@/modules/shared/components/ui/toaster'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute, roleRouteMap } from '@/modules/shared/components/ProtectedRoute'
import { ImpersonationBanner } from '@/modules/shared/components/ImpersonationBanner'
import LoginPage from './modules/shared/pages/LoginPage'
import PaymentSuccess from './modules/shared/pages/PaymentSuccess'
import PaymentCancel from './modules/shared/pages/PaymentCancel'
import FormularioConsultoria from './modules/shared/pages/FormularioConsultoriaPage'
import RedefinirSenha from './modules/shared/pages/RedefinirSenha'
import ForgotPasswordPage from './modules/shared/pages/ForgotPasswordPage'
import { queryClient } from '@/config/queryClient'

import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

function TelaIndicadoWrapper() {
// ... rest of the functions
  const { partnerId } = useParams<{ partnerId: string }>()
  const [partnerName, setPartnerName] = useState('Parceiro')
  const [realPartnerId, setRealPartnerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!partnerId) return

    fetch(`${import.meta.env.VITE_BACKEND_URL}/parceiro/parceirobyid/${partnerId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.nome) setPartnerName(data.nome)
        if (data?.id) setRealPartnerId(data.id)
      })
      .catch(() => setPartnerName('Parceiro'))
      .finally(() => setLoading(false))
  }, [partnerId])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  if (!partnerId || !realPartnerId) return <div className="min-h-screen flex items-center justify-center">Link inválido</div>

  return <TelaIndicado partnerName={partnerName} partnerId={realPartnerId} />
}

// Componente que redireciona baseado no role do usuário logado
function AuthRedirect() {
  const { isAuthenticated, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return <Navigate to="/login" replace />
  }

  const destination = roleRouteMap[profile.role] || '/adm'
  return <Navigate to={destination} replace />
}

function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ImpersonationBanner />
        <Routes>
          {/* Rota principal redireciona baseado na auth */}
          <Route path="/" element={<AuthRedirect />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas protegidas */}
          <Route path="/comercial/*" element={
            <ProtectedRoute allowedRoles={['comercial', 'super_admin']}>
              <Comercial />
            </ProtectedRoute>
          } />
          <Route path="/financeiro/*" element={
            <ProtectedRoute allowedRoles={['administrativo', 'super_admin']}>
              <FinanceiroApp />
            </ProtectedRoute>
          } />
          <Route path="/juridico/*" element={
            <ProtectedRoute allowedRoles={['juridico', 'super_admin']}>
              <JuridicoApp />
            </ProtectedRoute>
          } />
          <Route path="/tradutor/*" element={
            <ProtectedRoute allowedRoles={['tradutor', 'super_admin']}>
              <TradutoraApp />
            </ProtectedRoute>
          } />
          <Route path="/adm/*" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdmApp />
            </ProtectedRoute>
          } />

          {/* Rotas de cliente (Protegidas) */}
          <Route path="/cliente/*" element={
            <ProtectedRoute allowedRoles={['cliente', 'super_admin']}>
              <ClienteApp />
            </ProtectedRoute>
          } />

          {/* Rotas públicas (parceiros e links diretos) */}
          <Route path="/parceiro/cadastro" element={<CadastroParceiro />} />
          <Route path="/indicado/:partnerId" element={<TelaIndicadoWrapper />} />
          <Route path="/r/:partnerId" element={<TelaIndicadoWrapper />} />

          {/* Formulário público de consultoria e redefinição de senha */}
          <Route path="/formulario/consultoria/:agendamentoId" element={<FormularioConsultoria />} />
          <Route path="/formulario/consultoria" element={<FormularioConsultoria />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<RedefinirSenha />} />

          {/* Rotas de Pagamento */}
          <Route path="/agendamento/sucesso" element={<PaymentSuccess />} />
          <Route path="/agendamento/cancelado" element={<PaymentCancel />} />
          <Route path="/agendamento/falha" element={<PaymentCancel />} />
          <Route path="/agendamento/pendente" element={<PaymentSuccess />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

const root = document.getElementById('root')
if (root) createRoot(root).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AppRouter />
      <Toaster />
    </ThemeProvider>
  </QueryClientProvider>
)
