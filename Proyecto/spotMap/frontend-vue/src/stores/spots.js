import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { apiFetch } from '../services/api';

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeSpot(spot) {
  const schedule = String(spot?.schedule ?? spot?.best_time ?? '').trim().toLowerCase();
  const difficulty = String(spot?.difficulty ?? '').trim().toLowerCase();
  const season = String(spot?.season ?? '').trim().toLowerCase();

  return {
    ...spot,
    id: spot?.id,
    title: String(spot?.title ?? '').trim(),
    category: String(spot?.category ?? '').trim(),
    description: String(spot?.description ?? '').trim(),
    schedule,
    difficulty,
    season,
    lat: Number(spot?.lat ?? spot?.latitude),
    lng: Number(spot?.lng ?? spot?.longitude),
    tags: normalizeTags(spot?.tags),
  };
}

function hasFilterMatch(spot, filterValue, fields) {
  if (filterValue === 'all') {
    return true;
  }

  const normalizedFilter = String(filterValue).trim().toLowerCase();
  if (!normalizedFilter) {
    return true;
  }

  return fields.some((fieldValue) => String(fieldValue ?? '').trim().toLowerCase() === normalizedFilter)
    || spot.tags.some((tag) => String(tag).trim().toLowerCase() === normalizedFilter);
}

function buildSpotPayload(input) {
  return {
    title: String(input?.title ?? '').trim(),
    description: String(input?.description ?? '').trim(),
    lat: Number(input?.lat),
    lng: Number(input?.lng),
    category: String(input?.category ?? '').trim() || null,
    tags: Array.isArray(input?.tags)
      ? input.tags
      : String(input?.tags ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    image_path: String(input?.image_path ?? '').trim(),
    schedule: String(input?.schedule ?? '').trim(),
    difficulty: String(input?.difficulty ?? '').trim(),
    season: String(input?.season ?? '').trim(),
  };
}

export const useSpotsStore = defineStore('spots', () => {
  const spots = ref([]);
  const loading = ref(false);
  const error = ref('');
  const page = ref(1);
  const limit = ref(24);
  const total = ref(0);
  const pages = ref(1);

  const searchQuery = ref('');
  const categoryFilter = ref('all');
  const tagFilter = ref('all');
  const bestTimeFilter = ref('all');
  const difficultyFilter = ref('all');
  const seasonFilter = ref('all');
  const viewMode = ref('list');

  const socialLoading = ref(false);
  const socialError = ref('');
  const selectedComments = ref([]);
  const ratingAggregate = ref({ count: 0, average: 0 });
  const favoritesCount = ref(0);
  const isFavoritedByUser = ref(false);

  const bestTimeOptions = ['sunrise', 'golden_hour', 'blue_hour', 'night'];
  const difficultyOptions = ['easy', 'medium', 'hard'];
  const seasonOptions = ['spring', 'summer', 'autumn', 'winter'];

  const hasPrev = computed(() => page.value > 1);
  const hasNext = computed(() => page.value < pages.value);

  const availableCategories = computed(() => {
    const values = new Set(
      spots.value
        .map((spot) => spot.category)
        .filter(Boolean),
    );
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  });

  const availableTags = computed(() => {
    const values = new Set();
    spots.value.forEach((spot) => {
      spot.tags.forEach((tag) => values.add(tag));
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  });

  const filteredSpots = computed(() => {
    const search = searchQuery.value.trim().toLowerCase();
    return spots.value.filter((spot) => {
      const matchesSearch =
        !search ||
        spot.title.toLowerCase().includes(search) ||
        spot.description.toLowerCase().includes(search) ||
        spot.category.toLowerCase().includes(search) ||
        spot.tags.some((tag) => tag.toLowerCase().includes(search));

      const matchesCategory = categoryFilter.value === 'all' || spot.category === categoryFilter.value;
      const matchesTag = tagFilter.value === 'all' || spot.tags.includes(tagFilter.value);
      const matchesBestTime = hasFilterMatch(spot, bestTimeFilter.value, [spot.schedule, spot.best_time]);
      const matchesDifficulty = hasFilterMatch(spot, difficultyFilter.value, [spot.difficulty]);
      const matchesSeason = hasFilterMatch(spot, seasonFilter.value, [spot.season]);

      return matchesSearch && matchesCategory && matchesTag && matchesBestTime && matchesDifficulty && matchesSeason;
    });
  });

  function buildQueryParams() {
    const params = new URLSearchParams({
      page: String(page.value),
      limit: String(limit.value),
    });

    if (categoryFilter.value !== 'all') {
      params.set('category', categoryFilter.value);
    }
    if (tagFilter.value !== 'all') {
      params.set('tag', tagFilter.value);
    }
    if (bestTimeFilter.value !== 'all') {
      params.set('best_time', bestTimeFilter.value);
    }
    if (difficultyFilter.value !== 'all') {
      params.set('difficulty', difficultyFilter.value);
    }
    if (seasonFilter.value !== 'all') {
      params.set('season', seasonFilter.value);
    }

    return params.toString();
  }

  async function loadSpots() {
    loading.value = true;
    error.value = '';

    try {
      const payload = await apiFetch(`/spots?${buildQueryParams()}`);
      const data = payload?.data ?? {};
      const apiSpots = Array.isArray(data?.spots) ? data.spots : [];
      const pagination = data?.pagination ?? {};

      spots.value = apiSpots.map(normalizeSpot).filter((spot) => Number.isFinite(spot.lat) && Number.isFinite(spot.lng));
      total.value = Number(pagination?.total) || spots.value.length;
      pages.value = Math.max(1, Number(pagination?.pages) || 1);
      page.value = Math.max(1, Number(pagination?.page) || 1);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudieron cargar los spots.';
      spots.value = [];
      total.value = 0;
      pages.value = 1;
    } finally {
      loading.value = false;
    }
  }

  async function reload() {
    page.value = 1;
    await loadSpots();
  }

  async function nextPage() {
    if (!hasNext.value || loading.value) return;
    page.value += 1;
    await loadSpots();
  }

  async function prevPage() {
    if (!hasPrev.value || loading.value) return;
    page.value -= 1;
    await loadSpots();
  }

  async function setCategoryFilter(value) {
    categoryFilter.value = value || 'all';
    page.value = 1;
    await loadSpots();
  }

  async function setTagFilter(value) {
    tagFilter.value = value || 'all';
    page.value = 1;
    await loadSpots();
  }

  async function setBestTimeFilter(value) {
    bestTimeFilter.value = value || 'all';
    page.value = 1;
    await loadSpots();
  }

  async function setDifficultyFilter(value) {
    difficultyFilter.value = value || 'all';
    page.value = 1;
    await loadSpots();
  }

  async function setSeasonFilter(value) {
    seasonFilter.value = value || 'all';
    page.value = 1;
    await loadSpots();
  }

  async function createSpot(input, token) {
    const payload = buildSpotPayload(input);

    if (!payload.title || !Number.isFinite(payload.lat) || !Number.isFinite(payload.lng)) {
      throw new Error('Título y coordenadas son obligatorios');
    }
    if (!payload.image_path) {
      throw new Error('Debes indicar URL de imagen (image_path)');
    }

    const result = await apiFetch('/spots', {
      method: 'POST',
      body: payload,
      token,
    });

    await reload();
    return result;
  }

  async function updateSpot(spotId, input, token) {
    const id = Number(spotId);
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error('ID de spot inválido');
    }

    const payload = buildSpotPayload(input);
    if (!payload.title || !Number.isFinite(payload.lat) || !Number.isFinite(payload.lng)) {
      throw new Error('Título y coordenadas son obligatorios');
    }

    const result = await apiFetch(`/spots/${id}`, {
      method: 'PUT',
      body: payload,
      token,
    });

    await reload();
    return result;
  }

  async function loadSpotSocial(spotId, userId = null) {
    const id = Number(spotId);
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }

    socialLoading.value = true;
    socialError.value = '';

    try {
      const [commentsPayload, ratingPayload, favoritesPayload] = await Promise.all([
        apiFetch(`/spots/${id}/comments`),
        apiFetch(`/spots/${id}/rating`),
        apiFetch(`/spots/${id}/favorites`),
      ]);

      const comments = commentsPayload?.data?.comments;
      selectedComments.value = Array.isArray(comments) ? comments : [];

      ratingAggregate.value = {
        count: Number(ratingPayload?.data?.count) || 0,
        average: Number(ratingPayload?.data?.average) || 0,
      };

      const favorites = favoritesPayload?.data?.favorites;
      const favoritesList = Array.isArray(favorites) ? favorites : [];
      favoritesCount.value = Number(favoritesPayload?.data?.count) || favoritesList.length;

      const normalizedUserId = userId ? String(userId) : '';
      isFavoritedByUser.value = normalizedUserId !== ''
        && favoritesList.some((item) => String(item?.user_id ?? '') === normalizedUserId);
    } catch (err) {
      socialError.value = err instanceof Error ? err.message : 'No se pudo cargar información social';
      selectedComments.value = [];
      ratingAggregate.value = { count: 0, average: 0 };
      favoritesCount.value = 0;
      isFavoritedByUser.value = false;
    } finally {
      socialLoading.value = false;
    }
  }

  async function toggleFavorite(spotId, token, userId = null) {
    const id = Number(spotId);
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error('Spot inválido');
    }

    await apiFetch(`/spots/${id}/favorite`, {
      method: isFavoritedByUser.value ? 'DELETE' : 'POST',
      token,
    });

    await loadSpotSocial(id, userId);
  }

  async function rateSpot(spotId, score, token, userId = null) {
    const id = Number(spotId);
    const normalizedScore = Number(score);
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error('Spot inválido');
    }
    if (!Number.isFinite(normalizedScore) || normalizedScore < 1 || normalizedScore > 5) {
      throw new Error('La puntuación debe ser entre 1 y 5');
    }

    await apiFetch(`/spots/${id}/rate`, {
      method: 'POST',
      token,
      body: { score: normalizedScore },
    });

    await loadSpotSocial(id, userId);
  }

  async function addComment(spotId, body, token, userId = null) {
    const id = Number(spotId);
    const content = String(body ?? '').trim();
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error('Spot inválido');
    }
    if (!content) {
      throw new Error('El comentario no puede estar vacío');
    }

    await apiFetch(`/spots/${id}/comments`, {
      method: 'POST',
      token,
      body: { body: content },
    });

    await loadSpotSocial(id, userId);
  }

  function setSearchQuery(value) {
    searchQuery.value = String(value ?? '');
  }

  function setViewMode(value) {
    viewMode.value = value === 'grid' ? 'grid' : 'list';
  }

  return {
    spots,
    filteredSpots,
    loading,
    error,
    page,
    limit,
    total,
    pages,
    hasPrev,
    hasNext,
    viewMode,
    socialLoading,
    socialError,
    selectedComments,
    ratingAggregate,
    favoritesCount,
    isFavoritedByUser,
    searchQuery,
    categoryFilter,
    tagFilter,
    bestTimeFilter,
    difficultyFilter,
    seasonFilter,
    bestTimeOptions,
    difficultyOptions,
    seasonOptions,
    availableCategories,
    availableTags,
    loadSpots,
    reload,
    nextPage,
    prevPage,
    setSearchQuery,
    setCategoryFilter,
    setTagFilter,
    setBestTimeFilter,
    setDifficultyFilter,
    setSeasonFilter,
    createSpot,
    updateSpot,
    loadSpotSocial,
    toggleFavorite,
    rateSpot,
    addComment,
    setViewMode,
  };
});
