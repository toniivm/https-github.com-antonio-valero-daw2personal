// supabaseClient.js - Inicialización y helpers de Supabase
// NOTA: Usa un archivo separado para credenciales públicas (anon key).
// Crea un archivo `supabaseConfig.js` (IGNORADO en git) con:
// export const SUPABASE_URL = 'https://TU_URL.supabase.co';
// export const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
// Este archivo importará esas constantes. Si faltan, se usa modo fallback (API PHP).

let supabase = null;
let isReady = false;

export async function initSupabase() {
  try {
    const cfg = await import('./supabaseConfig.js');
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
    isReady = true;
    console.log('[Supabase] ✓ Inicializado');
  } catch (e) {
    console.warn('[Supabase] Config no encontrada. Usando backend API fallback.', e.message);
    isReady = false;
  }
}

export function getClient() {
  return supabase;
}

export { supabase };

export function supabaseAvailable() {
  return isReady && supabase !== null;
}

export async function getSession() {
  if (!supabaseAvailable()) return null;
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}

export async function getOrProvisionProfile(userId) {
  if (!supabaseAvailable()) return null;
  try {
    // Buscar perfil
    const { data: existing, error: selErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (selErr && selErr.code !== 'PGRST116') { // 116 = not found single
      console.warn('[Supabase] Perfil no encontrado, usando rol por defecto', selErr?.message);
      return { role: 'user' };
    }
    if (existing) return existing;

    // Crear perfil por defecto
    const { data: inserted, error: insErr } = await supabase
      .from('profiles')
      .insert({ user_id: userId, role: 'user' })
      .select('role')
      .single();

    if (insErr) {
      console.warn('[Supabase] Error creando perfil, usando rol por defecto', insErr?.message);
      return { role: 'user' };
    }
    return inserted;
  } catch (error) {
    console.warn('[Supabase] Error en getOrProvisionProfile:', error?.message);
    return { role: 'user' };
  }
}

export async function listPendingSpots() {
  if (!supabaseAvailable()) return [];
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[Supabase] Error listando pending', error);
    return [];
  }
  return data;
}

export async function approveSpot(id) {
  if (!supabaseAvailable()) return false;
  const { error } = await supabase
    .from('spots')
    .update({ status: 'approved' })
    .eq('id', id);
  if (error) {
    console.error('[Supabase] Error aprobando', error);
    return false;
  }
  return true;
}

export async function rejectSpot(id) {
  if (!supabaseAvailable()) return false;
  const { error } = await supabase
    .from('spots')
    .update({ status: 'rejected' })
    .eq('id', id);
  if (error) {
    console.error('[Supabase] Error rechazando', error);
    return false;
  }
  return true;
}

export async function fetchApprovedSpots({ limit = 50, offset = 0 } = {}) {
  if (!supabaseAvailable()) return null;
  
  try {
    const session = await getSession();
    const userId = session?.user?.id;
    
    // 1. Traer todos los spots approved (públicos)
    const { data: approved, error: err1, count } = await supabase
      .from('spots')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    
    if (err1) {
      console.error('[Supabase] Error fetchApprovedSpots', err1);
      return null;
    }
    
    // 2. Si hay usuario logueado, también traer sus spots pending
    let userPending = [];
    if (userId) {
      const { data: pending, error: err2 } = await supabase
        .from('spots')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (!err2 && pending) {
        userPending = pending;
      }
    }
    
    // 3. Combinar: approved + pending del usuario
    const combined = [...userPending, ...approved];
    
    console.log('[Supabase] Spots loaded:', {
      approved: approved?.length,
      userPending: userPending.length,
      total: combined.length
    });
    
    return { spots: combined, total: count };
  } catch (error) {
    console.error('[Supabase] Error en fetchApprovedSpots:', error);
    return null;
  }
}

export async function createSpot(spot) {
  if (!supabaseAvailable()) return null;
  const { data, error } = await supabase
    .from('spots')
    .insert(spot)
    .select('*')
    .single();
  if (error) {
    console.error('[Supabase] Error creando spot', error);
    return null;
  }
  return data;
}

export async function uploadSpotImage(file, spotId) {
  if (!supabaseAvailable()) return null;
  if (!file || !spotId) return null;
  const ext = file.name.split('.').pop().toLowerCase();
  const path = `spot-images/spot-${spotId}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage.from('public').upload(path, file, { upsert: false });
  if (upErr) {
    console.error('[Supabase] Error subiendo imagen', upErr);
    return null;
  }
  const { data: pub } = supabase.storage.from('public').getPublicUrl(path);
  const publicUrl = pub?.publicUrl || null;
  if (!publicUrl) return null;
  const { data, error: updErr } = await supabase
    .from('spots')
    .update({ image_path: publicUrl })
    .eq('id', spotId)
    .select('*')
    .single();
  if (updErr) {
    console.error('[Supabase] Error actualizando imagen spot', updErr);
    return null;
  }
  return data;
}

export function subscribeToSpots(callback) {
  if (!supabaseAvailable()) return null;
  const channel = supabase
    .channel('spots-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'spots' }, payload => {
      console.log('[Realtime] Spot cambió:', payload);
      callback(payload);
    })
    .subscribe();
  return channel;
}

export function unsubscribe(channel) {
  if (channel) {
    supabase.removeChannel(channel);
  }
}

/**
 * Obtener token de autenticación con auto-refresh
 * Intenta obtener el token actual y si no es válido, lo refresca
 * @returns {Promise<string|null>} Token o null si no hay sesión
 */
export async function getValidToken() {
  if (!supabaseAvailable()) return null;
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[Supabase] Error obteniendo sesión:', error);
      return null;
    }
    
    let token = data?.session?.access_token;
    
    // Si hay token, retornarlo
    if (token) {
      return token;
    }
    
    // Si no hay token pero hay refresh token, intentar refrescar
    if (data?.session?.refresh_token) {
      console.log('[Supabase] Token expirado, refrescando...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('[Supabase] Error refrescando token:', refreshError);
        return null;
      }
      
      return refreshData?.session?.access_token || null;
    }
    
    return null;
  } catch (error) {
    console.error('[Supabase] Error en getValidToken:', error);
    return null;
  }
}
