/**
 * auth.js - Sistema de autenticación con Supabase
 * Maneja login, registro, logout y estado de usuario
 */

import { showToast } from './notifications.js';

// Configuración de Supabase (usar variables del servidor)
const SUPABASE_URL = 'https://ptjkepxsjqyejkynjewc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0amtlcHhzanF5ZWpreW5qZXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDkyNDksImV4cCI6MjA3ODYyNTI0OX0._OPoGxMknS9VTzC16Zx_euobimiW1dzQnbpT5Ae3WQw';

let currentUser = null;

/**
 * Inicializar Supabase Auth
 */
export function initAuth() {
    console.log('[AUTH] Inicializando sistema de autenticación...');
    
    // Verificar si hay sesión guardada
    const session = getStoredSession();
    if (session) {
        currentUser = session.user;
        updateUIForLoggedInUser(currentUser);
    } else {
        updateUIForLoggedOutUser();
    }

    // Setup event listeners
    setupAuthListeners();
    
    console.log('[AUTH] ✓ Autenticación inicializada');
}

/**
 * Setup de listeners de formularios
 */
function setupAuthListeners() {
    // Login form
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('form-register');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Logout button
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Forgot password
    const forgotPasswordLink = document.getElementById('link-forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }
}

/**
 * Manejar login
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('login-remember').checked;

    if (!email || !password) {
        showToast('Por favor completa todos los campos', 'warning');
        return;
    }

    try {
        showToast('Iniciando sesión...', 'info', { autoCloseMs: 1000 });

        // Llamar a la API de Supabase para login
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error_description || 'Error al iniciar sesión');
        }

        // Guardar sesión
        const session = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            user: data.user
        };

        if (remember) {
            localStorage.setItem('spotmap_session', JSON.stringify(session));
        } else {
            sessionStorage.setItem('spotmap_session', JSON.stringify(session));
        }

        currentUser = data.user;
        updateUIForLoggedInUser(currentUser);

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalLogin'));
        modal.hide();

        showToast(`¡Bienvenido ${currentUser.email}!`, 'success');

    } catch (error) {
        console.error('[AUTH] Error en login:', error);
        showToast(error.message || 'Error al iniciar sesión', 'error');
    }
}

/**
 * Manejar registro
 */
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const termsAccepted = document.getElementById('register-terms').checked;

    // Validaciones
    if (!name || !email || !password || !passwordConfirm) {
        showToast('Por favor completa todos los campos', 'warning');
        return;
    }

    if (password !== passwordConfirm) {
        showToast('Las contraseñas no coinciden', 'warning');
        return;
    }

    if (password.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
        return;
    }

    if (!termsAccepted) {
        showToast('Debes aceptar los términos y condiciones', 'warning');
        return;
    }

    try {
        showToast('Creando cuenta...', 'info', { autoCloseMs: 1000 });

        // Llamar a la API de Supabase para registro
        const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                email,
                password,
                data: {
                    full_name: name
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error_description || 'Error al crear la cuenta');
        }

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegister'));
        modal.hide();

        showToast('¡Cuenta creada! Revisa tu email para confirmar', 'success');

        // Limpiar formulario
        document.getElementById('form-register').reset();

    } catch (error) {
        console.error('[AUTH] Error en registro:', error);
        showToast(error.message || 'Error al crear la cuenta', 'error');
    }
}

/**
 * Manejar logout
 */
async function handleLogout(e) {
    e.preventDefault();

    try {
        // Limpiar sesión local
        localStorage.removeItem('spotmap_session');
        sessionStorage.removeItem('spotmap_session');

        currentUser = null;
        updateUIForLoggedOutUser();

        showToast('Sesión cerrada correctamente', 'success');

    } catch (error) {
        console.error('[AUTH] Error en logout:', error);
        showToast('Error al cerrar sesión', 'error');
    }
}

/**
 * Manejar recuperación de contraseña
 */
async function handleForgotPassword(e) {
    e.preventDefault();

    const email = prompt('Ingresa tu email para recuperar tu contraseña:');
    
    if (!email) return;

    try {
        showToast('Enviando email de recuperación...', 'info', { autoCloseMs: 1500 });

        const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            throw new Error('Error al enviar el email');
        }

        showToast('Email de recuperación enviado. Revisa tu bandeja de entrada', 'success');

    } catch (error) {
        console.error('[AUTH] Error en recuperación:', error);
        showToast('Error al enviar el email de recuperación', 'error');
    }
}

/**
 * Actualizar UI cuando usuario está logueado
 */
function updateUIForLoggedInUser(user) {
    const loggedOut = document.getElementById('auth-logged-out');
    const loggedIn = document.getElementById('auth-logged-in');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');

    if (loggedOut) loggedOut.style.display = 'none';
    if (loggedIn) loggedIn.style.display = 'block';
    
    if (userName) {
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        userName.textContent = name;
    }

    if (userAvatar) {
        const seed = user.id || user.email;
        userAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    }

    console.log('[AUTH] ✓ UI actualizada para usuario logueado');
}

/**
 * Actualizar UI cuando usuario no está logueado
 */
function updateUIForLoggedOutUser() {
    const loggedOut = document.getElementById('auth-logged-out');
    const loggedIn = document.getElementById('auth-logged-in');

    if (loggedOut) loggedOut.style.display = 'flex';
    if (loggedIn) loggedIn.style.display = 'none';

    console.log('[AUTH] ✓ UI actualizada para usuario no logueado');
}

/**
 * Obtener sesión guardada
 */
function getStoredSession() {
    const localSession = localStorage.getItem('spotmap_session');
    const sessionSession = sessionStorage.getItem('spotmap_session');

    const sessionStr = localSession || sessionSession;
    
    if (!sessionStr) return null;

    try {
        return JSON.parse(sessionStr);
    } catch (error) {
        console.error('[AUTH] Error parseando sesión:', error);
        return null;
    }
}

/**
 * Obtener usuario actual
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * Verificar si el usuario está autenticado
 */
export function isAuthenticated() {
    return currentUser !== null;
}

/**
 * Obtener token de acceso
 */
export function getAccessToken() {
    const session = getStoredSession();
    return session?.access_token || null;
}
