import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from './auth';
import { authLocalLogin } from '../services/api';

vi.mock('../services/api', () => ({
  authLocalLogin: vi.fn(),
}));

function ensureWindowStorage() {
  const memory = new Map();
  const localStorage = {
    getItem: (key) => (memory.has(key) ? memory.get(key) : null),
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key),
    clear: () => memory.clear(),
  };

  globalThis.window = {
    ...(globalThis.window ?? {}),
    localStorage,
  };
}

describe('auth store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ensureWindowStorage();
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  it('logs in and persists session', async () => {
    authLocalLogin.mockResolvedValue({
      success: true,
      session: {
        access_token: 'jwt.token.value',
        user: {
          id: 'u-1',
          email: 'mod@test.local',
          role: 'moderator',
        },
      },
    });

    const store = useAuthStore();
    const ok = await store.login('mod@test.local', 'secret');

    expect(ok).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(store.isModerator).toBe(true);
    expect(store.role).toBe('moderator');

    const saved = JSON.parse(window.localStorage.getItem('spotmap_vue_auth'));
    expect(saved.token).toBe('jwt.token.value');
  });

  it('hydrates session from localStorage', () => {
    window.localStorage.setItem('spotmap_vue_auth', JSON.stringify({
      token: 'persisted.jwt',
      user: {
        id: 'u-2',
        email: 'user@test.local',
        role: 'user',
      },
    }));

    const store = useAuthStore();
    store.hydrate();

    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe('persisted.jwt');
    expect(store.role).toBe('user');
  });
});
