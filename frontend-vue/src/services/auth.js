import { apiFetch } from './api';
import { runtimeConfig } from '../config/runtime';

const LOCAL_TOKEN_KEY = 'spotmap_local_token';
const LOCAL_USER_KEY = 'spotmap_local_user';
const LOCAL_SESSION_META_KEY = 'spotmap_local_session_meta';

export function getStoredAccessToken() {
  return localStorage.getItem(LOCAL_TOKEN_KEY) || '';
}

function getStoredSessionMeta() {
  const raw = localStorage.getItem(LOCAL_SESSION_META_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    localStorage.removeItem(LOCAL_SESSION_META_KEY);
    return null;
  }
}

function clearLocalSessionStorage() {
  localStorage.removeItem(LOCAL_TOKEN_KEY);
  localStorage.removeItem(LOCAL_USER_KEY);
  localStorage.removeItem(LOCAL_SESSION_META_KEY);
}

function persistSession(user, token = '', expiresAt = null, provider = 'local') {
  if (token) {
    localStorage.setItem(LOCAL_TOKEN_KEY, String(token));
  }
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  localStorage.setItem(
    LOCAL_SESSION_META_KEY,
    JSON.stringify({
      provider,
      loginAt: Date.now(),
      expiresAt: expiresAt ? Number(expiresAt) * 1000 : null,
    }),
  );
}

function isExpiredSession() {
  const meta = getStoredSessionMeta();
  if (!meta?.expiresAt) return false;
  return Number(meta.expiresAt) <= Date.now();
}

export function getConfiguredOAuthProviders() {
  return runtimeConfig.oauthEnabled ? runtimeConfig.oauthProviders : [];
}

export async function startOAuth(provider) {
  const safeProvider = String(provider || '').trim().toLowerCase();
  if (!runtimeConfig.oauthEnabled) {
    throw new Error('OAuth desactivado en esta instancia');
  }

  if (!runtimeConfig.oauthProviders.includes(safeProvider)) {
    throw new Error(`Proveedor OAuth no permitido: ${safeProvider}`);
  }

  const url = `${runtimeConfig.oauthInitUrl}&provider=${encodeURIComponent(safeProvider)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('No se pudo iniciar OAuth en backend');
  }

  const payload = await response.json();
  const redirectUrl = payload?.data?.url;
  if (!redirectUrl) {
    throw new Error(payload?.message || 'Respuesta OAuth inválida');
  }

  window.location.href = redirectUrl;
}

function normalizeUser(user) {
  if (!user?.id) return null;
  const nestedUser = user.session?.user ?? null;
  const resolvedRole =
    user.role
    ?? user.app_metadata?.role
    ?? user.user_metadata?.role
    ?? nestedUser?.role
    ?? nestedUser?.app_metadata?.role
    ?? nestedUser?.user_metadata?.role
    ?? 'user';

  return {
    id: String(user.id),
    email: String(user.email ?? ''),
    role: String(resolvedRole),
    username: String(user.username ?? user.full_name ?? user.email ?? ''),
  };
}

/**
 * Carga la sesión activa desde el backend (placeholder compatible con Supabase).
 * @returns {Promise<{ id: string, email: string, role: string }|null>}
 */
export async function loadSession() {
  if (isExpiredSession()) {
    clearLocalSessionStorage();
    return null;
  }

  const persisted = localStorage.getItem(LOCAL_USER_KEY);
  if (persisted) {
    try {
      return normalizeUser(JSON.parse(persisted));
    } catch {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  }

  if (!runtimeConfig.backendAuthEnabled) {
    return null;
  }

  try {
    const payload = await apiFetch('/auth/session');
    const user = payload?.data?.user ?? payload?.user ?? null;
    const normalized = normalizeUser(user);
    if (normalized) {
      persistSession(normalized, '', null, 'backend');
    }
    return normalized;
  } catch {
    return null;
  }
}

/**
 * Inicia sesión con email/password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ id: string, email: string, role: string }>}
 */
export async function signIn(email, password) {
  if (runtimeConfig.backendAuthEnabled) {
    try {
      const payload = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      const user = normalizeUser(payload?.data?.user ?? payload?.user);
      if (!user) throw new Error('Respuesta de login inválida');
      const token = payload?.data?.session?.access_token ?? payload?.session?.access_token ?? '';
      const expiresAt = payload?.data?.session?.expires_at ?? payload?.session?.expires_at ?? null;
      persistSession(user, token, expiresAt, 'backend');
      return user;
    } catch {
      // fallback local auth-login.php
    }
  }

  try {
    const response = await fetch(runtimeConfig.authLoginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let message = 'Error al iniciar sesión';
      try {
        const payload = await response.json();
        message = payload?.error || payload?.message || message;
      } catch {
        // ignore parse error
      }
      throw new Error(message);
    }

    const payload = await response.json();
    const user = normalizeUser(payload?.user ?? payload?.session?.user);
    if (!user) {
      throw new Error('Respuesta de login local inválida');
    }

    const token = payload?.session?.access_token;
    const expiresAt = payload?.session?.expires_at ?? null;
    persistSession(user, token, expiresAt, 'local');
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * Registro básico (compatibilidad local): crea sesión para el nuevo usuario.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ id: string, email: string, role: string, username: string }>} usuario autenticado
 */
export async function signUp(name, email, password) {
  if (runtimeConfig.backendAuthEnabled) {
    try {
      const payload = await apiFetch('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
      const user = normalizeUser(payload?.data?.user ?? payload?.user);
      if (!user) throw new Error('Respuesta de registro inválida');
      const token = payload?.data?.session?.access_token ?? payload?.session?.access_token;
      const expiresAt = payload?.data?.session?.expires_at ?? payload?.session?.expires_at ?? null;
      persistSession(user, token, expiresAt, 'backend');
      return user;
    } catch {
      // fallback local
    }
  }

  const response = await fetch(runtimeConfig.authLoginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password, name, mode: 'register' }),
  });

  if (!response.ok) {
    let message = 'Error al registrarse';
    try {
      const payload = await response.json();
      message = payload?.error || payload?.message || message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  const payload = await response.json();
  const user = normalizeUser(payload?.user ?? payload?.session?.user);
  if (!user) throw new Error('Respuesta de registro local inválida');

  if (name && !user.username) {
    user.username = String(name).trim();
  }

  const token = payload?.session?.access_token;
  const expiresAt = payload?.session?.expires_at ?? null;
  persistSession(user, token, expiresAt, 'local');
  return user;
}

/**
 * Cierra la sesión activa.
 * @returns {Promise<void>}
 */
export async function signOut() {
  if (runtimeConfig.backendAuthEnabled) {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // backend puede no tener este endpoint en local fallback
    }
  }
  clearLocalSessionStorage();
}
