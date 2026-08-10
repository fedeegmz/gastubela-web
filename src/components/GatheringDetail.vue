<script setup lang="ts">
import { useGatheringsStore } from '@/stores/gatherings'

const store = useGatheringsStore()
</script>

<template>
  <section>
    <button type="button" @click="store.goToList()">Volver</button>
    <h2>{{ store.activeGathering?.name }}</h2>
    <p>Detalle de juntada en construcción.</p>
  </section>
</template>
