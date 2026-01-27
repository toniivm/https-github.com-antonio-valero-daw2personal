/**
 * spots.js - Gestión de operaciones CRUD de spots
 * Módulo responsable de crear, leer, actualizar y eliminar spots
 */

import * as mapModule from './map.js';
import { apiFetch } from './api.js';
import { Cache } from './cache.js';
import { getApproved, createSpotRecord } from './supabaseSpots.js';

/**
 * Cargar todos los spots de la API
 * @returns {Promise<Array>} Array de spots
 */
export async function loadSpots({ forceRefresh = false } = {}) {
    try {
        if (!forceRefresh) {
            const cached = Cache.get('spots');
            if (cached) {
                console.log(`[SPOTS] Cache hit: ${cached.length} spots`);
                return cached;
            }
        }
        console.log('[SPOTS] Fetching spots (Supabase/API)...');
        const spots = await getApproved({});
        Cache.set('spots', spots, 30000);
        console.log(`[SPOTS] ✓ ${spots.length} spots cargados`);
        return spots;
    } catch (error) {
        console.error('[SPOTS] Error cargando spots:', error);
        return [];
    }
}

/**
 * Mostrar spots en el mapa y sidebar
 * @param {Array} spots - Array de spots a mostrar
 * @param {Function} renderListCallback - Función para renderizar lista
 */
export function displaySpots(spots, renderListCallback) {
    if (!spots || !Array.isArray(spots)) {
        console.warn('[SPOTS] Array de spots inválido');
        return;
    }

    mapModule.clearAllMarkers();

    spots.forEach(spot => {
        mapModule.addMarker(spot);
    });

    if (renderListCallback && typeof renderListCallback === 'function') {
        renderListCallback(spots);
    }

    console.log(`[SPOTS] ✓ ${spots.length} spots mostrados`);
}

/**
 * Crear nuevo spot
 * @param {Object} spotData - Datos del spot { title, description, lat, lng, tags, category }
 * @param {File} photoFile1 - Primera foto (opcional)
 * @param {File} photoFile2 - Segunda foto (opcional)
 * @returns {Promise<Object>} Spot creado
 */
export async function createSpot(spotData, photoFile1 = null, photoFile2 = null) {
  try {
    if (!spotData.title || !spotData.title.trim()) throw new Error('El título es requerido');
    if (isNaN(spotData.lat) || isNaN(spotData.lng)) throw new Error('Latitud y longitud inválidas');
    if (spotData.lat < -90 || spotData.lat > 90) throw new Error('Latitud debe estar entre -90 y 90');
    if (spotData.lng < -180 || spotData.lng > 180) throw new Error('Longitud debe estar entre -180 y 180');
    
    // Validar imágenes
    if (photoFile1) {
      const maxSize = 5 * 1024 * 1024;
      if (photoFile1.size > maxSize) throw new Error('La primera foto no puede exceder 5MB');
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(photoFile1.type)) throw new Error('Formato de la primera foto no válido');
    }
    if (photoFile2) {
      const maxSize = 5 * 1024 * 1024;
      if (photoFile2.size > maxSize) throw new Error('La segunda foto no puede exceder 5MB');
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(photoFile2.type)) throw new Error('Formato de la segunda foto no válido');
    }
    
    console.log('[SPOTS] Creando spot (Supabase/API):', spotData.title);
    const created = await createSpotRecord(spotData, photoFile1, photoFile2);
    if (!created) throw new Error('Error creando spot');
    Cache.remove('spots');
    return created;
  } catch (error) {
    console.error('[SPOTS] Error creando spot:', error);
    throw error;
  }
}

/**
 * Obtener un spot específico
 * @param {number} spotId - ID del spot
 * @returns {Promise<Object>} Spot encontrado
 */
export async function getSpot(spotId) {
    try {
        console.log(`[SPOTS] Obteniendo spot ${spotId}`);
        const response = await apiFetch(`/spots/${spotId}`, { method: 'GET' });
        
        if (!response || !response.success) {
            throw new Error('Spot no encontrado');
        }

        return response.data;

    } catch (error) {
        console.error(`[SPOTS] Error obteniendo spot ${spotId}:`, error);
        throw error;
    }
}

/**
 * Eliminar un spot
 * @param {number} spotId - ID del spot
 * @returns {Promise<boolean>} True si se eliminó correctamente
 */
export async function deleteSpot(spotId) {
    try {
        console.log(`[SPOTS] Eliminando spot ${spotId}`);
        
        // Importar utilidades de Supabase
        const { supabaseAvailable, getClient, getValidToken } = await import('./supabaseClient.js');
        
        // Si Supabase está disponible, usar directamente
        if (supabaseAvailable()) {
            console.log('[SPOTS] Usando Supabase para eliminar...');
            const supabase = getClient();
            const { error } = await supabase
                .from('spots')
                .delete()
                .eq('id', spotId);
            
            if (error) {
                console.error('[SPOTS] Error eliminando de Supabase:', error);
                throw new Error(error.message || 'Error eliminando spot');
            }
            
            Cache.remove('spots');
            console.log(`[SPOTS] ✓ Spot ${spotId} eliminado desde Supabase`);
            return true;
        }
        
        // Fallback: usar API REST con token
        console.log('[SPOTS] Supabase no disponible, usando API...');
        const token = await getValidToken();
        
        if (!token) {
            throw new Error('Debes iniciar sesión para eliminar spots');
        }
        
        console.log('[SPOTS] Token obtenido, enviando DELETE...');
        console.log('[SPOTS] Token (primeros 20 chars):', token?.substring(0, 20) + '...');
        
        // La API retorna 204 (sin contenido) en delete exitoso
        const response = await apiFetch(`/spots/${spotId}`, { 
            method: 'DELETE',
            token: token
        });
        
        console.log('[SPOTS] Response DELETE:', response);
        Cache.remove('spots'); // invalidate cache
        console.log(`[SPOTS] ✓ Spot ${spotId} eliminado`);
        return true;

    } catch (error) {
        console.error(`[SPOTS] Error eliminando spot ${spotId}:`, error);
        throw error;
    }
}

/**
 * Subir foto a un spot
 * @param {number} spotId - ID del spot
 * @param {File} photoFile - Archivo de imagen
 * @returns {Promise<Object>} Spot actualizado con la nueva foto
 */
export async function uploadPhoto(spotId, photoFile) {
    try {
        if (!photoFile) {
            throw new Error('Archivo de foto es requerido');
        }

        console.log(`[SPOTS] Subiendo foto para spot ${spotId}`);

        const formData = new FormData();
        formData.append('photo', photoFile);

        const response = await apiFetch(`/spots/${spotId}/photo`, {
            method: 'POST',
            body: formData
            // NO incluir Content-Type: multipart/form-data, lo hace automáticamente el navegador
        });

        if (!response || !response.success) {
            throw new Error(response?.message || 'Error subiendo foto');
        }

        mapModule.updateMarker(spotId, response.data);
        Cache.remove('spots');
        console.log(`[SPOTS] ✓ Foto subida correctamente para spot ${spotId}`);
        return response.data;

    } catch (error) {
        console.error(`[SPOTS] Error subiendo foto para spot ${spotId}:`, error);
        throw error;
    }
}

/**
 * Obtener todas las categorías únicas
 * @param {Array} spots - Array de spots
 * @returns {Array} Array de categorías únicas
 */
export function getCategories(spots) {
    const categories = new Set();
    spots.forEach(spot => {
        if (spot.category) {
            categories.add(spot.category);
        }
    });
    return Array.from(categories).sort();
}

/**
 * Hacer visible un spot en el mapa
 * @param {number} spotId - ID del spot
 */
export function focusSpot(spotId) {
    const markers = mapModule.getAllMarkers();
    if (markers[spotId]) {
        const marker = markers[spotId];
        marker.openPopup();
        mapModule.getMap().panTo(marker.getLatLng());
        console.log(`[SPOTS] ✓ Enfoque en spot ${spotId}`);
    }
}
/**
 * Buscar spots por término
 * @param {Array} spots - Array de spots
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} Spots filtrados
 */
export function searchSpots(spots, searchTerm = '') {
    if (!searchTerm || searchTerm.trim() === '') {
        return spots;
    }

    const term = searchTerm.toLowerCase();
    return spots.filter(spot => 
        (spot.title && spot.title.toLowerCase().includes(term)) ||
        (spot.description && spot.description.toLowerCase().includes(term)) ||
        (spot.category && spot.category.toLowerCase().includes(term))
    );
}

/**
 * Filtrar spots por categoría
 * @param {Array} spots - Array de spots
 * @param {string} category - Categoría a filtrar
 * @returns {Array} Spots filtrados
 */
export function filterByCategory(spots, category = 'all') {
    if (!category || category === 'all') {
        return spots;
    }

    return spots.filter(spot => spot.category === category);
}

/**
 * Paginación simple - divide spots en páginas
 * @param {Array} spots - Array de spots
 * @param {number} pageNumber - Número de página (1-indexed)
 * @param {number} pageSize - Spots por página
 * @returns {Object} {items, total, page, pages}
 */
export function paginate(spots, pageNumber = 1, pageSize = 20) {
    const total = spots.length;
    const pages = Math.ceil(total / pageSize);
    const page = Math.max(1, Math.min(pageNumber, pages));
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
        items: spots.slice(start, end),
        total,
        page,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
    };
}