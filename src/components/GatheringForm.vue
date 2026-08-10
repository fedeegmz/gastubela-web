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
  <form class="card gathering-form" @submit.prevent="submit">
    <h3 class="gathering-form__title">Nueva juntada</h3>
    <div class="gathering-form__row">
      <label class="sr-only" for="gathering-name">Nombre de la juntada</label>
      <input
        id="gathering-name"
        v-model.trim="name"
        class="input"
        type="text"
        placeholder="Ej.: Asado del sábado"
      />
      <button class="btn btn--primary" type="submit" :disabled="name === ''">Crear</button>
    </div>
    <button class="gathering-form__cancel" type="button" @click="emit('cancel')">
      Cancelar
    </button>
  </form>
</template>

<style scoped>
.gathering-form {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
}

.gathering-form__title {
  font-size: var(--text-base);
  font-weight: 800;
}

.gathering-form__row {
  display: flex;
  gap: var(--space-3);
}

.gathering-form__row .input {
  flex: 1;
}

.gathering-form__cancel {
  justify-self: start;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.gathering-form__cancel:hover {
  color: var(--color-text);
}
</style>
