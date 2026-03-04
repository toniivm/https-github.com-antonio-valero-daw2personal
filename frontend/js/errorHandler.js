/**
 * errorHandler.js - Manejo centralizado y robusto de errores
 * Proporciona:
 * - Manejo global de excepciones no capturadas
 * - Wrapping seguro de promesas
 * - Logging estruturado de errores
 * - Recuperación automática de fallos
 */

const IS_DEV = window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';

let errorCount = 0;
const MAX_ERRORS_LOGGED = 100; // Evitar spam infinito de logs

/**
 * Wrapper seguro para funciones asíncronas
 * Retorna función que maneja errores automáticamente
 * @param {Function} fn - Función a envolver
 * @param {string} label - Etiqueta para debug
 * @returns {Function} Función envuelta
 */
export function safeAsync(fn, label = 'async-fn') {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(`${label}`, error);
      throw error; // Re-throw para que el caller pueda decidir
    }
  };
}

/**
 * Ejecutar código con fallback
 * @param {Function} main - Función principal a ejecutar
 * @param {Function} fallback - Función de fallback si main falla
 * @param {string} label - Etiqueta para debug
 * @returns {*} Resultado de main o fallback
 */
export async function withFallback(main, fallback, label = 'with-fallback') {
  try {
    return await main();
  } catch (error) {
    logError(`${label} - usando fallback`, error);
    try {
      return await fallback();
    } catch (fallbackError) {
      logError(`${label} - fallback también falló`, fallbackError);
      return null;
    }
  }
}

/**
 * Registrar error de manera estructurada
 * @param {string} context - Contexto del error
 * @param {Error} error - Objeto error
 * @param {Object} metadata - Datos adicionales
 */
export function logError(context, error, metadata = {}) {
  if (errorCount >= MAX_ERRORS_LOGGED) {
    return; // Deja de loguear para evitar spam
  }
  errorCount++;

  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    message: error?.message || String(error),
    stack: error?.stack || '',
    ...metadata
  };

  console.error(`[ERROR] ${context}:`, errorInfo);

  // En producción, enviar a servidor de monitoreo (si está disponible)
  if (!IS_DEV && window.errorReportEndpoint) {
    sendErrorToServer(errorInfo).catch(() => {
      // Silenciosamente fallar si no se puede enviar
    });
  }
}

/**
 * Enviar error al servidor de monitoreo (Sentry, LogRocket, etc)
 * @param {Object} errorInfo - Información del error
 */
async function sendErrorToServer(errorInfo) {
  try {
    await fetch(window.errorReportEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorInfo)
    });
  } catch (e) {
    // Ignorar errores en la transmisión de errores
  }
}

/**
 * Inicializar manejadores globales de errores
 */
export function initGlobalErrorHandlers() {
  // Errores no capturados en código síncrono
  window.addEventListener('error', (event) => {
    logError('Uncaught Error', event.error || new Error(event.message));
  });

  // Rechazos de promesas no manejadas
  window.addEventListener('unhandledrejection', (event) => {
    logError('Unhandled Promise Rejection', event.reason);
    event.preventDefault(); // Evitar que el navegador crashee
  });

  // Message desde service worker o iframes
  if (window.location !== window.parent.location) {
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'ERROR') {
        logError('Error from iframe/worker', new Error(event.data.message), {
          source: event.origin
        });
      }
    });
  }
}

/**
 * Wrapper para ejecutar código y recuperarse de errores
 * Útil para inicializaciones opcionales
 * @param {Function} fn - Función a ejecutar
 * @param {string} label - Etiqueta para logs
 * @param {*} defaultReturn - Valor por defecto si falla
 */
export function safeExecute(fn, label = 'safe-exec', defaultReturn = null) {
  try {
    return fn();
  } catch (error) {
    logError(`${label} failed, using default`, error);
    return defaultReturn;
  }
}

/**
 * Validar y limpiar datos antes de usar
 * @param {*} value - Valor a validar
 * @param {string} type - Tipo esperado ('object', 'array', 'string', 'number', 'boolean')
 * @param {*} defaultValue - Valor por defecto si no es válido
 * @returns {*} Valor validado o default
 */
export function validateData(value, type, defaultValue = null) {
  if (!value && value !== 0 && value !== false && value !== '') {
    return defaultValue;
  }

  const typeMap = {
    object: obj => typeof obj === 'object' && obj !== null && !Array.isArray(obj),
    array: arr => Array.isArray(arr),
    string: str => typeof str === 'string',
    number: num => typeof num === 'number' && !isNaN(num),
    boolean: bool => typeof bool === 'boolean',
    function: func => typeof func === 'function'
  };

  if (typeMap[type] && typeMap[type](value)) {
    return value;
  }

  logError(`Invalid data type`, new Error(`Expected ${type}, got ${typeof value}`));
  return defaultValue;
}

export default {
  safeAsync,
  withFallback,
  logError,
  initGlobalErrorHandlers,
  safeExecute,
  validateData
};
