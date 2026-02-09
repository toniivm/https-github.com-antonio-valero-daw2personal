/**
 * main.js - Punto de entrada de la aplicación
 * Orquesta los módulos: map, spots, ui, auth, oauth
 * Incluye manejo robusto de errores
 */

// ===== IMPORTS CORE =====
import { initMap } from './map.js';
import { loadSpots, displaySpots, focusSpot } from './spots.js';
import { getPending, approve, reject } from './supabaseSpots.js';
import { getCurrentRole, getAccessToken, isAuthenticated, getCurrentUser } from './auth.js';
import { subscribeToSpots, supabaseAvailable, initSupabase, getClient as getSupabaseClient } from './supabaseClient.js';
import * as mapModule from './map.js';
import { setupUI, renderSpotList, updateCategoryFilter, enableAutoGeolocate, showSpotListLoading } from './ui.js';
import { showToast } from './notifications.js';
import { initAuth } from './auth.js';
import { initSocial, isSpotLiked, toggleLike, openShareModal } from './social.js';
import { openSpotDetailsModal } from './comments.js';
import { initI18n, t } from './i18n.js';
import { initTheme } from './theme.js';
import { initOAuthButtons, handleOAuthCallback } from './oauth.js';
import { Config, buildApiUrl } from './config.js';
import { initMapPicker, initImagePreviews } from './spotMapPicker.js';
import { initMapPickerModal } from './mapPickerModal.js';
import { initSidebar } from './sidebar.js';

// ===== ERROR HANDLING =====
import { initGlobalErrorHandlers, safeAsync, logError } from './errorHandler.js';

/**
 * Inicializar aplicación cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[MAIN] 🚀 Inicializando SpotMap v1.0.1-pro...');

    try {
        // ===== FASE 0: SETUP CRÍTICO =====
        console.log('[MAIN] Fase 0: Inicialización crítica...');
        
        // Inicializar manejadores globales de errores
        initGlobalErrorHandlers();
        
        // 0.1 Inicializar Supabase (si está configurado, si no usa API fallback)
        console.log('[MAIN] • Configurando Supabase...');
        await initSupabase();

        // 0.2 Inicializar internacionalización
        console.log('[MAIN] • Inicializando i18n...');
        initI18n();

        // 0.3 Inicializar sistema de temas
        console.log('[MAIN] • Inicializando temas...');
        initTheme();

        // ===== FASE 1: AUTENTICACIÓN =====
        console.log('[MAIN] Fase 1: Sistema de autenticación...');
        initAuth();
        initOAuthButtons();
        handleOAuthCallback();

        // ===== FASE 2: SISTEMAS SOCIALES Y COMPONENTES =====
        console.log('[MAIN] Fase 2: Sistemas complementarios...');
        initSocial();
        initMapPicker();
        initImagePreviews();
        initMapPickerModal();
        initSidebar(); // 🎨 Inicializar sidebar colapsable

        // ===== FASE 3: MAPA (CRÍTICO) =====
        console.log('[MAIN] Fase 3: Inicialización de mapa...');
        if (!initMap()) {
            throw new Error('No se pudo inicializar el mapa');
        }

        // ===== FASE 4: UI Y DATOS =====
        console.log('[MAIN] Fase 4: Interfaz y datos...');
        enableAutoGeolocate();
        setupUI();

        // 4.1 Cargar favoritos del usuario
        const { loadUserFavorites } = await import('./social.js');
        await loadUserFavorites();

        // 4.2 Cargar spots
        showSpotListLoading();
        const spots = await loadSpots();
        displaySpots(spots, renderSpotList);
        
        if (spots.length === 0) {
            console.warn('[MAIN] ⚠️ No hay spots en la BD - mostrando mensaje informativo');
            const list = document.getElementById('spot-list');
            if (list) {
                list.innerHTML = `
                    <div class="alert alert-warning m-2">
                        <div><strong>Sin spots para mostrar.</strong></div>
                        <div class="small text-muted mt-1">Revisa que la base de datos esté inicializada y que la API sea accesible.</div>
                        <div class="small mt-2">API base detectada: <code>${Config.apiBase}</code></div>
                        <div class="small mt-1">Puedes inicializar datos desde backend/init-database.php o verificar rutas en backend/public/index.php</div>
                    </div>`;
            }
        }

        // ===== FASE 5: ADVANCED =====
        console.log('[MAIN] Fase 5: Funcionalidades avanzadas...');
        setupModerationPanel();
        setupRealtime();
        updateCategoryFilter(spots);

        // ===== COMPLETADO =====
        console.log('[MAIN] ✅ Aplicación inicializada correctamente');
        showToast('✅ Aplicación cargada', 'success', { autoCloseMs: 2500 });

    } catch (error) {
        console.error('[MAIN] ❌ Error crítico en inicialización:', error);
        logError('[MAIN] Initialization failed', error);
        showToast('Error iniciando: ' + error.message, 'error');
        
        const mapDiv = document.getElementById('map');
        if (mapDiv) {
            mapDiv.innerHTML = `
                <div class="alert alert-danger m-3">
                    <strong>❌ Error iniciando</strong><br/>
                    ${error.message}<br/>
                    <small class="text-muted">Comprueba la consola (F12) para más detalles</small>
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
window.openSpotDetailsModal = openSpotDetailsModal;

// Función segura para eliminar spot con confirmación
// Helper para verificar si un usuario puede borrar un spot
window.canDeleteSpot = (spotId) => {
    if (!isAuthenticated()) return false;
    const spot = window.currentSpots?.find(s => s.id === spotId);
    if (!spot) return false;
    const user = getCurrentUser();
    const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
    const isOwner = spot.user_id === user?.id;
    return isAdmin || isOwner;
};

// Intentar parsear JSON tolerando respuestas concatenadas
function parseJsonSafe(text) {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (_) {
        const sep = text.indexOf('}{');
        if (sep !== -1) {
            try { return JSON.parse(text.slice(0, sep + 1)); } catch (_) {}
        }
    }
    return null;
}

// Eliminar spot usando Supabase si está disponible; fallback a API PHP
async function deleteSpotRemote(spotId) {
    if (supabaseAvailable()) {
        const sb = getSupabaseClient();
        if (sb) {
            const { error } = await sb.from('spots').delete().eq('id', spotId);
            if (!error) return { ok: true, source: 'supabase' };
            console.warn('[DELETE] Supabase delete failed:', error?.message);
        }
    }

    const headers = { 'Content-Type': 'application/json' };
    try {
        const token = await getAccessToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch (err) {
        console.warn('[DELETE] No token available:', err?.message);
    }

    const url = buildApiUrl(`/spots/${spotId}`);
    const response = await fetch(url, { method: 'DELETE', headers });
    const text = await response.text();
    const data = parseJsonSafe(text);

    if (response.ok) {
        return { ok: true, source: 'api', data };
    }

    const message = data?.message || data?.error || text || 'Error desconocido';
    return { ok: false, status: response.status, message, data, raw: text };
}

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
    window.refreshPending = () => refreshPending(listEl, countEl);
    await refreshPending(listEl, countEl);
}

window.setupModerationPanel = setupModerationPanel;

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
        item.className = 'list-group-item d-flex flex-column gap-1 p-2';
        
        // Mostrar imágenes si existen
        let imagesHTML = '';
        if (spot.image_path) {
            imagesHTML += `<img src="${spot.image_path}" alt="${spot.title}" style="max-width: 100%; max-height: 100px; border-radius: 4px; margin-top: 8px;">`;
        }
        if (spot.image_path_2) {
            imagesHTML += `<img src="${spot.image_path_2}" alt="${spot.title}" style="max-width: 100%; max-height: 100px; border-radius: 4px; margin-top: 4px;">`;
        }
        if (spot.image_url) {
            imagesHTML += `<img src="${spot.image_url}" alt="${spot.title}" style="max-width: 100%; max-height: 100px; border-radius: 4px; margin-top: 8px;">`;
        }
        
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <strong>#${spot.id} ${spot.title}</strong>
                <small class="text-muted">${new Date(spot.created_at).toLocaleDateString()}</small>
            </div>
            <div class="small text-muted">${spot.description || '(sin descripción)'}</div>
            ${imagesHTML ? `<div class="moderator-images">${imagesHTML}</div>` : '<div class="small text-muted"><em>(sin imágenes)</em></div>'}
            <div class="d-flex gap-1 mt-2 flex-wrap">
                <button class="btn btn-sm btn-success" data-action="approve" title="Aprobar este spot">✔️ Aprobar</button>
                <button class="btn btn-sm btn-danger" data-action="reject" title="Rechazar este spot">❌ Rechazar</button>
                <button class="btn btn-sm btn-info" data-action="focus" title="Ver en el mapa">🗺️ Ver</button>
                <button class="btn btn-sm btn-warning" data-action="edit" title="Editar este spot">✏️ Editar</button>
                <button class="btn btn-sm btn-danger" data-action="delete" title="Eliminar este spot">🗑️ Eliminar</button>
            </div>
        `;
        
        // Botón Ver/Focus - centrar mapa en el spot
        item.querySelector('[data-action="focus"]').addEventListener('click', () => {
            focusSpot(spot.id);
            showToast(`📍 Mostrando "${spot.title}" en el mapa`, 'info');
        });
        
        // Botón Aprobar
        item.querySelector('[data-action="approve"]').addEventListener('click', async () => {
            item.classList.add('opacity-50');
            const ok = await approve(spot.id);
            if (ok) {
                item.remove();
                const spots = await loadSpots({ forceRefresh: true });
                displaySpots(spots, renderSpotList);
                await refreshPending(listEl, countEl);
                showToast(`✅ Spot "${spot.title}" aprobado`, 'success');
            } else {
                item.classList.remove('opacity-50');
                showToast('Error al aprobar el spot', 'error');
            }
        });
        item.querySelector('[data-action="reject"]').addEventListener('click', async () => {
            if (confirm(`¿Rechazar el spot "${spot.title}"?`)) {
                item.classList.add('opacity-50');
                const ok = await reject(spot.id);
                if (ok) {
                    item.remove();
                    await refreshPending(listEl, countEl);
                    showToast(`❌ Spot "${spot.title}" rechazado`, 'info');
                } else {
                    item.classList.remove('opacity-50');
                    showToast('Error al rechazar el spot', 'error');
                }
            }
        });
        item.querySelector('[data-action="focus"]').addEventListener('click', () => {
            focusSpot(spot.id);
        });
        
        // Botón Editar
        item.querySelector('[data-action="edit"]').addEventListener('click', () => {
            window.openSpotDetailsModal(spot);
            showToast(`📝 Abriendo detalles de "${spot.title}"`, 'info');
        });
        
        // Botón Eliminar
        item.querySelector('[data-action="delete"]').addEventListener('click', async () => {
            if (!confirm(`⚠️ ¿Eliminar el spot "${spot.title}" de forma permanente?`)) return;
            item.classList.add('opacity-50');
            try {
                const result = await deleteSpotRemote(spot.id);
                if (result.ok) {
                    item.remove();
                    await refreshPending(listEl, countEl);
                    const spots = await loadSpots({ forceRefresh: true });
                    displaySpots(spots, renderSpotList);
                    showToast(`✅ Spot "${spot.title}" eliminado correctamente`, 'success');
                } else {
                    item.classList.remove('opacity-50');
                    console.error('[PANEL-DELETE] Error:', result.message);
                    showToast(`Error al eliminar: ${result.message || 'Error desconocido'}`, 'error');
                }
            } catch (error) {
                item.classList.remove('opacity-50');
                console.error('[PANEL-DELETE] Exception:', error);
                showToast('Error al conectar con el servidor', 'error');
            }
        });
    listEl.appendChild(item);
  });
}

/**
 * Eliminar un spot (función global accesible desde tarjetas)
 */
window.confirmDeleteSpot = async function(spotId) {
    const spots = await loadSpots();
    const spot = spots?.find(s => s.id === spotId);
    if (!spot) {
        showToast('Spot no encontrado', 'error');
        return;
    }
    
    if (!confirm(`⚠️ ¿Eliminar el spot "${spot.title}" de forma permanente?`)) return;

    try {
        showToast('Eliminando spot...', 'info');
        const result = await deleteSpotRemote(spotId);

        if (result.ok) {
            if (window.mapModule && window.mapModule.removeMarker) {
                window.mapModule.removeMarker(spotId);
            }

            const updatedSpots = await loadSpots({ forceRefresh: true });
            displaySpots(updatedSpots, renderSpotList);
            showToast(`✅ Spot "${spot.title}" eliminado correctamente`, 'success');

            if (window.refreshPending) {
                window.refreshPending();
            }
        } else {
            console.error('[DELETE] Error from server:', result.message);
            showToast(`Error al eliminar: ${result.message || 'Error desconocido'}`, 'error');
        }
    } catch (error) {
        console.error('[DELETE] Exception:', error);
        showToast('Error al conectar con el servidor: ' + error.message, 'error');
    }
};

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