import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { authLocalLogin } from '../services/api';

const AUTH_STORAGE_KEY = 'spotmap_vue_auth';

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref('');
  const user = ref(null);
  const loading = ref(false);
  const error = ref('');

  const isAuthenticated = computed(() => Boolean(token.value));
  const role = computed(() => String(user.value?.role ?? 'user'));
  const isModerator = computed(() => role.value === 'moderator' || role.value === 'admin');

  function persist() {
    if (typeof window === 'undefined') {
      return;
    }

    if (!token.value) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: token.value, user: user.value }));
  }

  function hydrate() {
    if (typeof window === 'undefined') {
      return;
    }

    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = safeParse(raw);
    if (!parsed?.token) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    token.value = parsed.token;
    user.value = parsed.user ?? null;
  }

  async function login(email, password) {
    loading.value = true;
    error.value = '';

    try {
      const payload = await authLocalLogin(email, password);
      const session = payload?.session ?? {};
      token.value = String(session?.access_token ?? '');
      user.value = session?.user ?? payload?.user ?? null;

      if (!token.value) {
        throw new Error('Missing access token');
      }

      persist();
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudo iniciar sesión';
      token.value = '';
      user.value = null;
      persist();
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = '';
    user.value = null;
    error.value = '';
    persist();
  }

  return {
    token,
    user,
    loading,
    error,
    role,
    isAuthenticated,
    isModerator,
    hydrate,
    login,
    logout,
  };
});
