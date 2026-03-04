/**
 * imageValidator.js - Validación avanzada de imágenes
 * Verifica que las fotos sean reales y no corrupciones/tonterías
 */

/**
 * Validar que el archivo sea una imagen real y válida
 * @param {File} file - Archivo de imagen
 * @returns {Promise<{valid: boolean, error: string|null}>}
 */
export async function validateImage(file) {
  // 1. Validar que sea un archivo
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'No es un archivo válido' };
  }

  // 2. Validar tamaño (máx 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Imagen muy grande (máx 5MB)' };
  }

  // 3. Validar tipo MIME
  const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!VALID_TYPES.includes(file.type)) {
    return { valid: false, error: `Formato no válido. Usa: JPEG, PNG, WebP, GIF` };
  }

  // 4. Validar que sea imagen real (no corrupta)
  try {
    const isRealImage = await checkIfRealImage(file);
    if (!isRealImage) {
      return { valid: false, error: 'Archivo no parece ser una imagen válida' };
    }
  } catch (error) {
    console.warn('[Image] Error validando imagen:', error);
    // Permitir si la validación falla (fallback)
  }

  // 5. Validar dimensiones (mínimo razonable)
  try {
    const dimensions = await getImageDimensions(file);
    if (dimensions.width < 100 || dimensions.height < 100) {
      return { valid: false, error: 'Imagen demasiado pequeña (mín 100x100px)' };
    }
  } catch (error) {
    console.warn('[Image] Error obteniendo dimensiones:', error);
  }

  // ✅ Todo OK
  return { valid: true, error: null };
}

/**
 * Verificar si el archivo es realmente una imagen
 * @param {File} file
 * @returns {Promise<boolean>}
 */
async function checkIfRealImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const img = new Image();

    // Timeout para imágenes muy lentas
    const timeout = setTimeout(() => {
      resolve(false);
    }, 5000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    reader.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Obtener dimensiones de una imagen
 * @param {File} file
 * @returns {Promise<{width: number, height: number}>}
 */
async function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      reject(new Error('No se puede leer imagen'));
    };

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Error leyendo archivo'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Obtener preview de imagen (base64)
 * @param {File} file
 * @returns {Promise<string>} Data URL de la imagen
 */
export async function getImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Validar que no sea una imagen spam/NSFW (básico)
 * Nota: Para detección real, usar Google Vision API o similar
 * @param {File} file
 * @returns {Promise<{safe: boolean, confidence: number}>}
 */
export async function checkImageSafety(file) {
  // Por ahora: validación básica
  // En el futuro: integrar Google Vision API, AWS Rekognition, etc.

  const result = await validateImage(file);
  
  // Si pasa validación básica, asumir que es segura
  if (result.valid) {
    return { safe: true, confidence: 0.7 };
  }

  return { safe: false, confidence: 0.3 };
}

