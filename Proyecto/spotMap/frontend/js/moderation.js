/**
 * Sistema de moderación para SpotMap
 * Permite a moderadores y admins revisar y aprobar spots pendientes
 */

import { getCurrentUser, isAuthenticated } from './auth.js';
import { supabaseAvailable } from './supabaseClient.js';
import { showToast } from './ui.js';

let pendingSpots = [];

/**
 * Verificar si el usuario actual es moderador
 */
export function isModerator() {
    try {
        const user = getCurrentUser();
        return user && (user.role === 'moderator' || user.role === 'admin');
    } catch (e) {
        return false;
    }
}

/**
 * Cargar spots pendientes de aprobación
 */
export async function loadPendingSpots() {
    if (!isModerator()) {
        console.warn('[MODERATION] Usuario no es moderador, acceso denegado');
        return [];
    }

    try {
        if (supabaseAvailable()) {
            const { getClient } = await import('./supabaseClient.js');
            const supabase = getClient();
            
            const { data, error } = await supabase
                .from('spots')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            pendingSpots = data || [];
            console.log(`[MODERATION] ✅ ${pendingSpots.length} spots pendientes cargados`);
            return pendingSpots;
        }
    } catch (error) {
        console.error('[MODERATION] Error cargando spots pendientes:', error);
        showToast('Error cargando spots pendientes', 'error');
        return [];
    }
}

/**
 * Aprobar un spot
 */
export async function approveSpot(spotId) {
    if (!isModerator()) {
        showToast('No tienes permiso para aprobar spots', 'warning');
        return false;
    }

    try {
        if (supabaseAvailable()) {
            const { getClient } = await import('./supabaseClient.js');
            const supabase = getClient();
            
            const { data, error } = await supabase
                .from('spots')
                .update({ status: 'approved', updated_at: new Date().toISOString() })
                .eq('id', spotId)
                .select();
            
            if (error) throw error;
            
            // Eliminar de la lista local
            pendingSpots = pendingSpots.filter(s => s.id !== spotId);
            console.log(`[MODERATION] ✅ Spot ${spotId} aprobado`);
            showToast('Spot aprobado correctamente', 'success');
            
            // Invalidar cache
            const { Cache } = await import('./Cache.js');
            Cache.remove('spots');
            
            return true;
        }
    } catch (error) {
        console.error('[MODERATION] Error aprobando spot:', error);
        showToast('Error aprobando spot: ' + error.message, 'error');
        return false;
    }
}

/**
 * Rechazar un spot
 */
export async function rejectSpot(spotId, reason = '') {
    if (!isModerator()) {
        showToast('No tienes permiso para rechazar spots', 'warning');
        return false;
    }

    try {
        if (supabaseAvailable()) {
            const { getClient } = await import('./supabaseClient.js');
            const supabase = getClient();
            
            const { data, error } = await supabase
                .from('spots')
                .update({ 
                    status: 'rejected', 
                    updated_at: new Date().toISOString(),
                    rejection_reason: reason || null
                })
                .eq('id', spotId)
                .select();
            
            if (error) throw error;
            
            // Eliminar de la lista local
            pendingSpots = pendingSpots.filter(s => s.id !== spotId);
            console.log(`[MODERATION] ✅ Spot ${spotId} rechazado`);
            showToast('Spot rechazado correctamente', 'success');
            
            // Invalidar cache
            const { Cache } = await import('./Cache.js');
            Cache.remove('spots');
            
            return true;
        }
    } catch (error) {
        console.error('[MODERATION] Error rechazando spot:', error);
        showToast('Error rechazando spot: ' + error.message, 'error');
        return false;
    }
}

/**
 * Mostrar panel de moderación en la UI
 */
export async function setupModerationPanel() {
    if (!isModerator()) {
        console.log('[MODERATION] Usuario no es moderador, panel omitido');
        return;
    }

    console.log('[MODERATION] Configurando panel de moderación...');
    
    const moderationBtn = document.getElementById('btn-moderation-panel');
    if (!moderationBtn) {
        console.warn('[MODERATION] Botón de moderación no encontrado en HTML');
        return;
    }
    
    // Cargar spots pendientes al iniciar
    await loadPendingSpots();
    
    // Event listener para abrir panel
    moderationBtn.addEventListener('click', () => {
        showModerationPanel();
    });
    
    // Mostrar badge si hay spots pendientes
    if (pendingSpots.length > 0) {
        moderationBtn.innerHTML = `
            🛡️ Moderación 
            <span class="badge bg-danger" style="margin-left: 0.5rem;">${pendingSpots.length}</span>
        `;
        moderationBtn.style.display = 'flex';
        moderationBtn.style.alignItems = 'center';
    }
    
    console.log('[MODERATION] ✅ Panel de moderación configurado');
}

/**
 * Mostrar panel con spots pendientes
 */
async function showModerationPanel() {
    const spots = await loadPendingSpots();
    
    if (spots.length === 0) {
        showToast('No hay spots pendientes de aprobación', 'info');
        return;
    }
    
    // Crear modal HTML dinámicamente
    const modalHtml = `
        <div class="modal fade" id="moderationModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-gradient">
                        <h5 class="modal-title">🛡️ Panel de Moderación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="moderation-content">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal viejo si existe
    const oldModal = document.getElementById('moderationModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Llenar contenido
    const content = document.getElementById('moderation-content');
    let html = `
        <div class="alert alert-info">
            <strong>${spots.length} spot(s) pendiente(s) de aprobación</strong>
        </div>
        <div class="row g-3" id="pending-spots-container">
    `;
    
    for (const spot of spots) {
        const image = spot.image_path ? `
            <img src="${escapeHtml(spot.image_path)}" class="img-fluid rounded mb-3" alt="${escapeHtml(spot.title)}" style="max-height: 200px; width: 100%; object-fit: cover;">
        ` : '<div class="bg-secondary rounded mb-3 d-flex align-items-center justify-content-center" style="height: 200px; color: white;"><strong>📸 Sin imagen</strong></div>';
        
        html += `
            <div class="col-12 mb-3 p-3 border rounded bg-light">
                <div class="row">
                    <div class="col-md-6">
                        ${image}
                    </div>
                    <div class="col-md-6">
                        <h6 class="fw-bold">${escapeHtml(spot.title)}</h6>
                        <p class="text-muted small mb-2">${escapeHtml((spot.description || '').substring(0, 100))}...</p>
                        <p class="small">
                            📍 <strong>${spot.lat.toFixed(4)}, ${spot.lng.toFixed(4)}</strong><br>
                            🏷️ <strong>${escapeHtml(spot.category || 'Sin categoría')}</strong><br>
                            ⏰ <strong>${new Date(spot.created_at).toLocaleString('es-ES')}</strong>
                        </p>
                        <div class="d-grid gap-2">
                            <button class="btn btn-success btn-sm approve-btn" data-spot-id="${spot.id}">
                                ✅ Aprobar
                            </button>
                            <button class="btn btn-danger btn-sm reject-btn" data-spot-id="${spot.id}">
                                ❌ Rechazar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    content.innerHTML = html;
    
    // Event listeners para botones
    content.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const spotId = parseInt(btn.dataset.spotId);
            if (await approveSpot(spotId)) {
                // Recargar el panel
                const modal = bootstrap.Modal.getInstance(document.getElementById('moderationModal'));
                modal.hide();
                setTimeout(() => showModerationPanel(), 500);
            }
        });
    });
    
    content.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const spotId = parseInt(btn.dataset.spotId);
            const reason = prompt('Razón del rechazo (opcional):');
            if (reason !== null) { // Si no presiona Cancel
                if (await rejectSpot(spotId, reason)) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('moderationModal'));
                    modal.hide();
                    setTimeout(() => showModerationPanel(), 500);
                }
            }
        });
    });
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('moderationModal'));
    modal.show();
}

/**
 * Función auxiliar para escapar HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Inicializar sistema de moderación
 */
export function initModeration() {
    if (!isAuthenticated()) {
        console.log('[MODERATION] Usuario no autenticado, omitiendo');
        return;
    }
    
    setupModerationPanel().catch(err => {
        console.error('[MODERATION] Error inicializando:', err);
    });
}
