/**
 * map.js - Gestión de mapa con Leaflet
 * Módulo responsable de crear y gestionar el mapa interactivo
 */

let map = null;
let markers = {};
let currentPopup = null; // Guardar el popup abierto

/**
 * Inicializar el mapa centrado en España
 */
export function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('[MAP] Contenedor del mapa no encontrado');
        return false;
    }

    try {
        map = L.map('map', {
            minZoom: 3,  // Deszoom más amplio (zoom 3)
            maxZoom: 18, // Zoom máximo 18
            maxBounds: [[-85, -180], [85, 180]], // Limites del mundo - evita repetición
            maxBoundsViscosity: 1.0, // Evita que se salga de los límites
            zoomControl: false // Quitamos controles por defecto, los pondremos mejor
        }).setView([40.4637, -3.7492], 6); // Centro España

        // Estilo moderno y limpio - CartoDB Voyager (colores suaves, moderno)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            maxZoom: 19,
            subdomains: 'abcd'
        }).addTo(map);

        // Agregar controles personalizados
        L.control.zoom({
            position: 'bottomright' // Esquina abajo derecha
        }).addTo(map);

        // Agregar escala
        L.control.scale({
            position: 'bottomleft',
            imperial: false // Solo métrico
        }).addTo(map);

        // Agregar CSS para animaciones de pulso
        addMarkerAnimationStyles();

        // Nota: El selector de ubicación ahora usa modal (mapPickerModal.js)
        // No es necesario listener aquí

        window.map = map; // Expose for legacy callers (auth.js)
        console.log('[MAP] ✓ Mapa inicializado correctamente');
        return true;
    } catch (error) {
        console.error('[MAP] Error inicializando mapa:', error);
        return false;
    }
}

/**
 * Obtener color según categoría del spot
 */
function getCategoryColor(category) {
    const colors = {
        'parque': '#22c55e',      // Verde
        'playa': '#3b82f6',       // Azul
        'mirador': '#f59e0b',     // Naranja
        'monumento': '#8b5cf6',   // Púrpura
        'restaurante': '#ef4444', // Rojo
        'cafe': '#ec4899',        // Rosa
        'museo': '#14b8a6',       // Turquesa
        'naturaleza': '#10b981',  // Verde esmeralda
        'montaña': '#78716c',     // Gris
        'default': '#06b6d4'      // Cian (por defecto)
    };
    
    if (!category) return colors.default;
    
    const lowerCategory = category.toLowerCase();
    return colors[lowerCategory] || colors.default;
}

/**
 * Agregar estilos CSS para animaciones de marcadores
 */
function addMarkerAnimationStyles() {
    if (document.getElementById('marker-animation-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'marker-animation-styles';
    style.textContent = `
        @keyframes marker-pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7);
            }
            50% {
                box-shadow: 0 0 0 10px rgba(6, 182, 212, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(6, 182, 212, 0);
            }
        }
        
        .leaflet-marker-icon {
            animation: marker-pulse 2s infinite;
        }
        
        .leaflet-marker-icon:hover {
            transform: scale(1.3);
            transition: transform 0.2s ease-out;
            z-index: 1000 !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Agregar marcador al mapa para un spot
 * @param {Object} spot - Objeto spot con id, title, lat, lng, image_path
 */
export function addMarker(spot) {
    if (!map) {
        console.warn('[MAP] Mapa no inicializado');
        return;
    }

    if (!spot.id || spot.lat === null || spot.lng === null) {
        console.warn('[MAP] Spot inválido:', spot);
        return;
    }

    // Crear popup con información del spot
    let popupContent = `
        <div style="width: 180px;">
            <h5 style="font-size: 16px; margin-bottom: 8px; font-weight: bold; color: #000;">${escapeHtml(spot.title)}</h5>
            <p><small style="font-size: 13px; color: #333;">${escapeHtml(spot.description || 'Sin descripción')}</small></p>
    `;

    // Agregar categoría si existe
    if (spot.category) {
        popupContent += `
            <p><small style="font-size: 12px; color: #666; margin: 5px 0;"><strong>📁 Categoría:</strong> ${escapeHtml(spot.category)}</small></p>
        `;
    }

    // Agregar imagen si existe
    if (spot.image_path) {
        popupContent += `
            <img src="${escapeHtml(spot.image_path)}" 
                 alt="${escapeHtml(spot.title)}" 
                 style="width:100%; height:80px; object-fit: cover; border-radius:4px; margin:5px 0;">
        `;
    }

    popupContent += `
            <p><small style="font-size: 12px; color: #666;">📍 Lat: ${spot.lat.toFixed(4)}, Lng: ${spot.lng.toFixed(4)}</small></p>
            <button class="btn btn-sm btn-primary" style="font-size: 13px; padding: 6px 10px;" onclick="window.openSpotDetailsModal(${JSON.stringify(spot).replace(/"/g, '&quot;')})">Ver spot</button>
        </div>
    `;

    // Obtener color según categoría
    const categoryColor = getCategoryColor(spot.category);

    // Marcador con colores personalizados y efecto hover
    const marker = L.circleMarker([spot.lat, spot.lng], {
        radius: 10,
        fillColor: categoryColor,
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.85,
        className: 'spot-marker' // Para animaciones CSS
    })
        .addTo(map)
        .bindPopup(popupContent);

    // Efectos hover - más grande y brillante al pasar el mouse
    marker.on('mouseover', function() {
        this.setStyle({
            radius: 14,
            weight: 4,
            fillOpacity: 1
        });
    });

    marker.on('mouseout', function() {
        this.setStyle({
            radius: 10,
            weight: 3,
            fillOpacity: 0.85
        });
    });

    // Cerrar el popup anterior cuando se abre uno nuevo
    marker.on('click', function() {
        if (currentPopup && currentPopup !== marker) {
            currentPopup.closePopup();
        }
        currentPopup = marker;
    });

    markers[spot.id] = marker;
    console.log(`[MAP] ✓ Marcador agregado: ${spot.title} (${spot.id})`);
}

/**
 * Actualizar marcador existente
 * @param {number} spotId - ID del spot
 * @param {Object} updatedSpot - Datos actualizados del spot
 */
export function updateMarker(spotId, updatedSpot) {
    if (markers[spotId]) {
        markers[spotId].remove();
        delete markers[spotId];
    }
    addMarker(updatedSpot);
}

/**
 * Eliminar marcador del mapa
 * @param {number} spotId - ID del spot
 */
export function removeMarker(spotId) {
    if (markers[spotId]) {
        markers[spotId].remove();
        delete markers[spotId];
        console.log(`[MAP] ✓ Marcador eliminado: ${spotId}`);
    }
}

/**
 * Limpiar todos los marcadores
 */
export function clearAllMarkers() {
    Object.values(markers).forEach(marker => marker.remove());
    markers = {};
    console.log('[MAP] ✓ Todos los marcadores eliminados');
}

/**
 * Obtener el mapa actual
 */
export function getMap() {
    return map;
}

/**
 * Obtener todos los marcadores
 */
export function getAllMarkers() {
    return markers;
}

/**
 * Helper: Escapar HTML para prevenir XSS
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
