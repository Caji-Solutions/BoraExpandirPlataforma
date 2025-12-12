import { useState, useRef } from 'react'
import { File, Download, Send, X } from 'lucide-react'
import type { ApprovedDocument, TranslatedDocument } from '../types'

interface TraduzaoProps {
  approvedDocuments: ApprovedDocument[]
  translatedDocuments: TranslatedDocument[]
  onUploadTranslation: (file: File, approvedDocumentId: string, targetLanguage: string) => void
  onRequestQuote: (documentIds: string[], targetLanguages: string[]) => void
}

const LANGUAGES = {
  PT: 'Português',
  EN: 'Inglês',
  ES: 'Espanhol',
  FR: 'Francês',
  IT: 'Italiano',
  DE: 'Alemão',
  JA: 'Japonês',
  ZH: 'Chinês',
}

export function Traducao({
  approvedDocuments,
  translatedDocuments,
  onUploadTranslation,
  onRequestQuote,
}: TraduzaoProps) {
  const [selectedFiles, setSelectedFiles] = useState<Map<string, File>>(new Map())
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [targetLanguage, setTargetLanguage] = useState<string>('ES')
  const [showModal, setShowModal] = useState(false)
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  const toggleDoc = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedDocs.length === approvedDocuments.length) {
      setSelectedDocs([])
    } else {
      setSelectedDocs(approvedDocuments.map(d => d.id))
    }
  }

  const handleFileSelect = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFiles(prev => new Map(prev).set(docId, file))
    }
  }

  const handleUpload = (docId: string) => {
    const file = selectedFiles.get(docId)
    if (file) {
      onUploadTranslation(file, docId, targetLanguage)
      setSelectedFiles(prev => {
        const newMap = new Map(prev)
        newMap.delete(docId)
        return newMap
      })
      const input = fileInputRefs.current.get(docId)
      if (input) input.value = ''
    }
  }

  const handleSubmitQuote = () => {
    if (selectedDocs.length === 0) return
    onRequestQuote(selectedDocs, [targetLanguage])
    setShowModal(false)
    setSelectedDocs([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tradução</p>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Documentos aptos</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition"
        >
          <Send className="h-4 w-4" />
          Enviar para tradução
        </button>
      </div>

      {approvedDocuments.length === 0 ? (
        <div className="bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 rounded-lg p-8 text-center">
          <File className="h-12 w-12 text-gray-400 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            Nenhum documento aprovado no momento. Aguarde a análise jurídica.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-700/50 border-b border-gray-200 dark:border-neutral-600">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Documento</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Data de Aprovação</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {approvedDocuments.map(doc => {
                const translated = translatedDocuments.filter(t => t.approvedDocumentId === doc.id)
                const hasTranslated = translated.length > 0
                const status = hasTranslated ? 'traduzido' : 'aguardando'
                
                return (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/30 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                    
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(doc.approvalDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      {status === 'aguardando' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                          Aguardando tradução
                        </span>
                      )}
                      {status === 'traduzido' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          Documento traduzido
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Envie para tradução</p>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Selecione documentos e idioma</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedDocs.length === approvedDocuments.length && approvedDocuments.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">Selecionar todos</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 dark:text-gray-200">Idioma destino:</label>
                  <select
                    value={targetLanguage}
                    onChange={e => setTargetLanguage(e.target.value)}
                    className="border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded px-3 py-2 text-sm"
                  >
                    {Object.keys(LANGUAGES).map(lang => (
                      <option key={lang} value={lang}>
                        {LANGUAGES[lang as keyof typeof LANGUAGES]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {approvedDocuments.map(doc => (
                  <label
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-neutral-700/50 rounded border border-gray-200 dark:border-neutral-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-700 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleDoc(doc.id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Aprovado em {new Date(doc.approvalDate).toLocaleDateString('pt-BR')} • Idiomas: {doc.targetLanguages.join(', ')}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-800/50">
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Fazer orçamento conosco</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Enviaremos o pedido para nossa equipe e retornaremos com valor e prazo.
                  </p>
                  <button
                    onClick={handleSubmitQuote}
                    disabled={selectedDocs.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Solicitar orçamento
                  </button>
                </div>

                <div className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-800/50">
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Enviar traduzidos por conta própria</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Suba os arquivos já traduzidos no idioma selecionado.
                  </p>
                  <div className="space-y-3">
                    {selectedDocs.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Selecione ao menos um documento.</p>
                    )}
                    {selectedDocs.map(docId => {
                      const doc = approvedDocuments.find(d => d.id === docId)
                      const file = selectedFiles.get(docId)
                      return (
                        <div key={docId} className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-neutral-700 rounded border border-gray-200 dark:border-neutral-600">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{doc?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Idioma: {LANGUAGES[targetLanguage as keyof typeof LANGUAGES]}</p>
                            <input
                              ref={el => {
                                if (el) fileInputRefs.current.set(docId, el)
                              }}
                              type="file"
                              className="hidden"
                              onChange={e => handleFileSelect(docId, e)}
                              accept=".pdf,.doc,.docx,.txt"
                            />
                            <button
                              onClick={() => fileInputRefs.current.get(docId)?.click()}
                              className="mt-2 text-sm text-blue-600 dark:text-blue-300 font-medium hover:underline"
                            >
                              Escolher arquivo
                            </button>
                            {file && (
                              <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                <File className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                <span>{file.name}</span>
                                <button
                                  onClick={() => {
                                    setSelectedFiles(prev => {
                                      const m = new Map(prev)
                                      m.delete(docId)
                                      return m
                                    })
                                  }}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleUpload(docId)}
                            disabled={!file}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition"
                          >
                            Enviar
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
