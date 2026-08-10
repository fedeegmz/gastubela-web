import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useGatheringsStore } from '../gatherings'

function seed() {
  const store = useGatheringsStore()
  const gatheringId = store.addGathering('juntada')!
  const ana = store.addMember(gatheringId, 'ana')!
  const beto = store.addMember(gatheringId, 'beto')!
  return { store, gatheringId, ana, beto }
}

describe('navigation', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('starts on the list view with no active gathering', () => {
    const store = useGatheringsStore()

    expect(store.view).toBe('list')
    expect(store.activeGatheringId).toBeNull()
    expect(store.activeGathering).toBeUndefined()
  })

  it('opens a gathering into detail view', () => {
    const { store, gatheringId } = seed()

    store.openGathering(gatheringId)

    expect(store.view).toBe('detail')
    expect(store.activeGatheringId).toBe(gatheringId)
    expect(store.activeGathering?.id).toBe(gatheringId)
  })

  it('opens a gathering into results view', () => {
    const { store, gatheringId } = seed()

    store.openResults(gatheringId)

    expect(store.view).toBe('results')
    expect(store.activeGatheringId).toBe(gatheringId)
  })

  it('goes back to the list and clears the active gathering', () => {
    const { store, gatheringId } = seed()

    store.openGathering(gatheringId)
    store.goToList()

    expect(store.view).toBe('list')
    expect(store.activeGatheringId).toBeNull()
  })
})

describe('gatherings', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('creates a gathering with no members or expenses and returns its id', () => {
    const store = useGatheringsStore()

    const id = store.addGathering('  asado  ')

    expect(id).toBeTruthy()
    expect(store.gatherings).toEqual([{ id, name: 'asado', members: [], expenses: [] }])
  })

  it('rejects a blank name', () => {
    const store = useGatheringsStore()

    expect(store.addGathering('   ')).toBeNull()
    expect(store.gatherings).toEqual([])
  })

  it('removes a gathering', () => {
    const { store, gatheringId } = seed()

    store.removeGathering(gatheringId)

    expect(store.gatherings).toEqual([])
  })

  it('resets navigation when removing the active gathering', () => {
    const { store, gatheringId } = seed()

    store.openGathering(gatheringId)
    store.removeGathering(gatheringId)

    expect(store.view).toBe('list')
    expect(store.activeGatheringId).toBeNull()
  })
})

describe('members', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('adds a member to the gathering and returns its id', () => {
    const { store, gatheringId } = seed()

    const id = store.addMember(gatheringId, '  carla  ')

    expect(id).toBeTruthy()
    expect(store.gatherings[0]?.members.map((m) => m.name)).toEqual(['ana', 'beto', 'carla'])
  })

  it('rejects a blank member name', () => {
    const { store, gatheringId } = seed()

    expect(store.addMember(gatheringId, ' ')).toBeNull()
    expect(store.gatherings[0]?.members).toHaveLength(2)
  })

  it('renames a member', () => {
    const { store, gatheringId, ana } = seed()

    store.renameMember(gatheringId, ana, 'anita')

    expect(store.gatherings[0]?.members.find((m) => m.id === ana)?.name).toBe('anita')
  })

  it('removes a member with no expenses', () => {
    const { store, gatheringId, beto } = seed()

    expect(store.removeMember(gatheringId, beto)).toBe(true)
    expect(store.gatherings[0]?.members.map((m) => m.name)).toEqual(['ana'])
  })

  it('blocks removing a member who paid an expense', () => {
    const { store, gatheringId, ana, beto } = seed()

    store.addExpense(gatheringId, {
      name: 'comida',
      amountCents: 10000,
      paidById: ana,
      participantIds: [ana, beto],
    })

    expect(store.removeMember(gatheringId, ana)).toBe(false)
    expect(store.gatherings[0]?.members).toHaveLength(2)
  })

  it('blocks removing a member who participates in an expense', () => {
    const { store, gatheringId, ana, beto } = seed()

    store.addExpense(gatheringId, {
      name: 'comida',
      amountCents: 10000,
      paidById: ana,
      participantIds: [ana, beto],
    })

    expect(store.removeMember(gatheringId, beto)).toBe(false)
    expect(store.gatherings[0]?.members).toHaveLength(2)
  })
})

describe('expenses', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('adds an expense to the gathering and returns its id', () => {
    const { store, gatheringId, ana, beto } = seed()

    const id = store.addExpense(gatheringId, {
      name: '  comida  ',
      amountCents: 10000,
      paidById: ana,
      participantIds: [ana, beto],
    })

    expect(id).toBeTruthy()
    expect(store.gatherings[0]?.expenses).toEqual([
      { id, name: 'comida', amountCents: 10000, paidById: ana, participantIds: [ana, beto] },
    ])
  })

  it('defaults participants to all members', () => {
    const { store, gatheringId, ana } = seed()

    store.addExpense(gatheringId, { name: 'comida', amountCents: 5000, paidById: ana })

    const expense = store.gatherings[0]?.expenses[0]
    expect(expense?.participantIds).toEqual(store.gatherings[0]?.members.map((m) => m.id))
  })

  it('rejects a blank expense name', () => {
    const { store, gatheringId, ana } = seed()

    expect(
      store.addExpense(gatheringId, {
        name: ' ',
        amountCents: 10000,
        paidById: ana,
      }),
    ).toBeNull()
  })

  it('rejects a non-positive amount', () => {
    const { store, gatheringId, ana } = seed()

    expect(
      store.addExpense(gatheringId, { name: 'comida', amountCents: 0, paidById: ana }),
    ).toBeNull()
    expect(
      store.addExpense(gatheringId, { name: 'comida', amountCents: -1, paidById: ana }),
    ).toBeNull()
    expect(
      store.addExpense(gatheringId, { name: 'comida', amountCents: 10.5, paidById: ana }),
    ).toBeNull()
  })

  it('rejects an unknown payer', () => {
    const { store, gatheringId } = seed()

    expect(
      store.addExpense(gatheringId, {
        name: 'comida',
        amountCents: 10000,
        paidById: 'unknown',
      }),
    ).toBeNull()
  })

  it('rejects empty or unknown participants', () => {
    const { store, gatheringId, ana } = seed()

    expect(
      store.addExpense(gatheringId, {
        name: 'comida',
        amountCents: 10000,
        paidById: ana,
        participantIds: [],
      }),
    ).toBeNull()
    expect(
      store.addExpense(gatheringId, {
        name: 'comida',
        amountCents: 10000,
        paidById: ana,
        participantIds: ['unknown'],
      }),
    ).toBeNull()
  })

  it('removes an expense', () => {
    const { store, gatheringId, ana } = seed()
    store.addExpense(gatheringId, { name: 'comida', amountCents: 5000, paidById: ana })
    const expenseId = store.gatherings[0]!.expenses[0]!.id

    expect(store.removeExpense(gatheringId, expenseId)).toBe(true)
    expect(store.gatherings[0]?.expenses).toEqual([])
  })

  it('returns false when the expense does not exist', () => {
    const { store, gatheringId } = seed()

    expect(store.removeExpense(gatheringId, 'unknown')).toBe(false)
  })
})
