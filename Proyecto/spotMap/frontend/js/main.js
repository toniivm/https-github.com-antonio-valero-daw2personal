/**
 * main.js - Punto de entrada de la aplicación
 * Orquesta los módulos: map, spots, ui, auth
 */

import { initMap } from './map.js';
import { loadSpots, displaySpots, focusSpot } from './spots.js';
import { getPending, approve, reject } from './supabaseSpots.js';
import { getCurrentRole } from './auth.js';
import { subscribeToSpots, supabaseAvailable } from './supabaseClient.js';
import * as mapModule from './map.js';
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

        // 5.1 Moderación: cargar pending si rol adecuado
        setupModerationPanel();

        // 5.2 Realtime: suscribirse a cambios en spots
        setupRealtime();

        // 5.3 Service Worker: listener de actualizaciones
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                showNotification('Nueva versión disponible. Recargando...', 'info');
                setTimeout(() => window.location.reload(), 1000);
            });
        }

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
    displaySpots,
    getPending
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

async function setupModerationPanel() {
    const role = getCurrentRole();
    if (role !== 'moderator' && role !== 'admin') return;
    const listEl = document.getElementById('pending-list');
    const countEl = document.getElementById('pending-count');
    const closeBtn = document.getElementById('btn-close-moderation');
    if (!listEl || !countEl) return;
    closeBtn?.addEventListener('click', () => {
        document.getElementById('moderation-panel').style.display = 'none';
    });
    await refreshPending(listEl, countEl);
}

async function refreshPending(listEl, countEl) {
    listEl.innerHTML = '<div class="p-2 text-muted">Cargando pending...</div>';
    const pending = await getPending();
    countEl.textContent = `Pending: ${pending.length}`;
    if (pending.length === 0) {
        listEl.innerHTML = '<div class="p-2 text-success">No hay spots pendientes ✅</div>';
        return;
    }
    listEl.innerHTML = '';
    pending.forEach(spot => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex flex-column gap-1';
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <strong>#${spot.id} ${spot.title}</strong>
                <small>${new Date(spot.created_at).toLocaleDateString()}</small>
            </div>
            <div class="small text-muted">${spot.description || ''}</div>
            <div class="d-flex gap-2 mt-1">
                <button class="btn btn-sm btn-outline-success" data-action="approve">✔️ Aprobar</button>
                <button class="btn btn-sm btn-outline-danger" data-action="reject">❌ Rechazar</button>
                <button class="btn btn-sm btn-outline-secondary" data-action="focus">👁️ Ver</button>
            </div>
        `;
        item.querySelector('[data-action="approve"]').addEventListener('click', async () => {
            item.classList.add('opacity-50');
            const ok = await approve(spot.id);
            if (ok) {
                item.remove();
                const spots = await loadSpots({ forceRefresh: true });
                displaySpots(spots, renderSpotList);
                await refreshPending(listEl, countEl);
            } else {
                item.classList.remove('opacity-50');
            }
        });
        item.querySelector('[data-action="reject"]').addEventListener('click', async () => {
            item.classList.add('opacity-50');
            const ok = await reject(spot.id);
            if (ok) {
                item.remove();
                await refreshPending(listEl, countEl);
            } else {
                item.classList.remove('opacity-50');
            }
        });
        item.querySelector('[data-action="focus"]').addEventListener('click', () => {
            focusSpot(spot.id);
        });
    listEl.appendChild(item);
  });
}

function setupRealtime() {
  if (!supabaseAvailable()) {
    console.log('[Realtime] Supabase no disponible, omitiendo suscripción');
    return;
  }
  subscribeToSpots(async (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    console.log('[Realtime] Evento:', eventType, newRecord);
    
    if (eventType === 'INSERT' && newRecord.status === 'approved') {
      // Nuevo spot aprobado → añadir al mapa
      mapModule.addMarker(newRecord);
      showToast(`Nuevo spot: ${newRecord.title}`, 'info', { autoCloseMs: 3000 });
      // Refrescar lista
      const spots = await loadSpots({ forceRefresh: true });
      displaySpots(spots, renderSpotList);
    } else if (eventType === 'UPDATE') {
      if (oldRecord?.status === 'pending' && newRecord.status === 'approved') {
        // Spot aprobado → añadir al mapa
        mapModule.addMarker(newRecord);
        showToast(`Spot aprobado: ${newRecord.title}`, 'success', { autoCloseMs: 3000 });
        const spots = await loadSpots({ forceRefresh: true });
        displaySpots(spots, renderSpotList);
      } else if (newRecord.status === 'rejected') {
        // Spot rechazado → quitar del mapa si estaba
        mapModule.removeMarker(newRecord.id);
      }
    } else if (eventType === 'DELETE') {
      // Spot eliminado → quitar del mapa
      mapModule.removeMarker(oldRecord.id);
      const spots = await loadSpots({ forceRefresh: true });
      displaySpots(spots, renderSpotList);
    }
  });
  console.log('[Realtime] ✓ Suscripción activa a cambios en spots');
}