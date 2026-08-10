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
  <div class="app">
    <header class="app__header">
      <div class="app__header-inner">
        <div class="app__brand">
          <span class="app__logo" aria-hidden="true">$</span>
          <span class="app__name">gastubela</span>
        </div>
      </div>
    </header>

    <main class="app__main">
      <Transition name="fade" mode="out-in">
        <GatheringList v-if="view === 'list'" :key="'list'" />
        <GatheringDetail v-else-if="view === 'detail'" :key="'detail'" />
        <SettlementList v-else-if="view === 'results'" :key="'results'" />
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.app__header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(250, 248, 245, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.app__header-inner {
  max-width: 680px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-5);
}

.app__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.app__logo {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-md);
  background: var(--gradient-brand);
  color: #fff;
  font-size: var(--text-lg);
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
}

.app__name {
  font-size: var(--text-lg);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.app__main {
  max-width: 680px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-5) var(--space-10);
}
</style>
