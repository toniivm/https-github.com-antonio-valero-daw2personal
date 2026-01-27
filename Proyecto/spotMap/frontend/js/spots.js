/**
 * spots.js - Gestión de operaciones CRUD de spots
 * Módulo responsable de crear, leer, actualizar y eliminar spots
 * ✅ Incluye manejo robusto de errores y validaciones
 */

import * as mapModule from './map.js';
import { apiFetch } from './api.js';
import { Cache } from './cache.js';
import { getApproved, createSpotRecord } from './supabaseSpots.js';
import { logError, validateData } from './errorHandler.js';

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
    // Validar entrada
    const validSpots = validateData(spots, 'array', []);
    const validCallback = validateData(renderListCallback, 'function', null);
    
    if (validSpots.length === 0) {
        console.warn('[SPOTS] Array de spots vacío o inválido');
        // Aún renderizar para mostrar estado vacío
        if (validCallback) {
            validCallback([]);
        }
        return;
    }

    try {
        // Limpiar marcadores anteriores
        mapModule.clearAllMarkers();

        // Agregar marcadores de spots válidos
        let validCount = 0;
        validSpots.forEach(spot => {
            try {
                // Validar que spot tenga lat/lng
                if (typeof spot.lat !== 'number' || typeof spot.lng !== 'number') {
                    throw new Error(`Spot ${spot.id} sin coordenadas válidas`);
                }
                mapModule.addMarker(spot);
                validCount++;
            } catch (spotError) {
                logError(`[SPOTS] Error agregando marcador`, spotError, { spotId: spot?.id });
            }
        });

        // Renderizar lista si callback existe
        if (validCallback) {
            validCallback(validSpots);
        }

        console.log(`[SPOTS] ✓ ${validCount}/${validSpots.length} spots mostrados correctamente`);
    } catch (error) {
        logError('[SPOTS] Error en displaySpots', error, { spotsCount: validSpots.length });
        // No re-lanzar, permitir que la app continúe
    }
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
    // Validar datos básicos
    const title = validateData(spotData?.title, 'string', '').trim();
    if (!title) throw new Error('El título es requerido y no puede estar vacío');
    
    const lat = parseFloat(spotData?.lat);
    const lng = parseFloat(spotData?.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Latitud y longitud deben ser números válidos');
    }
    if (lat < -90 || lat > 90) {
      throw new Error('Latitud debe estar entre -90 y 90');
    }
    if (lng < -180 || lng > 180) {
      throw new Error('Longitud debe estar entre -180 y 180');
    }
    
    // Validar imágenes de forma consistente
    const validateImage = (file, label) => {
      if (!file) return null; // Opcional
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`${label} no puede exceder 5MB (actual: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error(`${label} formato no válido. Use: JPEG, PNG, WebP o GIF`);
      }
      return file;
    };

    const validPhoto1 = validateImage(photoFile1, 'Primera foto');
    const validPhoto2 = validateImage(photoFile2, 'Segunda foto');
    
    console.log(`[SPOTS] 📸 Creando spot: "${title}" en (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    
    // Llamar a Supabase o API
    const created = await createSpotRecord(spotData, validPhoto1, validPhoto2);
    
    if (!created) {
      throw new Error('Error inesperado: Spot no fue creado por el servidor');
    }
    
    // Invalidar caché después de crear
    Cache.remove('spots');
    
    console.log(`[SPOTS] ✅ Spot creado exitosamente (ID: ${created.id})`);
    return created;
    
  } catch (error) {
    logError('[SPOTS] Error creando spot', error, { 
      title: spotData?.title,
      hasPhoto1: !!photoFile1,
      hasPhoto2: !!photoFile2
    });
    throw error; // Re-lanzar para que UI maneje
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