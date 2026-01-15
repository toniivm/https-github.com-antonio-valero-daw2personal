// supabaseSpots.js - Capa de acceso a spots con Supabase y fallback API
import { supabaseAvailable, fetchApprovedSpots, listPendingSpots, approveSpot, rejectSpot, createSpot as sbCreateSpot, uploadSpotImage } from './supabaseClient.js';
import { apiFetch } from './api.js';

export async function getApproved({ forceRefresh = false } = {}) {
  if (supabaseAvailable()) {
    return (await fetchApprovedSpots({ limit: 200 }))?.spots || [];
  }
  // Fallback API
  const res = await apiFetch('/spots', { method: 'GET' });
  return res?.data?.spots || [];
}

export async function getPending() {
  if (!supabaseAvailable()) return [];
  return await listPendingSpots();
}

export async function approve(id) {
  if (supabaseAvailable()) return await approveSpot(id);
  return false;
}

export async function reject(id) {
  if (supabaseAvailable()) return await rejectSpot(id);
  return false;
}

export async function createSpotRecord(data, photoFile = null) {
  if (supabaseAvailable()) {
    // Crear spot sin 'status' (columna no existe por defecto en Supabase)
    // Si quieres moderación, ejecuta SUPABASE_SPOTS_STATUS.sql
    const base = { ...data };
    const created = await sbCreateSpot(base);
    if (!created) return null;
    if (photoFile) {
      const updated = await uploadSpotImage(photoFile, created.id);
      return updated || created;
    }
    return created;
  }
  const res = await apiFetch('/spots', { method: 'POST', body: data });
  return res?.data || null;
}
