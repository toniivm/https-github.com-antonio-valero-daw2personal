import { apiFetch } from './api';

function moderationError(err, fallback) {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export function isModerationUnsupported(err) {
  const message = err instanceof Error ? err.message : String(err || '');
  return /requires?\s+supabase/i.test(message);
}

function normalizePendingSpot(spot = {}) {
  const image = spot.image_url || spot.image_path || spot.image_path_1 || null;
  return {
    id: Number(spot.id ?? 0),
    title: String(spot.title ?? 'Sin título'),
    description: String(spot.description ?? ''),
    category: String(spot.category ?? 'Sin categoría'),
    lat: Number(spot.lat ?? 0),
    lng: Number(spot.lng ?? 0),
    createdAt: String(spot.created_at ?? ''),
    image,
  };
}

export async function fetchPendingSpots({ token, page = 1, limit = 50 } = {}) {
  try {
    const payload = await apiFetch(`/admin/pending?page=${page}&limit=${limit}`, { token });
    const spots = payload?.data?.spots ?? payload?.spots ?? [];
    const total = Number(payload?.data?.total ?? payload?.total ?? spots.length ?? 0) || 0;
    return {
      spots: spots.map(normalizePendingSpot).filter((spot) => spot.id > 0),
      total,
    };
  } catch (err) {
    throw new Error(moderationError(err, 'No se pudieron cargar los pendientes'));
  }
}

export async function approvePendingSpot(spotId, { token } = {}) {
  try {
    await apiFetch(`/admin/spots/${spotId}/approve`, {
      method: 'POST',
      token,
    });
    return true;
  } catch (err) {
    throw new Error(moderationError(err, 'No se pudo aprobar el spot'));
  }
}

export async function rejectPendingSpot(spotId, { token } = {}) {
  try {
    await apiFetch(`/admin/spots/${spotId}/reject`, {
      method: 'POST',
      token,
    });
    return true;
  } catch (err) {
    throw new Error(moderationError(err, 'No se pudo rechazar el spot'));
  }
}

export async function fetchModerationStats({ token } = {}) {
  try {
    const payload = await apiFetch('/admin/stats', { token });
    const data = payload?.data ?? payload ?? {};
    return {
      spotsTotal: Number(data.spots_total ?? 0) || 0,
      reportsPending: Number(data.reports_pending ?? 0) || 0,
      averageRatingGlobal: Number(data.average_rating_global ?? 0) || 0,
    };
  } catch (err) {
    throw new Error(moderationError(err, 'No se pudieron cargar estadísticas de moderación'));
  }
}