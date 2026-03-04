import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import {
  NOTIFICATIONS_POLL_INTERVAL_MS,
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
  isSupabaseRequiredError,
} from '../services/notifications';
import { getStoredAccessToken } from '../services/auth';

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  const syncing = ref(false);
  const error = ref('');
  const supported = ref(true);
  const initialized = ref(false);

  let pollHandle = null;

  const hasUnread = computed(() => unreadCount.value > 0);

  function resetState() {
    items.value = [];
    unreadCount.value = 0;
    error.value = '';
    supported.value = true;
    initialized.value = false;
  }

  function handleUnsupported(errorValue) {
    if (isSupabaseRequiredError(errorValue)) {
      supported.value = false;
      error.value = '';
      items.value = [];
      unreadCount.value = 0;
      stopPolling();
      return true;
    }
    return false;
  }

  async function loadUnreadCount() {
    const token = getStoredAccessToken();
    if (!token) {
      unreadCount.value = 0;
      return 0;
    }

    try {
      const count = await fetchUnreadCount({ token });
      unreadCount.value = count;
      return count;
    } catch (err) {
      if (handleUnsupported(err)) return 0;
      error.value = err instanceof Error ? err.message : 'No se pudo cargar el contador';
      return unreadCount.value;
    }
  }

  async function loadNotifications() {
    const token = getStoredAccessToken();
    if (!token) {
      items.value = [];
      unreadCount.value = 0;
      return [];
    }

    loading.value = true;
    error.value = '';
    try {
      const notifications = await fetchNotifications({ token, limit: 20, unreadOnly: false });
      items.value = notifications;
      await loadUnreadCount();
      initialized.value = true;
      return notifications;
    } catch (err) {
      if (handleUnsupported(err)) return [];
      error.value = err instanceof Error ? err.message : 'No se pudieron cargar las notificaciones';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function markAsRead(notificationId) {
    if (!notificationId) return;
    const token = getStoredAccessToken();
    if (!token) return;

    syncing.value = true;
    try {
      await markNotificationAsRead(notificationId, { token });
      await loadNotifications();
    } catch (err) {
      if (!handleUnsupported(err)) {
        error.value = err instanceof Error ? err.message : 'No se pudo marcar como leída';
      }
    } finally {
      syncing.value = false;
    }
  }

  async function markAllAsRead() {
    const token = getStoredAccessToken();
    if (!token) return;

    syncing.value = true;
    try {
      await markAllNotificationsAsRead({ token });
      await loadNotifications();
    } catch (err) {
      if (!handleUnsupported(err)) {
        error.value = err instanceof Error ? err.message : 'No se pudieron marcar todas como leídas';
      }
    } finally {
      syncing.value = false;
    }
  }

  async function deleteById(notificationId) {
    if (!notificationId) return;
    const token = getStoredAccessToken();
    if (!token) return;

    syncing.value = true;
    try {
      await deleteNotificationById(notificationId, { token });
      await loadNotifications();
    } catch (err) {
      if (!handleUnsupported(err)) {
        error.value = err instanceof Error ? err.message : 'No se pudo eliminar la notificación';
      }
    } finally {
      syncing.value = false;
    }
  }

  function startPolling() {
    if (pollHandle || !supported.value) return;
    pollHandle = setInterval(() => {
      loadUnreadCount();
    }, NOTIFICATIONS_POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (!pollHandle) return;
    clearInterval(pollHandle);
    pollHandle = null;
  }

  async function initForSession() {
    resetState();
    try {
      await loadNotifications();
    } catch {
      // loadNotifications ya setea error/supported; evitamos warnings de watchers
    }
    if (supported.value) {
      startPolling();
    }
  }

  function clearForLogout() {
    stopPolling();
    resetState();
  }

  return {
    items,
    unreadCount,
    loading,
    syncing,
    error,
    supported,
    initialized,
    hasUnread,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteById,
    startPolling,
    stopPolling,
    initForSession,
    clearForLogout,
  };
});