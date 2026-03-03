<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import SpotSidebar from './components/SpotSidebar.vue';
import MapView from './components/MapView.vue';
import { useSpotsStore } from './stores/spots';
import { useAuthStore } from './stores/auth';
import { useModerationStore } from './stores/moderation';

const spotsStore = useSpotsStore();
const authStore = useAuthStore();
const moderationStore = useModerationStore();
const selectedSpotId = ref(null);
const actionStatus = ref('');

const selectedSpot = computed(() => spotsStore.filteredSpots.find((spot) => String(spot.id) === String(selectedSpotId.value)) ?? null);

function handleSelectSpot(spotId) {
  selectedSpotId.value = spotId;
}

async function handleLogin(credentials) {
  const ok = await authStore.login(credentials?.email ?? '', credentials?.password ?? '');
  if (ok && authStore.isModerator) {
    await moderationStore.loadPending(authStore.token);
  }
}

function handleLogout() {
  authStore.logout();
  moderationStore.clear();
}

async function handleReloadModeration() {
  if (!authStore.token) {
    return;
  }
  await moderationStore.loadPending(authStore.token);
}

async function handleApproveSpot(spotId) {
  if (!authStore.token) {
    return;
  }
  await moderationStore.approveSpot(spotId, authStore.token);
}

async function handleRejectSpot(spotId) {
  if (!authStore.token) {
    return;
  }
  await moderationStore.rejectSpot(spotId, authStore.token);
}

async function handleCreateSpot(formData) {
  if (!authStore.token) {
    return;
  }

  try {
    await spotsStore.createSpot(formData, authStore.token);
    actionStatus.value = 'Spot creado correctamente';
  } catch (error) {
    actionStatus.value = error instanceof Error ? error.message : 'No se pudo crear el spot';
  }
}

async function handleUpdateSpot(payload) {
  if (!authStore.token) {
    return;
  }

  try {
    await spotsStore.updateSpot(payload?.id, payload, authStore.token);
    actionStatus.value = `Spot #${payload?.id} actualizado correctamente`;
  } catch (error) {
    actionStatus.value = error instanceof Error ? error.message : 'No se pudo actualizar el spot';
  }
}

async function handleToggleFavorite(spotId) {
  if (!authStore.token) {
    actionStatus.value = 'Necesitas iniciar sesión';
    return;
  }

  try {
    await spotsStore.toggleFavorite(spotId, authStore.token, authStore.user?.id ?? null);
    actionStatus.value = spotsStore.isFavoritedByUser ? 'Añadido a favoritos' : 'Quitado de favoritos';
  } catch (error) {
    actionStatus.value = error instanceof Error ? error.message : 'No se pudo actualizar favorito';
  }
}

async function handleRateSpot(payload) {
  if (!authStore.token) {
    actionStatus.value = 'Necesitas iniciar sesión';
    return;
  }

  try {
    await spotsStore.rateSpot(payload?.spotId, payload?.score, authStore.token, authStore.user?.id ?? null);
    actionStatus.value = 'Valoración enviada';
  } catch (error) {
    actionStatus.value = error instanceof Error ? error.message : 'No se pudo valorar el spot';
  }
}

async function handleAddComment(payload) {
  if (!authStore.token) {
    actionStatus.value = 'Necesitas iniciar sesión';
    return;
  }

  try {
    await spotsStore.addComment(payload?.spotId, payload?.body, authStore.token, authStore.user?.id ?? null);
    actionStatus.value = 'Comentario enviado';
  } catch (error) {
    actionStatus.value = error instanceof Error ? error.message : 'No se pudo enviar el comentario';
  }
}

onMounted(() => {
  authStore.hydrate();
  spotsStore.loadSpots();
  if (authStore.isAuthenticated && authStore.isModerator) {
    moderationStore.loadPending(authStore.token);
  }
});

watch(selectedSpotId, async (spotId) => {
  if (!spotId) {
    return;
  }
  await spotsStore.loadSpotSocial(spotId, authStore.user?.id ?? null);
});

watch(
  () => authStore.user?.id,
  async (userId) => {
    if (!selectedSpotId.value) {
      return;
    }
    await spotsStore.loadSpotSocial(selectedSpotId.value, userId ?? null);
  },
);
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        📸 SpotMap Vue (Migración)
      </div>
      <div class="meta">
        Fase 0 · UI núcleo
      </div>
    </header>

    <main class="layout">
      <SpotSidebar
        :spots="spotsStore.filteredSpots"
        :loading="spotsStore.loading"
        :error="spotsStore.error"
        :selected-id="selectedSpotId"
        :selected-spot="selectedSpot"
        :view-mode="spotsStore.viewMode"
        :search-query="spotsStore.searchQuery"
        :category-filter="spotsStore.categoryFilter"
        :tag-filter="spotsStore.tagFilter"
        :best-time-filter="spotsStore.bestTimeFilter"
        :difficulty-filter="spotsStore.difficultyFilter"
        :season-filter="spotsStore.seasonFilter"
        :available-categories="spotsStore.availableCategories"
        :available-tags="spotsStore.availableTags"
        :best-time-options="spotsStore.bestTimeOptions"
        :difficulty-options="spotsStore.difficultyOptions"
        :season-options="spotsStore.seasonOptions"
        :auth-loading="authStore.loading"
        :auth-error="authStore.error"
        :is-authenticated="authStore.isAuthenticated"
        :current-user="authStore.user"
        :current-role="authStore.role"
        :is-moderator="authStore.isModerator"
        :moderation-loading="moderationStore.loading"
        :moderation-error="moderationStore.error"
        :pending-spots="moderationStore.pendingSpots"
        :pending-total="moderationStore.totalPending"
        :show-create-form="authStore.isAuthenticated"
        :action-status="actionStatus"
        :social-loading="spotsStore.socialLoading"
        :social-error="spotsStore.socialError"
        :favorites-count="spotsStore.favoritesCount"
        :is-favorited-by-user="spotsStore.isFavoritedByUser"
        :rating-aggregate="spotsStore.ratingAggregate"
        :selected-comments="spotsStore.selectedComments"
        :page="spotsStore.page"
        :pages="spotsStore.pages"
        :total="spotsStore.total"
        :has-prev="spotsStore.hasPrev"
        :has-next="spotsStore.hasNext"
        @select-spot="handleSelectSpot"
        @reload="spotsStore.reload"
        @change-view="spotsStore.setViewMode"
        @change-search="spotsStore.setSearchQuery"
        @change-category="spotsStore.setCategoryFilter"
        @change-tag="spotsStore.setTagFilter"
        @change-best-time="spotsStore.setBestTimeFilter"
        @change-difficulty="spotsStore.setDifficultyFilter"
        @change-season="spotsStore.setSeasonFilter"
        @login="handleLogin"
        @logout="handleLogout"
        @reload-moderation="handleReloadModeration"
        @approve-pending="handleApproveSpot"
        @reject-pending="handleRejectSpot"
        @create-spot="handleCreateSpot"
        @update-spot="handleUpdateSpot"
        @toggle-favorite="handleToggleFavorite"
        @rate-spot="handleRateSpot"
        @add-comment="handleAddComment"
        @prev-page="spotsStore.prevPage"
        @next-page="spotsStore.nextPage"
      />

      <MapView
        :spots="spotsStore.filteredSpots"
        :selected-spot="selectedSpot"
      />
    </main>
  </div>
</template>
