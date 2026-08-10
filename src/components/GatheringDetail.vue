<script setup lang="ts">
import MemberList from '@/components/MemberList.vue'
import { useGatheringsStore } from '@/stores/gatherings'

const store = useGatheringsStore()
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
      <p>Todavía no hay gastos cargados.</p>
    </section>
  </section>
</template>
