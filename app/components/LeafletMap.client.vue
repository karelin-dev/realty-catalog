<script setup>
// Живая карта на Leaflet и тайлах OpenStreetMap. Компонент только для браузера и грузится
// отдельным файлом: скрипт карты скачивается, только когда карту показывают.
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  markers: { type: Array, required: true }, // { id, coords, label, muted }
  activeId: { type: String, default: null },
  fitIds: { type: Array, default: null }, // по каким меткам подобрать масштаб; по умолчанию по всем активным
  zoom: { type: Number, default: 15 },
  wheel: { type: Boolean, default: false }
})
const emit = defineEmits(['select'])

const el = ref(null)
let L
let map
let layer

function icon(m, active) {
  const html = m.muted
    ? '<span class="lpin-muted"></span>'
    : `<span class="lpin${active ? ' is-active' : ''}"><span class="lpin__label">${m.label}</span><span class="lpin__stem"></span><span class="lpin__dot"></span></span>`
  return L.divIcon({ html, className: 'lpin-wrap', iconSize: [0, 0], iconAnchor: [0, 0] })
}

function draw(fit = false) {
  if (!map) return
  layer.clearLayers()
  for (const m of props.markers) {
    const active = m.id === props.activeId
    const marker = L.marker(m.coords, {
      icon: icon(m, active),
      keyboard: !m.muted,
      interactive: !m.muted,
      title: m.title || '',
      zIndexOffset: active ? 1000 : m.muted ? -1000 : 0
    })
    marker.on('click', () => emit('select', m.id))
    layer.addLayer(marker)
  }
  if (fit) fitView()
}

function fitView(ids = props.fitIds) {
  const points = props.markers.filter((m) => !m.muted && (!ids || ids.includes(m.id))).map((m) => m.coords)
  if (points.length === 1) map.setView(points[0], props.zoom)
  else if (points.length) map.fitBounds(points, { padding: [60, 60], maxZoom: 14 })
  else map.setView([59.94, 30.31], 11)
}

onMounted(async () => {
  L = (await import('leaflet')).default
  map = L.map(el.value, { zoomControl: false, scrollWheelZoom: props.wheel, attributionControl: false })
  L.control.zoom({ position: 'topright', zoomInTitle: 'Приблизить', zoomOutTitle: 'Отдалить' }).addTo(map)
  L.control.attribution({ prefix: '<a href="https://leafletjs.com">Leaflet</a>' }).addTo(map)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">участники OpenStreetMap</a>'
  }).addTo(map)
  layer = L.layerGroup().addTo(map)
  draw(true)
})

watch(() => props.markers.map((m) => `${m.id}:${m.muted}`).join(), () => draw(true))
watch(() => props.activeId, () => draw(false))

onBeforeUnmount(() => map?.remove())
defineExpose({
  invalidate: () => map?.invalidateSize(),
  fitAll: () => map && fitView(null)
})
</script>

<template>
  <div ref="el" class="lmap" role="region" aria-label="Карта объектов" />
</template>

<style>
.lmap {
  width: 100%;
  height: 100%;
  background: var(--stone);
  font-family: var(--sans);
}

.lmap .leaflet-tile-pane {
  filter: saturate(0.38) contrast(0.92) brightness(1.04);
}

.lmap .leaflet-control-zoom {
  border: 0;
  box-shadow: 0 4px 14px rgba(30, 36, 34, 0.16);
}

.lmap .leaflet-control-zoom a {
  width: 44px;
  height: 44px;
  color: var(--ink);
  font-size: 20px;
  line-height: 44px;
}

.lmap .leaflet-control-attribution {
  font-size: 11px;
}

.lpin-wrap {
  background: none;
  border: 0;
}

.lpin {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, calc(-100% + 3.5px));
  color: var(--ink);
  cursor: pointer;
}

.lpin__label {
  padding: 6px 10px;
  border-radius: 3px;
  background: #fff;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 6px 16px rgba(30, 36, 34, 0.2);
}

.lpin__stem {
  width: 1px;
  height: 10px;
  background: currentColor;
}

.lpin__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9);
}

.lpin:hover .lpin__label,
.lpin.is-active .lpin__label,
.leaflet-marker-icon:focus-visible .lpin__label {
  background: var(--brand);
  color: #fff;
}

.lpin.is-active,
.lpin:hover {
  color: var(--brand);
}

.lpin-muted {
  position: absolute;
  left: -5px;
  top: -5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 2px #a39a8d;
}
</style>
