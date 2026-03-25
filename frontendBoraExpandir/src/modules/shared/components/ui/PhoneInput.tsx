import React, { useState, useRef, useEffect } from 'react'

const COUNTRIES = [
  { code: 'US', ddi: '1', flag: '🇺🇸', name: 'EUA/Canadá' },
  { code: 'BR', ddi: '55', flag: '🇧🇷', name: 'Brasil' },
  { code: 'MX', ddi: '52', flag: '🇲🇽', name: 'México' },
  { code: 'AR', ddi: '54', flag: '🇦🇷', name: 'Argentina' },
  { code: 'CO', ddi: '57', flag: '🇨🇴', name: 'Colômbia' },
  { code: 'PE', ddi: '51', flag: '🇵🇪', name: 'Peru' },
  { code: 'CL', ddi: '56', flag: '🇨🇱', name: 'Chile' },
  { code: 'GB', ddi: '44', flag: '🇬🇧', name: 'Reino Unido' },
  { code: 'FR', ddi: '33', flag: '🇫🇷', name: 'França' },
  { code: 'DE', ddi: '49', flag: '🇩🇪', name: 'Alemanha' },
  { code: 'ES', ddi: '34', flag: '🇪🇸', name: 'Espanha' },
  { code: 'IT', ddi: '39', flag: '🇮🇹', name: 'Itália' },
  { code: 'PT', ddi: '351', flag: '🇵🇹', name: 'Portugal' },
  { code: 'CH', ddi: '41', flag: '🇨🇭', name: 'Suíça' },
  { code: 'RU', ddi: '7', flag: '🇷🇺', name: 'Rússia' },
  { code: 'TR', ddi: '90', flag: '🇹🇷', name: 'Turquia' },
  { code: 'SA', ddi: '966', flag: '🇸🇦', name: 'Arábia Saudita' },
  { code: 'AE', ddi: '971', flag: '🇦🇪', name: 'Emirados Árabes Unidos' },
  { code: 'IL', ddi: '972', flag: '🇮🇱', name: 'Israel' },
  { code: 'QA', ddi: '974', flag: '🇶🇦', name: 'Catar' },
  { code: 'IR', ddi: '98', flag: '🇮🇷', name: 'Irã' },
]

interface PhoneInputProps {
  value: string
  onChange: (val: string) => void
  required?: boolean
  className?: string
  placeholder?: string
  name?: string
  id?: string
}

export function PhoneInput({ value, onChange, required, className, placeholder, name, id }: PhoneInputProps) {
  let matchingCountry = COUNTRIES[1] // Default Brasil
  let rawNumber = ''

  if (value) {
    const rawDigits = value.replace(/\D/g, '')
    const sortedCountries = [...COUNTRIES].sort((a, b) => b.ddi.length - a.ddi.length)
    let found = false
    
    for (const country of sortedCountries) {
      if (value.startsWith(`+${country.ddi}`)) {
        matchingCountry = country
        rawNumber = value.substring(`+${country.ddi}`.length).replace(/\D/g, '')
        found = true
        break
      } else if (value.startsWith(country.ddi) && !value.includes('+')) {
        matchingCountry = country
        rawNumber = value.substring(country.ddi.length).replace(/\D/g, '')
        found = true
        break
      } else if (rawDigits.startsWith(country.ddi)) {
        matchingCountry = country
        rawNumber = rawDigits.substring(country.ddi.length)
        found = true
        break
      }
    }
    
    if (!found) {
      rawNumber = rawDigits
    }
  }

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    onChange(`+${country.ddi}${rawNumber}`)
    setIsOpen(false)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    onChange(`+${matchingCountry.ddi}${val}`)
  }

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center gap-1.5 px-2 py-2 w-[72px] bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer h-[42px] hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors"
          title="País do número"
        >
          <img 
            src={`https://flagcdn.com/w20/${matchingCountry.code.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w40/${matchingCountry.code.toLowerCase()}.png 2x`}
            width="20"
            alt={matchingCountry.name}
            className="rounded-[2px] shadow-sm ml-1"
          />
          <svg className="h-4 w-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-xl outline-none custom-scrollbar py-1">
            {COUNTRIES.map(c => (
              <button
                key={c.code}
                type="button"
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors ${matchingCountry.code === c.code ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                onClick={() => handleCountrySelect(c)}
              >
                <img 
                  src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                  srcSet={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png 2x`}
                  width="20"
                  alt={c.name}
                  className="rounded-[2px] shadow-sm shrink-0"
                />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-gray-400 dark:text-gray-500">+{c.ddi}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-lg focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 overflow-hidden h-[42px] transition-shadow">
        <span className="pl-3 pr-2 py-2 text-gray-500 dark:text-gray-400 text-sm font-medium whitespace-nowrap bg-gray-50 dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-600 h-full flex items-center select-none">
          +{matchingCountry.ddi}
        </span>
        <input
          type="tel"
          id={id}
          name={name}
          value={rawNumber}
          onChange={handleNumberChange}
          required={required}
          className="w-full py-2 px-3 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          placeholder={placeholder || "11999999999"}
        />
      </div>
    </div>
  )
}
