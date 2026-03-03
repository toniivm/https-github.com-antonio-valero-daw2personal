import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { apiFetch } from '../services/api';

export const useModerationStore = defineStore('moderation', () => {
  const pendingSpots = ref([]);
  const loading = ref(false);
  const error = ref('');

  const totalPending = computed(() => pendingSpots.value.length);

  async function loadPending(token) {
    loading.value = true;
    error.value = '';

    try {
      const payload = await apiFetch('/api/admin/pending?page=1&limit=25', { token });
      const spots = payload?.data?.spots;
      pendingSpots.value = Array.isArray(spots) ? spots : [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudo cargar moderación';
      pendingSpots.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function approveSpot(spotId, token) {
    await apiFetch(`/api/admin/spots/${spotId}/approve`, { method: 'POST', token });
    pendingSpots.value = pendingSpots.value.filter((spot) => String(spot.id) !== String(spotId));
  }

  async function rejectSpot(spotId, token) {
    await apiFetch(`/api/admin/spots/${spotId}/reject`, { method: 'POST', token });
    pendingSpots.value = pendingSpots.value.filter((spot) => String(spot.id) !== String(spotId));
  }

  function clear() {
    pendingSpots.value = [];
    error.value = '';
  }

  return {
    pendingSpots,
    totalPending,
    loading,
    error,
    loadPending,
    approveSpot,
    rejectSpot,
    clear,
  };
});
