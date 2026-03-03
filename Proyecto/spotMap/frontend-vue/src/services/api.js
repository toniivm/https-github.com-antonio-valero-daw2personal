import { runtimeConfig } from '../config/runtime';

function buildApiUrl(endpoint) {
  const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${runtimeConfig.apiBase}${normalized}`;
}

function buildPublicUrl(fileName) {
  const base = runtimeConfig.apiBase.replace(/\/index\.php$/i, '/');
  const normalized = fileName.replace(/^\/+/, '');
  return `${base}${normalized}`;
}

export async function apiFetch(endpoint, { method = 'GET', body = null, token = null } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), runtimeConfig.timeoutMs);

  try {
    const headers = new Headers({ Accept: 'application/json' });

    if (!(body instanceof FormData) && body !== null) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(buildApiUrl(endpoint), {
      method,
      headers,
      body: body === null ? null : body instanceof FormData ? body : JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      const payload = contentType.includes('application/json') ? await response.json() : await response.text();
      const message = payload?.message || payload?.error || `HTTP ${response.status}`;
      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function authLocalLogin(email, password) {
  const response = await fetch(buildPublicUrl('auth-login.php'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.success) {
    const message = payload?.message || payload?.error || 'Login failed';
    throw new Error(message);
  }

  return payload;
}
