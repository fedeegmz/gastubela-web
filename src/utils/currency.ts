const arsFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

export function formatCents(cents: number): string {
  return arsFormatter.format(cents / 100)
}
