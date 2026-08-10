<script setup lang="ts">
import { computed, ref } from 'vue'

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
</script>

<template>
  <form v-if="members.length > 0" @submit.prevent="submit">
    <label for="expense-name">Descripción</label>
    <input
      id="expense-name"
      v-model.trim="name"
      type="text"
      placeholder="Ej.: Carne para el asado"
    />

    <label for="expense-amount">Monto ($)</label>
    <input
      id="expense-amount"
      v-model="amount"
      type="text"
      inputmode="decimal"
      placeholder="Ej.: 12500 o 125,50"
    />

    <label for="expense-payer">Pagó</label>
    <select id="expense-payer" v-model="payerId">
      <option v-for="member in members" :key="member.id" :value="member.id">
        {{ member.name }}
      </option>
    </select>

    <fieldset>
      <legend>Participantes</legend>
      <label v-for="member in members" :key="member.id">
        <input
          type="checkbox"
          :checked="participantIds.includes(member.id)"
          :disabled="isOnlyParticipant(member.id)"
          @change="toggleParticipant(member.id, ($event.target as HTMLInputElement).checked)"
        />
        {{ member.name }}
      </label>
    </fieldset>

    <button type="submit" :disabled="!canSubmit">Agregar gasto</button>
  </form>

  <p v-else>Agregá miembros primero para cargar gastos.</p>
</template>
