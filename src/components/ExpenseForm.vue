<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useGatheringsStore } from '@/stores/gatherings'
import { parseAmountToCents } from '@/utils/currency'

const store = useGatheringsStore()

const members = computed(() => store.activeGathering?.members ?? [])
const name = ref('')
const amount = ref('')
const payerId = ref('')
const participantIds = ref<string[]>([])

const amountCents = computed(() => parseAmountToCents(amount.value))
const canSubmit = computed(
  () => name.value.trim() !== '' && amountCents.value !== null && participantIds.value.length > 0,
)

function reset(): void {
  name.value = ''
  amount.value = ''
  payerId.value = members.value[0]?.id ?? ''
  participantIds.value = members.value.map((member) => member.id)
}

function toggleParticipant(memberId: string, checked: boolean): void {
  if (checked) {
    participantIds.value = [...participantIds.value, memberId]
  } else {
    participantIds.value = participantIds.value.filter((id) => id !== memberId)
  }
}

function isOnlyParticipant(memberId: string): boolean {
  return participantIds.value.length === 1 && participantIds.value[0] === memberId
}

function submit(): void {
  if (amountCents.value === null) return

  const expenseId = store.addExpense(store.activeGatheringId!, {
    name: name.value,
    amountCents: amountCents.value,
    paidById: payerId.value,
    participantIds: participantIds.value,
  })
  if (expenseId !== null) reset()
}
reset()

watch(
  members,
  (next) => {
    const missing = next.map((member) => member.id).filter((id) => !participantIds.value.includes(id))
    if (missing.length > 0) {
      participantIds.value = [...participantIds.value, ...missing]
    }
  },
  { immediate: true },
)

</script>

<template>
  <form v-if="members.length > 0" class="expense-form" @submit.prevent="submit">
    <div class="expense-form__grid">
      <div class="form-field">
        <label class="form-field__label" for="expense-name">Descripción</label>
        <input
          id="expense-name"
          v-model.trim="name"
          class="input"
          type="text"
          placeholder="Ej.: Carne para el asado"
        />
      </div>

      <div class="form-field">
        <label class="form-field__label" for="expense-amount">Monto</label>
        <div class="expense-form__amount">
          <span class="expense-form__currency" aria-hidden="true">$</span>
          <input
            id="expense-amount"
            v-model="amount"
            class="input expense-form__amount-input"
            type="text"
            inputmode="decimal"
            placeholder="12500 o 125,50"
          />
        </div>
      </div>

      <fieldset class="expense-form__fieldset">
        <legend class="form-field__label">Pagó</legend>
        <div class="expense-form__chips">
          <button
            v-for="member in members"
            :key="member.id"
            type="button"
            class="chip"
            :class="{ 'chip--active': payerId === member.id }"
            :aria-pressed="payerId === member.id"
            @click="payerId = member.id"
          >
            {{ member.name }}
          </button>
        </div>
      </fieldset>
    </div>

    <fieldset class="expense-form__fieldset">
      <legend class="form-field__label">Participantes</legend>
      <div class="expense-form__chips">
        <button
          v-for="member in members"
          :key="member.id"
          type="button"
          class="chip"
          :class="{ 'chip--active': participantIds.includes(member.id) }"
          :disabled="isOnlyParticipant(member.id)"
          :aria-pressed="participantIds.includes(member.id)"
          @click="toggleParticipant(member.id, !participantIds.includes(member.id))"
        >
          {{ member.name }}
        </button>
      </div>
    </fieldset>

    <button class="btn btn--primary expense-form__submit" type="submit" :disabled="!canSubmit">
      Agregar gasto
    </button>
  </form>

  <p v-else class="expense-form__empty">Agregá miembros primero para cargar gastos.</p>
</template>

<style scoped>
.expense-form {
  display: grid;
  gap: var(--space-4);
  padding: 0 var(--space-5) var(--space-5);
}

.expense-form__grid {
  display: grid;
  gap: var(--space-3);
}

.expense-form__amount {
  position: relative;
}

.expense-form__currency {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  font-weight: 700;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.expense-form__amount-input {
  padding-left: 1.75rem;
}

.expense-form__fieldset {
  display: grid;
  gap: var(--space-2);
  border: none;
  padding: 0;
}

.expense-form__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.expense-form__submit {
  justify-self: start;
}

.expense-form__empty {
  padding: var(--space-4) var(--space-5);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
</style>
