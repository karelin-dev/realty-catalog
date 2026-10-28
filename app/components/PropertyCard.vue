<script setup>
// Карточка объекта. Фото листаются свайпом (scroll-snap) или стрелками при наведении.
import { TYPES } from '~/data/properties'

const props = defineProps({
  property: { type: Object, required: true },
  active: { type: Boolean, default: false },
  priority: { type: Boolean, default: false },
  sizes: { type: String, default: '(max-width: 760px) 100vw, 400px' }
})
const emit = defineEmits(['hover'])

const p = computed(() => props.property)
const link = computed(() => `/catalog/${p.value.slug}`)
const title = computed(() => shortTitle(p.value))
const badge = computed(() => {
  if (p.value.type !== 'flat') return TYPES[p.value.type]
  return p.value.market === 'new' ? 'Новостройка' : 'Вторичное'
})

const track = ref(null)
const index = ref(0)
const COUNT = 4
// Фото 2–4 подгружаем, только когда с карточкой начали взаимодействовать:
// иначе каталог сразу скачал бы все 48 фото (lazy не работает внутри горизонтальной ленты)
const engaged = ref(false)
const engage = () => (engaged.value = true)

function activate() {
  emit('hover', p.value.slug)
  engage()
}

function go(step) {
  const el = track.value
  const next = Math.min(Math.max(index.value + step, 0), COUNT - 1)
  el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
}

function onScroll() {
  const el = track.value
  index.value = Math.round(el.scrollLeft / el.clientWidth)
}
</script>

<template>
  <article
    class="card"
    :class="{ 'is-active': active }"
    @mouseenter="activate"
    @mouseleave="emit('hover', null)"
    @focusin="activate"
  >
    <div class="card__media">
      <div ref="track" class="card__track" @scroll.passive="onScroll" @touchstart.passive="engage" @pointerdown="engage">
        <NuxtLink
          v-for="n in COUNT"
          :key="n"
          :to="link"
          class="card__slide"
          :tabindex="n === 1 ? undefined : -1"
          :aria-hidden="n === 1 ? undefined : 'true'"
          :aria-label="n === 1 ? title : undefined"
        >
          <img
            v-if="n === 1 || engaged"
            :src="photo(p.slug, n, 800)"
            :srcset="photoSrcset(p.slug, n)"
            :sizes="sizes"
            width="800"
            height="600"
            alt=""
            :loading="priority && n === 1 ? 'eager' : 'lazy'"
            :fetchpriority="priority && n === 1 ? 'high' : undefined"
            decoding="async"
          >
        </NuxtLink>
      </div>
      <span class="card__badge">{{ badge }}</span>
      <FavButton :slug="p.slug" :title="title" class="card__fav" />
      <button v-show="index > 0" type="button" class="card__nav card__nav--prev" aria-label="Предыдущее фото" tabindex="-1" @click="go(-1)">
        <AppIcon name="prev" :size="16" :stroke="2" />
      </button>
      <button v-show="index < COUNT - 1" type="button" class="card__nav card__nav--next" aria-label="Следующее фото" tabindex="-1" @click="go(1)">
        <AppIcon name="next" :size="16" :stroke="2" />
      </button>
      <span class="card__dots" aria-hidden="true">
        <span v-for="n in COUNT" :key="n" :class="{ 'is-on': index === n - 1 }" />
      </span>
    </div>

    <div class="card__body">
      <div class="card__price">
        <span class="card__total num">{{ formatPrice(p.price) }}</span>
        <span class="card__month num">от {{ formatPrice(monthlyFor(p.price)) }}/мес</span>
      </div>
      <NuxtLink :to="link" class="card__title">{{ title }}</NuxtLink>
      <span class="card__sub">{{ subTitle(p) }}</span>
      <div class="card__where">
        <span class="dot" :style="{ background: p.metro && !isCountry(p) ? lineColor(p.metro.line) : 'var(--brass)' }" />
        <span>{{ whereLabel(p) }}</span>
        <span class="card__district">{{ districtLabel(p) }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.card__media {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--stone);
}

.card.is-active .card__media {
  box-shadow: 0 0 0 2px var(--brand);
}

.card__track {
  display: flex;
  aspect-ratio: 4 / 3;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.card__track::-webkit-scrollbar {
  display: none;
}

.card__slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
}

.card__slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s;
}

.card:hover .card__slide img {
  transform: scale(1.02);
}

.card__badge {
  position: absolute;
  left: 12px;
  top: 12px;
  padding: 6px 10px;
  border-radius: 2px;
  background: #fff;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  pointer-events: none;
}

.card__fav {
  position: absolute;
  right: 10px;
  top: 10px;
}

.card__nav {
  position: absolute;
  top: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-top: -20px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  color: var(--ink);
  box-shadow: 0 4px 12px rgba(30, 36, 34, 0.18);
  opacity: 0;
  transition: opacity 0.2s;
}

.card__nav--prev {
  left: 10px;
}

.card__nav--next {
  right: 10px;
}

.card:hover .card__nav {
  opacity: 1;
}

@media (hover: none) {
  .card__nav {
    display: none !important;
  }
}

.card__dots {
  position: absolute;
  left: 50%;
  bottom: 12px;
  display: flex;
  gap: 5px;
  transform: translateX(-50%);
  pointer-events: none;
}

.card__dots span {
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.7);
  transition: width 0.2s;
}

.card__dots span.is-on {
  width: 16px;
  background: #fff;
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 18px;
}

.card__price {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 2px 12px;
}

.card__total {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 1.2;
}

.card__month {
  color: var(--brass-text);
  font-size: 13.5px;
  font-weight: 600;
}

.card__title {
  color: var(--ink);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
}

.card__title:hover {
  color: var(--brand);
}

.card__sub {
  color: var(--muted);
  font-size: 14px;
}

.card__where {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
  color: var(--ink-2);
  font-size: 14px;
}

.card__district {
  margin-left: auto;
  color: var(--muted);
  white-space: nowrap;
}
</style>
