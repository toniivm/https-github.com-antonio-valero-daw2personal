import { runtimeConfig } from '../config/runtime';

/**
 * Normaliza los tags de un spot al formato array de strings.
 * @param {unknown} tags
 * @returns {string[]}
 */
export function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof tags === 'string') {
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function isAbsoluteUrl(value) {
  return /^https?:\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:');
}

export function resolveImageUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (isAbsoluteUrl(raw)) return raw;

  if (raw.startsWith('/uploads/')) {
    return `${runtimeConfig.backendPublicBase}${raw}`;
  }

  if (raw.startsWith('/')) {
    return `${window.location.origin}${raw}`;
  }

  return `${runtimeConfig.backendPublicBase}/${raw.replace(/^\/+/, '')}`;
}

/**
 * Normaliza un objeto spot crudo de la API al contrato interno.
 * @param {Object} spot
 * @returns {{ id: unknown, title: string, description: string, category: string, lat: number, lng: number, tags: string[], imagePath: string, status: string }}
 */
export function normalizeSpot(spot) {
  const imagePath =
    spot?.imagePath ||
    spot?.image_path ||
    spot?.image ||
    spot?.image_url ||
    '';

  const imagePath2 = spot?.imagePath2 || spot?.image_path_2 || '';

  return {
    id: spot?.id,
    userId: spot?.userId ?? spot?.user_id ?? '',
    title: String(spot?.title ?? '').trim(),
    description: String(spot?.description ?? '').trim(),
    category: String(spot?.category ?? '').trim(),
    lat: Number(spot?.lat ?? spot?.latitude),
    lng: Number(spot?.lng ?? spot?.longitude),
    tags: normalizeTags(spot?.tags),
    imagePath: resolveImageUrl(imagePath),
    imagePath2: resolveImageUrl(imagePath2),
    status: String(spot?.status ?? '').trim(),
  };
}

/**
 * Filtra spots que tienen coordenadas válidas.
 * @param {{ lat: number, lng: number }[]} spots
 * @returns {{ lat: number, lng: number }[]}
 */
export function filterValidCoords(spots) {
  return spots.filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));
}
