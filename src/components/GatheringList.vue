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
    <header class="section-header">
      <div>
        <h2 class="section-header__title">Mis juntadas</h2>
        <p class="section-header__subtitle">Dividí gastos con amigos, sin drama</p>
      </div>
      <button class="btn btn--primary" type="button" @click="showForm = !showForm">
        {{ showForm ? 'Cancelar' : 'Nueva juntada' }}
      </button>
    </header>

    <Transition name="fade">
      <GatheringForm
        v-if="showForm"
        class="gathering-list__form"
        @created="handleCreated"
        @cancel="showForm = false"
      />
    </Transition>

    <div v-if="store.gatherings.length === 0" class="card empty-state">
      <p class="empty-state__title">Todavía no hay juntadas</p>
      <p class="empty-state__text">Creá la primera para empezar a dividir gastos.</p>
    </div>

    <ul v-else class="gathering-list__grid">
      <li v-for="gathering in store.gatherings" :key="gathering.id" class="card gathering-card">
        <div class="gathering-card__mark" aria-hidden="true">
          {{ gathering.name.charAt(0).toUpperCase() }}
        </div>
        <button class="gathering-card__open" type="button" @click="store.openGathering(gathering.id)">
          <span class="gathering-card__name">{{ gathering.name }}</span>
          <span class="gathering-card__meta">
            {{ gathering.members.length }}
            {{ gathering.members.length === 1 ? 'miembro' : 'miembros' }} ·
            {{ gathering.expenses.length }}
            {{ gathering.expenses.length === 1 ? 'gasto' : 'gastos' }}
          </span>
        </button>
        <button
          class="btn btn--icon btn--danger"
          type="button"
          :aria-label="`Eliminar ${gathering.name}`"
          @click="store.removeGathering(gathering.id)"
        >
          ×
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.gathering-list__form {
  margin-bottom: var(--space-5);
}

.gathering-list__grid {
  display: grid;
  gap: var(--space-3);
}

.gathering-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  transition:
    box-shadow var(--transition),
    transform var(--transition);
}

.gathering-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.gathering-card__mark {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-md);
  background: var(--gradient-brand);
  color: #fff;
  font-size: var(--text-lg);
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(108, 92, 231, 0.3);
}

.gathering-card:nth-child(3n + 2) .gathering-card__mark {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
}

.gathering-card:nth-child(3n + 3) .gathering-card__mark {
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  box-shadow: 0 4px 10px rgba(14, 165, 233, 0.3);
}

.gathering-card__open {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
  text-align: left;
  min-width: 0;
}

.gathering-card__name {
  font-size: var(--text-base);
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gathering-card__meta {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
</style>
