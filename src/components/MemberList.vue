<script setup lang="ts">
import { ref } from 'vue'

import { useGatheringsStore } from '@/stores/gatherings'

const store = useGatheringsStore()
const name = ref('')
const error = ref('')

const avatarPalette = [
  'linear-gradient(135deg, #8b5cf6, #6c5ce7)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #10b981, #14b8a6)',
  'linear-gradient(135deg, #f43f5e, #f97316)',
]

function avatarStyle(index: number): Record<string, string> {
  return { background: avatarPalette[index % avatarPalette.length] ?? '#6c5ce7' }
}

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
  <section class="card member-list">
    <header class="member-list__header">
      <h3 class="member-list__title">Miembros</h3>
      <span class="badge badge--muted">{{ store.activeGathering?.members.length ?? 0 }}</span>
    </header>

    <form class="member-list__form" @submit.prevent="addMember">
      <label class="sr-only" for="member-name">Nombre del miembro</label>
      <input
        id="member-name"
        v-model.trim="name"
        class="input"
        type="text"
        placeholder="Ej.: Ana"
      />
      <button class="btn btn--primary" type="submit" :disabled="name === ''">Agregar</button>
    </form>

    <p v-if="error" class="member-list__error" role="alert">{{ error }}</p>

    <p v-if="store.activeGathering?.members.length === 0" class="member-list__empty">
      Todavía no hay miembros. Agregá el primero.
    </p>

    <ul v-else class="member-list__items">
      <li v-for="(member, index) in store.activeGathering?.members" :key="member.id" class="member-list__item">
        <span class="avatar" :style="avatarStyle(index)" aria-hidden="true">
          {{ member.name.charAt(0).toUpperCase() }}
        </span>
        <span class="member-list__name">{{ member.name }}</span>
        <button
          class="btn btn--icon btn--danger"
          type="button"
          :aria-label="`Eliminar a ${member.name}`"
          @click="removeMember(member.id)"
        >
          ×
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.member-list {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
}

.member-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.member-list__title {
  font-size: var(--text-base);
  font-weight: 800;
}

.member-list__form {
  display: flex;
  gap: var(--space-3);
}

.member-list__form .input {
  flex: 1;
}

.member-list__error {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-danger-soft);
  color: var(--color-danger);
  font-size: var(--text-sm);
  font-weight: 600;
}

.member-list__empty {
  padding: var(--space-4);
  text-align: center;
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.member-list__items {
  display: grid;
  gap: var(--space-2);
}

.member-list__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background-color var(--transition);
}

.member-list__item:hover {
  background: var(--color-surface-muted);
}

.member-list__name {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: 600;
}
</style>
