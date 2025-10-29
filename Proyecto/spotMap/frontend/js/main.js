// main.js — Inicializa el mapa, carga spots y conecta UI
import { apiFetch } from './api.js';

let map;
let markers = new Map();
let spotsCache = [];

/** Inicializa el mapa Leaflet **/
function initMap() {
  map = L.map('map').setView([40.4168, -3.7038], 6); // España por defecto

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
  }).addTo(map);
}

/** Añade marcador al mapa **/
function addMarker(spot) {
  if (!spot.lat || !spot.lng) return;

  const marker = L.marker([spot.lat, spot.lng])
    .addTo(map)
    .bindPopup(`<strong>${spot.title}</strong><br>${spot.description || ''}`);

  markers.set(spot.id, marker);
}

/** Renderiza la lista lateral **/
function renderSpotList(spots) {
  const list = document.getElementById('spot-list');
  list.innerHTML = '';

  if (!spots.length) {
    list.innerHTML = '<li class="list-group-item text-muted">No se encontraron spots</li>';
    return;
  }

  for (const s of spots) {
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-action';
    li.textContent = s.title;
    li.addEventListener('click', () => {
      const marker = markers.get(s.id);
      if (marker) {
        map.setView(marker.getLatLng(), 13);
        marker.openPopup();
      }
    });
    list.appendChild(li);
  }
}

/** Carga spots desde la API o fallback local **/
async function loadSpots() {
  try {
    const data = await apiFetch('/spots');
    spotsCache = Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('API no disponible, usando datos locales', err);
    spotsCache = [
      { id: 1, title: 'Mirador de ejemplo', description: 'Bonitas vistas', lat: 40.4168, lng: -3.7038 },
      { id: 2, title: 'Playa ejemplo', description: 'Atardecer en la costa', lat: 43.317, lng: -1.986 }
    ];
  }

  // limpiar marcadores previos
  markers.forEach(m => map.removeLayer(m));
  markers = new Map();

  spotsCache.forEach(addMarker);
  renderSpotList(spotsCache);
}

/** Configura los eventos de la interfaz **/
function setupUI() {
  // Mostrar modal para añadir spot
  document.getElementById('btn-add-spot').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('modalAddSpot'));
    modal.show();
  });

  // Enviar formulario
  document.getElementById('form-add-spot').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);

    // Si no hay lat/lng, usar centro actual del mapa
    const center = map.getCenter();

    const payload = {
      title: data.get('title'),
      description: data.get('description'),
      lat: parseFloat(data.get('lat')) || center.lat,
      lng: parseFloat(data.get('lng')) || center.lng,
      tags: (data.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      await apiFetch('/spots', { method: 'POST', body: payload });
      await loadSpots();
      bootstrap.Modal.getInstance(document.getElementById('modalAddSpot')).hide();
      form.reset();
    } catch (err) {
      alert('Error creando spot: ' + (err.payload?.message || err.message));
    }
  });

  // Filtro de búsqueda
  document.getElementById('btn-filter').addEventListener('click', () => {
    const q = document.getElementById('search-input').value.toLowerCase();
    const cat = document.getElementById('category-filter').value;

    const filtered = spotsCache.filter(s => {
      const matchQ = !q || (s.title && s.title.toLowerCase().includes(q)) ||
        (s.tags && s.tags.join(',').toLowerCase().includes(q));
      const matchC = !cat || (s.category === cat);
      return matchQ && matchC;
    });

    markers.forEach(m => map.removeLayer(m));
    markers = new Map();
    filtered.forEach(addMarker);
    renderSpotList(filtered);
  });
}

/** Inicialización global **/
window.addEventListener('DOMContentLoaded', async () => {
  initMap();
  setupUI();
  await loadSpots();
});
