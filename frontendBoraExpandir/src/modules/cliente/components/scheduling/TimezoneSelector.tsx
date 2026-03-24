import { useState, useEffect, useMemo } from 'react'
import { Globe, Check, Loader2 } from 'lucide-react'

const TIMEZONE_OPTIONS = [
  { offset: 'UTC-12:00', label: '🇺🇸 EUA (West of Date Line)', iana: 'Etc/GMT+12' },
  { offset: 'UTC-11:00', label: '🇺🇸 EUA (Samoa)', iana: 'Pacific/Pago_Pago' },
  { offset: 'UTC-10:00', label: '🇺🇸 EUA (Hawaii)', iana: 'Pacific/Honolulu' },
  { offset: 'UTC-09:00', label: '🇺🇸 EUA (Alaska)', iana: 'America/Anchorage' },
  { offset: 'UTC-08:00', label: '🇺🇸 EUA (Pacific)', iana: 'America/Los_Angeles' },
  { offset: 'UTC-07:00', label: '🇺🇸 EUA (Mountain)', iana: 'America/Denver' },
  { offset: 'UTC-06:00', label: '🇲🇽 México / 🇺🇸 EUA (Central)', iana: 'America/Chicago' },
  { offset: 'UTC-05:00', label: '🇺🇸 EUA (Eastern) / 🇨🇴 Colombia / 🇵🇪 Peru', iana: 'America/New_York' },
  { offset: 'UTC-04:00', label: '🇻🇪 Venezuela / 🇧🇷 Manaus', iana: 'America/Caracas' },
  { offset: 'UTC-03:00', label: '🇧🇷 Brasília / 🇦🇷 Argentina / 🇺🇾 Uruguay', iana: 'America/Sao_Paulo' },
  { offset: 'UTC-02:00', label: '🇧🇷 Fernando de Noronha', iana: 'America/Noronha' },
  { offset: 'UTC-01:00', label: '🇵🇹 Açores', iana: 'Atlantic/Azores' },
  { offset: 'UTC+00:00', label: '🇬🇧 Reino Unido / 🇵🇹 Portugal / 🇮🇪 Irlanda', iana: 'Europe/Lisbon' },
  { offset: 'UTC+01:00', label: '🇫🇷 França / 🇩🇪 Alemanha / 🇪🇸 Espanha / 🇮🇹 Itália', iana: 'Europe/Madrid' },
  { offset: 'UTC+02:00', label: '🇪🇬 Egito / 🇿🇦 África do Sul / 🇬🇷 Grécia', iana: 'Europe/Athens' },
  { offset: 'UTC+03:00', label: '🇸🇦 Arábia Saudita / 🇷🇺 Rússia (Moscou)', iana: 'Europe/Moscow' },
  { offset: 'UTC+04:00', label: '🇦🇪 Emirados Árabes / 🇷🇺 Rússia (Samara)', iana: 'Asia/Dubai' },
  { offset: 'UTC+05:00', label: '🇵🇰 Paquistão', iana: 'Asia/Karachi' },
  { offset: 'UTC+05:30', label: '🇮🇳 Índia', iana: 'Asia/Kolkata' },
  { offset: 'UTC+06:00', label: '🇧🇩 Bangladesh', iana: 'Asia/Dhaka' },
  { offset: 'UTC+07:00', label: '🇹🇭 Tailândia / 🇻🇳 Vietnã', iana: 'Asia/Bangkok' },
  { offset: 'UTC+08:00', label: '🇨🇳 China / 🇸🇬 Singapura / 🇦🇺 Austrália (Perth)', iana: 'Asia/Singapore' },
  { offset: 'UTC+09:00', label: '🇯🇵 Japão / 🇰🇷 Coreia do Sul', iana: 'Asia/Tokyo' },
  { offset: 'UTC+10:00', label: '🇦🇺 Austrália (Sydney)', iana: 'Australia/Sydney' },
  { offset: 'UTC+11:00', label: '🇳🇨 Nova Caledônia', iana: 'Pacific/Noumea' },
  { offset: 'UTC+12:00', label: '🇳🇿 Nova Zelândia', iana: 'Pacific/Auckland' },
]

const STORAGE_KEY = 'clienteTimezone'

interface TimezoneSelectorProps {
  clienteId: string
  isNonBrazilian?: boolean
}

export function TimezoneSelector({ clienteId, isNonBrazilian = false }: TimezoneSelectorProps) {
  const [selected, setSelected] = useState<string>('')
  const [search, setSearch] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setSelected(stored)
    }
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return TIMEZONE_OPTIONS
    const q = search.toLowerCase()
    return TIMEZONE_OPTIONS.filter(tz =>
      tz.offset.toLowerCase().includes(q) ||
      tz.label.toLowerCase().includes(q) ||
      tz.iana.toLowerCase().includes(q)
    )
  }, [search])

  const handleSave = async () => {
    if (!selected) return
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/cliente/timezone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId, timezone: selected }),
      })
      if (!res.ok) throw new Error('Erro ao salvar fuso horário')
      localStorage.setItem(STORAGE_KEY, selected)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar')
    } finally {
      setIsSaving(false)
    }
  }

  const currentOption = TIMEZONE_OPTIONS.find(tz => tz.iana === selected)

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Globe className="w-5 h-5 text-blue-500" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fuso Horário</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isNonBrazilian
              ? 'Detectamos que você pode estar em outro país. Configure seu fuso horário para ver os agendamentos corretamente.'
              : 'Selecione seu fuso horário para exibir os horários dos agendamentos corretamente.'}
          </p>
        </div>
      </div>

      {isNonBrazilian && !selected && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          Seu telefone ou localização indica que você pode estar fora do Brasil. Configure o fuso horário para ver os horários corretos.
        </div>
      )}

      {currentOption && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
          Fuso horário atual: <span className="font-semibold">{currentOption.offset} — {currentOption.label}</span>
        </div>
      )}

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Buscar por país, cidade ou offset (ex: UTC-03, Brasília)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-3 bg-gray-50 dark:bg-neutral-700 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
        />

        <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-neutral-700 divide-y divide-gray-100 dark:divide-neutral-700">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhum resultado encontrado</div>
          ) : (
            filtered.map(tz => (
              <button
                key={tz.iana}
                type="button"
                onClick={() => setSelected(tz.iana)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                  selected === tz.iana
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700/50'
                }`}
              >
                <span>
                  <span className="font-mono font-semibold text-xs mr-2 text-gray-500 dark:text-gray-400">{tz.offset}</span>
                  {tz.label}
                </span>
                {selected === tz.iana && <Check className="w-4 h-4 flex-shrink-0" />}
              </button>
            ))
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          {saveSuccess && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-2">
              <Check className="w-4 h-4" />
              Fuso horário salvo com sucesso!
            </p>
          )}
          {!saveSuccess && <span />}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !selected}
            className="flex items-center gap-2 px-5 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-sm text-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            Salvar Fuso Horário
          </button>
        </div>
      </div>
    </div>
  )
}

export function getClientTimezone(): string {
  return localStorage.getItem(STORAGE_KEY) || Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function formatInClientTimezone(isoDate: string, options: Intl.DateTimeFormatOptions = {}): string {
  try {
    const tz = getClientTimezone()
    return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, ...options }).format(new Date(isoDate))
  } catch {
    return new Date(isoDate).toLocaleString('pt-BR')
  }
}
