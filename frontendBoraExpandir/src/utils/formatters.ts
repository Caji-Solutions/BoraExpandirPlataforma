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
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, -3)}-${digits.slice(-3)}`
}

export function maskCpfInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function maskPhoneInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 15)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, -3)}-${digits.slice(-3)}`
}
