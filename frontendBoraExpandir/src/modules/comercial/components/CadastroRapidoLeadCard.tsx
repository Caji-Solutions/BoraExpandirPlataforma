import React, { useState } from 'react'
import { Plus, Mail, Phone, User, Building2 } from 'lucide-react'
import type { LeadFormData } from '../../../types/comercial'

interface CadastroRapidoLeadCardProps {
  onSaveLead: (leadData: LeadFormData) => void
}

export default function CadastroRapidoLeadCard({ onSaveLead }: CadastroRapidoLeadCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<LeadFormData>({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.nome && formData.email && formData.telefone) {
      onSaveLead(formData)
      setFormData({ nome: '', email: '', telefone: '', empresa: '' })
      setIsOpen(false)
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Novo Lead</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {!isOpen ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Cadastre um novo lead rapidamente clicando no botão
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              <User className="h-4 w-4" />
              Nome
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Nome do lead"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="email@example.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Phone className="h-4 w-4" />
              Telefone
            </label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
              placeholder="(11) 99999-9999"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Building2 className="h-4 w-4" />
              Empresa (opcional)
            </label>
            <input
              type="text"
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              placeholder="Nome da empresa"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              Salvar Lead
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
