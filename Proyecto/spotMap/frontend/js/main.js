/**
 * main.js - Punto de entrada de la aplicación
 * Orquesta los módulos: map, spots, ui, auth
 */

import { initMap } from './map.js';
import { loadSpots, displaySpots, focusSpot } from './spots.js';
import { setupUI, renderSpotList, updateCategoryFilter, enableAutoGeolocate, showSpotListLoading } from './ui.js';
import { showToast } from './notifications.js';
import { initAuth } from './auth.js';
import { initSocial, isSpotLiked, toggleLike, openShareModal } from './social.js';
import { openSpotDetailsModal } from './comments.js';
import { initI18n, t } from './i18n.js';
import { initTheme } from './theme.js';

/**
 * Inicializar aplicación cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[MAIN] Inicializando aplicación SpotMap...');

    try {
        // 0. Inicializar internacionalización
        initI18n();

        // 0.1 Inicializar sistema de temas
        initTheme();

        // 0.2 Inicializar sistema de autenticación
        initAuth();

        // 0.3 Inicializar sistema social
        initSocial();

        // 0.4 Registrar Service Worker (PWA)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('[PWA] Service Worker registered:', reg))
                .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
        }

        // 1. Inicializar mapa
        if (!initMap()) {
            throw new Error('No se pudo inicializar el mapa');
        }

        // 2. Intentar obtener ubicación del usuario automáticamente
        enableAutoGeolocate();

        // 3. Configurar interfaz de usuario
        setupUI();

        // 4. Mostrar skeleton y cargar spots
        showSpotListLoading();
        const spots = await loadSpots();
        
        if (spots.length === 0) {
            console.warn('[MAIN] No hay spots en la base de datos');
        }

        // 5. Mostrar spots en mapa y sidebar
        displaySpots(spots, renderSpotList);

        // 6. Actualizar categorías en filtro
        updateCategoryFilter(spots);

        console.log('[MAIN] ✓ Aplicación inicializada correctamente');
        showToast('Aplicación cargada correctamente', 'success', { autoCloseMs: 2500 });

    } catch (error) {
        console.error('[MAIN] Error inicializando aplicación:', error);
        showToast('Error iniciando aplicación: ' + error.message, 'error');
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

// Para debug en consola y funciones globales
window.debugInfo = {
    focusSpot,
    loadSpots,
    displaySpots
};

// Exponer funciones sociales globalmente
window.isSpotLiked = isSpotLiked;
window.toggleLike = toggleLike;
window.openShareModal = openShareModal;

// Exponer función de detalles/comentarios globalmente
window.openSpotDetails = openSpotDetailsModal;

// Offline / Online feedback
window.addEventListener('offline', () => {
    showToast('⚠️ Has perdido la conexión. Funciones limitadas.', 'warning', { autoCloseMs: 5000 });
});
window.addEventListener('online', () => {
    showToast('✅ Conexión restaurada', 'success');
});

console.log('[MAIN] SpotMap ES6 modules loaded. Use window.debugInfo for debugging.');
