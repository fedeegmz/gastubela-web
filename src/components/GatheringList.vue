<script setup lang="ts">
import { ref } from 'vue'

import GatheringForm from '@/components/GatheringForm.vue'
import { useGatheringsStore } from '@/stores/gatherings'

const store = useGatheringsStore()
const showForm = ref(false)

function handleCreated(): void {
  showForm.value = false
}
</script>

<template>
  <section>
    <header>
      <h2>Mis juntadas</h2>
      <button type="button" @click="showForm = !showForm">
        {{ showForm ? 'Cancelar' : 'Nueva juntada' }}
      </button>
    </header>

    <GatheringForm v-if="showForm" @created="handleCreated" @cancel="showForm = false" />

    <p v-if="store.gatherings.length === 0">
      Todavía no hay juntadas. Crea la primera para empezar.
    </p>

    <ul v-else>
      <li v-for="gathering in store.gatherings" :key="gathering.id">
        <button type="button" @click="store.openGathering(gathering.id)">
          {{ gathering.name }}
        </button>
        <button type="button" @click="store.removeGathering(gathering.id)">Eliminar</button>
      </li>
    </ul>
  </section>
</template>
