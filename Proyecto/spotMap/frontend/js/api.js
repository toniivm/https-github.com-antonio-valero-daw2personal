// api.js — Wrapper profesional para la API REST de SpotMap

const API_BASE = 'http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/api.php';


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
  timeout = 10000,
  headers: customHeaders = {}
} = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const headers = new Headers({ 'Accept': 'application/json' });
  
  // Merge custom headers (pero no establecer Content-Type para FormData)
  if (!(body instanceof FormData)) {
    if (customHeaders['Content-Type']) {
      headers.append('Content-Type', customHeaders['Content-Type']);
    } else if (body) {
      headers.append('Content-Type', 'application/json');
    }
    
    // Agregar otros headers custom
    for (const [key, value] of Object.entries(customHeaders)) {
      if (key !== 'Content-Type') {
        headers.append(key, value);
      }
    }
  } else {
    // Para FormData, solo agregar non-Content-Type headers
    for (const [key, value] of Object.entries(customHeaders)) {
      if (key !== 'Content-Type') {
        headers.append(key, value);
      }
    }
  }
  
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  // Construir URL con parámetros
  let url = API_BASE;
  
  // Parsear endpoint: /spots o /spots/1 o /spots/1/photo
  if (endpoint === '/spots' && method === 'POST') {
    url += '?action=spots';
  } else if (endpoint === '/spots' && method === 'GET') {
    url += '?action=spots';
  } else if (endpoint.match(/^\/spots\/\d+$/)) {
    const id = endpoint.split('/')[2];
    url += `?action=spots&id=${id}`;
  } else if (endpoint.match(/^\/spots\/\d+\/photo$/)) {
    const id = endpoint.split('/')[2];
    url += `?action=spots&id=${id}&sub=photo`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : null,
      signal: controller.signal
    });

    clearTimeout(id);

    console.log(`[API] ${method} ${endpoint} → ${response.status}`);

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
