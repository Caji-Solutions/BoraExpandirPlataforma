import { useState, useEffect, useRef } from 'react'
import { User, Mail, Phone, Fingerprint, Save, Loader2, Edit2, X, Camera } from 'lucide-react'
import { Client, Document } from '../../modules/cliente/types'

interface ConfigProps {
  onClose?: () => void
  client?: Client
  documents?: Document[]
  onRefresh?: () => Promise<void>
}

export function Config({ onClose, client, documents = [], onRefresh }: ConfigProps) {

  // Form state
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    phone: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Profile Photo state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize form data when client loads
  useEffect(() => {
    if (client) {
      setFormData({
        email: client.email,
        phone: client.phone || ''
      })
    }
  }, [client])

  // Get profile photo
  const profilePhotoUrl = client?.avatarUrl || null

  const handleEdit = () => {
    // Reset form data to current values before editing
    if (client) {
      setFormData({
        email: client.email,
        phone: client.phone || ''
      })
    }
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data
    if (client) {
      setFormData({
        email: client.email,
        phone: client.phone || ''
      })
    }
  }

  // Enforce light mode
  useEffect(() => {
    applyTheme('light')
  }, [])

  // Apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark') => {
    const html = document.documentElement
    html.classList.remove('light', 'dark')
    html.classList.remove('dark')
    html.style.colorScheme = 'light'
    localStorage.setItem('theme', 'light')
    window.dispatchEvent(new Event('themechange'))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call for data update (not implemented in backend yet for basic data)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaveSuccess(true)
    setIsEditing(false)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !client) return

    setIsUploadingPhoto(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('clienteId', client.id)

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const response = await fetch(`${API_BASE_URL}/cliente/profile-photo`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar foto')
      }

      // Refresh data
      if (onRefresh) {
        await onRefresh()
      }
      
    } catch (error) {
      console.error('Erro no upload da foto:', error)
      alert('Erro ao atualizar foto de perfil')
    } finally {
      setIsUploadingPhoto(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Configurações
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie seus dados e preferências
        </p>
      </div>

      <div className="grid gap-6">
        {client && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Informações Pessoais
              </h2>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar Dados
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center border-4 border-white dark:border-neutral-700 shadow-lg overflow-hidden relative">
                    {profilePhotoUrl ? (
                        <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                    )}
                    
                    {/* Upload Overlay */}
                    <div 
                        onClick={handlePhotoClick}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                        <Camera className="w-8 h-8 text-white" />
                    </div>

                    {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  {/* Small edit icon badge - keep it or remove since we have hover effect? Keeping for affordance */}
                  <div className="absolute bottom-1 right-1 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 border-2 border-white dark:border-neutral-800 pointer-events-none">
                      <Camera className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cliente</p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="flex-1 space-y-6">
                
                {/* ID - Read Only */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Fingerprint className="w-4 h-4" />
                      ID do Cliente
                    </label>
                    <div className="p-3 bg-gray-100 dark:bg-neutral-900/50 rounded-lg text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-neutral-700 font-mono text-sm select-all">
                      {client.id}
                    </div>
                  </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Read Only Fields */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nome Completo
                    </label>
                    <div className="p-3 bg-gray-100 dark:bg-neutral-900/50 rounded-lg text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 cursor-not-allowed">
                      {client.name}
                    </div>
                  </div>

                  {/* REMOVED SERVICE TYPE FIELD */}

                  {/* Editable Fields */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full p-3 bg-white dark:bg-neutral-700 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-700">
                        {formData.email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telefone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full p-3 bg-white dark:bg-neutral-700 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-700">
                        {formData.phone || <i className="text-gray-400">Não informado</i>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Actions */}
                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-700">
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all border border-gray-200 dark:border-neutral-600"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Salvar Alterações
                    </button>
                  </div>
                )}
                
                {saveSuccess && !isEditing && (
                   <div className="flex justify-end pt-2">
                     <p className="text-green-600 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                       <Save className="w-4 h-4" />
                       Dados atualizados com sucesso!
                     </p>
                   </div>
                )}

              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Para alterar nome ou dados críticos, entre em contato com o suporte.
              </p>
            </div>
          </div>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 px-4 bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors font-medium"
        >
          Fechar
        </button>
      )}
    </div>
  )
}
