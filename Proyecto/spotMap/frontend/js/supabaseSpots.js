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
    // Crear spot con status='pending' (moderación)
    // Si quieres que se publiquen automáticamente, usa status='approved'
    const base = { ...data, status: 'pending' };
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

/**
 * FAVORITOS - Guardar en Supabase para sincronización en tiempo real
 */

export async function addFavorite(userId, spotId) {
  if (!supabaseAvailable()) return false;
  try {
    const { getClient } = await import('./supabaseClient.js');
    const client = getClient();
    const { error } = await client
      .from('user_favorites')
      .insert({ user_id: userId, spot_id: spotId });
    
    if (error) {
      console.warn('[SPOTS] Error agregando favorito:', error);
      return false;
    }
    console.log('[SPOTS] ✓ Favorito agregado:', spotId);
    return true;
  } catch (err) {
    console.error('[SPOTS] Error en addFavorite:', err);
    return false;
  }
}

export async function removeFavorite(userId, spotId) {
  if (!supabaseAvailable()) return false;
  try {
    const { getClient } = await import('./supabaseClient.js');
    const client = getClient();
    const { error } = await client
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('spot_id', spotId);
    
    if (error) {
      console.warn('[SPOTS] Error removiendo favorito:', error);
      return false;
    }
    console.log('[SPOTS] ✓ Favorito removido:', spotId);
    return true;
  } catch (err) {
    console.error('[SPOTS] Error en removeFavorite:', err);
    return false;
  }
}

export async function getFavoriteSpotIds(userId) {
  if (!supabaseAvailable()) return [];
  try {
    const { getClient } = await import('./supabaseClient.js');
    const client = getClient();
    const { data, error } = await client
      .from('user_favorites')
      .select('spot_id')
      .eq('user_id', userId);
    
    if (error) {
      console.warn('[SPOTS] Error obteniendo favoritos:', error);
      return [];
    }
    const ids = data?.map(fav => fav.spot_id) || [];
    console.log('[SPOTS] ✓ Favoritos cargados:', ids.length);
    return ids;
  } catch (err) {
    console.error('[SPOTS] Error en getFavoriteSpotIds:', err);
    return [];
  }
}

export async function subscribeFavorites(userId, callback) {
  if (!supabaseAvailable()) return null;
  try {
    const { getClient } = await import('./supabaseClient.js');
    const client = getClient();
    
    const subscription = client
      .from('user_favorites')
      .on('*', (payload) => {
        if (payload.new?.user_id === userId || payload.old?.user_id === userId) {
          console.log('[SPOTS] Cambio en favoritos detectado');
          callback(payload);
        }
      })
      .subscribe();
    
    return subscription;
  } catch (err) {
    console.error('[SPOTS] Error en subscribeFavorites:', err);
    return null;
  }
}
