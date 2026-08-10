import { describe, expect, it } from 'vitest'

import type { Expense, Gathering, Member } from '@/types'
import { computeBalances, settleBalances, settleGathering, shareExpense } from '../settlements'

function member(id: string): Member {
  return { id, name: id }
}

function expense(
  id: string,
  amountCents: number,
  paidById: string,
  participantIds: string[],
): Expense {
  return { id, name: id, amountCents, paidById, participantIds }
}

function gathering(members: Member[], expenses: Expense[]): Gathering {
  return { id: 'gathering', name: 'juntada', members, expenses }
}

function sumTransfers(transfers: { amountCents: number }[]): number {
  return transfers.reduce((sum, transfer) => sum + transfer.amountCents, 0)
}

describe('shareExpense', () => {
  it('splits the expense evenly when it divides cleanly', () => {
    expect(shareExpense(9000, 3, 0)).toEqual([3000, 3000, 3000])
  })

  it('gives the rounding remainder to the payer', () => {
    expect(shareExpense(10000, 3, 0)).toEqual([3334, 3333, 3333])
  })

  it('assigns the remainder to the payer wherever they sit in the list', () => {
    expect(shareExpense(10000, 3, 2)).toEqual([3333, 3333, 3334])
  })

  it('falls back to the first participants when the payer is not listed', () => {
    expect(shareExpense(10000, 3, -1)).toEqual([3334, 3333, 3333])
  })

  it('keeps the sum of shares equal to the expense amount', () => {
    const shares = shareExpense(10000, 3, 0)
    expect(shares.reduce((sum, share) => sum + share, 0)).toBe(10000)
  })
})

describe('computeBalances', () => {
  it('returns zero for every member when there are no expenses', () => {
    const balances = computeBalances(gathering([member('a'), member('b')], []))

    expect([...balances.values()]).toEqual([0, 0])
  })

  it('computes positive balance for payers and negative for participants', () => {
    const balances = computeBalances(
      gathering([member('a'), member('b')], [expense('e1', 10000, 'a', ['a', 'b'])]),
    )

    expect(balances.get('a')).toBe(5000)
    expect(balances.get('b')).toBe(-5000)
  })

  it('does not charge a member excluded from an expense', () => {
    const balances = computeBalances(
      gathering([member('a'), member('b'), member('c')], [expense('e1', 9000, 'a', ['a', 'b'])]),
    )

    expect(balances.get('a')).toBe(4500)
    expect(balances.get('b')).toBe(-4500)
    expect(balances.get('c')).toBe(0)
  })

  it('applies the rounding remainder to the payer so balances sum to zero', () => {
    const balances = computeBalances(
      gathering(
        [member('a'), member('b'), member('c')],
        [expense('e1', 10000, 'a', ['a', 'b', 'c'])],
      ),
    )

    expect([...balances.values()]).toEqual([6666, -3333, -3333])
    expect([...balances.values()].reduce((sum, balance) => sum + balance, 0)).toBe(0)
  })
})

describe('settleBalances', () => {
  it('matches the largest debtor with the largest creditor', () => {
    const transfers = settleBalances(
      new Map([
        ['a', 7500],
        ['b', -2500],
        ['c', -5000],
      ]),
    )

    expect(transfers).toEqual([
      { fromMemberId: 'c', toMemberId: 'a', amountCents: 5000 },
      { fromMemberId: 'b', toMemberId: 'a', amountCents: 2500 },
    ])
  })

  it('produces a partial transfer when credits and debts do not match one to one', () => {
    const transfers = settleBalances(
      new Map([
        ['a', 7500],
        ['b', 2500],
        ['c', -10000],
      ]),
    )

    expect(transfers).toEqual([
      { fromMemberId: 'c', toMemberId: 'a', amountCents: 7500 },
      { fromMemberId: 'c', toMemberId: 'b', amountCents: 2500 },
    ])
    expect(sumTransfers(transfers)).toBe(10000)
  })

  it('resolves ties deterministically by member id', () => {
    const transfers = settleBalances(
      new Map([
        ['a', 4000],
        ['b', -2000],
        ['c', -2000],
      ]),
    )

    expect(transfers).toEqual([
      { fromMemberId: 'b', toMemberId: 'a', amountCents: 2000 },
      { fromMemberId: 'c', toMemberId: 'a', amountCents: 2000 },
    ])
  })

  it('returns no transfers when everyone is settled', () => {
    expect(settleBalances(new Map([['a', 0]]))).toEqual([])
  })
})

describe('settleGathering', () => {
  it('returns a single transfer for a simple two-person gathering', () => {
    const transfers = settleGathering(
      gathering([member('a'), member('b')], [expense('e1', 10000, 'a', ['a', 'b'])]),
    )

    expect(transfers).toEqual([{ fromMemberId: 'b', toMemberId: 'a', amountCents: 5000 }])
  })

  it('returns no transfers when the payer is the only participant', () => {
    const transfers = settleGathering(
      gathering([member('a'), member('b')], [expense('e1', 10000, 'a', ['a'])]),
    )

    expect(transfers).toEqual([])
  })

  it('keeps a member excluded from an expense out of the transfers', () => {
    const transfers = settleGathering(
      gathering([member('a'), member('b'), member('c')], [expense('e1', 9000, 'a', ['a', 'b'])]),
    )

    expect(transfers).toEqual([{ fromMemberId: 'b', toMemberId: 'a', amountCents: 4500 }])
  })

  it('settles a multi-expense gathering to zero', () => {
    const transfers = settleGathering(
      gathering(
        [member('a'), member('b'), member('c')],
        [expense('e1', 6000, 'a', ['a', 'b', 'c']), expense('e2', 3000, 'b', ['b', 'c'])],
      ),
    )

    expect(transfers).toEqual([
      { fromMemberId: 'c', toMemberId: 'a', amountCents: 3500 },
      { fromMemberId: 'b', toMemberId: 'a', amountCents: 500 },
    ])
  })

  it('returns no transfers for an empty gathering', () => {
    expect(settleGathering(gathering([], []))).toEqual([])
  })
})
