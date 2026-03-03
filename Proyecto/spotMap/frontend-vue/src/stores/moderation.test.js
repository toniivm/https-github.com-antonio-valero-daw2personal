import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useModerationStore } from './moderation';
import { apiFetch } from '../services/api';

vi.mock('../services/api', () => ({
  apiFetch: vi.fn(),
}));

describe('moderation store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  it('loads pending spots from admin endpoint', async () => {
    apiFetch.mockResolvedValue({
      data: {
        spots: [
          { id: 10, title: 'Spot pendiente A' },
          { id: 11, title: 'Spot pendiente B' },
        ],
      },
    });

    const store = useModerationStore();
    await store.loadPending('token-123');

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/pending?page=1&limit=25', { token: 'token-123' });
    expect(store.pendingSpots).toHaveLength(2);
    expect(store.totalPending).toBe(2);
  });

  it('removes spot from list after approve', async () => {
    apiFetch.mockResolvedValue({ success: true });
    const store = useModerationStore();
    store.pendingSpots = [{ id: 99, title: 'Pendiente' }];

    await store.approveSpot(99, 'token-123');

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/spots/99/approve', { method: 'POST', token: 'token-123' });
    expect(store.pendingSpots).toHaveLength(0);
  });
});
