/**
 * main.js - Punto de entrada de la aplicación
 * Orquesta los módulos: map, spots, ui
 */

import { initMap } from './map.js';
import { loadSpots, displaySpots, focusSpot } from './spots.js';
import { setupUI, renderSpotList, updateCategoryFilter, enableAutoGeolocate } from './ui.js';

/**
 * Inicializar aplicación cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[MAIN] Inicializando aplicación SpotMap...');

    try {
        // 1. Inicializar mapa
        if (!initMap()) {
            throw new Error('No se pudo inicializar el mapa');
        }

        // 2. Intentar obtener ubicación del usuario automáticamente
        enableAutoGeolocate();

        // 3. Configurar interfaz de usuario
        setupUI();

        // 4. Cargar spots
        const spots = await loadSpots();
        
        if (spots.length === 0) {
            console.warn('[MAIN] No hay spots en la base de datos');
        }

        // 5. Mostrar spots en mapa y sidebar
        displaySpots(spots, renderSpotList);

        // 6. Actualizar categorías en filtro
        updateCategoryFilter(spots);

        console.log('[MAIN] ✓ Aplicación inicializada correctamente');

    } catch (error) {
        console.error('[MAIN] Error inicializando aplicación:', error);
        const mapDiv = document.getElementById('map');
        if (mapDiv) {
            mapDiv.innerHTML = `
                <div class="alert alert-danger m-3">
                    Error iniciando la aplicación: ${error.message}
                </div>
            `;
        }
    }
});

// Para debug en consola
window.debugInfo = {
    focusSpot,
    loadSpots,
    displaySpots
};

console.log('[MAIN] SpotMap ES6 modules loaded. Use window.debugInfo for debugging.');
