<script setup>
// Статичная карта города на главной: картинка из тайлов OpenStreetMap и метки цен поверх.
// Без скриптов карты: страница грузится быстрее, а живая карта есть в каталоге.
const props = defineProps({ items: { type: Array, required: true } })

const MAP = { zoom: 11, center: [59.948, 30.312], width: 640, height: 600 }
const pins = computed(() =>
  props.items
    .filter((p) => p.district !== 'suburbs')
    .map((p) => ({ p, pos: projectToMap(p.coords, MAP) }))
    .filter(({ pos }) => pos.left > 5 && pos.left < 95 && pos.top > 8 && pos.top < 98)
)
</script>

<template>
  <div class="city-map">
    <img :src="asset('img/maps/city.webp')" width="640" height="600" alt="Карта Петербурга с объектами каталога" loading="lazy" decoding="async">
    <NuxtLink
      v-for="{ p, pos } in pins"
      :key="p.slug"
      :to="`/catalog/${p.slug}`"
      class="pin"
      :style="{ left: `${pos.left}%`, top: `${pos.top}%` }"
      :aria-label="`${shortTitle(p)}, ${formatPrice(p.price)}`"
    >
      <span class="pin__label">{{ formatMillions(p.price) }}</span>
      <span class="pin__stem" />
      <span class="pin__dot" />
    </NuxtLink>
    <span class="city-map__credit">© участники OpenStreetMap</span>
  </div>
</template>

<style scoped>
.city-map {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 0 0 1px var(--line-2);
}

.city-map img {
  width: 100%;
  height: auto;
}

.pin {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, calc(-100% + 3.5px));
  color: var(--ink);
  text-decoration: none;
}

.pin__label {
  padding: 6px 10px;
  border-radius: 3px;
  background: #fff;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 6px 16px rgba(30, 36, 34, 0.18);
  transition: background-color 0.2s, color 0.2s;
}

.pin__stem {
  width: 1px;
  height: 10px;
  background: currentColor;
}

.pin__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9);
}

.pin:hover,
.pin:focus-visible {
  z-index: 2;
  color: var(--brand);
}

.pin:hover .pin__label,
.pin:focus-visible .pin__label {
  background: var(--brand);
  color: #fff;
}

.city-map__credit {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.85);
  color: var(--ink-2);
  font-size: 11px;
}

@media (max-width: 600px) {
  .pin__label {
    padding: 4px 7px;
    font-size: 11.5px;
  }
}
</style>
