// supabaseSpots.js - Capa de acceso a spots con Supabase y fallback API
import { supabaseAvailable, supportsStatus, fetchApprovedSpots, listPendingSpots, approveSpot, rejectSpot, createSpot as sbCreateSpot, uploadSpotImage } from './supabaseClient.js';
import { apiFetch } from './api.js';

export async function getApproved({ forceRefresh = false } = {}) {
  // Intentar Supabase primero
  if (supabaseAvailable()) {
    try {
      const result = await fetchApprovedSpots({ limit: 200 });
      if (result?.spots) {
        console.log('[supabaseSpots] ✓ Spots obtenidos de Supabase');
        return result.spots;
      }
    } catch (error) {
      console.warn('[supabaseSpots] Error de Supabase, usando fallback API:', error.message);
    }
  }
  
  // Fallback: usar API local
  try {
    console.log('[supabaseSpots] Intentando fallback a API local...');
    const res = await apiFetch('/spots', { method: 'GET' });
    
    console.log('[supabaseSpots] Respuesta cruda de API:', JSON.stringify(res, null, 2));
    
    // Intentar múltiples estructuras de respuesta
    let spots = null;
    
    if (Array.isArray(res)) {
      spots = res;
    } else if (res?.data?.spots && Array.isArray(res.data.spots)) {
      spots = res.data.spots;
    } else if (res?.data && Array.isArray(res.data)) {
      spots = res.data;
    } else if (res?.spots && Array.isArray(res.spots)) {
      spots = res.spots;
    } else if (res?.success && res?.data) {
      // Última opción: si success es true y data existe
      spots = Array.isArray(res.data) ? res.data : [];
    }
    
    if (spots && Array.isArray(spots)) {
      console.log(`[supabaseSpots] ✓ Spots obtenidos de API local: ${spots.length} items`);
      return spots;
    }
    
    console.warn('[supabaseSpots] API no retornó spots válidos:', res);
    return [];
  } catch (error) {
    console.error('[supabaseSpots] Error en API local:', error);
    return [];
  }
}

export async function getPending() {
  if (!supabaseAvailable()) return [];
  if (!supportsStatus()) {
    console.warn('[supabaseSpots] Status column missing; pending list disabled');
    return [];
  }

  // Prefer backend admin endpoint when available (uses service key on server)
  try {
    const { getAccessToken } = await import('./auth.js');
    const token = await getAccessToken();
    if (token) {
      const res = await apiFetch('/api/admin/pending', { method: 'GET', token });
      const spots = res?.data?.spots || res?.spots || [];
      if (Array.isArray(spots)) return spots;
    }
  } catch (err) {
    console.warn('[supabaseSpots] Admin pending via API failed, fallback Supabase:', err?.message);
  }

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

export async function createSpotRecord(data, photoFile1 = null, photoFile2 = null) {
  console.log('[supabaseSpots] createSpotRecord llamado con:', {
    data,
    photoFile1: photoFile1 ? `${photoFile1.name} (${photoFile1.size} bytes)` : null,
    photoFile2: photoFile2 ? `${photoFile2.name} (${photoFile2.size} bytes)` : null
  });
  
  if (supabaseAvailable()) {
    // Crear spot con status='pending' (moderación) si la columna existe
    const base = supportsStatus() ? { ...data, status: 'pending' } : { ...data };
    const created = await sbCreateSpot(base);
    if (!created) {
      console.error('[supabaseSpots] Error creando spot en Supabase');
      return null;
    }
    
    console.log('[supabaseSpots] Spot creado en Supabase (ID:', created.id, ')');
    
    // Subir hasta 2 imágenes a Supabase Storage
    if (photoFile1) {
      console.log('[supabaseSpots] Subiendo imagen 1 a Supabase Storage...');
      try {
        const updated = await uploadSpotImage(photoFile1, created.id, 1);
        if (updated && updated.image_path) {
          created.image_path = updated.image_path;
          console.log('[supabaseSpots] ✓ Imagen 1 subida:', created.image_path);
        }
      } catch (error) {
        console.error('[supabaseSpots] Error subiendo imagen 1:', error);
      }
    }
    
    if (photoFile2) {
      console.log('[supabaseSpots] Subiendo imagen 2 a Supabase Storage...');
      try {
        const updated = await uploadSpotImage(photoFile2, created.id, 2);
        if (updated && updated.image_path_2) {
          created.image_path_2 = updated.image_path_2;
          console.log('[supabaseSpots] ✓ Imagen 2 subida:', created.image_path_2);
        }
      } catch (error) {
        console.error('[supabaseSpots] Error subiendo imagen 2:', error);
      }
    }
    
    return created;
  }
  
  // Fallback: API local con FormData
  console.log('[supabaseSpots] Supabase no disponible, usando API local');
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description || '');
  formData.append('lat', data.lat);
  formData.append('lng', data.lng);
  formData.append('category', data.category || '');
  formData.append('status', 'pending');
  if (data.tags && Array.isArray(data.tags)) {
    formData.append('tags', JSON.stringify(data.tags));
  }
  
  if (photoFile1) {
    console.log('[supabaseSpots] Agregando image1 al FormData');
    formData.append('image1', photoFile1);
  }
  if (photoFile2) {
    console.log('[supabaseSpots] Agregando image2 al FormData');
    formData.append('image2', photoFile2);
  }
  
  const res = await apiFetch('/spots', { method: 'POST', body: formData });
  console.log('[supabaseSpots] Respuesta API local:', res);
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
