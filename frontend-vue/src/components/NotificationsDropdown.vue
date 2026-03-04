<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useNotificationsStore } from '../stores/notifications';
import { formatTimeAgo, getNotificationIcon } from '../services/notifications';

const notificationsStore = useNotificationsStore();
const open = ref(false);
const rootRef = ref(null);

const hasItems = computed(() => notificationsStore.items.length > 0);
const canUseNotifications = computed(() => notificationsStore.supported);

function toggleOpen() {
  open.value = !open.value;
  if (open.value && !notificationsStore.initialized && canUseNotifications.value) {
    notificationsStore.loadNotifications();
  }
}

function close() {
  open.value = false;
}

function onDocumentClick(event) {
  if (!rootRef.value) return;
  if (!rootRef.value.contains(event.target)) {
    close();
  }
}

async function handleNotificationClick(notification) {
  if (!notification?.id || notification.isRead) return;
  await notificationsStore.markAsRead(notification.id);
}

async function handleDelete(notificationId) {
  await notificationsStore.deleteById(notificationId);
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
});
</script>

<template>
  <div ref="rootRef" class="notifications-dropdown" v-if="canUseNotifications">
    <button class="topbar-btn notifications-trigger" type="button" @click="toggleOpen" title="Notificaciones" aria-label="Notificaciones">
      🔔
      <span v-if="notificationsStore.unreadCount > 0" class="notifications-badge">
        {{ notificationsStore.unreadCount > 99 ? '99+' : notificationsStore.unreadCount }}
      </span>
    </button>

    <section v-if="open" class="notifications-panel" role="dialog" aria-label="Notificaciones">
      <header class="notifications-header">
        <strong>Notificaciones</strong>
        <button class="auth-switch" type="button" :disabled="notificationsStore.syncing || notificationsStore.unreadCount === 0" @click="notificationsStore.markAllAsRead">
          Marcar leídas
        </button>
      </header>

      <p v-if="notificationsStore.error" class="auth-error notifications-error">{{ notificationsStore.error }}</p>

      <div v-if="notificationsStore.loading" class="notifications-empty">Cargando notificaciones…</div>
      <div v-else-if="!hasItems" class="notifications-empty">No hay notificaciones</div>

      <ul v-else class="notifications-list">
        <li
          v-for="notification in notificationsStore.items"
          :key="notification.id"
          class="notification-item"
          :class="{ 'notification-item--unread': !notification.isRead }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-main">
            <div class="notification-title-row">
              <span class="notification-icon">{{ getNotificationIcon(notification.type) }}</span>
              <strong class="notification-title">{{ notification.title }}</strong>
              <span v-if="!notification.isRead" class="notification-new">NUEVA</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            <small class="notification-time">{{ formatTimeAgo(notification.createdAt) }}</small>
          </div>

          <button class="notification-delete" type="button" @click.stop="handleDelete(notification.id)" title="Eliminar notificación">
            ×
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>