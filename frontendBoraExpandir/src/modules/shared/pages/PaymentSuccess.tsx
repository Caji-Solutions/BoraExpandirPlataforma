import React, { useEffect } from 'react'
import { CheckCircle2, Calendar, Clock, ArrowRight } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 dark:border-emerald-900/20">
        <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <path d="M0 0h100v100H0z" fill="currentColor" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 animate-bounce">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">Pagamento Confirmado!</h1>
            <p className="text-emerald-100 font-medium">Seu pagamento foi realizado com sucesso.</p>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-6 mb-8">
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
              Enviamos um e-mail de confirmação com todos os detalhes e o link de acesso para sua reunião.
            </p>
            
            <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 border border-gray-100 dark:border-neutral-700">
               <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                 <Calendar className="h-4 w-4 text-emerald-600" />
                 <span>Fique atento ao seu calendário</span>
               </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group"
          >
            Voltar para o Início
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            BoraExpandir &copy; 2026
          </p>
        </div>
      </div>
    </div>
  )
}
