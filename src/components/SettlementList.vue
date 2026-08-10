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
</script>

<template>
  <section>
    <button type="button" @click="store.openGathering(store.activeGatheringId!)">Volver</button>
    <h2>{{ gathering?.name }}</h2>

    <section v-if="gathering && gathering.members.length > 0">
      <header>
        <h3>Saldos</h3>
      </header>

      <ul>
        <li v-for="member in gathering.members" :key="member.id">
          <template v-if="(balances.get(member.id) ?? 0) > 0">
            {{ member.name }} cobra {{ formatCents(balances.get(member.id)!) }}
          </template>
          <template v-else-if="(balances.get(member.id) ?? 0) < 0">
            {{ member.name }} debe {{ formatCents(-balances.get(member.id)!) }}
          </template>
          <template v-else>{{ member.name }} no tiene deuda</template>
        </li>
      </ul>
    </section>

    <section>
      <header>
        <h3>Transferencias</h3>
      </header>

      <p v-if="transfers.length === 0">No hay deudas que saldar.</p>

      <ul v-else>
        <li v-for="[debtorId, owed] in groupedTransfers" :key="debtorId">
          {{ memberName(debtorId) }} debe:
          <ul>
            <li v-for="transfer in owed" :key="transfer.toMemberId">
              a {{ memberName(transfer.toMemberId) }} — {{ formatCents(transfer.amountCents) }}
            </li>
          </ul>
        </li>
      </ul>
    </section>
  </section>
</template>
