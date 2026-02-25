import React from 'react'
import { XCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PaymentCancel() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-red-100 dark:border-red-900/20">
        <div className="bg-red-600 p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 animate-pulse">
              <XCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">Ops! Algo deu errado</h1>
            <p className="text-red-100 font-medium">O pagamento não foi processado ou foi cancelado.</p>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-6 mb-8 text-center text-sm">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-red-500/50" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Não se preocupe, nenhum valor foi cobrado do seu cartão. Você pode tentar realizar o agendamento novamente.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/cliente/agendamento')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 group"
            >
              <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              Tentar Novamente
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 font-semibold py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </button>
          </div>
          
          <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            BoraExpandir &copy; 2026
          </p>
        </div>
      </div>
    </div>
  )
}
