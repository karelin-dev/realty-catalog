<script setup>
// Блоки ниже первого экрана (Lazy… hydrate-on-visible) оживают, когда до них долистали:
// меньше работы для браузера при загрузке страницы.
import { DISTRICTS, agents, properties } from '~/data/properties'
import cormorantItalicUrl from '~/assets/fonts/cormorant-garamond-cyrillic-wght-italic.woff2?url'

const config = useRuntimeConfig()

useSeoMeta({
  title: 'Квартиры и дома в Петербурге',
  description: 'Агентство недвижимости «Литера»: квартиры, дома и таунхаусы в Петербурге и пригороде. Проверяем документы до показа, считаем ипотеку, ведём сделку до ключей.',
  ogTitle: 'Литера: недвижимость Петербурга',
  ogDescription: 'Квартиры, дома и таунхаусы. Платёж по ипотеке у каждого объекта, карта, избранное и сравнение.',
  ogUrl: `${config.public.siteUrl}/`
})
useHead({ link: [{ rel: 'canonical', href: `${config.public.siteUrl}/` }, fontPreload(cormorantItalicUrl)] })

const minPrice = Math.min(...properties.map((p) => p.price))
const stats = [
  { value: String(properties.length), text: 'объектов в каталоге' },
  { value: `от ${formatMillions(minPrice)} ₽`, text: 'студия у метро «Электросила»' },
  { value: `от ${formatPrice(Math.round(monthlyFor(minPrice)))}`, text: 'платёж в месяц по ипотеке*' },
  { value: '11', text: 'районов: 8 в городе и 3 в области' }
]

// Подборки считаются по тем же фильтрам, что откроются в каталоге
const collections = [
  { key: 'first', title: 'Первая квартира', query: { type: 'flat', price_to: '15000000' }, note: (n) => `${objectsWord(n)} до 15 млн ₽` },
  { key: 'new', title: 'Новостройки', query: { market: 'new' } },
  { key: 'center', title: 'Исторический центр', query: { district: 'center,admiralteysky,petrogradsky' } },
  { key: 'country', title: 'Загородные дома', query: { type: 'house,townhouse' } }
].map((c) => {
  const found = applyFilters(properties, parseFilters(c.query))
  const from = Math.min(...found.map((p) => p.price))
  return { ...c, note: c.note ? c.note(found.length) : `${objectsWord(found.length)} от ${formatMillions(from)} ₽` }
})

const newest = applyFilters(properties, parseFilters({})).slice(0, 3)

const districtRows = DISTRICTS.map((d) => {
  const items = properties.filter((p) => p.district === d.key)
  const from = Math.min(...items.map((p) => p.price))
  return { ...d, count: items.length, from: `${items.length > 1 ? 'от ' : ''}${formatMillions(from)} ₽` }
}).filter((d) => d.count)

const steps = [
  { title: 'Проверяем объект до показа', text: 'Собственники, история перехода прав, долги и обременения. На просмотр едете только к чистым квартирам.' },
  { title: 'Комиссия известна заранее', text: 'Сумма фиксируется в договоре и не меняется по ходу сделки.' },
  { title: 'Безопасные расчёты', text: 'Деньги передаются через аккредитив или банковскую ячейку, а не из рук в руки.' },
  { title: 'Один агент от звонка до ключей', text: 'На связи ежедневно с 9 до 21, по телефону и в мессенджерах.' }
]

const team = Object.entries(agents).map(([key, a]) => ({ key, ...a }))
const img = (path, widths) => widths.map((w) => `${asset(`${path}-${w}.webp`)} ${w}w`).join(', ')
</script>

<template>
  <div>
    <section class="hero" aria-labelledby="hero-title">
      <div class="wrap">
        <div class="hero__head">
          <div class="hero__title">
            <span class="eyebrow">Агентство недвижимости · Санкт-Петербург</span>
            <h1 id="hero-title">Ваш новый адрес <em>в Петербурге</em></h1>
          </div>
          <div class="hero__intro">
            <p class="lead">Подберём квартиру или дом под ваш бюджет, проверим документы и проведём сделку до ключей. От студии у метро до дома у залива.</p>
            <div class="hero__links">
              <NuxtLink to="/catalog" class="btn btn--primary">Смотреть каталог</NuxtLink>
              <a href="#mortgage" class="link-arrow">Рассчитать платёж <AppIcon name="arrow" :size="16" /></a>
            </div>
          </div>
        </div>
        <HeroSearch class="hero__search" />
      </div>
      <div class="hero__photo">
        <picture>
          <source media="(max-width: 600px)" :srcset="img('img/hero/canal-m', [480, 800])" sizes="100vw">
          <img
            :src="asset('img/hero/canal-1400.webp')"
            :srcset="img('img/hero/canal', [800, 1400, 1800])"
            sizes="(max-width: 1440px) 100vw, 1392px"
            width="1400"
            height="503"
            alt="Набережная канала в центре Петербурга летом"
          >
        </picture>
      </div>
      <div class="wrap">
        <dl class="stats">
          <div v-for="s in stats" :key="s.text" class="stats__item">
            <dt>{{ s.text }}</dt>
            <dd class="serif-num">{{ s.value }}</dd>
          </div>
        </dl>
        <p class="footnote">* Ставка 6%, первоначальный взнос 20%, срок 20 лет. Расчёт предварительный, условия называет банк.</p>
      </div>
    </section>

    <section class="section" aria-labelledby="sets-title">
      <div class="wrap">
        <div class="section-head">
          <div class="section-head__title">
            <span class="eyebrow">Подборки</span>
            <h2 id="sets-title" class="h2">С чего начать поиск</h2>
          </div>
          <NuxtLink to="/catalog" class="link-arrow">Весь каталог <AppIcon name="arrow" :size="16" /></NuxtLink>
        </div>
        <ul class="tiles">
          <li v-for="c in collections" :key="c.key">
            <NuxtLink :to="{ path: '/catalog', query: c.query }" class="tile">
              <img
                :src="asset(`img/tiles/${c.key}-600.webp`)"
                :srcset="img(`img/tiles/${c.key}`, [300, 600])"
                sizes="(max-width: 600px) 50vw, 300px"
                width="600"
                height="800"
                alt=""
                loading="lazy"
                decoding="async"
              >
              <span class="tile__title">{{ c.title }}</span>
              <span class="tile__note">{{ c.note }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <section class="section" aria-labelledby="new-title">
      <div class="wrap">
        <div class="section-head">
          <div class="section-head__title">
            <span class="eyebrow">Каталог</span>
            <h2 id="new-title" class="h2">Новое в каталоге</h2>
          </div>
          <NuxtLink to="/catalog" class="link-arrow">Все {{ properties.length }} объектов <AppIcon name="arrow" :size="16" /></NuxtLink>
        </div>
        <div class="cards">
          <LazyPropertyCard v-for="p in newest" :key="p.slug" hydrate-on-visible :property="p" sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 400px" />
        </div>
      </div>
    </section>

    <section class="map-section" aria-labelledby="map-title">
      <div class="wrap split">
        <div class="split__text">
          <span class="eyebrow">Карта</span>
          <h2 id="map-title" class="h2">Восемь районов города и&nbsp;три пригорода</h2>
          <p class="lead">Сразу видно, сколько идти до метро и где ближайший парк. Метки с ценами ведут на страницу объекта.</p>
          <ul class="districts">
            <li v-for="d in districtRows" :key="d.key">
              <NuxtLink :to="{ path: '/catalog', query: { district: d.key } }">
                <span class="districts__name">{{ d.name }}</span>
                <span class="districts__count">{{ d.count }}</span>
                <span class="districts__from num">{{ d.from }}</span>
              </NuxtLink>
            </li>
          </ul>
          <NuxtLink to="/catalog" class="btn btn--primary split__btn">
            <AppIcon name="pin" :size="18" /> Открыть каталог на карте
          </NuxtLink>
        </div>
        <LazyCityMap hydrate-on-visible :items="properties" />
      </div>
    </section>

    <section id="mortgage" class="section" aria-labelledby="mortgage-title">
      <div class="wrap">
        <div class="section-head">
          <div class="section-head__title">
            <span class="eyebrow">Ипотека</span>
            <h2 id="mortgage-title" class="h2">Посчитайте платёж до&nbsp;звонка в&nbsp;банк</h2>
          </div>
          <p class="lead section-head__aside">Впишите цену понравившегося объекта или двигайте ползунки: калькулятор сразу покажет платёж и переплату.</p>
        </div>
        <LazyMortgageCalc hydrate-on-visible />
      </div>
    </section>

    <section class="section" aria-labelledby="trust-title">
      <div class="wrap trust">
        <img
          class="trust__photo"
          :src="asset('img/trust-800.webp')"
          :srcset="img('img/trust', [400, 800])"
          sizes="(max-width: 860px) 100vw, 480px"
          width="800"
          height="1000"
          alt="Светлая гостиная с арочными окнами"
          loading="lazy"
          decoding="async"
        >
        <div class="trust__text">
          <span class="eyebrow">Почему Литера</span>
          <h2 id="trust-title" class="h2">Работаем так, чтобы на&nbsp;сделке было спокойно</h2>
          <ol class="steps">
            <li v-for="(s, i) in steps" :key="s.title">
              <span class="steps__num" aria-hidden="true">0{{ i + 1 }}</span>
              <span class="steps__body">
                <strong>{{ s.title }}</strong>
                <span>{{ s.text }}</span>
              </span>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <section id="agents" class="section" aria-labelledby="agents-title">
      <div class="wrap">
        <div class="section-head">
          <div class="section-head__title">
            <span class="eyebrow">Команда</span>
            <h2 id="agents-title" class="h2">Агенты, которые знают свои районы</h2>
          </div>
          <p class="section-head__aside">Каждый ведёт несколько районов и сопровождает сделку от первого звонка до передачи ключей.</p>
        </div>
        <ul class="agents">
          <li v-for="a in team" :key="a.key" class="agent">
            <img
              :src="asset(`img/agents/${a.photo}-480.webp`)"
              :srcset="img(`img/agents/${a.photo}`, [240, 480])"
              sizes="(max-width: 600px) 100vw, 400px"
              width="480"
              height="600"
              :alt="a.name"
              loading="lazy"
              decoding="async"
            >
            <h3>{{ a.name }}</h3>
            <span class="agent__role">{{ a.role }}</span>
            <a :href="`tel:${a.phone.replace(/[^\d+]/g, '')}`" class="agent__phone">{{ a.phone }}</a>
          </li>
        </ul>
      </div>
    </section>

    <section id="lead" class="lead-section" aria-labelledby="lead-title">
      <div class="wrap lead-grid">
        <div class="lead-grid__text">
          <h2 id="lead-title" class="h2">Расскажите, что ищете</h2>
          <p class="lead">Агент перезвонит, уточнит бюджет и район и пришлёт подборку в течение дня. Это бесплатно и ни к чему не обязывает.</p>
        </div>
        <LazyLeadForm hydrate-on-visible />
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  padding-top: 52px;
}

.hero__head {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: 56px;
  align-items: end;
}

.hero__title {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero h1 {
  font-family: var(--serif);
  font-size: clamp(46px, 6vw, 86px);
  font-weight: 600;
  line-height: 0.98;
  letter-spacing: -0.015em;
}

.hero h1 em {
  color: var(--brand);
  font-style: italic;
  font-weight: 500;
  white-space: nowrap;
}

.hero__intro {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding-bottom: 8px;
}

.hero__links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 28px;
}

.hero__search {
  position: relative;
  z-index: 2;
  margin-top: 40px;
}

.hero__photo {
  max-width: 1440px;
  margin: -46px auto 0;
  padding: 0 clamp(0px, 1.7vw, 24px);
}

.hero__photo img {
  width: 100%;
  height: auto;
  aspect-ratio: 1392 / 500;
  object-fit: cover;
  border-radius: var(--radius);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 52px;
}

.stats__item {
  display: flex;
  flex-direction: column-reverse;
  gap: 6px;
  padding: 4px 28px;
}

.stats__item:first-child {
  padding-left: 0;
}

.stats__item + .stats__item {
  border-left: 1px solid var(--line);
}

.stats dt {
  color: var(--muted);
  font-size: 14px;
}

.stats dd {
  font-size: clamp(30px, 3vw, 44px);
  line-height: 1;
}

.footnote {
  margin-top: 18px;
  color: var(--muted);
  font-size: 12.5px;
}

.section {
  padding-top: 128px;
}

.section-head__aside {
  max-width: 420px;
  color: var(--muted);
}

.tiles {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.tile {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--ink);
  text-decoration: none;
}

.tile img {
  width: 100%;
  height: auto;
  margin-bottom: 14px;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: var(--radius);
  transition: opacity 0.2s;
}

.tile:hover img {
  opacity: 0.9;
}

.tile__title {
  font-family: var(--serif);
  font-size: 30px;
  font-weight: 600;
  line-height: 1.1;
}

.tile:hover .tile__title {
  color: var(--brand);
}

.tile__note {
  color: var(--muted);
  font-size: 15px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}

.map-section {
  margin-top: 128px;
  padding: 112px 0;
  background: var(--stone);
}

.split {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: 72px;
  align-items: center;
}

.split__text {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.split__btn {
  align-self: flex-start;
  margin-top: 8px;
}

.districts {
  margin-top: 6px;
  border-top: 1px solid var(--line-2);
}

.districts a {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line-2);
  color: var(--ink);
  font-size: 15.5px;
  text-decoration: none;
}

.districts a:hover .districts__name {
  color: var(--brand);
}

.districts__name {
  font-weight: 600;
}

.districts__count {
  color: var(--muted);
}

.districts__from {
  margin-left: auto;
  font-weight: 600;
}

.trust {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: 88px;
  align-items: center;
}

.trust__photo {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: var(--radius);
}

.trust__text {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.steps {
  margin-top: 14px;
  border-top: 1px solid var(--line);
}

.steps li {
  display: flex;
  gap: 28px;
  padding: 24px 0;
  border-bottom: 1px solid var(--line);
}

.steps__num {
  min-width: 36px;
  color: var(--brass);
  font-family: var(--serif);
  font-size: 30px;
  font-weight: 500;
  line-height: 1;
}

.steps__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--muted);
  font-size: 15.5px;
  line-height: 1.6;
}

.steps__body strong {
  color: var(--ink);
  font-size: 18px;
}

.agents {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}

.agent {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.agent img {
  width: 100%;
  height: auto;
  margin-bottom: 14px;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: var(--radius);
}

.agent h3 {
  font-family: var(--serif);
  font-size: 30px;
  font-weight: 600;
  line-height: 1.1;
}

.agent__role {
  color: var(--muted);
  font-size: 15px;
}

.agent__phone {
  margin-top: 8px;
  color: var(--ink);
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
}

.lead-section {
  margin-top: 128px;
  padding: 104px 0;
  background: var(--stone);
}

.lead-grid {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: 72px;
  align-items: center;
}

.lead-grid__text {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

@media (max-width: 1100px) {
  .tiles,
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stats {
    row-gap: 28px;
  }

  .stats__item:nth-child(3) {
    padding-left: 0;
    border-left: 0;
  }

  .cards,
  .agents {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .hero__head,
  .split,
  .trust,
  .lead-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 36px;
  }

  .section {
    padding-top: 88px;
  }

  .map-section,
  .lead-section {
    margin-top: 88px;
    padding: 72px 0;
  }
}

@media (max-width: 600px) {
  .hero {
    padding-top: 28px;
  }

  .hero__head {
    gap: 18px;
  }

  .hero__search {
    margin-top: 28px;
  }

  .hero__photo {
    margin-top: 20px;
    padding: 0 var(--gutter);
  }

  .hero__photo img {
    aspect-ratio: 16 / 10;
  }

  .tiles {
    gap: 16px;
  }

  .tile__title {
    font-size: 24px;
  }

  .tile__note {
    font-size: 13.5px;
  }

  .cards,
  .agents {
    grid-template-columns: minmax(0, 1fr);
  }

  .stats__item {
    padding: 0 16px;
  }

  .stats__item:nth-child(odd) {
    padding-left: 0;
  }
}
</style>
