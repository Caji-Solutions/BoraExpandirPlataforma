import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import '@/index.css'

import { ClienteApp } from '@/modules/cliente/ClienteApp'
import { FinanceiroApp } from '@/modules/financeiro/FinanceiroApp'
import { JuridicoApp } from '@/modules/juridico/JuridicoApp'
import AdmApp from '@/modules/adm/AdmApp'
import CadastroParceiro from './modules/shared/components/parceiro/CadastroParceiro'
import TelaIndicado from './modules/shared/components/parceiro/TelaIndicado'
import Comercial from './modules/comercial/Comercial'
import Tradutora from './modules/tradurora/tradutora'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { Toaster } from './modules/adm/components/ui/toaster'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute, roleRouteMap } from './components/ProtectedRoute'
import LoginPage from './modules/shared/pages/LoginPage'
import PaymentSuccess from './modules/shared/pages/PaymentSuccess'
import PaymentCancel from './modules/shared/pages/PaymentCancel'

import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

function TelaIndicadoWrapper() {
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
              <Tradutora />
            </ProtectedRoute>
          } />
          <Route path="/adm/*" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdmApp />
            </ProtectedRoute>
          } />

          {/* Rotas públicas (cliente e parceiro) */}
          <Route path="/cliente/*" element={<ClienteApp />} />
          <Route path="/parceiro/cadastro" element={<CadastroParceiro />} />
          <Route path="/indicado/:partnerId" element={<TelaIndicadoWrapper />} />
          <Route path="/r/:partnerId" element={<TelaIndicadoWrapper />} />

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
  <ThemeProvider>
    <AppRouter />
    <Toaster />
  </ThemeProvider>
)
