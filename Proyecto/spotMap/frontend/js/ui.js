/**
 * ui.js - Gestión de interfaz de usuario
 * Módulo responsable de eventos, formularios y actualización del DOM
 */

import * as spotsModule from './spots.js';
import * as mapModule from './map.js';
import { showToast } from './notifications.js';
import { getFavoriteSpots } from './social.js';
import { validateImage } from './imageValidator.js';
import { isAuthenticated, getCurrentUser } from './auth.js';

/**
 * Configurar todos los event listeners de la UI
 */
export function setupUI() {
    console.log('[UI] Configurando interfaz de usuario...');

    // Botón "Añadir spot"
    const btnAddSpot = document.getElementById('btn-add-spot');
    if (btnAddSpot) {
        btnAddSpot.addEventListener('click', () => {
            // Validar autenticación
            if (!isAuthenticated()) {
                showToast('Debes iniciar sesión para crear spots', 'warning');
                return;
            }
            
            console.log('[UI] Abriendo modal para añadir spot');
            const modalEl = document.getElementById('modalAddSpot');
            const modal = new bootstrap.Modal(modalEl);

            // Accesibilidad: asegurar que aria-hidden no permanezca activo mientras hay foco dentro
            modalEl.addEventListener('shown.bs.modal', () => {
                modalEl.removeAttribute('aria-hidden');
            });
            modalEl.addEventListener('hidden.bs.modal', () => {
                modalEl.setAttribute('aria-hidden', 'true');
            });

            modal.show();
        });
    }

    // Botón favoritos: mostrar solo spots marcados como favoritos
    const btnFavorites = document.getElementById('btn-favorites');
    if (btnFavorites) {
        btnFavorites.addEventListener('click', async () => {
            const allSpots = await spotsModule.loadSpots();
            const favIds = getFavoriteSpots();
            const favoritesOnly = allSpots.filter(s => favIds.includes(s.id));
            renderSpotList(favoritesOnly);
            showToast(`Favoritos: ${favoritesOnly.length}`, 'info');
        });
    }

    // Evento delegado para clicks en botones de like (corazón)
    document.addEventListener('click', async (e) => {
        const likeBtn = e.target.closest('.btn-like');
        if (!likeBtn) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // Validar autenticación
        if (!isAuthenticated()) {
            showToast('Debes iniciar sesión para marcar favoritos', 'warning');
            return;
        }
        
        const spotId = parseInt(likeBtn.dataset.spotId);
        const { toggleLike } = await import('./social.js');
        await toggleLike(spotId, likeBtn);
    });

    // Botón toggle sidebar (móvil)
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    if (btnToggleSidebar && sidebar) {
        btnToggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            const expanded = sidebar.classList.contains('active');
            btnToggleSidebar.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });
    }

    // Botones de cambio de vista
    setupViewToggle();

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
 * Configurar toggle entre vista lista y grid
 */
function setupViewToggle() {
    const btnViewList = document.getElementById('btn-view-list');
    const btnViewGrid = document.getElementById('btn-view-grid');
    const spotList = document.getElementById('spot-list');

    if (!btnViewList || !btnViewGrid || !spotList) return;

    btnViewList.addEventListener('click', () => {
        btnViewList.classList.add('active');
        btnViewGrid.classList.remove('active');
        spotList.classList.remove('spot-grid-view');
        spotList.classList.add('spot-list-view');
        
        // Re-renderizar con vista lista
        spotsModule.loadSpots().then(spots => {
            renderSpotList(spots);
        });
    });

    btnViewGrid.addEventListener('click', () => {
        btnViewGrid.classList.add('active');
        btnViewList.classList.remove('active');
        spotList.classList.remove('spot-list-view');
        spotList.classList.add('spot-grid-view');
        
        // Re-renderizar con vista grid
        spotsModule.loadSpots().then(spots => {
            renderSpotList(spots);
        });
    });
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

        // Validar imagen si está presente
        if (photoFile) {
            const imageValidation = await validateImage(photoFile);
            if (!imageValidation.valid) {
                showToast('Error en la foto: ' + imageValidation.error, 'error');
                btnSubmit.disabled = false;
                btnSubmit.textContent = originalText;
                return;
            }
        }

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

        // Mensaje personalizado según estado
        if (newSpot.status === 'pending') {
            showToast(
                '✅ Spot creado correctamente\n\nTu spot está siendo verificado por nuestro equipo y aparecerá públicamente en breve.',
                'info',
                { autoCloseMs: 5000 }
            );
        } else {
            showToast('✓ Spot publicado correctamente', 'success');
        }

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

    } catch (error) {
        console.error('[UI] Error creando spot:', error);
        showToast(`❌ Error: ${error.message}`, 'error');
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

// Loading skeleton for spot list
export function showSpotListLoading() {
    const spotList = document.getElementById('spot-list');
    if (!spotList) return;
    
    spotList.setAttribute('aria-busy', 'true');
    const isGridView = spotList.classList.contains('spot-grid-view');
    
    if (isGridView) {
        spotList.innerHTML = Array.from({ length: 6 }).map(() => `
            <div class="skeleton-card">
                <div class="skeleton-image"></div>
                <div class="skeleton-text short"></div>
            </div>
        `).join('');
    } else {
        spotList.innerHTML = Array.from({ length: 4 }).map(() => `
            <div class="skeleton-card">
                <div class="skeleton-image"></div>
                <div class="skeleton-text long"></div>
                <div class="skeleton-text medium"></div>
                <div class="skeleton-text short"></div>
            </div>
        `).join('');
    }
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
        showToast('Geolocalización no soportada. Ingresa coordenadas manualmente.', 'warning');
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

            showToast('✓ Ubicación obtenida', 'success');
        },
        (error) => {
            console.warn('[UI] Geolocalización rechazada:', error.message);
            showToast('📍 Ingresa ubicación manualmente', 'info');
        },
        { timeout: 5000, enableHighAccuracy: false }
    );
}

/**
 * Renderizar lista de spots en el sidebar
 * @param {Array} spots - Array de spots a mostrar
 */
export function renderSpotList(spots) {
    const spotList = document.getElementById('spot-list');
    const spotCount = document.getElementById('spot-count');
    
    if (!spotList) {
        console.warn('[UI] Elemento spot-list no encontrado');
        return;
    }

    // Actualizar contador
    if (spotCount) {
        spotCount.textContent = spots ? spots.length : 0;
    }

    if (!spots || spots.length === 0) {
        spotList.innerHTML = '<p class="text-muted text-center py-4">No hay spots para mostrar</p>';
        return;
    }

    // Guardar referencia global para features sociales
    window.currentSpots = spots || [];

    // Detectar vista activa
    const isGridView = spotList.classList.contains('spot-grid-view');
    
    if (isGridView) {
        spotList.innerHTML = spots.map(spot => renderSpotCardGrid(spot)).join('');
    } else {
        spotList.innerHTML = spots.map(spot => renderSpotCardList(spot)).join('');
    }

    console.log(`[UI] ✓ Lista actualizada con ${spots.length} spots`);
}

/**
 * Renderizar card de spot en vista lista
 */
function renderSpotCardList(spot) {
    const imagePath = spot.image_path || '';
    const imageHtml = imagePath 
        ? `<img src="${escapeHtml(imagePath)}" alt="${escapeHtml(spot.title)}" class="spot-card-image" loading="lazy" onerror="this.style.display='none'">`
        : '';
    
    const isLiked = window.isSpotLiked ? window.isSpotLiked(spot.id) : false;
    
    // Verificar si puede borrar
    const user = getCurrentUser();
    const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
    const isOwner = spot.user_id === user?.id;
    const canDelete = isAuthenticated() && (isAdmin || isOwner);
    
    return `
        <div class="spot-card" onclick="window.openSpotDetails(${JSON.stringify(spot).replace(/"/g, '&quot;')})">
            ${imageHtml}
            <div class="spot-card-content">
                <div class="spot-card-actions">
                    <button type="button" class="btn-social btn-like ${isLiked ? 'liked' : ''}" data-spot-id="${spot.id}" title="Añadir a favoritos" onclick="event.stopPropagation()">
                        <span class="like-icon">${isLiked ? '❤️' : '🤍'}</span>
                    </button>
                    <button type="button" class="btn-social btn-share" data-spot-id="${spot.id}" title="Compartir este lugar" onclick="event.stopPropagation()">
                        <i class="bi bi-share-fill"></i>
                    </button>
                    <button type="button" class="btn-social btn-details" data-spot-id="${spot.id}" title="Ver detalles" onclick="event.stopPropagation(); window.openSpotDetails(${JSON.stringify(spot).replace(/"/g, '&quot;')})">
                        <i class="bi bi-eye-fill"></i>
                    </button>
                    ${canDelete ? `
                        <button type="button" class="btn-social btn-delete" onclick="event.stopPropagation(); window.confirmDeleteSpot(${spot.id})" title="Eliminar spot">
                            <i class="bi bi-trash3"></i>
                        </button>
                    ` : ''}
                </div>
                <h6 class="spot-card-title">
                    ${escapeHtml(spot.title)}
                </h6>
                <p class="spot-card-description">
                    ${escapeHtml(spot.description || 'Sin descripción')}
                </p>
                ${spot.status === 'pending' ? `
                    <div class="alert alert-warning small mb-2" style="padding: 0.5rem 0.75rem; font-size: 0.85rem;">
                        <strong>⏳ En verificación</strong><br>
                        Este spot está siendo revisado por nuestro equipo de moderación. Aparecerá públicamente en breve.
                    </div>
                ` : ''}
                <div class="d-flex justify-content-between align-items-center">
                    <small class="spot-card-meta">
                        📍 ${spot.lat.toFixed(3)}, ${spot.lng.toFixed(3)}
                    </small>
                    <div>
                        ${spot.status === 'pending' ? '<span class="badge bg-warning text-dark">⏳ Pendiente</span>' : ''}
                        ${spot.category ? `<span class="badge">${escapeHtml(spot.category)}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderizar card de spot en vista grid
 */
function renderSpotCardGrid(spot) {
    const imagePath = spot.image_path || '';
    const imageHtml = imagePath 
        ? `<img src="${escapeHtml(imagePath)}" alt="${escapeHtml(spot.title)}" class="spot-card-image" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="spot-card-image"></div>`;
    
    const isLiked = window.isSpotLiked ? window.isSpotLiked(spot.id) : false;
    
    // Verificar si puede borrar
    const user = getCurrentUser();
    const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
    const isOwner = spot.user_id === user?.id;
    const canDelete = isAuthenticated() && (isAdmin || isOwner);
    
    return `
        <div class="spot-card spot-card-grid" onclick="window.openSpotDetails(${JSON.stringify(spot).replace(/"/g, '&quot;')})">
            ${imageHtml}
            <div class="spot-card-content">
                <div class="spot-card-actions">
                    <button type="button" class="btn-social btn-like ${isLiked ? 'liked' : ''}" data-spot-id="${spot.id}" title="Añadir a favoritos" onclick="event.stopPropagation()">
                        <span class="like-icon">${isLiked ? '❤️' : '🤍'}</span>
                    </button>
                    <button type="button" class="btn-social btn-share" data-spot-id="${spot.id}" title="Compartir este lugar" onclick="event.stopPropagation()">
                        <i class="bi bi-share-fill"></i>
                    </button>
                    <button type="button" class="btn-social btn-details" data-spot-id="${spot.id}" title="Ver detalles" onclick="event.stopPropagation(); window.openSpotDetails(${JSON.stringify(spot).replace(/"/g, '&quot;')})">
                        <i class="bi bi-eye-fill"></i>
                    </button>
                    ${canDelete ? `
                        <button type="button" class="btn-social btn-delete" onclick="event.stopPropagation(); window.confirmDeleteSpot(${spot.id})" title="Eliminar spot">
                            <i class="bi bi-trash3"></i>
                        </button>
                    ` : ''}
                </div>
                <h6 class="spot-card-title mb-1">
                    ${escapeHtml(spot.title)}
                </h6>
                <div class="d-flex gap-1">
                    ${spot.status === 'pending' ? '<span class="badge bg-warning text-dark">⏳ Pendiente</span>' : ''}
                    ${spot.category ? `<span class="badge">${escapeHtml(spot.category)}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

/**
 * Actualizar categorías en el filtro
 * @param {Array} spots - Array de spots
 */
export function updateCategoryFilter(spots) {
    const categoryFilter = document.getElementById('filter-category');
    const categoryChips = document.getElementById('category-chips');
    
    if (!categoryFilter) return;

    const categories = spotsModule.getCategories(spots);
    const currentValue = categoryFilter.value;

    // Actualizar select
    const options = [
        '<option value="all">Todas las categorías</option>',
        ...categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`)
    ];

    categoryFilter.innerHTML = options.join('');
    categoryFilter.value = currentValue;

    // Actualizar chips visuales
    if (categoryChips && categories.length > 0) {
        categoryChips.innerHTML = categories.slice(0, 5).map(cat => `
            <button class="category-chip" data-category="${escapeHtml(cat)}" onclick="window.filterByChip('${escapeHtml(cat)}')">
                ${escapeHtml(cat)}
            </button>
        `).join('');
    }
}

/**
 * Filtrar por chip de categoría
 */
window.filterByChip = async function(category) {
    const categoryFilter = document.getElementById('filter-category');
    const chips = document.querySelectorAll('.category-chip');
    
    // Actualizar estado visual de chips
    chips.forEach(chip => {
        if (chip.dataset.category === category) {
            chip.classList.toggle('active');
            const isActive = chip.classList.contains('active');
            categoryFilter.value = isActive ? category : 'all';
        } else {
            chip.classList.remove('active');
        }
    });

    // Filtrar spots
    try {
        const spots = await spotsModule.loadSpots();
        const filtered = spotsModule.filterByCategory(spots, categoryFilter.value);
        renderSpotList(filtered);
    } catch (error) {
        console.error('[UI] Error filtrando por chip:', error);
    }
};

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
            showToast('Spot eliminado', 'success');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
};

window.focusSpot = function(spotId) {
    spotsModule.focusSpot(spotId);
};
