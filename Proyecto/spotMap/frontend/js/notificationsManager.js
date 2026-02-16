// notificationsManager.js - Sistema de notificaciones en tiempo casi real
// Maneja carga, visualización y actualización de notificaciones del usuario

import { getApiUrl } from './config.js';
import { getAccessToken } from './auth.js';

let pollInterval = null;
const POLL_INTERVAL_MS = 30000; // 30 segundos

/**
 * Inicializa el sistema de notificaciones
 */
export function initNotifications() {
    const user = getCurrentUserFromStorage();
    if (!user) {
        hideNotificationsButton();
        stopPolling();
        return;
    }

    showNotificationsButton();
    loadNotifications();
    startPolling();

    // Event listeners
    document.getElementById('btn-mark-all-read')?.addEventListener('click', markAllAsRead);
    
    // Recargar al abrir el dropdown
    document.getElementById('btn-notifications')?.addEventListener('click', () => {
        loadNotifications();
    });
}

/**
 * Obtiene el usuario actual del localStorage
 */
function getCurrentUserFromStorage() {
    try {
        const user = localStorage.getItem('spotmap_user');
        return user ? JSON.parse(user) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Muestra el botón de notificaciones
 */
function showNotificationsButton() {
    const btn = document.getElementById('notifications-button');
    if (btn) btn.style.display = 'block';
}

/**
 * Oculta el botón de notificaciones
 */
function hideNotificationsButton() {
    const btn = document.getElementById('notifications-button');
    if (btn) btn.style.display = 'none';
}

/**
 * Carga las notificaciones del usuario
 */
export async function loadNotifications() {
    try {
        const token = await getAccessToken();
        if (!token) return;

        const response = await fetch(`${getApiUrl()}/api/notifications?limit=20&unread_only=false`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Failed to load notifications:', response.status);
            return;
        }

        const data = await response.json();
        renderNotifications(data.notifications || []);
        updateUnreadCount();
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

/**
 * Actualiza el contador de notificaciones no leídas
 */
async function updateUnreadCount() {
    try {
        const token = await getAccessToken();
        if (!token) return;

        const response = await fetch(`${getApiUrl()}/api/notifications/unread-count`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return;

        const data = await response.json();
        const count = data.count || 0;

        const badge = document.getElementById('notifications-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error updating unread count:', error);
    }
}

/**
 * Renderiza la lista de notificaciones
 */
function renderNotifications(notifications) {
    const container = document.getElementById('notifications-list');
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-3 small">
                No hay notificaciones
            </div>
        `;
        return;
    }

    container.innerHTML = notifications.map(notif => {
        const isUnread = !notif.is_read;
        const icon = getNotificationIcon(notif.type);
        const timeAgo = formatTimeAgo(notif.created_at);

        return `
            <div class="list-group-item list-group-item-action p-2 ${isUnread ? 'bg-light' : ''}" 
                 data-notification-id="${notif.id}"
                 style="cursor: pointer; ${isUnread ? 'border-left: 3px solid #0d6efd;' : ''}">
                <div class="d-flex w-100 justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span style="font-size: 1.2rem;">${icon}</span>
                            <strong class="small">${escapeHtml(notif.title)}</strong>
                            ${isUnread ? '<span class="badge bg-primary" style="font-size: 0.6rem;">NUEVA</span>' : ''}
                        </div>
                        <p class="mb-1 small text-muted">${escapeHtml(notif.message)}</p>
                        <small class="text-muted">${timeAgo}</small>
                    </div>
                    <button class="btn btn-sm btn-link text-muted p-0 ms-2" 
                            onclick="deleteNotification(${notif.id})" 
                            title="Eliminar">
                        ×
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Añadir event listeners para marcar como leída al hacer click
    container.querySelectorAll('[data-notification-id]').forEach(item => {
        item.addEventListener('click', async (e) => {
            if (e.target.tagName === 'BUTTON') return; // Ignorar click en botón eliminar
            const notifId = item.dataset.notificationId;
            await markAsRead(notifId);
        });
    });
}

/**
 * Obtiene el icono según el tipo de notificación
 */
function getNotificationIcon(type) {
    const icons = {
        'spot_approved': '✅',
        'spot_rejected': '❌',
        'spot_comment': '💬',
        'spot_like': '❤️',
        'system': 'ℹ️'
    };
    return icons[type] || '🔔';
}

/**
 * Formatea el tiempo relativo (hace X minutos/horas/días)
 */
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/**
 * Marca una notificación como leída
 */
async function markAsRead(notificationId) {
    try {
        const token = await getAccessToken();
        if (!token) return;

        const response = await fetch(`${getApiUrl()}/api/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            await loadNotifications();
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

/**
 * Marca todas las notificaciones como leídas
 */
async function markAllAsRead() {
    try {
        const token = await getAccessToken();
        if (!token) return;

        const response = await fetch(`${getApiUrl()}/api/notifications/mark-all-read`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            await loadNotifications();
        }
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
}

/**
 * Elimina una notificación
 */
window.deleteNotification = async function(notificationId) {
    try {
        const token = await getAccessToken();
        if (!token) return;

        const response = await fetch(`${getApiUrl()}/api/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            await loadNotifications();
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
    }
};

/**
 * Inicia el polling de notificaciones
 */
function startPolling() {
    if (pollInterval) return; // Ya está activo
    
    pollInterval = setInterval(() => {
        updateUnreadCount();
    }, POLL_INTERVAL_MS);
}

/**
 * Detiene el polling de notificaciones
 */
function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Limpia el sistema de notificaciones (logout)
 */
export function cleanupNotifications() {
    stopPolling();
    hideNotificationsButton();
    
    const badge = document.getElementById('notifications-badge');
    if (badge) badge.style.display = 'none';
    
    const container = document.getElementById('notifications-list');
    if (container) {
        container.innerHTML = `
            <div class="text-center text-muted py-3 small">
                No hay notificaciones
            </div>
        `;
    }
}
