/**
 * Modal Map Picker
 * Seleccionador de ubicación integrado en un modal con mapa interactivo
 * Muestra marcadores temporales (naranjas) mientras se selecciona
 */

let pickerMap = null;
let selectedMarker = null;
let selectedLat = null;
let selectedLng = null;

/**
 * Inicializar el mapa del selector en el modal
 */
export function initMapPickerModal() {
  const modalElement = document.getElementById('modalMapPicker');
  const mapContainer = document.getElementById('location-picker-map');
  const btnConfirmLocation = document.getElementById('btn-confirm-location');
  const btnMapPicker = document.getElementById('btn-map-picker');

  if (!modalElement || !mapContainer) {
    console.warn('[MapPickerModal] Modal elements not found');
    return;
  }

  // Evento al abrir el modal
  modalElement.addEventListener('show.bs.modal', function() {
    console.log('[MapPickerModal] Opening map picker modal');
    
    // Crear el mapa si no existe
    if (!pickerMap) {
      setTimeout(() => {
        initPickerMap();
      }, 100);
    } else {
      // Invalidar el tamaño del mapa para que se redibuje
      pickerMap.invalidateSize();
    }
  });

  // Evento al cerrar el modal
  modalElement.addEventListener('hide.bs.modal', function() {
    console.log('[MapPickerModal] Closing map picker modal');
    resetPicker();
  });

  // Botón confirmar ubicación
  btnConfirmLocation.addEventListener('click', function() {
    if (selectedLat !== null && selectedLng !== null) {
      confirmLocation();
    }
  });
}

/**
 * Inicializar el mapa dentro del modal
 */
function initPickerMap() {
  const mapContainer = document.getElementById('location-picker-map');
  
  if (!mapContainer || pickerMap) return;

  console.log('[MapPickerModal] Initializing picker map');

  // Crear mapa con Leaflet
  pickerMap = L.map(mapContainer).setView([40.4168, -3.7038], 13); // Madrid por defecto

  // Agregar tiles de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(pickerMap);

  // Listener para clicks en el mapa
  pickerMap.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    console.log('[MapPickerModal] Map clicked at', lat, lng);
    
    // Remover marcador anterior
    if (selectedMarker) {
      pickerMap.removeLayer(selectedMarker);
    }

    // Crear nuevo marcador en color naranja/rojo (temporal)
    selectedMarker = L.circleMarker([lat, lng], {
      radius: 10,
      fillColor: '#ff8c00', // Color naranja
      color: '#ff6500',
      weight: 3,
      opacity: 0.9,
      fillOpacity: 0.8,
    }).addTo(pickerMap);

    // Actualizar coordenadas seleccionadas
    selectedLat = lat;
    selectedLng = lng;

    // Habilitar botón confirmar
    document.getElementById('btn-confirm-location').disabled = false;

    // Centro del mapa en la ubicación
    pickerMap.setView([lat, lng], pickerMap.getZoom());
  });

  console.log('[MapPickerModal] Picker map initialized');
}

/**
 * Confirmar la ubicación seleccionada
 */
function confirmLocation() {
  if (selectedLat === null || selectedLng === null) {
    console.warn('[MapPickerModal] No location selected');
    return;
  }

  console.log('[MapPickerModal] Confirming location:', selectedLat, selectedLng);

  // Llenar los campos de coordenadas en el formulario
  const inputLat = document.getElementById('spot-lat');
  const inputLng = document.getElementById('spot-lng');

  if (inputLat && inputLng) {
    inputLat.value = selectedLat.toFixed(6);
    inputLng.value = selectedLng.toFixed(6);
    
    console.log('[MapPickerModal] Coordinates filled:', inputLat.value, inputLng.value);
    
    // Mostrar toast de confirmación
    showToast('✔️ Ubicación confirmada', 'success');
  }

  // Cerrar el modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalMapPicker'));
  if (modal) {
    modal.hide();
  }

  resetPicker();
}

/**
 * Resetear el selector
 */
function resetPicker() {
  console.log('[MapPickerModal] Resetting picker');

  if (selectedMarker && pickerMap) {
    pickerMap.removeLayer(selectedMarker);
  }

  selectedMarker = null;
  selectedLat = null;
  selectedLng = null;

  document.getElementById('btn-confirm-location').disabled = true;
}

/**
 * Mostrar toast de notificación
 */
function showToast(message, type = 'info') {
  // Crear elemento toast
  const toastDiv = document.createElement('div');
  toastDiv.className = `alert alert-${type} alert-dismissible fade show`;
  toastDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2000;
    min-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  toastDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild(toastDiv);

  // Autocierre después de 3 segundos
  setTimeout(() => {
    toastDiv.remove();
  }, 3000);
}
