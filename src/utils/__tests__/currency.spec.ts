import { describe, expect, it } from 'vitest'

import { formatCents } from '../currency'

describe('formatCents', () => {
  it('formats zero cents as zero pesos', () => {
    expect(formatCents(0)).toBe('$\u00A00,00')
  })

  it('formats whole pesos with thousand separators', () => {
    expect(formatCents(123456)).toBe('$\u00A01.234,56')
  })

  it('formats small amounts with the decimal separator', () => {
    expect(formatCents(3333)).toContain('33,33')
  })

  it('handles negative amounts', () => {
    expect(formatCents(-1000)).toBe('-$\u00A010,00')
  })
})
