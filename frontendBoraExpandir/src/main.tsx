import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import '@/index.css'

import { ClienteApp } from '@/modules/cliente/ClienteApp'
import { FinanceiroApp } from '@/modules/financeiro/FinanceiroApp'
import { JuridicoApp } from '@/modules/juridico/JuridicoApp'
import  AdmApp  from '@/modules/adm/AdmApp'
import CadastroParceiro from './modules/shared/components/parceiro/CadastroParceiro'
import TelaIndicado from './modules/shared/components/parceiro/TelaIndicado'
import Comercial from './modules/comercial/Comercial'
import Tradutora from './modules/tradurora/tradutora'
import { ThemeProvider } from './components/ui/ThemeProvider'

import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

function TelaIndicadoWrapper() {
  const { partnerId } = useParams<{ partnerId: string }>()
  const [partnerName, setPartnerName] = useState('Parceiro')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!partnerId) return
    fetch(`${import.meta.env.VITE_BACKEND_URL}/parceiro/parceirobyid/${partnerId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.nome) setPartnerName(data.nome)
      })
      .catch(() => setPartnerName('Parceiro'))
      .finally(() => setLoading(false))
  }, [partnerId])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  if (!partnerId) return <div className="min-h-screen flex items-center justify-center">Link inválido</div>

  return <TelaIndicado partnerName={partnerName} partnerId={partnerId} />
}

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center p-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">BoraExpandir - Front Unificado</h1>
        <p className="text-neutral-600">Escolha um portal ou acesse via login central.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="/cliente" className="px-4 py-2 bg-emerald-600 text-white rounded">Cliente</a>
          <a href="/comercial" className="px-4 py-2 bg-blue-600 text-white rounded">Comercial</a>
          <a href="/financeiro" className="px-4 py-2 bg-amber-600 text-white rounded">Financeiro</a>
          <a href="/juridico" className="px-4 py-2 bg-violet-600 text-white rounded">Jurídico</a>
          <a href="/adm" className="px-4 py-2 bg-rose-600 text-white rounded">Admin</a>
          <a href="/tradutor" className="px-4 py-2 bg-indigo-600 text-white rounded">Tradutor</a>
        </div>
      </div>
    </div>
  )
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cliente/*" element={<ClienteApp />} />
        <Route path="/comercial/*" element={<Comercial />} />
        <Route path="/tradutor/*" element={<Tradutora />} />
        <Route path="/financeiro/*" element={<FinanceiroApp />} />
        <Route path="/juridico/*" element={<JuridicoApp />} />
        <Route path="/adm/*" element={<AdmApp />} />
        <Route path="/parceiro/cadastro" element={<CadastroParceiro />} />
        <Route path="/indicado/:partnerId" element={<TelaIndicadoWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

const root = document.getElementById('root')
if (root) createRoot(root).render(
  <ThemeProvider>
    <AppRouter />
  </ThemeProvider>
)
