// spotMapPicker.js - Gestión de imágenes y utilidades de ubicación
import * as mapModule from './map.js';

/**
 * Inicializar selector de ubicación en el mapa (ahora usa modal)
 */
export function initMapPicker() {
    // Ya no se usa el selector inline, ahora usa modal con mapPickerModal.js
    console.log('[MAP-PICKER] Map picker initialized (modal-based)');
}

/**
 * Actualizar coordenadas en el formulario
 */
export function updateSpotCoordinates(lat, lng) {
    const inputLat = document.getElementById('spot-lat');
    const inputLng = document.getElementById('spot-lng');
    
    if (inputLat && inputLng) {
        inputLat.value = lat.toFixed(6);
        inputLng.value = lng.toFixed(6);
        console.log(`[MAP-PICKER] Coordenadas actualizadas: ${lat}, ${lng}`);
    }
}

/**
 * Inicializar previsualizaciones de imágenes
 */
export function initImagePreviews() {
    for (let i = 1; i <= 2; i++) {
        const inputId = `spot-photo-${i}`;
        const previewId = `preview-photo-${i}`;
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        
        if (input && preview) {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Validar tipo de archivo
                    if (!file.type.startsWith('image/')) {
                        alert('Por favor selecciona una imagen válida');
                        e.target.value = '';
                        preview.style.display = 'none';
                        return;
                    }
                    
                    // Validar tamaño (máximo 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        alert('La imagen no puede exceder 5MB');
                        e.target.value = '';
                        preview.style.display = 'none';
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = preview.querySelector('img');
                        img.src = event.target.result;
                        preview.style.display = 'block';
                        console.log(`[IMAGE-PREVIEW] Imagen ${i} cargada`);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
}

/**
 * Obtener archivos de imágenes del formulario
 */
export function getFormImages() {
    const images = [];
    for (let i = 1; i <= 2; i++) {
        const input = document.getElementById(`spot-photo-${i}`);
        if (input && input.files.length > 0) {
            images.push(input.files[0]);
        }
    }
    return images;
}

/**
 * Limpiar formulario de imágenes
 */
export function clearFormImages() {
    for (let i = 1; i <= 2; i++) {
        const input = document.getElementById(`spot-photo-${i}`);
        const preview = document.getElementById(`preview-photo-${i}`);
        
        if (input) input.value = '';
        if (preview) preview.style.display = 'none';
    }
    console.log('[IMAGE-PREVIEW] Imágenes limpias');
}
