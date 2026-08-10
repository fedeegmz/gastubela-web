<script setup lang="ts">
import { computed } from 'vue'

import ExpenseForm from '@/components/ExpenseForm.vue'
import MemberList from '@/components/MemberList.vue'
import { useGatheringsStore } from '@/stores/gatherings'
import { formatCents } from '@/utils/currency'

const store = useGatheringsStore()

const gathering = computed(() => store.activeGathering)
const activeName = computed(() => gathering.value?.name ?? '')

function memberName(memberId: string): string {
  return gathering.value?.members.find((member) => member.id === memberId)?.name ?? ''
}
</script>

<template>
  <section class="detail">
    <div class="detail__nav">
      <button class="btn btn--ghost" type="button" @click="store.goToList()">← Volver</button>
      <button
        class="btn btn--primary"
        type="button"
        @click="store.openResults(store.activeGatheringId!)"
      >
        Finalizar
      </button>
    </div>

    <header class="detail__header">
      <div class="detail__mark" aria-hidden="true">{{ activeName.charAt(0).toUpperCase() }}</div>
      <div>
        <h2 class="detail__title">{{ activeName }}</h2>
        <p class="detail__subtitle">
          {{ gathering?.members.length ?? 0 }} miembros ·
          {{ gathering?.expenses.length ?? 0 }} gastos
        </p>
      </div>
    </header>

    <MemberList />

    <section class="card detail__section">
      <header class="detail__section-header">
        <h3 class="detail__section-title">Gastos</h3>
        <span class="badge badge--muted">{{ gathering?.expenses.length ?? 0 }}</span>
      </header>

      <ExpenseForm />

      <p v-if="gathering?.expenses.length === 0" class="detail__empty">
        Todavía no hay gastos cargados.
      </p>

      <ul v-else class="expenses">
        <li v-for="expense in gathering?.expenses" :key="expense.id" class="expense">
          <div class="expense__main">
            <p class="expense__name">{{ expense.name }}</p>
            <p class="expense__meta">Pagó {{ memberName(expense.paidById) }}</p>
            <div class="expense__participants">
              <span v-for="participantId in expense.participantIds" :key="participantId" class="chip">
                {{ memberName(participantId) }}
              </span>
            </div>
          </div>
          <div class="expense__side">
            <span class="expense__amount">{{ formatCents(expense.amountCents) }}</span>
            <button
              class="btn btn--icon btn--danger"
              type="button"
              :aria-label="`Eliminar gasto ${expense.name}`"
              @click="store.removeExpense(store.activeGatheringId!, expense.id)"
            >
              ×
            </button>
          </div>
        </li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.detail {
  display: grid;
  gap: var(--space-5);
}

.detail__nav {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}

.detail__header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.detail__mark {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: var(--radius-lg);
  background: var(--gradient-brand);
  color: #fff;
  font-size: var(--text-xl);
  font-weight: 800;
  box-shadow: 0 6px 16px rgba(108, 92, 231, 0.35);
}

.detail__title {
  font-size: var(--text-2xl);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.detail__subtitle {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.detail__section {
  display: grid;
  gap: var(--space-4);
}

.detail__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-5) 0;
}

.detail__section-title {
  font-size: var(--text-base);
  font-weight: 800;
}

.detail__empty {
  padding: 0 var(--space-5) var(--space-5);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.expenses {
  display: grid;
  gap: var(--space-2);
  padding: 0 var(--space-4) var(--space-4);
}

.expense {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
}

.expense__name {
  font-weight: 700;
  font-size: var(--text-sm);
}

.expense__meta {
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.expense__participants {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-2);
}

.expense__side {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
}

.expense__amount {
  font-weight: 800;
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}
</style>
