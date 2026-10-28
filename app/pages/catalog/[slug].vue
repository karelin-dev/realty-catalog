<script setup>
import { TYPES, agents, findProperty, properties } from '~/data/properties'

definePageMeta({ layout: 'compact' })

const route = useRoute()
const config = useRuntimeConfig()
const p = findProperty(route.params.slug)
if (!p) throw createError({ statusCode: 404, statusMessage: 'Объект не найден', fatal: true })

const agent = agents[p.agent]
const url = `${config.public.siteUrl}/catalog/${p.slug}/`
const title = shortTitle(p)
const country = isCountry(p)

useSeoMeta({
  title: `${p.title}, ${formatMillions(p.price)} ₽`,
  description: p.description[0],
  ogTitle: `${title}, ${formatPrice(p.price)}`,
  ogDescription: p.description[0],
  ogUrl: url,
  ogImage: `${config.public.siteUrl}/img/objects/${p.slug}/1-800.webp`
})
useHead({
  link: [{ rel: 'canonical', href: url }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: p.title,
      url,
      image: `${config.public.siteUrl}/img/objects/${p.slug}/1-800.webp`,
      datePosted: p.addedAt,
      offers: { '@type': 'Offer', price: p.price, priceCurrency: 'RUB' }
    })
  }]
})

const eyebrow = [p.type === 'flat' ? (p.market === 'new' ? 'Новостройка' : 'Вторичное жильё') : TYPES[p.type], country ? `построен в ${p.year} году` : `дом ${p.year} года`].join(' · ')
const facts = country
  ? [[formatArea(p.area), 'площадь дома'], [`${p.plot} сот.`, 'участок'], [String(p.storeys), plural(p.storeys, ['этаж', 'этажа', 'этажей'])], [`${String(p.ceiling).replace('.', ',')} м`, 'потолки'], [String(p.year), 'год постройки']]
  : [[formatArea(p.area), 'общая площадь'], [formatArea(p.kitchenArea), p.kitchenLabel.toLowerCase()], [`${p.floor} из ${p.floors}`, 'этаж'], [`${String(p.ceiling).replace('.', ',')} м`, 'потолки'], [String(p.year), 'год постройки']]

const MODES = { walk: 'пешком', transport: 'на транспорте', car: 'на машине' }
const KIND_COLORS = { park: '#6f8f6a', school: 'var(--brass)', shop: '#8c8478' }
const nearbyColor = (n) => (n.kind === 'metro' && p.metro && !country ? lineColor(p.metro.line) : KIND_COLORS[n.kind] || 'var(--muted)')

// Похожие: тот же тип жилья (город или загород), ближе всего по цене
const similar = properties
  .filter((o) => o.slug !== p.slug && isCountry(o) === country)
  .sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price))
  .slice(0, 3)

const lightbox = ref(false)
const lightboxStart = ref(0)
const booking = ref(false)
const openPhoto = (i) => {
  lightboxStart.value = i
  lightbox.value = true
}

const mapBox = ref(null)
const mapVisible = useInView(mapBox)
const { copyLink } = useToast()
const share = () => copyLink(window.location.href)
const tel = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`
</script>

<template>
  <div class="object">
    <div class="wrap">
      <nav aria-label="Хлебные крошки" class="crumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink to="/catalog">Каталог</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink :to="{ path: '/catalog', query: { district: p.district } }">{{ p.district === 'suburbs' ? 'Пригород' : `${districtName(p.district)} район` }}</NuxtLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{{ title }}</span>
      </nav>

      <div class="head">
        <div class="head__text">
          <span class="eyebrow">{{ eyebrow }}</span>
          <h1 class="h1">{{ p.title }}</h1>
          <div class="head__where">
            <span v-if="!country" class="head__metro"><span class="dot" :style="{ background: lineColor(p.metro.line) }" />{{ p.metro.name }}, {{ metroLabel(p) }}</span>
            <span>{{ country ? `${p.place}, ${p.address}, ${p.distance}` : `${districtName(p.district)} район, ${p.address}` }}</span>
          </div>
        </div>
        <div class="head__actions">
          <FavButton :slug="p.slug" text />
          <button type="button" class="head__share" @click="share"><AppIcon name="share" /> Поделиться</button>
        </div>
      </div>

      <section class="mosaic" aria-label="Фотографии">
        <button v-for="i in 3" :key="i" type="button" class="mosaic__item" :aria-label="`Открыть фото ${i}: ${p.photos[i - 1]}`" @click="openPhoto(i - 1)">
          <img
            :src="photo(p.slug, i, i === 1 ? 1600 : 800)"
            :srcset="i === 1 ? `${photo(p.slug, 1, 800)} 800w, ${photo(p.slug, 1, 1600)} 1600w` : undefined"
            :sizes="i === 1 ? '(max-width: 760px) 100vw, 800px' : undefined"
            width="800"
            height="600"
            :alt="p.photos[i - 1]"
            :fetchpriority="i === 1 ? 'high' : undefined"
            :loading="i === 1 ? 'eager' : 'lazy'"
          >
        </button>
        <button type="button" class="mosaic__all" @click="openPhoto(0)">
          <AppIcon name="grid" :size="18" /> Все фото · {{ p.photos.length }}
        </button>
      </section>

      <div class="layout">
        <div class="content">
          <dl class="facts">
            <div v-for="[value, label] in facts" :key="label" class="facts__item">
              <dt>{{ label }}</dt>
              <dd class="serif-num">{{ value }}</dd>
            </div>
          </dl>

          <section class="block" aria-labelledby="about-title">
            <h2 id="about-title" class="block__title">О {{ country ? 'доме' : p.type === 'apartments' ? 'апартаментах' : 'квартире' }}</h2>
            <p v-for="text in p.description" :key="text" class="block__text">{{ text }}</p>
            <ul class="highlights">
              <li v-for="h in p.highlights" :key="h"><AppIcon name="check" :size="18" :stroke="2" /> {{ h }}</li>
            </ul>
          </section>

          <section class="block" aria-labelledby="specs-title">
            <h2 id="specs-title" class="block__title">Характеристики</h2>
            <dl class="specs">
              <div v-for="[label, value] in p.specs" :key="label"><dt>{{ label }}</dt><dd>{{ value }}</dd></div>
            </dl>
          </section>

          <section class="block" aria-labelledby="place-title">
            <h2 id="place-title" class="block__title">Расположение</h2>
            <div ref="mapBox" class="omap">
              <LazyLeafletMap v-if="mapVisible" :markers="[{ id: p.slug, coords: p.coords, label: p.address, title: p.address }]" :zoom="country ? 13 : 15" />
            </div>
            <dl class="specs nearby">
              <div v-for="n in p.nearby" :key="n.name">
                <dt><span class="dot" :style="{ background: nearbyColor(n) }" /> {{ n.name }}</dt>
                <dd>{{ n.minutes }} мин {{ MODES[n.mode] }}</dd>
              </div>
            </dl>
          </section>

          <section id="calc" class="block" aria-labelledby="calc-title">
            <h2 id="calc-title" class="block__title">Ипотека на {{ country ? 'этот дом' : 'эту квартиру' }}</h2>
            <MortgageCalc :price="p.price" fixed-price :cta="false" id-prefix="o" class="ocalc" />
          </section>
        </div>

        <aside class="aside" aria-label="Цена и контакты">
          <div class="price-card">
            <div class="price-card__price">
              <span class="label">Цена</span>
              <span class="price-card__total serif-num">{{ formatPrice(p.price) }}</span>
              <span class="price-card__ppm num">{{ formatPrice(p.price / p.area) }} за м²</span>
            </div>
            <a href="#calc" class="price-card__mortgage">
              <span>
                <span class="price-card__hint">В ипотеку при взносе 20%</span>
                <strong class="num">от {{ formatPrice(monthlyFor(p.price)) }} в месяц</strong>
              </span>
              <AppIcon name="arrow" :size="18" />
            </a>
            <button type="button" class="btn btn--primary btn--block" @click="booking = true">Записаться на просмотр</button>
            <a :href="tel(agent.phone)" class="btn btn--outline btn--block">Позвонить агенту</a>
            <div class="agent-row">
              <img :src="asset(`img/agents/${agent.photo}-240.webp`)" width="60" height="75" :alt="agent.name">
              <span>
                <strong>{{ agent.name }}</strong>
                <span>{{ agent.role }} · {{ agent.phone }}</span>
              </span>
            </div>
          </div>
          <div class="trust-note">
            <AppIcon name="shield" :size="22" />
            <p><strong>Документы проверены</strong>Собственники, история перехода прав и обременения. Выписку покажем на просмотре.</p>
          </div>
          <p class="meta">Объект № {{ p.num }} · добавлен {{ formatDate(p.addedAt) }}</p>
        </aside>
      </div>

      <section class="similar" aria-labelledby="similar-title">
        <div class="section-head">
          <h2 id="similar-title" class="h2">Похожие объекты</h2>
          <NuxtLink :to="{ path: '/catalog', query: country ? { type: 'house,townhouse' } : { type: 'flat,apartments' } }" class="link-arrow">
            {{ country ? 'Все загородные' : 'Все квартиры' }} <AppIcon name="arrow" :size="16" />
          </NuxtLink>
        </div>
        <div class="similar__cards">
          <PropertyCard v-for="o in similar" :key="o.slug" :property="o" sizes="(max-width: 760px) 100vw, 400px" />
        </div>
      </section>
    </div>

    <div class="mobile-bar">
      <a :href="tel(agent.phone)" class="icon-btn mobile-bar__call" aria-label="Позвонить агенту"><AppIcon name="phone" :size="19" /></a>
      <button type="button" class="btn btn--primary mobile-bar__book" @click="booking = true">Записаться на просмотр</button>
    </div>

    <PhotoLightbox :open="lightbox" :property="p" :start="lightboxStart" @close="lightbox = false" />
    <BookingDialog :open="booking" :property="p" :agent="agent" @close="booking = false" />
  </div>
</template>

<style scoped>
.object {
  padding-top: 32px;
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

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px 40px;
  margin: 22px 0 32px;
}

.head__text {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 860px;
}

.head__where {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 22px;
  color: var(--ink-2);
  font-size: 15.5px;
}

.head__metro {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.head__actions {
  display: flex;
  gap: 22px;
}

.head__share {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  font-size: 15px;
  font-weight: 600;
}

.head__share:hover {
  color: var(--brand);
}

.mosaic {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 8px;
  height: clamp(320px, 42vw, 560px);
}

.mosaic__item {
  padding: 0;
  border: 0;
  background: var(--stone);
  overflow: hidden;
  cursor: zoom-in;
}

.mosaic__item:first-child {
  grid-row: span 2;
  border-radius: var(--radius) 0 0 var(--radius);
}

.mosaic__item:nth-child(2) {
  border-radius: 0 var(--radius) 0 0;
}

.mosaic__item:nth-child(3) {
  border-radius: 0 0 var(--radius) 0;
}

.mosaic__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s;
}

.mosaic__item:hover img {
  transform: scale(1.02);
}

.mosaic__all {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 3px;
  background: #fff;
  font-size: 14.5px;
  font-weight: 600;
  box-shadow: 0 6px 18px rgba(30, 36, 34, 0.18);
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 64px;
  align-items: start;
  margin-top: 56px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 64px;
  min-width: 0;
}

.facts {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.facts__item {
  display: flex;
  flex-direction: column-reverse;
  gap: 4px;
  padding: 22px 20px;
}

.facts__item:first-child {
  padding-left: 0;
}

.facts__item + .facts__item {
  border-left: 1px solid var(--line);
}

.facts dt {
  color: var(--muted);
  font-size: 13.5px;
}

.facts dd {
  font-size: 36px;
  line-height: 1;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.block__title {
  font-family: var(--serif);
  font-size: 42px;
  font-weight: 600;
  line-height: 1.05;
}

.block__text {
  color: #2e3633;
  font-size: 17px;
  line-height: 1.75;
}

.highlights,
.specs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 48px;
}

.highlights {
  margin-top: 10px;
}

.highlights li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  font-size: 15.5px;
}

.highlights svg {
  flex-shrink: 0;
  color: var(--brass);
}

.specs div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
}

.specs dt {
  color: var(--muted);
}

.specs dd {
  font-weight: 600;
  text-align: right;
}

.nearby dt {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--ink);
}

.nearby dd {
  color: var(--muted);
  font-weight: 500;
  white-space: nowrap;
}

.omap {
  aspect-ratio: 800 / 380;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--stone);
  box-shadow: 0 0 0 1px var(--line);
}

.ocalc {
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 0;
  border-radius: var(--radius);
  box-shadow: 0 0 0 1px var(--line);
}

.ocalc :deep(.calc__inputs) {
  padding: 32px;
}

.ocalc :deep(.calc__result) {
  align-self: stretch;
  justify-content: center;
  padding: 32px;
  border-radius: 0;
}

.ocalc :deep(.calc__monthly) {
  font-size: 56px;
}

.ocalc :deep(.calc__box) {
  width: 170px;
}

.aside {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.price-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 32px;
  border-radius: var(--radius);
  background: #fff;
  box-shadow: 0 0 0 1px var(--line), 0 30px 70px rgba(30, 36, 34, 0.08);
}

.price-card__price {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.price-card__total {
  font-size: 48px;
  line-height: 1;
}

.price-card__ppm {
  color: var(--muted);
  font-size: 14.5px;
}

.price-card__mortgage {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  padding: 16px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
}

.price-card__mortgage > span {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.price-card__hint {
  color: var(--muted);
  font-size: 14px;
}

.price-card__mortgage strong {
  color: var(--brass-text);
  font-size: 17px;
}

.price-card .btn {
  min-height: 56px;
}

.agent-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
}

.agent-row img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  object-position: top;
  border-radius: 50%;
}

.agent-row span {
  display: flex;
  flex-direction: column;
  color: var(--muted);
  font-size: 13.5px;
  line-height: 1.35;
}

.agent-row strong {
  color: var(--ink);
  font-family: var(--serif);
  font-size: 23px;
  font-weight: 600;
}

.trust-note {
  display: flex;
  gap: 14px;
  padding: 20px 22px;
  border-radius: var(--radius);
  background: var(--stone);
  color: var(--ink-2);
  font-size: 14px;
  line-height: 1.6;
}

.trust-note svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--brand);
}

.trust-note strong {
  display: block;
  color: var(--ink);
  font-size: 15px;
}

.meta {
  padding: 0 4px;
  color: var(--muted);
  font-size: 13px;
}

.similar {
  padding: 112px 0 120px;
}

.similar__cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}

.mobile-bar {
  display: none;
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .aside {
    position: static;
  }

  .similar__cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mobile-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    display: flex;
    gap: 10px;
    padding: 12px var(--gutter) calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid var(--line);
    background: #fff;
  }

  .mobile-bar__call {
    width: 52px;
    height: 52px;
    border-radius: var(--radius);
    border-color: var(--ink);
  }

  .mobile-bar__book {
    flex: 1;
  }

  .object {
    padding-bottom: 80px;
  }
}

@media (max-width: 760px) {
  .object {
    padding-top: 20px;
  }

  .mosaic {
    display: block;
    height: auto;
    margin: 0 calc(var(--gutter) * -1);
  }

  .mosaic__item {
    display: none;
    width: 100%;
    aspect-ratio: 4 / 3;
  }

  .mosaic__item:first-child {
    display: block;
    border-radius: 0;
  }

  .facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .facts__item,
  .facts__item:first-child {
    padding: 16px 0;
  }

  .facts__item + .facts__item {
    border-left: 0;
  }

  .facts__item:nth-child(even) {
    padding-left: 16px;
    border-left: 1px solid var(--line);
  }

  .facts dd {
    font-size: 30px;
  }

  .layout {
    margin-top: 32px;
  }

  .content {
    gap: 48px;
  }

  .block__title {
    font-size: 34px;
  }

  .highlights,
  .specs,
  .similar__cards {
    grid-template-columns: minmax(0, 1fr);
  }

  .omap {
    aspect-ratio: 4 / 3;
  }

  .ocalc {
    grid-template-columns: minmax(0, 1fr);
  }

  .ocalc :deep(.calc__inputs),
  .ocalc :deep(.calc__result) {
    padding: 20px;
  }

  .price-card {
    padding: 24px 20px;
  }

  .price-card__total {
    font-size: 40px;
  }

  .similar {
    padding: 80px 0 64px;
  }
}
</style>
