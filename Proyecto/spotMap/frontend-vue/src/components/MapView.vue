<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import L from 'leaflet';

const props = defineProps({
  spots: {
    type: Array,
    default: () => [],
  },
  selectedSpot: {
    type: Object,
    default: null,
  },
});

const mapRoot = ref(null);
let map = null;
let layerGroup = null;

function getCoords(spot) {
  const lat = Number(spot?.latitude ?? spot?.lat);
  const lng = Number(spot?.longitude ?? spot?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return [lat, lng];
}

function renderMarkers() {
  if (!map || !layerGroup) {
    return;
  }

  layerGroup.clearLayers();
  const bounds = [];

  props.spots.forEach((spot) => {
    const coords = getCoords(spot);
    if (!coords) {
      return;
    }

    bounds.push(coords);
    const marker = L.marker(coords).addTo(layerGroup);
    marker.bindPopup(`<strong>${spot.title || 'Spot'}</strong><br>${spot.category || 'sin categoría'}`);
  });

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
  }
}

onMounted(() => {
  map = L.map(mapRoot.value, {
    zoomControl: true,
  }).setView([40.4168, -3.7038], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  layerGroup = L.layerGroup().addTo(map);
  renderMarkers();
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
    layerGroup = null;
  }
});

watch(
  () => props.spots,
  () => {
    renderMarkers();
  },
  { deep: true },
);

watch(
  () => props.selectedSpot,
  (spot) => {
    if (!map || !spot) {
      return;
    }
    const coords = getCoords(spot);
    if (!coords) {
      return;
    }
    map.flyTo(coords, 14, { duration: 0.6 });
  },
  { deep: true },
);
</script>

<template>
  <section class="map-panel">
    <div
      ref="mapRoot"
      class="map-root"
      aria-label="Mapa de spots"
    />
  </section>
</template>
