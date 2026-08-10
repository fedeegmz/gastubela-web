<script setup lang="ts">
import ExpenseForm from '@/components/ExpenseForm.vue'
import MemberList from '@/components/MemberList.vue'
import { useGatheringsStore } from '@/stores/gatherings'
import { formatCents } from '@/utils/currency'

const store = useGatheringsStore()

function memberName(memberId: string): string {
  return store.activeGathering?.members.find((member) => member.id === memberId)?.name ?? ''
}
</script>

<template>
  <section>
    <button type="button" @click="store.goToList()">Volver</button>
    <h2>{{ store.activeGathering?.name }}</h2>

    <MemberList />

    <section>
      <header>
        <h3>Gastos</h3>
      </header>

      <ExpenseForm />

      <p v-if="store.activeGathering?.expenses.length === 0">Todavía no hay gastos cargados.</p>

      <ul v-else>
        <li v-for="expense in store.activeGathering?.expenses" :key="expense.id">
          {{ expense.name }} — {{ formatCents(expense.amountCents) }}
          <p>
            Pagó {{ memberName(expense.paidById) }} ·
            {{ expense.participantIds.map(memberName).join(', ') }}
          </p>
          <button type="button" @click="store.removeExpense(store.activeGatheringId!, expense.id)">
            Eliminar
          </button>
        </li>
      </ul>
    </section>
  </section>
</template>
