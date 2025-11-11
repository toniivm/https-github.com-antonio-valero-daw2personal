/**
 * ui.js - Gestión de interfaz de usuario
 * Módulo responsable de eventos, formularios y actualización del DOM
 */

import * as spotsModule from './spots.js';
import * as mapModule from './map.js';

/**
 * Configurar todos los event listeners de la UI
 */
export function setupUI() {
    console.log('[UI] Configurando interfaz de usuario...');

    // Botón "Añadir spot"
    const btnAddSpot = document.getElementById('btn-add-spot');
    if (btnAddSpot) {
        btnAddSpot.addEventListener('click', () => {
            console.log('[UI] Abriendo modal para añadir spot');
            const modal = new bootstrap.Modal(document.getElementById('modalAddSpot'));
            modal.show();
        });
    }

    // Formulario de añadir spot
    const formAddSpot = document.getElementById('form-add-spot');
    if (formAddSpot) {
        formAddSpot.addEventListener('submit', handleAddSpotSubmit);
    }

    // Campo de búsqueda
    const searchInput = document.getElementById('search-spot');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Filtro por categoría
    const categoryFilter = document.getElementById('filter-category');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleCategoryFilter);
    }

    // Botón de geolocalización del formulario
    const btnGeolocateForm = document.getElementById('btn-geolocate-form');
    if (btnGeolocateForm) {
        btnGeolocateForm.addEventListener('click', handleGeolocate);
    }

    console.log('[UI] ✓ Interfaz configurada');
}

/**
 * Manejar envío del formulario de añadir spot
 */
async function handleAddSpotSubmit(e) {
    e.preventDefault();
    console.log('[UI] Enviando formulario de nuevo spot...');

    try {
        // Desactivar botón de envío
        const btnSubmit = document.getElementById('btn-save-spot');
        const originalText = btnSubmit.textContent;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

        // Obtener datos del formulario
        const title = document.getElementById('spot-title').value.trim();
        const description = document.getElementById('spot-description').value.trim();
        const latStr = document.getElementById('spot-lat').value.trim();
        const lngStr = document.getElementById('spot-lng').value.trim();
        const category = document.getElementById('spot-category').value.trim() || null;
        const tagsInput = document.getElementById('spot-tags').value;
        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
        const photoFile = document.getElementById('spot-photo').files[0] || null;

        // Validar datos
        const validationErrors = validateSpotForm(title, latStr, lngStr);
        
        if (validationErrors.length > 0) {
            showValidationErrors(validationErrors);
            btnSubmit.disabled = false;
            btnSubmit.textContent = originalText;
            return;
        }

        // Convertir coordenadas
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);

        // Crear FormData para envío con foto
        const spotData = {
            title,
            description: description || null,
            lat,
            lng,
            category,
            tags
        };

        console.log('[UI] Datos validados:', spotData);

        // Crear spot (sin pasar headers, dejar que spots.js maneje)
        const newSpot = await spotsModule.createSpot(spotData, photoFile);

        console.log('[UI] ✓ Spot creado exitosamente:', newSpot);

        // Limpiar formulario
        document.getElementById('form-add-spot').reset();
        document.getElementById('validation-summary').style.display = 'none';

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalAddSpot'));
        if (modal) modal.hide();

        // Recargar spots
        const spots = await spotsModule.loadSpots();
        spotsModule.displaySpots(spots, renderSpotList);

        // Enfocar nuevo spot en mapa
        if (newSpot.id) {
            mapModule.getMap().setView([newSpot.lat, newSpot.lng], 12);
        }

        showNotification('✓ Spot creado correctamente', 'success');

    } catch (error) {
        console.error('[UI] Error creando spot:', error);
        showNotification(`❌ Error: ${error.message}`, 'error');
    } finally {
        // Restaurar botón de envío
        const btnSubmit = document.getElementById('btn-save-spot');
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<strong>✓ Crear Spot</strong>';
    }
}

/**
 * Validar datos del formulario de spot
 * @param {string} title - Título del spot
 * @param {string} latStr - Latitud como string
 * @param {string} lngStr - Longitud como string
 * @returns {Array} Array de errores de validación
 */
function validateSpotForm(title, latStr, lngStr) {
    const errors = [];

    // Validar título
    if (!title || title.length === 0) {
        errors.push('El título es requerido');
    } else if (title.length < 3) {
        errors.push('El título debe tener al menos 3 caracteres');
    } else if (title.length > 255) {
        errors.push('El título no puede exceder 255 caracteres');
    }

    // Validar latitud
    if (!latStr || latStr.length === 0) {
        errors.push('La latitud es requerida');
    } else {
        const lat = parseFloat(latStr);
        if (isNaN(lat)) {
            errors.push('La latitud debe ser un número válido');
        } else if (lat < -90 || lat > 90) {
            errors.push('La latitud debe estar entre -90 y 90');
        }
    }

    // Validar longitud
    if (!lngStr || lngStr.length === 0) {
        errors.push('La longitud es requerida');
    } else {
        const lng = parseFloat(lngStr);
        if (isNaN(lng)) {
            errors.push('La longitud debe ser un número válido');
        } else if (lng < -180 || lng > 180) {
            errors.push('La longitud debe estar entre -180 y 180');
        }
    }

    return errors;
}

/**
 * Mostrar errores de validación en el formulario
 * @param {Array} errors - Array de mensajes de error
 */
function showValidationErrors(errors) {
    const summaryDiv = document.getElementById('validation-summary');
    const errorList = document.getElementById('validation-list');

    if (errors.length === 0) {
        summaryDiv.style.display = 'none';
        return;
    }

    errorList.innerHTML = '';
    errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = '⚠️ ' + error;
        errorList.appendChild(li);
    });

    summaryDiv.style.display = 'block';
    summaryDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Manejar búsqueda de spots
 */
async function handleSearch(e) {
    const searchTerm = e.target.value;
    console.log('[UI] Buscando:', searchTerm);

    try {
        const spots = await spotsModule.loadSpots();
        const filtered = spotsModule.searchSpots(spots, searchTerm);
        renderSpotList(filtered);

    } catch (error) {
        console.error('[UI] Error buscando spots:', error);
    }
}

/**
 * Manejar filtro por categoría
 */
async function handleCategoryFilter(e) {
    const category = e.target.value;
    console.log('[UI] Filtrando por categoría:', category);

    try {
        const spots = await spotsModule.loadSpots();
        const filtered = spotsModule.filterByCategory(spots, category);
        renderSpotList(filtered);

    } catch (error) {
        console.error('[UI] Error filtrando spots:', error);
    }
}

/**
 * Manejar geolocalización del usuario
 */
function handleGeolocate() {
    console.log('[UI] Solicitando geolocalización...');

    if (!navigator.geolocation) {
        alert('Geolocalización no soportada en este navegador');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            console.log(`[UI] ✓ Ubicación obtenida: ${lat}, ${lng}`);

            // Rellenar campos del formulario
            document.getElementById('spot-lat').value = lat.toFixed(6);
            document.getElementById('spot-lng').value = lng.toFixed(6);

            // Mover mapa a la ubicación
            mapModule.getMap().setView([lat, lng], 14);

            showNotification('Ubicación obtenida correctamente', 'success');
        },
        (error) => {
            console.error('[UI] Error de geolocalización:', error);
            alert('No se pudo obtener la ubicación: ' + error.message);
        }
    );
}

/**
 * Renderizar lista de spots en el sidebar
 * @param {Array} spots - Array de spots a mostrar
 */
export function renderSpotList(spots) {
    const spotList = document.getElementById('spot-list');
    if (!spotList) {
        console.warn('[UI] Elemento spot-list no encontrado');
        return;
    }

    if (!spots || spots.length === 0) {
        spotList.innerHTML = '<p class="text-muted">No hay spots cercanos</p>';
        return;
    }

    spotList.innerHTML = spots.map(spot => `
        <div class="list-group-item d-flex justify-content-between align-items-start">
            <div style="flex: 1;">
                <h6 class="mb-1">
                    <a href="#" onclick="window.focusSpot(${spot.id}); return false;">
                        ${escapeHtml(spot.title)}
                    </a>
                </h6>
                <p class="mb-1 text-muted">
                    <small>${escapeHtml(spot.description || 'Sin descripción')}</small>
                </p>
                <small class="text-secondary">
                    ${spot.lat.toFixed(4)}, ${spot.lng.toFixed(4)}
                </small>
                ${spot.category ? `<br><span class="badge bg-info">${escapeHtml(spot.category)}</span>` : ''}
            </div>
            <button class="btn btn-sm btn-outline-danger ms-2" onclick="window.deleteSpot(${spot.id})">
                🗑️
            </button>
        </div>
    `).join('');

    console.log(`[UI] ✓ Lista actualizada con ${spots.length} spots`);
}

/**
 * Mostrar notificación al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 */
export function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.container-fluid') || document.body;
    container.insertBefore(alertDiv, container.firstChild);

    // Auto-cerrar después de 4 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}

/**
 * Actualizar categorías en el filtro
 * @param {Array} spots - Array de spots
 */
export function updateCategoryFilter(spots) {
    const categoryFilter = document.getElementById('filter-category');
    if (!categoryFilter) return;

    const categories = spotsModule.getCategories(spots);
    const currentValue = categoryFilter.value;

    const options = [
        '<option value="all">Todas las categorías</option>',
        ...categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`)
    ];

    categoryFilter.innerHTML = options.join('');
    categoryFilter.value = currentValue;
}

/**
 * Habilitar geolocalización automática al cargar
 */
export function enableAutoGeolocate() {
    console.log('[UI] Intentando geolocalización automática...');

    if (!navigator.geolocation) {
        console.warn('[UI] Geolocalización no soportada');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const map = mapModule.getMap();
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 12);
            
            // Agregar marcador de usuario
            L.marker([lat, lng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(map).bindPopup('Tu ubicación');

            console.log('[UI] ✓ Geolocalización automática completada');
        },
        (error) => {
            console.warn('[UI] Geolocalización automática rechazada:', error);
        }
    );
}

/**
 * Función debounce para búsqueda
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Escapar HTML para prevenir XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Exportar deleteSpot y focusSpot a nivel global para onclick
window.deleteSpot = async function(spotId) {
    try {
        if (confirm('¿Eliminar este spot?')) {
            await spotsModule.deleteSpot(spotId);
            const spots = await spotsModule.loadSpots();
            spotsModule.displaySpots(spots, renderSpotList);
            showNotification('Spot eliminado', 'success');
        }
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
};

window.focusSpot = function(spotId) {
    spotsModule.focusSpot(spotId);
};
