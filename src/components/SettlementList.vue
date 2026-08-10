<script setup lang="ts">
import { computed } from 'vue'

import { useGatheringsStore } from '@/stores/gatherings'
import { formatCents } from '@/utils/currency'
import { computeBalances, settleGathering } from '@/utils/settlements'

const store = useGatheringsStore()

const gathering = computed(() => store.activeGathering)

const balances = computed(() => (gathering.value ? computeBalances(gathering.value) : new Map()))

const transfers = computed(() => (gathering.value ? settleGathering(gathering.value) : []))

const groupedTransfers = computed(() => {
  const groups = new Map<string, { toMemberId: string; amountCents: number }[]>()
  for (const transfer of transfers.value) {
    const group = groups.get(transfer.fromMemberId) ?? []
    group.push({ toMemberId: transfer.toMemberId, amountCents: transfer.amountCents })
    groups.set(transfer.fromMemberId, group)
  }
  return groups
})

function memberName(memberId: string): string {
  return gathering.value?.members.find((member) => member.id === memberId)?.name ?? ''
}

function balanceOf(memberId: string): number {
  return balances.value.get(memberId) ?? 0
}
</script>

<template>
  <section class="results">
    <div class="results__nav">
      <button
        class="btn btn--ghost"
        type="button"
        @click="store.openGathering(store.activeGatheringId!)"
      >
        ← Volver
      </button>
    </div>

    <header class="results__header">
      <h2 class="results__title">{{ gathering?.name }}</h2>
      <p class="results__subtitle">Resultados finales</p>
    </header>

    <section v-if="gathering && gathering.members.length > 0" class="card results__card">
      <h3 class="results__card-title">Saldos</h3>
      <ul class="results__balances">
        <li v-for="member in gathering.members" :key="member.id" class="results__balance">
          <span class="results__balance-name">{{ member.name }}</span>
          <span v-if="balanceOf(member.id) > 0" class="badge badge--success">
            Cobra {{ formatCents(balanceOf(member.id)) }}
          </span>
          <span v-else-if="balanceOf(member.id) < 0" class="badge badge--danger">
            Debe {{ formatCents(-balanceOf(member.id)) }}
          </span>
          <span v-else class="badge badge--muted">Saldado</span>
        </li>
      </ul>
    </section>

    <section class="card results__card">
      <h3 class="results__card-title">Transferencias</h3>

      <p v-if="transfers.length === 0" class="results__empty">No hay deudas que saldar.</p>

      <ul v-else class="results__groups">
        <li v-for="[debtorId, owed] in groupedTransfers" :key="debtorId" class="results__group">
          <p class="results__group-debtor">{{ memberName(debtorId) }}</p>
          <ul class="results__transfers">
            <li v-for="transfer in owed" :key="transfer.toMemberId" class="results__transfer">
              <span class="results__arrow" aria-hidden="true">→</span>
              <span class="results__to">{{ memberName(transfer.toMemberId) }}</span>
              <span class="results__amount">{{ formatCents(transfer.amountCents) }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.results {
  display: grid;
  gap: var(--space-5);
}

.results__nav {
  display: flex;
}

.results__title {
  font-size: var(--text-2xl);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.results__subtitle {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.results__card {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
}

.results__card-title {
  font-size: var(--text-base);
  font-weight: 800;
}

.results__balances {
  display: grid;
  gap: var(--space-2);
}

.results__balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
}

.results__balance-name {
  font-size: var(--text-sm);
  font-weight: 600;
}

.results__empty {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.results__groups {
  display: grid;
  gap: var(--space-4);
}

.results__group {
  display: grid;
  gap: var(--space-2);
}

.results__group-debtor {
  font-size: var(--text-sm);
  font-weight: 700;
}

.results__transfers {
  display: grid;
  gap: var(--space-2);
}

.results__transfer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
  font-size: var(--text-sm);
}

.results__arrow {
  color: var(--color-primary);
  font-weight: 700;
}

.results__to {
  flex: 1;
  font-weight: 600;
}

.results__amount {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
</style>
