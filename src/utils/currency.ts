const arsFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

export function formatCents(cents: number): string {
  return arsFormatter.format(cents / 100)
}

export function parseAmountToCents(text: string): number | null {
  const normalized = text.trim().replace(',', '.')
  if (normalized === '') return null

  const lastDot = normalized.lastIndexOf('.')
  if (lastDot === -1) return toCents(normalized)

  const decimals = normalized.slice(lastDot + 1)
  if (decimals.length > 2) {
    const whole = normalized.replace(/\./g, '')
    return toCents(whole)
  }

  const whole = normalized.slice(0, lastDot).replace(/\./g, '')
  return toCents(`${whole}.${decimals}`)
}

function toCents(value: string): number | null {
  if (!/^\d+(\.\d+)?$/.test(value)) return null
  const pesos = Number(value)
  if (!Number.isFinite(pesos) || pesos <= 0) return null
  return Math.round(pesos * 100)
}
