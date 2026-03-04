import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useNotificationsStore } from './notifications';

vi.mock('../services/auth', () => ({
  getStoredAccessToken: vi.fn(() => 'token-123'),
}));

vi.mock('../services/notifications', () => ({
  NOTIFICATIONS_POLL_INTERVAL_MS: 30000,
  fetchNotifications: vi.fn(),
  fetchUnreadCount: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  deleteNotificationById: vi.fn(),
  isSupabaseRequiredError: vi.fn(() => false),
}));

import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
  isSupabaseRequiredError,
} from '../services/notifications';

describe('useNotificationsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    fetchUnreadCount.mockResolvedValue(2);
    fetchNotifications.mockResolvedValue([
      { id: 1, title: 'Test', message: 'Hola', isRead: false, type: 'system', createdAt: new Date().toISOString() },
    ]);
  });

  it('carga notificaciones y contador', async () => {
    const store = useNotificationsStore();
    await store.loadNotifications();

    expect(store.items).toHaveLength(1);
    expect(store.unreadCount).toBe(2);
    expect(store.initialized).toBe(true);
  });

  it('marca una notificación como leída y recarga', async () => {
    const store = useNotificationsStore();
    await store.loadNotifications();
    await store.markAsRead(1);

    expect(markNotificationAsRead).toHaveBeenCalledWith(1, { token: 'token-123' });
    expect(fetchNotifications).toHaveBeenCalledTimes(2);
  });

  it('marca todas como leídas', async () => {
    const store = useNotificationsStore();
    await store.markAllAsRead();

    expect(markAllNotificationsAsRead).toHaveBeenCalledWith({ token: 'token-123' });
  });

  it('elimina notificación y recarga', async () => {
    const store = useNotificationsStore();
    await store.deleteById(1);

    expect(deleteNotificationById).toHaveBeenCalledWith(1, { token: 'token-123' });
  });

  it('desactiva soporte si backend requiere supabase', async () => {
    isSupabaseRequiredError.mockReturnValueOnce(true);
    fetchNotifications.mockRejectedValueOnce(new Error('Notifications require Supabase backend'));

    const store = useNotificationsStore();
    await store.loadNotifications();

    expect(store.supported).toBe(false);
    expect(store.items).toHaveLength(0);
  });
});