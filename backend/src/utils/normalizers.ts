const DIGITS_ONLY_REGEX = /\D/g

export function onlyDigits(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).replace(DIGITS_ONLY_REGEX, '')
}

export function normalizePhone(value: unknown): string | null {
  const digits = onlyDigits(value)
  return digits.length ? digits : null
}

export function normalizeCpf(value: unknown): string | null {
  const digits = onlyDigits(value)
  if (!digits) return null
  return digits
}

export function formatCpfDisplay(value: unknown): string {
  const digits = onlyDigits(value)
  if (digits.length !== 11) return String(value ?? '')
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function formatPhoneDisplay(value: unknown): string {
  const digits = onlyDigits(value)
  if (!digits) return ''
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, -3)}-${digits.slice(-3)}`
}
