<script setup lang="ts">
import { ref } from 'vue'

import { useGatheringsStore } from '@/stores/gatherings'

const store = useGatheringsStore()
const name = ref('')
const error = ref('')

function addMember(): void {
  if (store.addMember(store.activeGatheringId!, name.value)) {
    name.value = ''
    error.value = ''
  }
}

function removeMember(memberId: string): void {
  if (store.removeMember(store.activeGatheringId!, memberId)) {
    error.value = ''
  } else {
    error.value = 'No se puede eliminar: el miembro tiene gastos asociados.'
  }
}
</script>

<template>
  <section>
    <header>
      <h3>Miembros</h3>
    </header>

    <form @submit.prevent="addMember">
      <label for="member-name">Nombre del miembro</label>
      <input id="member-name" v-model.trim="name" type="text" placeholder="Ej.: Ana" />
      <button type="submit" :disabled="name === ''">Agregar</button>
    </form>

    <p v-if="error">{{ error }}</p>

    <p v-if="store.activeGathering?.members.length === 0">
      Todavía no hay miembros. Agregá el primero.
    </p>

    <ul v-else>
      <li v-for="member in store.activeGathering?.members" :key="member.id">
        {{ member.name }}
        <button type="button" @click="removeMember(member.id)">Eliminar</button>
      </li>
    </ul>
  </section>
</template>
