// api.js — Wrapper profesional para la API REST de SpotMap

const API_BASE = 'http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public';


/**
 * Realiza peticiones HTTP a la API.
 * @param {string} endpoint - Endpoint de la API (por ejemplo, '/spots').
 * @param {object} [options] - Opciones de la petición.
 * @param {string} [options.method='GET'] - Método HTTP.
 * @param {object|FormData|null} [options.body=null] - Cuerpo de la petición.
 * @param {string|null} [options.token=null] - Token JWT o similar.
 * @param {number} [options.timeout=10000] - Tiempo máximo en milisegundos.
 * @returns {Promise<object|null>} - Respuesta JSON o null.
 */
export async function apiFetch(endpoint, {
  method = 'GET',
  body = null,
  token = null,
  timeout = 10000
} = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const headers = new Headers({ 'Accept': 'application/json' });
  if (body && !(body instanceof FormData)) {
    headers.append('Content-Type', 'application/json');
  }
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : null,
      signal: controller.signal
    });

    clearTimeout(id);

    // Manejo de errores HTTP
    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let payload = null;
      if (contentType.includes('application/json')) {
        payload = await response.json();
      } else {
        payload = await response.text();
      }
      const error = new Error(payload?.message || 'Error en la API');
      error.status = response.status;
      error.details = payload;
      throw error;
    }

    // Sin contenido
    if (response.status === 204) return null;

    // Retorna JSON
    return await response.json();

  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error('La petición ha superado el tiempo límite');
    }
    console.error(`[apiFetch] Error en ${endpoint}:`, err);
    throw err;
  }
}
