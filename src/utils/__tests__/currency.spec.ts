import { describe, expect, it } from 'vitest'

import { formatCents, parseAmountToCents } from '../currency'

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

describe('parseAmountToCents', () => {
  it('parses whole pesos to cents', () => {
    expect(parseAmountToCents('12500')).toBe(1250000)
  })

  it('trims surrounding whitespace', () => {
    expect(parseAmountToCents('  12500  ')).toBe(1250000)
  })

  it('parses a dot as the decimal separator', () => {
    expect(parseAmountToCents('12.5')).toBe(1250)
  })

  it('parses a comma as the decimal separator', () => {
    expect(parseAmountToCents('12,5')).toBe(1250)
  })

  it('treats the last separator as decimal and the rest as thousands', () => {
    expect(parseAmountToCents('12.500,50')).toBe(1250050)
  })

  it('treats dots before the last one as thousands', () => {
    expect(parseAmountToCents('1.234.567')).toBe(123456700)
  })

  it('treats a three-digit last group as thousands', () => {
    expect(parseAmountToCents('1.239')).toBe(123900)
  })

  it('rejects an empty string', () => {
    expect(parseAmountToCents('')).toBeNull()
    expect(parseAmountToCents('   ')).toBeNull()
  })

  it('rejects non-numeric input', () => {
    expect(parseAmountToCents('abc')).toBeNull()
  })

  it('rejects negative amounts', () => {
    expect(parseAmountToCents('-100')).toBeNull()
  })

  it('rejects zero', () => {
    expect(parseAmountToCents('0')).toBeNull()
  })

  it('rejects a bare decimal separator', () => {
    expect(parseAmountToCents('.5')).toBeNull()
  })
})
