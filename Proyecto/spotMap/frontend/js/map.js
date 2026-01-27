/**
 * map.js - Gestión de mapa con Leaflet
 * Módulo responsable de crear y gestionar el mapa interactivo
 */

let map = null;
let markers = {};

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
        map = L.map('map').setView([40.4637, -3.7492], 6); // Centro España

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Nota: El selector de ubicación ahora usa modal (mapPickerModal.js)
        // No es necesario listener aquí

        console.log('[MAP] ✓ Mapa inicializado correctamente');
        return true;
    } catch (error) {
        console.error('[MAP] Error inicializando mapa:', error);
        return false;
    }
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
        <div style="width: 200px;">
            <h5>${escapeHtml(spot.title)}</h5>
            <p><small>${escapeHtml(spot.description || 'Sin descripción')}</small></p>
    `;

    // Agregar imagen si existe
    if (spot.image_path) {
        popupContent += `
            <img src="${escapeHtml(spot.image_path)}" 
                 alt="${escapeHtml(spot.title)}" 
                 style="width:100%; height:auto; border-radius:4px; margin:5px 0;">
        `;
    }

    popupContent += `
            <p><small>Lat: ${spot.lat.toFixed(4)}, Lng: ${spot.lng.toFixed(4)}</small></p>
            <button class="btn btn-sm btn-primary" onclick="window.openSpotDetails({id: ${spot.id}})">Ver detalles</button>
        </div>
    `;

    // Usar circleMarker más pequeño y discreto
    const marker = L.circleMarker([spot.lat, spot.lng], {
        radius: 8,
        fillColor: '#007bff',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    })
        .addTo(map)
        .bindPopup(popupContent);

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
