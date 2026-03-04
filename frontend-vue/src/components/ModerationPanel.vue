<script setup>
import { computed, onMounted, ref } from 'vue';
import { useModerationStore } from '../stores/moderation';
import { useSpotsStore } from '../stores/spots';

const moderationStore = useModerationStore();
const spotsStore = useSpotsStore();
const open = ref(false);

const canUseModeration = computed(() => moderationStore.supported);

function toggleOpen() {
  open.value = !open.value;
  if (open.value) {
    moderationStore.loadPending();
  }
}

async function handleApprove(spotId) {
  await moderationStore.approve(spotId);
  await spotsStore.reload();
}

async function handleReject(spotId) {
  await moderationStore.reject(spotId);
  await spotsStore.reload();
}

onMounted(() => {
  moderationStore.loadPending();
});
</script>

<template>
  <div class="moderation-wrap" v-if="canUseModeration">
    <button class="topbar-btn moderation-trigger" type="button" @click="toggleOpen" title="Panel de moderación de spots">
      🛡️ Moderación
      <span v-if="moderationStore.totalPending > 0" class="moderation-badge">{{ moderationStore.totalPending }}</span>
    </button>

    <section v-if="open" class="moderation-panel" role="dialog" aria-label="Panel de moderación">
      <header class="moderation-panel-head">
        <strong>🛡️ Moderación</strong>
        <button class="topbar-btn" type="button" @click="open = false">✖</button>
      </header>

      <p class="moderation-count" v-if="!moderationStore.loading">Pendientes: {{ moderationStore.totalPending }}</p>

      <div v-if="open && !moderationStore.loading" class="moderation-stats" aria-label="Resumen de moderación">
        <small>Spots totales: {{ moderationStore.stats.spotsTotal }}</small>
        <small>Reportes pendientes: {{ moderationStore.stats.reportsPending }}</small>
        <small>Rating medio global: {{ moderationStore.stats.averageRatingGlobal.toFixed(2) }}</small>
      </div>

      <p v-if="moderationStore.error" class="auth-error">{{ moderationStore.error }}</p>

      <div v-if="moderationStore.loading" class="notifications-empty">Cargando pendientes…</div>
      <div v-else-if="moderationStore.pendingSpots.length === 0" class="notifications-empty">No hay spots pendientes</div>

      <ul v-else class="moderation-list">
        <li v-for="spot in moderationStore.pendingSpots" :key="spot.id" class="moderation-item">
          <img v-if="spot.image" :src="spot.image" :alt="spot.title" class="moderation-image">
          <div v-else class="moderation-image moderation-image--empty">📸 Sin imagen</div>

          <div class="moderation-body">
            <strong>{{ spot.title }}</strong>
            <p>{{ spot.description || 'Sin descripción' }}</p>
            <small>📍 {{ Number.isFinite(spot.lat) ? spot.lat.toFixed(4) : '-' }}, {{ Number.isFinite(spot.lng) ? spot.lng.toFixed(4) : '-' }}</small>
            <small>🏷️ {{ spot.category || 'Sin categoría' }}</small>
            <small v-if="spot.createdAt">⏰ {{ new Date(spot.createdAt).toLocaleString('es-ES') }}</small>

            <div class="moderation-actions">
              <button class="topbar-btn topbar-btn--primary" type="button" :disabled="moderationStore.actionLoading" @click="handleApprove(spot.id)">
                ✅ Aprobar
              </button>
              <button class="topbar-btn moderation-reject" type="button" :disabled="moderationStore.actionLoading" @click="handleReject(spot.id)">
                ❌ Rechazar
              </button>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>