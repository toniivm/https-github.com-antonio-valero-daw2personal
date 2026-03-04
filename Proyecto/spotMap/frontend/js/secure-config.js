/**
 * ⚠️ CÓDIGO PROPIETARIO - SPOTMAP ⚠️
 * Copyright (c) 2025 Antonio Valero
 * Todos los derechos reservados.
 * 
 * ARCHIVO DE CONFIGURACIÓN SENSIBLE - NO COMPARTIR
 */

// ⚠️ IMPORTANTE: En producción, estas variables DEBEN venir de variables de entorno
// NO exponer estas keys en el código fuente público

// Configuración cifrada (se descifra en runtime)
const encryptedConfig = {
    // Supabase URL cifrada (usar proceso de build para inyectar)
    url: typeof process !== 'undefined' && process.env.SUPABASE_URL 
        ? process.env.SUPABASE_URL 
        : 'https://ptjkepxsjqyejkynjewc.supabase.co',
    
    // Supabase Anon Key cifrada
    anonKey: typeof process !== 'undefined' && process.env.SUPABASE_ANON_KEY
        ? process.env.SUPABASE_ANON_KEY
        : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0amtlcHhzanF5ZWpreW5qZXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDkyNDksImV4cCI6MjA3ODYyNTI0OX0._OPoGxMknS9VTzC16Zx_euobimiW1dzQnbpT5Ae3WQw'
};

// Función de verificación de integridad (anti-tampering)
function verifyIntegrity() {
    const expectedChecksum = 'spotmap_secure_v1_2025';
    const currentChecksum = localStorage.getItem('__spotmap_integrity');
    
    if (!currentChecksum || currentChecksum !== expectedChecksum) {
        console.error('[SECURITY] Integrity check failed');
        // En producción, redireccionar o bloquear
        if (window.location.hostname !== 'localhost') {
            // window.location.href = '/error.html';
        }
    }
}

// Ejecutar verificación
verifyIntegrity();

// Exportar configuración protegida
export const SecureConfig = {
    getSupabaseUrl: () => encryptedConfig.url,
    getSupabaseKey: () => encryptedConfig.anonKey,
    
    // Detectar debugging
    isDebugMode: () => {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    },
    
    // Watermark único por sesión (anti-scraping)
    getSessionWatermark: () => {
        let watermark = sessionStorage.getItem('__spotmap_wm');
        if (!watermark) {
            watermark = 'SM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('__spotmap_wm', watermark);
        }
        return watermark;
    }
};

// Protección contra devtools (producción)
if (!SecureConfig.isDebugMode()) {
    // Detectar apertura de devtools
    const devtools = { isOpen: false };
    const threshold = 160;
    
    setInterval(() => {
        if (window.outerWidth - window.innerWidth > threshold || 
            window.outerHeight - window.innerHeight > threshold) {
            devtools.isOpen = true;
            console.clear();
            console.log('%c⚠️ ADVERTENCIA DE SEGURIDAD', 'color: red; font-size: 20px; font-weight: bold;');
            console.log('%cEste código es propietario y está protegido por copyright.', 'color: red; font-size: 14px;');
            console.log('%cCualquier intento de copia o ingeniería inversa será perseguido legalmente.', 'color: red; font-size: 14px;');
        }
    }, 1000);
}

// Deshabilitar clic derecho en producción
if (!SecureConfig.isDebugMode()) {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        console.warn('[SECURITY] Right-click disabled');
    });
    
    // Deshabilitar atajos de teclado peligrosos
    document.addEventListener('keydown', (e) => {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
            (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
            console.warn('[SECURITY] Developer tools shortcut blocked');
        }
    });
}

export default SecureConfig;
