<script setup>
import { properties } from '~/data/properties'

definePageMeta({ layout: 'compact' })

const config = useRuntimeConfig()
useSeoMeta({
  title: 'Каталог: квартиры и дома в Петербурге',
  description: 'Квартиры, апартаменты и загородные дома в Петербурге и пригороде. Фильтры по цене или платежу в месяц, районам и метро, карта объектов.',
  ogTitle: 'Каталог недвижимости «Литера»',
  ogUrl: `${config.public.siteUrl}/catalog/`
})
useHead({ link: [{ rel: 'canonical', href: `${config.public.siteUrl}/catalog/` }] })

const { filters: routeFilters, update, reset } = useCatalogFilters()

// Страница собрана заранее без параметров. Чтобы разметка совпала при загрузке,
// первый раз рисуем без фильтров, а фильтры из адреса применяем сразу после этого.
const mounted = ref(false)
const filters = computed(() => (mounted.value ? routeFilters.value : parseFilters({})))
const results = computed(() => applyFilters(properties, filters.value))
const chips = computed(() => activeChips(filters.value))

const activeSlug = ref(null)
const panelOpen = ref(false)
const mapOpen = ref(false)
const isDesktop = ref(false)
const sideMap = ref(null)

const showSideMap = computed(() => isDesktop.value && filters.value.view === 'map')
const markers = computed(() =>
  properties.map((p) => ({
    id: p.slug,
    coords: p.coords,
    label: formatMillions(p.price),
    title: `${shortTitle(p)}, ${formatPrice(p.price)}`,
    muted: !results.value.includes(p)
  }))
)
// Масштаб карты подбираем по городским объектам, загородные видно, если отдалить карту
const cityIds = computed(() => results.value.filter((p) => p.district !== 'suburbs').map((p) => p.slug))
const suburbCount = computed(() => results.value.length - cityIds.value.length)
const fitIds = computed(() => (cityIds.value.length ? cityIds.value : null))
const selected = computed(() => properties.find((p) => p.slug === activeSlug.value) || null)

let mql
function onMedia() {
  isDesktop.value = mql.matches
}

onMounted(() => {
  mounted.value = true
  mql = window.matchMedia('(min-width: 1181px)')
  onMedia()
  mql.addEventListener('change', onMedia)
})
onBeforeUnmount(() => mql?.removeEventListener('change', onMedia))

function onPinSelect(slug) {
  activeSlug.value = slug
  if (!mapOpen.value) document.getElementById(`card-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function openMap() {
  activeSlug.value = results.value[0]?.slug || null
  mapOpen.value = true
}
</script>

<template>
  <div>
    <div class="side head">
      <nav aria-label="Хлебные крошки" class="crumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Каталог</span>
      </nav>
      <div class="head__row">
        <h1 class="h1">Купить квартиру или дом в&nbsp;Петербурге</h1>
        <p class="head__intro">Квартиры, апартаменты и загородные дома. Каждый объект проверен юристом до публикации.</p>
      </div>
    </div>

    <FilterBar :filters="filters" @update="update" @open-panel="panelOpen = true" @open-map="openMap" />

    <div class="results side" :class="{ 'results--map': showSideMap }">
      <section class="list" aria-labelledby="results-title">
        <div class="list__head">
          <h2 id="results-title" class="list__count" aria-live="polite">{{ objectsWord(results.length) }}</h2>
          <span v-if="chips.length" class="list__total">из {{ properties.length }}</span>
          <button v-for="c in chips" :key="c.key" type="button" class="list__chip" :aria-label="`Убрать фильтр: ${c.label}`" @click="update(c.reset)">
            {{ c.label }} <AppIcon name="close" :size="12" :stroke="2.4" />
          </button>
          <button v-if="chips.length" type="button" class="text-btn" @click="reset">Сбросить</button>
        </div>

        <EmptyResults v-if="!results.length" :filters="filters" @update="update" @reset="reset" />

        <div v-else class="cards" :class="{ 'cards--wide': !showSideMap }">
          <PropertyCard
            v-for="(p, i) in results"
            :id="`card-${p.slug}`"
            :key="p.slug"
            :property="p"
            :active="showSideMap && activeSlug === p.slug"
            :priority="i < 2"
            :sizes="showSideMap ? '(max-width: 1180px) 50vw, 400px' : '(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 400px'"
            @hover="activeSlug = $event"
          />
          <aside class="pick">
            <span class="eyebrow">Подбор</span>
            <p class="pick__title">Покажем варианты, которых ещё нет на&nbsp;сайте</p>
            <p class="pick__text">Расскажите о бюджете и районе: агент соберёт подборку за день. Бесплатно.</p>
            <NuxtLink to="/#lead" class="btn btn--primary">Оставить заявку</NuxtLink>
          </aside>
        </div>
      </section>

      <div v-if="filters.view === 'map'" class="mapcol" aria-label="Карта объектов">
        <LazyLeafletMap
          v-if="showSideMap"
          ref="sideMap"
          :markers="markers"
          :fit-ids="fitIds"
          :active-id="activeSlug"
          wheel
          @select="onPinSelect"
        />
        <button v-if="showSideMap && suburbCount && cityIds.length" type="button" class="mapcol__more" @click="sideMap?.fitAll()">
          Показать ещё {{ objectsWord(suburbCount) }} за городом
        </button>
      </div>
    </div>

    <FiltersPanel :open="panelOpen" :filters="filters" @close="panelOpen = false" @apply="update" />

    <AppDialog :open="mapOpen" variant="full" label="Объекты на карте" @close="mapOpen = false">
      <div class="mmap">
        <div class="mmap__bar">
          <button type="button" class="icon-btn" aria-label="Вернуться к списку" @click="mapOpen = false">
            <AppIcon name="prev" :size="19" />
          </button>
          <span class="mmap__title">{{ objectsWord(results.length) }} на карте</span>
          <button type="button" class="btn btn--outline mmap__filters" @click="panelOpen = true">Фильтры</button>
        </div>
        <div class="mmap__map">
          <LazyLeafletMap v-if="mapOpen" :markers="markers" :fit-ids="fitIds" :active-id="activeSlug" wheel @select="onPinSelect" />
        </div>
        <NuxtLink v-if="selected" :to="`/catalog/${selected.slug}`" class="mmap__card">
          <img :src="photo(selected.slug, 1, 400)" width="400" height="300" alt="">
          <span class="mmap__info">
            <strong class="num">{{ formatPrice(selected.price) }}</strong>
            <span class="mmap__month num">от {{ formatPrice(monthlyFor(selected.price)) }}/мес</span>
            <span>{{ shortTitle(selected) }}</span>
            <span class="mmap__where">{{ whereLabel(selected) }}</span>
          </span>
        </NuxtLink>
      </div>
    </AppDialog>
  </div>
</template>

<style scoped>
.head {
  padding-top: 36px;
  padding-bottom: 30px;
}

.crumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--muted);
  font-size: 13.5px;
}

.crumbs a {
  color: var(--muted);
  text-decoration: none;
}

.crumbs a:hover {
  color: var(--ink);
}

.crumbs [aria-hidden] {
  color: #b9b0a3;
}

.crumbs [aria-current] {
  color: var(--ink);
}

.head__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px 40px;
  margin-top: 18px;
}

.head__intro {
  max-width: 420px;
  color: var(--muted);
  font-size: 15.5px;
  line-height: 1.6;
}

.results {
  display: flex;
  align-items: flex-start;
  gap: 32px;
}

.results--map {
  padding-right: 0;
}

.list {
  flex: 1 1 auto;
  min-width: 0;
  padding: 28px 0 96px;
}

.list__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  margin-bottom: 28px;
}

.list__count {
  font-family: var(--serif);
  font-size: 30px;
  font-weight: 600;
  line-height: 1;
}

.list__total {
  color: var(--muted);
  font-size: 14px;
}

.list__chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 17px;
  background: var(--stone);
  font-size: 13.5px;
  font-weight: 600;
}

.list__chip:hover {
  background: var(--stone-2);
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 40px 28px;
}

.cards--wide {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.pick {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 14px;
  padding: 36px;
  border-radius: var(--radius);
  background: var(--stone);
}

.pick__title {
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 600;
  line-height: 1.08;
}

.pick__text {
  color: var(--ink-2);
  font-size: 15px;
  line-height: 1.6;
}

.mapcol {
  position: sticky;
  top: 73px;
  flex: 0 0 clamp(420px, 38vw, 620px);
  height: calc(100vh - 73px);
  border-left: 1px solid var(--line);
  background: var(--stone);
}

.mapcol__more {
  position: absolute;
  left: 16px;
  top: 16px;
  z-index: 500;
  min-height: 40px;
  padding: 0 14px;
  border: 0;
  border-radius: 3px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(30, 36, 34, 0.16);
  font-size: 13.5px;
  font-weight: 600;
}

.mmap {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.mmap__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 64px;
  padding: 0 12px;
  border-bottom: 1px solid var(--line);
}

.mmap__title {
  font-weight: 700;
}

.mmap__filters {
  min-height: 42px;
  margin-left: auto;
  padding: 0 14px;
}

.mmap__map {
  position: relative;
  flex: 1;
}

.mmap__card {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 18px;
  z-index: 500;
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: var(--radius);
  background: #fff;
  color: var(--ink);
  text-decoration: none;
  box-shadow: 0 18px 44px rgba(30, 36, 34, 0.22);
}

.mmap__card img {
  flex-shrink: 0;
  width: 112px;
  height: 96px;
  object-fit: cover;
  border-radius: 3px;
}

.mmap__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  font-size: 14px;
}

.mmap__info strong {
  font-size: 19px;
}

.mmap__month {
  color: var(--brass-text);
  font-size: 12.5px;
  font-weight: 600;
}

.mmap__where {
  color: var(--muted);
  font-size: 13px;
}

@media (max-width: 1180px) {
  .mapcol {
    display: none;
  }

  .results--map {
    padding-right: var(--gutter);
  }
}

@media (max-width: 760px) {
  .cards,
  .cards--wide {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }

  .head {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .list {
    padding-top: 20px;
  }
}
</style>
