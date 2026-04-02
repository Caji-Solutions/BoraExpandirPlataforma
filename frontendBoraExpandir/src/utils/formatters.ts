const NON_DIGITS = /\D/g

export function onlyDigits(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).replace(NON_DIGITS, '')
}

export function normalizePhone(value: unknown): string {
  return onlyDigits(value)
}

export function normalizeCpf(value: unknown): string {
  return onlyDigits(value)
}

export function formatCpfDisplay(value: unknown): string {
  const digits = onlyDigits(value)
  if (digits.length !== 11) return String(value || '')
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function formatPhoneDisplay(value: unknown): string {
  const digits = onlyDigits(value)
  if (!digits) return ''
  const len = digits.length
  // Apenas número local sem DDD: 8 dígitos → XXXX-XXXX
  if (len <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`
  // Com DDD (10 dígitos fixo / 11 dígitos celular) → (XX) XXXXX-XXXX
  if (len === 10) return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`
  if (len === 11) return `${digits.slice(0, 2)}-${digits.slice(2, 7)}-${digits.slice(7)}`
  // Com DDI (12 dígitos fixo / 13 dígitos celular) → DDI-DDD-XXXXX-XXXX
  if (len === 12) return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`
  if (len === 13) return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 9)}-${digits.slice(9)}`
  // Mais dígitos: DDI variável, assume 2 DDI + 2 DDD + restante
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, -4)}-${digits.slice(-4)}`
}

export function maskCpfInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function maskPhoneInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 13)
  const len = digits.length
  if (len <= 2) return digits
  if (len <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  if (len <= 6) return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
  if (len <= 11) return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
  if (len === 12) return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 9)}-${digits.slice(9)}`
}
