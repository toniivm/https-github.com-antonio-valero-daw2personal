/**
 * oauth.js - Gestión de autenticación con redes sociales
 * Copyright (c) 2026 Antonio Valero
 */

/**
 * Inicializar botones de OAuth
 */
export function initOAuthButtons() {
    console.log('[OAUTH] Inicializando botones de OAuth...');
    
    document.getElementById('btn-login-google')?.addEventListener('click', () => initiateOAuth('google'));
    document.getElementById('btn-login-facebook')?.addEventListener('click', () => initiateOAuth('facebook'));
    document.getElementById('btn-login-twitter')?.addEventListener('click', () => initiateOAuth('twitter'));
    document.getElementById('btn-login-instagram')?.addEventListener('click', () => initiateOAuth('instagram'));
    
    console.log('[OAUTH] ✓ Botones inicializados');
}

/**
 * Iniciar flujo OAuth con el proveedor especificado
 */
export async function initiateOAuth(provider) {
    try {
        console.log(`[OAUTH] Iniciando login con ${provider}...`);
        
        // Mostrar loading
        showToast(`Conectando con ${provider}...`, 'info');
        
        // Llamar a backend para obtener URL de OAuth
        const response = await fetch(`/backend/public/api.php?action=oauth_init&provider=${provider}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        const data = await response.json();
        
        if (data.success && data.data?.url) {
            // Redirigir a la URL de OAuth
            window.location.href = data.data.url;
        } else {
            throw new Error(data.message || 'OAuth initialization failed');
        }
    } catch (error) {
        console.error(`[OAUTH] Error: ${error.message}`);
        showToast(`Error conectando con ${provider}`, 'error');
    }
}

/**
 * Procesar callback de OAuth después de que el usuario se autentica
 */
export async function handleOAuthCallback() {
    try {
        const params = new URLSearchParams(window.location.search);
        const provider = params.get('provider');
        const code = params.get('code');
        
        if (!provider || !code) {
            console.log('[OAUTH] No hay parámetros de callback');
            return;
        }
        
        console.log(`[OAUTH] Procesando callback de ${provider}...`);
        
        // Llamar a backend para completar el flujo OAuth
        const response = await fetch('/backend/public/api.php?action=oauth_callback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                provider,
                code,
            }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log(`[OAUTH] ✓ Login exitoso con ${provider}`);
            
            // Guardar token
            localStorage.setItem('auth_token', data.data?.token);
            localStorage.setItem('user_id', data.data?.user_id);
            localStorage.setItem('user_provider', provider);
            
            showToast(`¡Bienvenido ${data.data?.name}!`, 'success');
            
            // Limpiar URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Recargar página para actualizar estado de auth
            setTimeout(() => window.location.reload(), 1500);
        } else {
            throw new Error(data.message || 'OAuth callback failed');
        }
    } catch (error) {
        console.error(`[OAUTH] Error en callback: ${error.message}`);
        showToast(`Error autenticándose: ${error.message}`, 'error');
    }
}

/**
 * Enlazar cuenta existente con red social
 */
export async function linkOAuthAccount(provider) {
    try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            showToast('Debes estar logueado para enlazar cuenta', 'error');
            return;
        }
        
        console.log(`[OAUTH] Enlazando cuenta con ${provider}...`);
        
        const response = await fetch(`/backend/public/api.php?action=oauth_link&provider=${provider}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({ user_id: userId }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Cuenta enlazada con ${provider}`, 'success');
            return true;
        } else {
            throw new Error(data.message || 'Linking failed');
        }
    } catch (error) {
        console.error(`[OAUTH] Error al enlazar: ${error.message}`);
        showToast(`Error enlazando cuenta: ${error.message}`, 'error');
        return false;
    }
}

/**
 * Desenlazar cuenta de red social
 */
export async function unlinkOAuthAccount(provider) {
    try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            showToast('Debes estar logueado', 'error');
            return;
        }
        
        console.log(`[OAUTH] Desenlazando cuenta de ${provider}...`);
        
        const response = await fetch(`/backend/public/api.php?action=oauth_unlink&provider=${provider}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({ user_id: userId }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Cuenta desenlazada de ${provider}`, 'success');
            return true;
        } else {
            throw new Error(data.message || 'Unlinking failed');
        }
    } catch (error) {
        console.error(`[OAUTH] Error al desenlazar: ${error.message}`);
        showToast(`Error desenlazando cuenta: ${error.message}`, 'error');
        return false;
    }
}

/**
 * Helper para mostrar toast (importar desde notifications.js)
 */
function showToast(message, type = 'info') {
    // Import desde notifications.js si está disponible
    try {
        const toastFunc = window.showToast || console.log;
        toastFunc(message, type);
    } catch (e) {
        console.log(`[TOAST] ${type.toUpperCase()}: ${message}`);
    }
}
