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
 * Estado centralizado de filtros
 */
export const filterState = {
    search: '',
    category: 'all',
    tag: 'all',
    onlyMine: false,
    distanceKm: 50,
    enableDistance: false,
    userLocation: null
};

function hasActiveFilters() {
    return Boolean(
        (filterState.search && filterState.search.trim()) ||
        (filterState.category && filterState.category !== 'all') ||
        (filterState.tag && filterState.tag !== 'all') ||
        filterState.onlyMine ||
        (filterState.enableDistance && filterState.userLocation)
    );
}

function toFiniteNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function getSpotCoords(spot) {
    const lat = toFiniteNumber(spot?.lat);
    const lng = toFiniteNumber(spot?.lng);
    return { lat, lng, valid: lat !== null && lng !== null };
}

function updateLoadMoreVisibility(currentSpotsCount = 0) {
    const container = document.getElementById('load-more-container');
    const button = document.getElementById('btn-load-more-spots');
    if (!container || !button || typeof spotsModule.getPaginationState !== 'function') {
        return;
    }

    const pagination = spotsModule.getPaginationState();
    const shouldShow = pagination.hasMore && !hasActiveFilters();

    container.style.display = shouldShow ? 'block' : 'none';
    if (!shouldShow) return;

    const remaining = Math.max(0, (pagination.total || 0) - currentSpotsCount);
    button.disabled = false;
    button.textContent = remaining > 0
        ? `Cargar más (${remaining} restantes)`
        : 'Cargar más';
}

async function handleLoadMoreSpots() {
    const button = document.getElementById('btn-load-more-spots');
    if (!button || typeof spotsModule.loadMoreSpots !== 'function') {
        return;
    }

    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Cargando...';

    try {
        const spots = await spotsModule.loadMoreSpots();

        if (hasActiveFilters()) {
            await applyFilters();
        } else {
            spotsModule.displaySpots(spots, renderSpotList);
        }

        updateCategoryFilter(spots);
        updateTagFilter(spots);
    } catch (error) {
        console.error('[UI] Error cargando más spots:', error);
        showToast('Error al cargar más spots', 'error');
    } finally {
        button.disabled = false;
        if (button.textContent === 'Cargando...') {
            button.textContent = originalText;
        }
    }
}

/**
 * Aplicar filtros en cascada
 */
export async function applyFilters() {
    try {
        let spots = await spotsModule.loadSpots();

        if (hasActiveFilters() && typeof spotsModule.ensureAllSpotsLoaded === 'function') {
            spots = await spotsModule.ensureAllSpotsLoaded();
        }
        
        if (!spots) {
            console.warn('[UI] No hay spots disponibles');
            renderSpotList([]);
            return;
        }
        
        // Filtro de búsqueda
        if (filterState.search && filterState.search.trim()) {
            spots = spotsModule.searchSpots(spots, filterState.search);
            console.log(`[UI] Búsqueda filtrada: ${spots.length} spots`);
        }
        
        // Filtro de categoría
        if (filterState.category && filterState.category !== 'all') {
            spots = spotsModule.filterByCategory(spots, filterState.category);
            console.log(`[UI] Categoría filtrada: ${spots.length} spots`);
        }
        
        // Filtro de tags
        if (filterState.tag && filterState.tag !== 'all') {
            spots = spotsModule.filterByTag(spots, filterState.tag);
            console.log(`[UI] Tags filtrados: ${spots.length} spots`);
        }
        
        // Filtro "Solo mis spots"
        if (filterState.onlyMine) {
            const user = getCurrentUser();
            if (user && user.id) {
                spots = spotsModule.filterByOwner(spots, user.id);
                console.log(`[UI] Mis spots: ${spots.length} spots`);
            } else {
                console.warn('[UI] Usuario no autenticado, no se puede mostrar Mis Spots');
                spots = [];
            }
        }
        
        // Filtro de distancia
        if (filterState.enableDistance && filterState.userLocation) {
            spots = spotsModule.filterByDistance(spots, filterState.userLocation, filterState.distanceKm);
            console.log(`[UI] Distancia filtrada: ${spots.length} spots`);
        }
        
        console.log(`[UI] Resultado final: ${spots.length} spots mostrados`);
        renderSpotList(spots);
        updateLoadMoreVisibility(spots.length);
    } catch (error) {
        console.error('[UI] Error aplicando filtros:', error);
        showToast(`Error al filtrar: ${error.message}`, 'error');
    }
}

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
                // Inicializar contadores de caracteres
                const spotTitle = document.getElementById('spot-title');
                const spotDescription = document.getElementById('spot-description');
                const spotTitleCount = document.getElementById('spot-title-count');
                const spotDescriptionCount = document.getElementById('spot-description-count');
                
                if (spotTitle && spotTitleCount) {
                    spotTitleCount.textContent = `${spotTitle.value.length}/255`;
                }
                if (spotDescription && spotDescriptionCount) {
                    spotDescriptionCount.textContent = `${spotDescription.value.length}/1000`;
                }
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

    const btnLoadMoreSpots = document.getElementById('btn-load-more-spots');
    if (btnLoadMoreSpots) {
        btnLoadMoreSpots.addEventListener('click', handleLoadMoreSpots);
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

    // === Nuevos filtros ===
    
    // Toggle "Mis Spots"
    const toggleMySpots = document.getElementById('toggle-my-spots');
    if (toggleMySpots) {
        toggleMySpots.addEventListener('change', (e) => {
            filterState.onlyMine = e.target.checked;
            applyFilters();
        });
    }

    // Filtro por tags
    const filterTag = document.getElementById('filter-tag');
    if (filterTag) {
        filterTag.addEventListener('change', async (e) => {
            filterState.tag = e.target.value;
            
            // Actualizar chips de tags si existen
            const tagChips = document.querySelectorAll('.tag-chip');
            tagChips.forEach(chip => {
                chip.classList.toggle('active', chip.dataset.tag === filterState.tag);
            });
            
            applyFilters();
        });
    }

    // Chips de tags (clickeables)
    document.addEventListener('click', (e) => {
        const tagChip = e.target.closest('.tag-chip');
        if (!tagChip) return;
        
        e.preventDefault();
        const tag = tagChip.dataset.tag;
        
        // Toggle: si ya está activo, deseleccionar
        if (filterState.tag === tag) {
            filterState.tag = 'all';
        } else {
            filterState.tag = tag;
        }
        
        // Actualizar select si existe
        const filterTag = document.getElementById('filter-tag');
        if (filterTag) {
            filterTag.value = filterState.tag;
        }
        
        applyFilters();
    });

    // Filtro de distancia
    const filterDistance = document.getElementById('filter-distance');
    const filterDistanceToggle = document.getElementById('filter-distance-toggle');
    const filterDistanceValue = document.getElementById('filter-distance-value');
    const distanceFilterContainer = document.getElementById('distance-filter-container');

    console.log('[UI] Elementos de distancia:', {
        filterDistance: filterDistance ? 'encontrado' : 'NO ENCONTRADO',
        filterDistanceToggle: filterDistanceToggle ? 'encontrado' : 'NO ENCONTRADO',
        filterDistanceValue: filterDistanceValue ? 'encontrado' : 'NO ENCONTRADO',
        distanceFilterContainer: distanceFilterContainer ? 'encontrado' : 'NO ENCONTRADO'
    });

    if (filterDistanceToggle) {
        filterDistanceToggle.addEventListener('change', (e) => {
            filterState.enableDistance = e.target.checked;
            console.log('[UI] Filtro de distancia:', filterState.enableDistance);
            
            // Mostrar/ocultar el contenedor de distancia
            if (distanceFilterContainer) {
                distanceFilterContainer.style.display = e.target.checked ? 'block' : 'none';
                console.log('[UI] Contenedor de distancia:', e.target.checked ? 'visible' : 'oculto');
            }
            
            if (filterState.enableDistance) {
                // Obtener geolocalización del usuario
                if (!navigator.geolocation) {
                    showToast('Geolocalización no disponible', 'warning');
                    e.target.checked = false;
                    filterState.enableDistance = false;
                    if (distanceFilterContainer) {
                        distanceFilterContainer.style.display = 'none';
                    }
                    return;
                }
                
                console.log('[UI] Solicitando ubicación del usuario...');
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        filterState.userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        console.log('[UI] ✓ Ubicación obtenida:', filterState.userLocation);
                        showToast(`📍 Ubicación obtenida: ${filterState.userLocation.lat.toFixed(3)}, ${filterState.userLocation.lng.toFixed(3)}`, 'success');
                        applyFilters();
                    },
                    (error) => {
                        console.error('[UI] Error de geolocalización:', error.message);
                        showToast('No se pudo obtener tu ubicación: ' + error.message, 'warning');
                        e.target.checked = false;
                        filterState.enableDistance = false;
                        if (distanceFilterContainer) {
                            distanceFilterContainer.style.display = 'none';
                        }
                    },
                    { timeout: 5000 }
                );
            } else {
                applyFilters();
            }
        });
    }

    if (filterDistance) {
        filterDistance.addEventListener('input', (e) => {
            filterState.distanceKm = parseInt(e.target.value);
            if (filterDistanceValue) {
                filterDistanceValue.textContent = `${filterState.distanceKm} km`;
            }
            if (filterState.enableDistance) {
                applyFilters();
            }
        });
    }

    // === Validación en vivo del formulario ===
    setupFormLiveValidation();

    // === Mostrar "Mi Spots" solo si autenticado ===
    if (isAuthenticated()) {
        const mySpotsContainer = document.getElementById('my-spots-container');
        if (mySpotsContainer) {
            mySpotsContainer.style.display = 'block';
        }
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
        
        // Obtener ambas imágenes (hasta 2)
        const photoFile1 = document.getElementById('spot-photo-1').files[0] || null;
        const photoFile2 = document.getElementById('spot-photo-2').files[0] || null;

        // Validar imágenes si están presentes
        if (photoFile1) {
            const imageValidation = await validateImage(photoFile1);
            if (!imageValidation.valid) {
                showToast('Error en la primera foto: ' + imageValidation.error, 'error');
                btnSubmit.disabled = false;
                btnSubmit.textContent = originalText;
                return;
            }
        }
        
        if (photoFile2) {
            const imageValidation = await validateImage(photoFile2);
            if (!imageValidation.valid) {
                showToast('Error en la segunda foto: ' + imageValidation.error, 'error');
                btnSubmit.disabled = false;
                btnSubmit.textContent = originalText;
                return;
            }
        }

        if (!photoFile1 && !photoFile2) {
            showToast('Debes agregar al menos una imagen', 'warning');
            btnSubmit.disabled = false;
            btnSubmit.textContent = originalText;
            return;
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

        // Crear FormData para envío con fotos
        const spotData = {
            title,
            description: description || null,
            lat,
            lng,
            category,
            tags
        };

        console.log('[UI] Datos validados:', spotData);
        console.log('[UI] Imágenes:', { image1: photoFile1 ? 'sí' : 'no', image2: photoFile2 ? 'sí' : 'no' });

        // Crear spot (sin pasar headers, dejar que spots.js maneje)
        const newSpot = await spotsModule.createSpot(spotData, photoFile1, photoFile2);

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

        // Limpiar formulario e imágenes
        document.getElementById('form-add-spot').reset();
        document.getElementById('validation-summary').style.display = 'none';
        
        // Limpiar previsualizaciones
        const { clearFormImages } = await import('./spotMapPicker.js');
        clearFormImages();

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

    filterState.search = searchTerm;
    applyFilters();
}

/**
 * Manejar filtro por categoría
 */
async function handleCategoryFilter(e) {
    const category = e.target.value;
    console.log('[UI] Filtrando por categoría:', category);

    filterState.category = category;
    applyFilters();
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
        updateLoadMoreVisibility(0);
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
    updateLoadMoreVisibility(spots.length);
}

/**
 * Renderizar card de spot en vista lista
 */
function renderSpotCardList(spot) {
    const imagePath = spot.image_path || spot.image_url || '';
    const imageHtml = imagePath 
        ? `<img src="${escapeHtml(imagePath)}" alt="${escapeHtml(spot.title)}" class="spot-card-image" loading="lazy" onerror="this.style.display='none';">`
        : '<div class="spot-card-no-image">📸 Sin imagen</div>';
    
    const isLiked = window.isSpotLiked ? window.isSpotLiked(spot.id) : false;
    
    // Verificar si puede borrar/editar (admin o propietario)
    const canDelete = typeof window.canDeleteSpot === 'function'
        ? window.canDeleteSpot(spot.id)
        : (() => {
            const user = getCurrentUser();
            const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
            const isOwner = user?.id && spot?.user_id && String(user.id) === String(spot.user_id);
            return isAuthenticated() && (isAdmin || isOwner);
        })();
    const canEdit = typeof window.canEditSpot === 'function'
        ? window.canEditSpot(spot.id)
        : (isAuthenticated() && getCurrentUser()?.role === 'admin');
    
    // Calcular distancia desde ubicación del usuario si está disponible
    let distanceHtml = '';
    const coords = getSpotCoords(spot);

    if (filterState.userLocation && coords.valid) {
        const distance = spotsModule.calculateDistanceKm(
            filterState.userLocation.lat,
            filterState.userLocation.lng,
            coords.lat,
            coords.lng
        );
        distanceHtml = `<span class="spot-distance" title="Distancia aproximada">📏 ${distance.toFixed(1)} km</span>`;
    }
    
    // Rating
    const rating = spot.rating || 0;
    const ratingCount = spot.rating_count || 0;
    let ratingHtml = '';
    if (rating > 0 || ratingCount > 0) {
        ratingHtml = `<span class="spot-rating" title="Calificación">⭐ ${rating.toFixed(1)} (${ratingCount})</span>`;
    }
    
    return `
        <div class="spot-card" onclick="window.openSpotDetailsModal(${JSON.stringify(spot).replace(/"/g, '&quot;')})">
            ${imageHtml}
            <div class="spot-card-content">
                <div class="spot-card-actions">
                    <button type="button" class="btn-social btn-like ${isLiked ? 'liked' : ''}" data-spot-id="${spot.id}" title="Añadir a favoritos" onclick="event.stopPropagation()">
                        <span class="like-icon">${isLiked ? '❤️' : '🤍'}</span>
                    </button>
                    <button type="button" class="btn-social btn-share" data-spot-id="${spot.id}" title="Compartir este lugar" onclick="event.stopPropagation()">
                        <i class="bi bi-share-fill"></i>
                    </button>
                    <button type="button" class="btn-social btn-details" data-spot-id="${spot.id}" title="Ver detalles" onclick="event.stopPropagation(); window.openSpotDetailsModal(${JSON.stringify(spot).replace(/"/g, '&quot;')})">
                        <i class="bi bi-eye-fill"></i>
                    </button>
                    ${canEdit ? `
                        <button type="button" class="btn-social btn-edit" onclick="event.stopPropagation(); window.openSpotDetailsModal(${JSON.stringify(spot).replace(/"/g, '&quot;')})" title="Editar spot">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                    ` : ''}
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
                <div class="spot-card-extra">
                    ${ratingHtml}
                    ${distanceHtml}
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="spot-card-meta">
                        📍 ${coords.valid ? `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}` : 'Coordenadas no disponibles'}
                    </small>
                    <div>
                        ${spot.status === 'pending' ? '<span class="badge bg-warning text-dark">⏳ Pendiente</span>' : ''}
                        ${spot.category ? `<span class="badge" data-category="${escapeHtml(spot.category.toLowerCase())}">${escapeHtml(spot.category)}</span>` : ''}
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
    
    // Verificar si puede borrar/editar (admin o propietario)
    const canDelete = typeof window.canDeleteSpot === 'function'
        ? window.canDeleteSpot(spot.id)
        : (() => {
            const user = getCurrentUser();
            const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
            const isOwner = user?.id && spot?.user_id && String(user.id) === String(spot.user_id);
            return isAuthenticated() && (isAdmin || isOwner);
        })();
    const canEdit = typeof window.canEditSpot === 'function'
        ? window.canEditSpot(spot.id)
        : (isAuthenticated() && getCurrentUser()?.role === 'admin');
    
    // Calcular distancia desde ubicación del usuario si está disponible
    let distanceHtml = '';
    const coords = getSpotCoords(spot);

    if (filterState.userLocation && coords.valid) {
        const distance = spotsModule.calculateDistanceKm(
            filterState.userLocation.lat,
            filterState.userLocation.lng,
            coords.lat,
            coords.lng
        );
        distanceHtml = `<span class="spot-distance" title="Distancia aproximada">📏 ${distance.toFixed(1)} km</span>`;
    }
    
    // Rating
    const rating = spot.rating || 0;
    const ratingCount = spot.rating_count || 0;
    let ratingHtml = '';
    if (rating > 0 || ratingCount > 0) {
        ratingHtml = `<span class="spot-rating" title="Calificación">⭐ ${rating.toFixed(1)}</span>`;
    }
    
    return `
        <div class="spot-card spot-card-grid" onclick="window.openSpotDetailsModal(${JSON.stringify(spot).replace(/"/g, '&quot;')})">
            ${imageHtml}
            <div class="spot-card-content">
                <div class="spot-card-actions">
                    <button type="button" class="btn-social btn-like ${isLiked ? 'liked' : ''}" data-spot-id="${spot.id}" title="Añadir a favoritos" onclick="event.stopPropagation()">
                        <span class="like-icon">${isLiked ? '❤️' : '🤍'}</span>
                    </button>
                    <button type="button" class="btn-social btn-share" data-spot-id="${spot.id}" title="Compartir este lugar" onclick="event.stopPropagation()">
                        <i class="bi bi-share-fill"></i>
                    </button>
                    <button type="button" class="btn-social btn-details" data-spot-id="${spot.id}" title="Ver detalles" onclick="event.stopPropagation(); window.openSpotDetailsModal(${JSON.stringify(spot).replace(/"/g, '&quot;')})">
                        <i class="bi bi-eye-fill"></i>
                    </button>
                    ${canEdit ? `
                        <button type="button" class="btn-social btn-edit" onclick="event.stopPropagation(); window.openSpotDetailsModal(${JSON.stringify(spot).replace(/"/g, '&quot;')})" title="Editar spot">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                    ` : ''}
                    ${canDelete ? `
                        <button type="button" class="btn-social btn-delete" onclick="event.stopPropagation(); window.confirmDeleteSpot(${spot.id})" title="Eliminar spot">
                            <i class="bi bi-trash3"></i>
                        </button>
                    ` : ''}
                </div>
                <h6 class="spot-card-title mb-1">
                    ${escapeHtml(spot.title)}
                </h6>
                <div class="spot-card-extra">
                    ${ratingHtml}
                    ${distanceHtml}
                </div>
                <div class="d-flex gap-1">
                    ${spot.status === 'pending' ? '<span class="badge bg-warning text-dark">⏳ Pendiente</span>' : ''}
                    ${spot.category ? `<span class="badge" data-category="${escapeHtml(spot.category.toLowerCase())}">${escapeHtml(spot.category)}</span>` : ''}
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
 * Actualizar filtro y chips de etiquetas
 * @param {Array} spots - Array de spots
 */
export function updateTagFilter(spots) {
    const filterTag = document.getElementById('filter-tag');
    const tagChips = document.getElementById('tag-chips');
    
    if (!filterTag && !tagChips) {
        console.warn('[UI] Elementos de filtro de tags no encontrados');
        return;
    }

    try {
        const tags = spotsModule.getTags(spots);
        console.log(`[UI] Tags extraídos: ${tags.length} etiquetas`, tags);
        
        // Actualizar select
        if (filterTag) {
            const currentValue = filterTag.value;
            const options = [
                '<option value="all">Todas las etiquetas</option>',
                ...tags.map(tag => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`)
            ];
            filterTag.innerHTML = options.join('');
            filterTag.value = currentValue;
        }
        
        // Actualizar chips visuales
        if (tagChips) {
            if (tags.length > 0) {
                tagChips.innerHTML = tags.slice(0, 8).map(tag => `
                    <button type="button" class="tag-chip" data-tag="${escapeHtml(tag)}" title="${escapeHtml(tag)}">
                        ${escapeHtml(tag)}
                    </button>
                `).join('');
                console.log(`[UI] Chips generados: ${Math.min(8, tags.length)} mostrados`);
            } else {
                tagChips.innerHTML = '';
                console.log('[UI] Sin etiquetas disponibles');
            }
        }
    } catch (error) {
        console.error('[UI] Error al actualizar filtro de tags:', error);
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
 * Geolocalización deshabilitada automáticamente.
 * Solo se solicita cuando el usuario habilita el filtro de distancia.
 */

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
/**
 * Configurar validación en vivo del formulario de spot
 */
function setupFormLiveValidation() {
    // Contador de caracteres del título
    const spotTitle = document.getElementById('spot-title');
    const spotTitleCount = document.getElementById('spot-title-count');
    
    if (spotTitle && spotTitleCount) {
        console.log('[UI] Configurando validación de título');
        const updateTitleCount = () => {
            const length = spotTitle.value.length;
            spotTitleCount.textContent = `${length}/255`;
            spotTitle.classList.toggle('is-invalid', length > 255);
        };
        
        spotTitle.addEventListener('input', updateTitleCount);
        spotTitle.addEventListener('blur', () => {
            if (spotTitle.value.length < 3 && spotTitle.value.length > 0) {
                spotTitle.classList.add('is-invalid');
            }
        });
    } else {
        console.warn('[UI] Elementos de título no encontrados para validación');
    }
    
    // Contador de caracteres de la descripción
    const spotDescription = document.getElementById('spot-description');
    const spotDescriptionCount = document.getElementById('spot-description-count');
    
    if (spotDescription && spotDescriptionCount) {
        console.log('[UI] Configurando validación de descripción');
        const updateDescriptionCount = () => {
            const length = spotDescription.value.length;
            spotDescriptionCount.textContent = `${length}/1000`;
            spotDescription.classList.toggle('is-invalid', length > 1000);
        };
        
        spotDescription.addEventListener('input', updateDescriptionCount);
    } else {
        console.warn('[UI] Elementos de descripción no encontrados para validación');
    }
    
    // Validación de coordenadas
    const spotLat = document.getElementById('spot-lat');
    const spotLng = document.getElementById('spot-lng');
    
    if (spotLat && spotLng) {
        console.log('[UI] Configurando validación de coordenadas');
        const validateCoords = () => {
            const lat = parseFloat(spotLat.value);
            const lng = parseFloat(spotLng.value);
            
            const latValid = lat >= -90 && lat <= 90;
            const lngValid = lng >= -180 && lng <= 180;
            
            spotLat.classList.toggle('is-invalid', !latValid && spotLat.value !== '');
            spotLng.classList.toggle('is-invalid', !lngValid && spotLng.value !== '');
        };
        
        spotLat.addEventListener('blur', validateCoords);
        spotLng.addEventListener('blur', validateCoords);
    } else {
        console.warn('[UI] Elementos de coordenadas no encontrados para validación');
    }
}