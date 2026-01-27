/**
 * auth.js - Sistema de autenticación con Supabase
 * Maneja login, registro, logout y estado de usuario
 */

import { showToast } from './notifications.js';
import { getClient, getOrProvisionProfile, supabaseAvailable } from './supabaseClient.js';

let currentUser = null;
let currentRole = 'guest';

/**
 * Inicializar Supabase Auth
 */
export async function initAuth() {
    console.log('[AUTH] Inicializando sistema de autenticación...');
    const supabase = getClient();

    if (supabaseAvailable() && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            currentUser = data.session.user;
            await loadProfileRole();
            updateUIForLoggedInUser(currentUser);
        } else {
            updateUIForLoggedOutUser();
        }

        // Escuchar cambios de auth
        supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                currentUser = session.user;
                await loadProfileRole();
                updateUIForLoggedInUser(currentUser);
            } else {
                currentUser = null;
                currentRole = 'guest';
                updateUIForLoggedOutUser();
            }
        });
    } else {
        // Fallback: sesión manual previa
        const session = getStoredSession();
        if (session) {
            currentUser = session.user;
            updateUIForLoggedInUser(currentUser);
        } else {
            updateUIForLoggedOutUser();
        }
        setAuthUnavailableState();
    }

    setupAuthListeners();
    console.log('[AUTH] ✓ Autenticación inicializada');
}

function setAuthUnavailableState() {
    const loginBtn = document.getElementById('btn-login');
    const registerBtn = document.getElementById('btn-register');
    if (loginBtn) {
        loginBtn.setAttribute('disabled', 'disabled');
        loginBtn.setAttribute('title', 'Configura Supabase para iniciar sesión');
    }
    if (registerBtn) {
        registerBtn.setAttribute('disabled', 'disabled');
        registerBtn.setAttribute('title', 'Configura Supabase para registrarte');
    }
    showToast('Auth deshabilitado: falta supabaseConfig.js', 'warning', { autoCloseMs: 4000 });
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

    // Logout button - usar delegación de eventos global
    document.addEventListener('click', (e) => {
        const logoutBtn = e.target?.closest('#btn-logout');
        if (logoutBtn) {
            console.log('[AUTH] Click en logout button');
            e.preventDefault();
            e.stopPropagation();
            handleLogout(e);
        }
    });

    // Forgot password
    const forgotPasswordLink = document.getElementById('link-forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }

    // Dropdown toggle simple y directo
    // Usar delegación: detecta clicks en cualquier elemento y maneja el dropdown
    document.addEventListener('click', (e) => {
        const dropdownBtn = e.target?.closest('#auth-logged-in .dropdown-toggle');
        
        if (dropdownBtn) {
            console.log('[AUTH] Click en dropdown button');
            e.preventDefault();
            e.stopPropagation();
            
            const loggedInDiv = document.getElementById('auth-logged-in');
            const menu = loggedInDiv?.querySelector('.dropdown-menu');
            
            console.log('[AUTH] Menu encontrado:', !!menu);
            
            if (menu) {
                menu.classList.toggle('show');
                console.log('[AUTH] Menu ahora visible:', menu.classList.contains('show'));
            }
            return;
        }
        
        // Cerrar dropdown si clickeamos fuera
        const loggedInDiv = document.getElementById('auth-logged-in');
        if (loggedInDiv && !loggedInDiv.contains(e.target)) {
            const menu = loggedInDiv?.querySelector('.dropdown-menu');
            if (menu) {
                menu.classList.remove('show');
            }
        }
    });

    // Cerrar dropdown al clickear un item del menu
    document.addEventListener('click', (e) => {
        if (e.target?.closest('#auth-logged-in .dropdown-item')) {
            const loggedInDiv = document.getElementById('auth-logged-in');
            const menu = loggedInDiv?.querySelector('.dropdown-menu');
            if (menu) {
                menu.classList.remove('show');
            }
        }
    });

    console.log('[AUTH] ✓ Auth listeners configurados');
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
        const supabase = getClient();
        if (supabase) {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                currentUser = data.user;
                await loadProfileRole();
                updateUIForLoggedInUser(currentUser);
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalLogin'));
                if (modal) {
                    modal.hide();
                    // Limpiar backdrop manualmente
                    setTimeout(() => {
                        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                        // Reinicializar mapa
                        if (window.map) window.map.invalidateSize();
                    }, 300);
                }
                showToast(`¡Bienvenido ${currentUser.email}!`, 'success');
            } catch (supabaseError) {
                // Fallback a login local si Supabase falla
                console.warn('[AUTH] Supabase login falló, intentando fallback local:', supabaseError.message);
                await loginLocal(email, password);
            }
        } else {
            // Sin Supabase, usar login local
            await loginLocal(email, password);
        }
    } catch (error) {
        console.error('[AUTH] Error en login:', error);
        showToast(error.message || 'Error al iniciar sesión', 'error');
    }
}

/**
 * Login local (fallback cuando Supabase no está disponible)
 */
async function loginLocal(email, password) {
    try {
        console.log('[AUTH] Usando login local...');
        const response = await fetch('/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/auth-login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error en login local');
        }
        
        const result = await response.json();
        if (result.success && result.session) {
            currentUser = result.user;
            localStorage.setItem('spotmap_local_token', result.session.access_token);
            localStorage.setItem('spotmap_local_user', JSON.stringify(result.user));
            await loadProfileRole();
            updateUIForLoggedInUser(currentUser);
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalLogin'));
            if (modal) {
                modal.hide();
                // Limpiar backdrop manualmente
                setTimeout(() => {
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                    // Reinicializar mapa
                    if (window.map) window.map.invalidateSize();
                }, 300);
            }
            showToast(`¡Bienvenido ${currentUser.email}!`, 'success');
        }
    } catch (error) {
        console.error('[AUTH] Error en login local:', error);
        throw error;
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
        const supabase = getClient();
        if (supabase) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: name } }
            });
            if (error) throw error;
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegister'));
            if (modal) {
                modal.hide();
                // Limpiar backdrop manualmente
                setTimeout(() => {
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                    // Reinicializar mapa
                    if (window.map) window.map.invalidateSize();
                }, 300);
            }
            showToast('¡Cuenta creada! Revisa tu email para confirmar', 'success');
            document.getElementById('form-register').reset();
        } else {
            showToast('Supabase no disponible', 'error');
        }
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
    console.log('[AUTH] Ejecutando logout...');

    try {
        const supabase = getClient();
        if (supabase) {
            console.log('[AUTH] Cerrando sesión en Supabase...');
            await supabase.auth.signOut();
            console.log('[AUTH] ✓ Sesión cerrada en Supabase');
        }
        // Limpiar sesión local
        localStorage.removeItem('spotmap_session');
        sessionStorage.removeItem('spotmap_session');

        currentUser = null;
        console.log('[AUTH] ✓ Datos de sesión limpiados');
        
        updateUIForLoggedOutUser();

        showToast('Sesión cerrada correctamente', 'success');
        console.log('[AUTH] ✓ Logout completado');

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
        const supabase = getClient();
        if (supabase) {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            showToast('Email enviado. Revisa tu bandeja.', 'success');
        }
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

    if (loggedOut) {
        loggedOut.style.display = 'none';
        loggedOut.style.visibility = 'hidden';
    }
    if (loggedIn) {
        loggedIn.style.display = 'block';
        loggedIn.style.visibility = 'visible';
    }
    
    if (userName) {
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        userName.textContent = name;
    }

    if (userAvatar) {
        const seed = user.id || user.email;
        userAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    }

    toggleModerationVisibility();
    console.log('[AUTH] ✓ UI actualizada para usuario logueado (rol=' + currentRole + ')');
}

/**
 * Actualizar UI cuando usuario no está logueado
 */
function updateUIForLoggedOutUser() {
    const loggedOut = document.getElementById('auth-logged-out');
    const loggedIn = document.getElementById('auth-logged-in');

    if (loggedOut) {
        loggedOut.style.display = 'flex';
        loggedOut.style.visibility = 'visible';
    }
    if (loggedIn) {
        loggedIn.style.display = 'none';
        loggedIn.style.visibility = 'hidden';
    }

    const panel = document.getElementById('moderation-panel');
    if (panel) panel.style.display = 'none';
    currentRole = 'guest';
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
    if (!currentUser) return null;
    return {
        ...currentUser,
        role: currentRole
    };
}

export function getCurrentRole() {
    return currentRole;
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
export async function getAccessToken() {
    // Primero intentar obtener de Supabase
    if (supabaseAvailable()) {
        const supabase = getClient();
        if (supabase) {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.access_token) {
                return data.session.access_token;
            }
        }
    }
    
    // Fallback: sesión almacenada
    const session = getStoredSession();
    return session?.access_token || null;
}

async function loadProfileRole() {
    if (!currentUser) return;
    try {
        const profile = await getOrProvisionProfile(currentUser.id);
        currentRole = profile?.role || 'user';
    } catch (error) {
        console.warn('[AUTH] Error cargando rol del perfil:', error?.message);
        currentRole = 'user'; // Default role
    }
}

function toggleModerationVisibility() {
    const panel = document.getElementById('moderation-panel');
    if (!panel) return;
    
    const isModerator = currentRole === 'moderator' || currentRole === 'admin';
    panel.style.display = isModerator ? 'block' : 'none';
    
    // Si es moderador, cargar los spots pending
    if (isModerator && window.setupModerationPanel) {
        setTimeout(() => {
            window.setupModerationPanel();
        }, 100);
    }
}

