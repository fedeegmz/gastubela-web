<script setup lang="ts">
import { ref } from 'vue'

import { useGatheringsStore } from '@/stores/gatherings'

const emit = defineEmits<{
  created: []
  cancel: []
}>()

const store = useGatheringsStore()
const name = ref('')

function submit(): void {
  if (store.addGathering(name.value)) {
    name.value = ''
    emit('created')
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <label for="gathering-name">Nombre de la juntada</label>
    <input
      id="gathering-name"
      v-model.trim="name"
      type="text"
      placeholder="Ej.: Asado del sábado"
    />
    <button type="submit" :disabled="name === ''">Crear</button>
    <button type="button" @click="emit('cancel')">Cancelar</button>
  </form>
</template>
