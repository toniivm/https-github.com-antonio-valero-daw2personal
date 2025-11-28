import { LocalStorageStrategy, SessionStorageStrategy, MemoryStorageStrategy } from './StorageStrategy.js';

/**
 * Abstract Factory para crear diferentes tipos de Storage
 * Patrón de diseño AbstractFactory aplicado a la gestión de almacenamiento
 */
export class StorageFactory {
  static createStorage(type = 'local') {
    switch (type.toLowerCase()) {
      case 'local':
        return new LocalStorageStrategy();
      case 'session':
        return new SessionStorageStrategy();
      case 'memory':
        return new MemoryStorageStrategy();
      default:
        console.warn(`Tipo de storage '${type}' no reconocido. Usando LocalStorage por defecto.`);
        return new LocalStorageStrategy();
    }
  }

  /**
   * Crea el storage más apropiado según disponibilidad del navegador
   */
  static createBestAvailableStorage() {
    // Verificar si LocalStorage está disponible
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return new LocalStorageStrategy();
    } catch (e) {
      console.warn('LocalStorage no disponible, intentando SessionStorage');
    }

    // Verificar si SessionStorage está disponible
    try {
      const testKey = '__storage_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return new SessionStorageStrategy();
    } catch (e) {
      console.warn('SessionStorage no disponible, usando MemoryStorage');
    }

    // Fallback a memoria
    return new MemoryStorageStrategy();
  }
}
