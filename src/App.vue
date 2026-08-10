<script setup lang="ts">
import { storeToRefs } from 'pinia'

import GatheringDetail from '@/components/GatheringDetail.vue'
import GatheringList from '@/components/GatheringList.vue'
import SettlementList from '@/components/SettlementList.vue'
import { useGatheringsStore } from '@/stores/gatherings'

const store = useGatheringsStore()
const { view } = storeToRefs(store)
</script>

<template>
  <main>
    <h1>gastubela</h1>

    <GatheringList v-if="view === 'list'" />
    <GatheringDetail v-else-if="view === 'detail'" />
    <SettlementList v-else-if="view === 'results'" />
  </main>
</template>
