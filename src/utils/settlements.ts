import type { Gathering, Transfer } from '@/types'

export function shareExpense(
  amountCents: number,
  participantCount: number,
  payerIndex: number,
): number[] {
  const share = Math.floor(amountCents / participantCount)
  const shares = Array.from({ length: participantCount }, () => share)
  const remainder = amountCents - share * participantCount

  if (payerIndex >= 0 && payerIndex < participantCount) {
    shares[payerIndex] = shares[payerIndex]! + remainder
  } else {
    for (let i = 0; i < remainder; i++) shares[i] = shares[i]! + 1
  }

  return shares
}

export function computeBalances(gathering: Gathering): Map<string, number> {
  const balances = new Map<string, number>()
  for (const member of gathering.members) balances.set(member.id, 0)

  for (const expense of gathering.expenses) {
    if (expense.participantIds.length === 0) continue

    const payerIndex = expense.participantIds.indexOf(expense.paidById)
    const shares = shareExpense(expense.amountCents, expense.participantIds.length, payerIndex)

    balances.set(expense.paidById, (balances.get(expense.paidById) ?? 0) + expense.amountCents)
    expense.participantIds.forEach((memberId, index) => {
      balances.set(memberId, (balances.get(memberId) ?? 0) - shares[index]!)
    })
  }

  return balances
}

export function settleBalances(balances: Map<string, number>): Transfer[] {
  const debtors = [...balances.entries()]
    .filter(([, balance]) => balance < 0)
    .map(([memberId, balance]) => ({ memberId, amountCents: -balance }))
    .sort(byLargestAmount)

  const creditors = [...balances.entries()]
    .filter(([, balance]) => balance > 0)
    .map(([memberId, balance]) => ({ memberId, amountCents: balance }))
    .sort(byLargestAmount)

  const transfers: Transfer[] = []
  let debtorIndex = 0
  let creditorIndex = 0

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]!
    const creditor = creditors[creditorIndex]!
    const amountCents = Math.min(debtor.amountCents, creditor.amountCents)

    transfers.push({
      fromMemberId: debtor.memberId,
      toMemberId: creditor.memberId,
      amountCents,
    })

    debtor.amountCents -= amountCents
    creditor.amountCents -= amountCents

    if (debtor.amountCents === 0) debtorIndex++
    if (creditor.amountCents === 0) creditorIndex++
  }

  return transfers
}

export function settleGathering(gathering: Gathering): Transfer[] {
  return settleBalances(computeBalances(gathering))
}

interface Position {
  readonly memberId: string
  amountCents: number
}

function byLargestAmount(a: Position, b: Position): number {
  return b.amountCents - a.amountCents || a.memberId.localeCompare(b.memberId)
}
