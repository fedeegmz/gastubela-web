import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { Expense, Gathering, Member } from '@/types'
import { uuid } from '@/utils/uuid'

export type View = 'list' | 'detail' | 'results'

export interface NewExpenseInput {
  readonly name: string
  readonly amountCents: number
  readonly paidById: string
  readonly participantIds?: readonly string[]
}

export const useGatheringsStore = defineStore('gatherings', () => {
  const gatherings = ref<Gathering[]>([])
  const view = ref<View>('list')
  const activeGatheringId = ref<string | null>(null)

  const activeGathering = computed(() =>
    gatherings.value.find((gathering) => gathering.id === activeGatheringId.value),
  )

  function goToList(): void {
    view.value = 'list'
    activeGatheringId.value = null
  }

  function openGathering(id: string): void {
    activeGatheringId.value = id
    view.value = 'detail'
  }

  function openResults(id: string): void {
    activeGatheringId.value = id
    view.value = 'results'
  }

  function addGathering(name: string): string | null {
    const trimmed = name.trim()
    if (trimmed === '') return null

    const gathering: Gathering = { id: uuid(), name: trimmed, members: [], expenses: [] }
    gatherings.value = [...gatherings.value, gathering]
    return gathering.id
  }

  function removeGathering(id: string): void {
    gatherings.value = gatherings.value.filter((gathering) => gathering.id !== id)
    if (activeGatheringId.value === id) goToList()
  }

  function addMember(gatheringId: string, name: string): string | null {
    const trimmed = name.trim()
    if (trimmed === '') return null

    const member: Member = { id: uuid(), name: trimmed }
    updateGathering(gatheringId, (gathering) => ({
      ...gathering,
      members: [...gathering.members, member],
    }))
    return member.id
  }

  function renameMember(gatheringId: string, memberId: string, name: string): void {
    const trimmed = name.trim()
    if (trimmed === '') return

    updateGathering(gatheringId, (gathering) => ({
      ...gathering,
      members: gathering.members.map((member) =>
        member.id === memberId ? { ...member, name: trimmed } : member,
      ),
    }))
  }

  function removeMember(gatheringId: string, memberId: string): boolean {
    const gathering = findGathering(gatheringId)
    if (!gathering || hasMemberExpenses(gathering, memberId)) return false

    updateGathering(gatheringId, (gathering) => ({
      ...gathering,
      members: gathering.members.filter((member) => member.id !== memberId),
    }))
    return true
  }

  function addExpense(gatheringId: string, input: NewExpenseInput): string | null {
    const gathering = findGathering(gatheringId)
    if (!gathering) return null

    const name = input.name.trim()
    if (name === '') return null
    if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) return null

    const memberIds = new Set(gathering.members.map((member) => member.id))
    if (!memberIds.has(input.paidById)) return null

    const participantIds = input.participantIds ?? gathering.members.map((member) => member.id)
    if (participantIds.length === 0 || !participantIds.every((id) => memberIds.has(id))) return null

    const expense: Expense = {
      id: uuid(),
      name,
      amountCents: input.amountCents,
      paidById: input.paidById,
      participantIds: [...participantIds],
    }
    updateGathering(gatheringId, (gathering) => ({
      ...gathering,
      expenses: [...gathering.expenses, expense],
    }))
    return expense.id
  }

  function removeExpense(gatheringId: string, expenseId: string): boolean {
    const gathering = findGathering(gatheringId)
    if (!gathering || !gathering.expenses.some((expense) => expense.id === expenseId)) return false

    updateGathering(gatheringId, (gathering) => ({
      ...gathering,
      expenses: gathering.expenses.filter((expense) => expense.id !== expenseId),
    }))
    return true
  }

  function findGathering(id: string): Gathering | undefined {
    return gatherings.value.find((gathering) => gathering.id === id)
  }

  function updateGathering(id: string, update: (gathering: Gathering) => Gathering): void {
    gatherings.value = gatherings.value.map((gathering) =>
      gathering.id === id ? update(gathering) : gathering,
    )
  }

  function hasMemberExpenses(gathering: Gathering, memberId: string): boolean {
    return gathering.expenses.some(
      (expense) => expense.paidById === memberId || expense.participantIds.includes(memberId),
    )
  }

  return {
    gatherings,
    view,
    activeGatheringId,
    activeGathering,
    goToList,
    openGathering,
    openResults,
    addGathering,
    removeGathering,
    addMember,
    renameMember,
    removeMember,
    addExpense,
    removeExpense,
  }
})
