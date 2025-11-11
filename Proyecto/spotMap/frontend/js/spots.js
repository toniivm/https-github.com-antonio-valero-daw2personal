/**
 * spots.js - Gestión de operaciones CRUD de spots
 * Módulo responsable de crear, leer, actualizar y eliminar spots
 */

import * as mapModule from './map.js';
import { apiFetch } from './api.js';

/**
 * Cargar todos los spots de la API
 * @returns {Promise<Array>} Array de spots
 */
export async function loadSpots() {
    try {
        console.log('[SPOTS] Cargando spots...');
        const response = await apiFetch('/spots', { method: 'GET' });
        
        if (!response || !response.data || !Array.isArray(response.data.spots)) {
            console.warn('[SPOTS] Respuesta inválida de API');
            return [];
        }

        console.log(`[SPOTS] ✓ ${response.data.spots.length} spots cargados`);
        return response.data.spots;

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
 * @param {File} photoFile - Archivo de foto (opcional)
 * @returns {Promise<Object>} Spot creado
 */
export async function createSpot(spotData, photoFile = null) {
    try {
        // Validación básica en cliente
        if (!spotData.title || !spotData.title.trim()) {
            throw new Error('El título es requerido');
        }
        if (isNaN(spotData.lat) || isNaN(spotData.lng)) {
            throw new Error('Latitud y longitud inválidas');
        }
        if (spotData.lat < -90 || spotData.lat > 90) {
            throw new Error('Latitud debe estar entre -90 y 90');
        }
        if (spotData.lng < -180 || spotData.lng > 180) {
            throw new Error('Longitud debe estar entre -180 y 180');
        }

        console.log('[SPOTS] Creando nuevo spot:', spotData.title);

        // Si hay foto, usar FormData
        let body;
        let headers = {};

        if (photoFile) {
            // Validar archivo
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (photoFile.size > maxSize) {
                throw new Error('La foto no puede exceder 5MB');
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!validTypes.includes(photoFile.type)) {
                throw new Error('Formato de foto no válido. Use: JPEG, PNG, WebP o GIF');
            }

            const formData = new FormData();
            formData.append('title', spotData.title);
            formData.append('description', spotData.description || '');
            formData.append('lat', spotData.lat);
            formData.append('lng', spotData.lng);
            formData.append('category', spotData.category || '');
            formData.append('tags', JSON.stringify(spotData.tags || []));
            formData.append('photo', photoFile);

            body = formData;
            // No establecer Content-Type para FormData, el navegador lo hace automáticamente
        } else {
            // Sin foto, enviar objeto (apiFetch se encargará de serializar)
            body = spotData;
            headers['Content-Type'] = 'application/json';
        }

        const response = await apiFetch('/spots', {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response || !response.success) {
            // Mejorar mensaje de error
            if (response?.errors) {
                // Si hay errores de validación específicos
                const errorMessages = Object.values(response.errors).flat();
                throw new Error(errorMessages.join(', '));
            }
            throw new Error(response?.message || 'Error creando spot');
        }

        console.log('[SPOTS] ✓ Spot creado:', response.data);
        return response.data;

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
        
        // La API retorna 204 (sin contenido) en delete exitoso
        const response = await apiFetch(`/spots/${spotId}`, { method: 'DELETE' });
        
        // Response será null para 204, lo cual es correcto
        // No validar response.success porque es 204 No Content
        
        mapModule.removeMarker(spotId);
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
        console.log(`[SPOTS] ✓ Foto subida correctamente para spot ${spotId}`);
        return response.data;

    } catch (error) {
        console.error(`[SPOTS] Error subiendo foto para spot ${spotId}:`, error);
        throw error;
    }
}

/**
 * Buscar spots por término
 * @param {Array} spots - Array de spots a buscar
 * @param {string} searchTerm - Término a buscar
 * @returns {Array} Spots filtrados
 */
export function searchSpots(spots, searchTerm) {
    if (!searchTerm || !searchTerm.trim()) {
        return spots;
    }

    const term = searchTerm.toLowerCase().trim();
    return spots.filter(spot => {
        const title = (spot.title || '').toLowerCase();
        const description = (spot.description || '').toLowerCase();
        const category = (spot.category || '').toLowerCase();
        
        return title.includes(term) || description.includes(term) || category.includes(term);
    });
}

/**
 * Filtrar spots por categoría
 * @param {Array} spots - Array de spots
 * @param {string} category - Categoría a filtrar
 * @returns {Array} Spots de la categoría
 */
export function filterByCategory(spots, category) {
    if (!category || category === 'all') {
        return spots;
    }

    return spots.filter(spot => spot.category === category);
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
