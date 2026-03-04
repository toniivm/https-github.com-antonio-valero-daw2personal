/**
 * Interfaz abstracta para Storage
 * Define los métodos que deben implementar todas las estrategias de almacenamiento
 */
export class StorageStrategy {
  save(key, data) {
    throw new Error("Método 'save' debe ser implementado");
  }

  load(key) {
    throw new Error("Método 'load' debe ser implementado");
  }

  remove(key) {
    throw new Error("Método 'remove' debe ser implementado");
  }

  clear() {
    throw new Error("Método 'clear' debe ser implementado");
  }
}

/**
 * Implementación concreta: LocalStorage
 */
export class LocalStorageStrategy extends StorageStrategy {
  save(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error('Error guardando en LocalStorage:', error);
      return false;
    }
  }

  load(key) {
    try {
      const serializedData = localStorage.getItem(key);
      return serializedData ? JSON.parse(serializedData) : null;
    } catch (error) {
      console.error('Error cargando de LocalStorage:', error);
      return null;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error eliminando de LocalStorage:', error);
      return false;
    }
  }

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error limpiando LocalStorage:', error);
      return false;
    }
  }
}

/**
 * Implementación concreta: SessionStorage
 */
export class SessionStorageStrategy extends StorageStrategy {
  save(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      sessionStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error('Error guardando en SessionStorage:', error);
      return false;
    }
  }

  load(key) {
    try {
      const serializedData = sessionStorage.getItem(key);
      return serializedData ? JSON.parse(serializedData) : null;
    } catch (error) {
      console.error('Error cargando de SessionStorage:', error);
      return null;
    }
  }

  remove(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error eliminando de SessionStorage:', error);
      return false;
    }
  }

  clear() {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error limpiando SessionStorage:', error);
      return false;
    }
  }
}

/**
 * Implementación concreta: Memory (para testing o fallback)
 */
export class MemoryStorageStrategy extends StorageStrategy {
  constructor() {
    super();
    this.storage = new Map();
  }

  save(key, data) {
    this.storage.set(key, data);
    return true;
  }

  load(key) {
    return this.storage.get(key) || null;
  }

  remove(key) {
    return this.storage.delete(key);
  }

  clear() {
    this.storage.clear();
    return true;
  }
}
