import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Rocket, CheckCircle2, Gift, Users, Star } from 'lucide-react'
import { Client } from '../types'

interface PartnerDashboardProps {
  client: Client
  onBecomeClient?: () => void
}

export default function PartnerDashboard({ client, onBecomeClient }: PartnerDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Rocket className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Bem-vindo, {client.name}!</h1>
            <p className="text-indigo-100 text-lg">Você está no modo Parceiro</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">Programa de Parcerias</Badge>
              <Badge variant="secondary" className="bg-emerald-500 text-white border-0">Ganhe com indicações</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Indique e Ganhe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>Compartilhe seu link e acompanhe suas indicações. A cada cliente convertido, você recebe uma comissão.</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Comissão por conversão</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Acompanhamento em tempo real</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Materiais prontos para divulgação</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Torne-se Cliente Bora Expandir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>Desbloqueie o acompanhamento completo do seu processo, upload de documentos, status detalhado e suporte especializado.</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Upload e validação de documentos</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Linha do tempo do processo</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Notificações e prazos</li>
            </ul>
            <button
              onClick={onBecomeClient}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              <Gift className="h-4 w-4" /> Quero virar cliente
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
