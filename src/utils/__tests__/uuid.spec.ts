import { describe, expect, it } from 'vitest'

import { uuid } from '../uuid'

describe('uuid', () => {
  it('returns a non-empty UUID with the expected format', () => {
    const id = uuid()

    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('returns unique values on consecutive calls', () => {
    expect(uuid()).not.toBe(uuid())
  })
})
