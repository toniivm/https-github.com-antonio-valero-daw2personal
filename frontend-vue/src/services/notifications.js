import { apiFetch } from './api';

export const NOTIFICATIONS_POLL_INTERVAL_MS = 30000;

function notificationsError(err, fallback) {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export function isSupabaseRequiredError(err) {
  const message = err instanceof Error ? err.message : String(err || '');
  return /requires?\s+supabase/i.test(message);
}

function normalizeNotification(item = {}) {
  return {
    id: Number(item.id ?? 0),
    type: String(item.type ?? 'system'),
    title: String(item.title ?? 'Notificación'),
    message: String(item.message ?? ''),
    isRead: Boolean(item.is_read),
    createdAt: String(item.created_at ?? ''),
  };
}

export async function fetchNotifications({ token, limit = 20, unreadOnly = false } = {}) {
  try {
    const payload = await apiFetch(`/notifications?limit=${limit}&unread_only=${unreadOnly ? 'true' : 'false'}`, {
      token,
    });
    const list = payload?.data?.notifications ?? payload?.notifications ?? [];
    return list.map(normalizeNotification).filter((item) => item.id > 0);
  } catch (err) {
    throw new Error(notificationsError(err, 'No se pudieron cargar las notificaciones'));
  }
}

export async function fetchUnreadCount({ token } = {}) {
  try {
    const payload = await apiFetch('/notifications/unread-count', { token });
    return Number(payload?.data?.count ?? payload?.count ?? 0) || 0;
  } catch (err) {
    throw new Error(notificationsError(err, 'No se pudo cargar el contador de notificaciones'));
  }
}

export async function markNotificationAsRead(notificationId, { token } = {}) {
  return apiFetch(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
    token,
  });
}

export async function markAllNotificationsAsRead({ token } = {}) {
  return apiFetch('/notifications/mark-all-read', {
    method: 'POST',
    token,
  });
}

export async function deleteNotificationById(notificationId, { token } = {}) {
  return apiFetch(`/notifications/${notificationId}`, {
    method: 'DELETE',
    token,
  });
}

export function getNotificationIcon(type) {
  const iconMap = {
    spot_approved: '✅',
    spot_rejected: '❌',
    spot_comment: '💬',
    spot_like: '❤️',
    system: 'ℹ️',
  };
  return iconMap[type] ?? '🔔';
}

export function formatTimeAgo(dateString) {
  if (!dateString) return 'Ahora mismo';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Ahora mismo';

  const diffMs = Date.now() - date.getTime();
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