/**
 * logger.js - Sistema de logging condicional para producción
 * Solo muestra logs en desarrollo (localhost)
 */

const IS_DEV = window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname === '';

/**
 * Log normal - solo en desarrollo
 */
export const log = IS_DEV ? console.log.bind(console) : () => {};

/**
 * Warning - solo en desarrollo  
 */
export const warn = IS_DEV ? console.warn.bind(console) : () => {};

/**
 * Error - siempre se registra (crítico)
 */
export const error = console.error.bind(console);

/**
 * Info - solo en desarrollo
 */
export const info = IS_DEV ? console.info.bind(console) : () => {};

/**
 * Debug - solo en desarrollo con flag adicional
 */
export const debug = (IS_DEV && localStorage.getItem('debug') === 'true') 
    ? console.debug.bind(console) 
    : () => {};

/**
 * Group - solo en desarrollo
 */
export const group = IS_DEV ? console.group.bind(console) : () => {};
export const groupEnd = IS_DEV ? console.groupEnd.bind(console) : () => {};

/**
 * Exportar flag de desarrollo para uso condicional
 */
export const isDevelopment = () => IS_DEV;

/**
 * Habilitar debug en runtime (solo dev)
 * Uso: En consola: localStorage.setItem('debug', 'true')
 */
if (IS_DEV) {
    console.log('%c[Logger] Modo desarrollo activado', 'color: #0ea5e9; font-weight: bold');
    console.log('[Logger] Para habilitar debug: localStorage.setItem("debug", "true")');
}
