<script setup>
// Избранное: карточками или таблицей сравнения. Подборкой можно поделиться ссылкой
// (?ids=...): у получателя она откроется, даже если его избранное пустое.
import { agents, findProperty } from '~/data/properties'

definePageMeta({ layout: 'compact' })

const config = useRuntimeConfig()
useSeoMeta({
  title: 'Избранное и сравнение',
  description: 'Сохранённые объекты и их сравнение: цена, платёж в месяц, площадь, этаж, дорога до метро.'
})
useHead({ link: [{ rel: 'canonical', href: `${config.public.siteUrl}/favorites/` }] })

const route = useRoute()
const { slugs, ready, toggle, set } = useFavorites()
const { copyLink, show } = useToast()

const sharedIds = computed(() => String(route.query.ids || '').split(',').filter((s) => findProperty(s)))
const shared = computed(() => sharedIds.value.length > 0)
const items = computed(() => (shared.value ? sharedIds.value : slugs.value).map(findProperty).filter(Boolean))

const view = ref('compare')
const onlyDiff = ref(false)
const cleared = ref([])
const booking = ref(null)

watch(
  () => items.value.length,
  (n) => {
    if (n < 2) view.value = 'cards'
  }
)

function shareLink() {
  const url = `${window.location.origin}${config.app.baseURL}favorites/?ids=${slugs.value.join(',')}`
  copyLink(url, 'Ссылка на подборку скопирована')
}

function clearAll() {
  cleared.value = [...slugs.value]
  set([])
}

function undo() {
  set(cleared.value)
  cleared.value = []
}

function saveShared() {
  set([...slugs.value, ...sharedIds.value])
  show('Подборка сохранена в избранное')
  navigateTo('/favorites')
}

function remove(slug) {
  if (shared.value) return
  toggle(slug)
}

const bookingProperty = computed(() => (booking.value ? findProperty(booking.value) : null))
</script>

<template>
  <div class="wrap fav">
    <nav aria-label="Хлебные крошки" class="crumbs">
      <NuxtLink to="/">Главная</NuxtLink>
      <span aria-hidden="true">/</span>
      <span aria-current="page">Избранное</span>
    </nav>

    <div class="fav__head">
      <div class="fav__title">
        <h1 class="h1">{{ shared ? 'Подборка по ссылке' : 'Избранное' }}</h1>
        <p v-if="ready" class="fav__intro">
          <template v-if="shared">{{ objectsWord(items.length) }}. Сохраните подборку, чтобы вернуться к ней позже.</template>
          <template v-else-if="items.length">{{ objectsWord(items.length) }}. Список хранится в этом браузере, им можно поделиться ссылкой.</template>
        </p>
      </div>
      <div v-if="ready && items.length" class="fav__actions">
        <template v-if="shared">
          <button type="button" class="btn btn--primary" @click="saveShared">Сохранить в избранное</button>
          <NuxtLink to="/favorites" class="text-btn">Моё избранное</NuxtLink>
        </template>
        <template v-else>
          <button type="button" class="fav__link-btn" @click="shareLink"><AppIcon name="link" :size="19" /> Скопировать ссылку на подборку</button>
          <button type="button" class="text-btn" @click="clearAll">Очистить</button>
        </template>
      </div>
    </div>

    <p v-if="cleared.length && !items.length" class="fav__undo" role="status">
      Список очищен. <button type="button" class="text-btn" @click="undo">Вернуть</button>
    </p>

    <div v-if="!ready" class="fav__loading" aria-hidden="true" />

    <section v-else-if="!items.length" class="fav__empty" aria-labelledby="fav-empty-title">
      <span class="fav__empty-icon"><AppIcon name="heart" :size="32" :stroke="1.5" /></span>
      <h2 id="fav-empty-title" class="h3">Здесь появятся сохранённые объекты</h2>
      <p class="lead">Нажмите на сердечко на фото объекта, чтобы вернуться к нему позже и сравнить с другими: цену, платёж, площадь и дорогу до метро.</p>
      <NuxtLink to="/catalog" class="btn btn--primary">Перейти в каталог</NuxtLink>
      <span class="fav__note">Список хранится в этом браузере, регистрация не нужна.</span>
    </section>

    <template v-else>
      <div class="fav__toolbar">
        <div class="seg" role="group" aria-label="Вид избранного">
          <button type="button" :aria-pressed="view === 'cards'" @click="view = 'cards'">Карточки</button>
          <button type="button" :aria-pressed="view === 'compare'" :disabled="items.length < 2" @click="view = 'compare'">Сравнение</button>
        </div>
        <label v-if="view === 'compare'" class="checkbox"><input v-model="onlyDiff" type="checkbox"> Показать только различия</label>
        <span v-if="view === 'compare'" class="fav__legend"><span class="fav__swatch" aria-hidden="true" /> лучшее значение в строке</span>
        <span v-else-if="items.length < 2" class="fav__legend">Добавьте ещё объект, чтобы сравнить</span>
      </div>

      <CompareTable v-if="view === 'compare'" :items="items" :only-diff="onlyDiff" @remove="remove" @book="booking = $event" />
      <div v-else class="fav__cards">
        <PropertyCard v-for="p in items" :key="p.slug" :property="p" sizes="(max-width: 760px) 100vw, 400px" />
      </div>
    </template>

    <BookingDialog
      v-if="bookingProperty"
      :open="!!booking"
      :property="bookingProperty"
      :agent="agents[bookingProperty.agent]"
      @close="booking = null"
    />
  </div>
</template>

<style scoped>
.fav {
  padding-top: 32px;
  padding-bottom: 112px;
}

.crumbs {
  display: flex;
  gap: 10px;
  color: var(--muted);
  font-size: 13.5px;
}

.crumbs a {
  color: var(--muted);
  text-decoration: none;
}

.crumbs [aria-hidden] {
  color: #b9b0a3;
}

.crumbs [aria-current] {
  color: var(--ink);
}

.fav__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px 40px;
  margin: 18px 0 30px;
}

.fav__title {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fav__intro {
  color: var(--muted);
  font-size: 15.5px;
}

.fav__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
}

.fav__link-btn {
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

.fav__link-btn:hover {
  color: var(--brand);
}

.fav__undo {
  margin-bottom: 20px;
  color: var(--ink-2);
}

.fav__loading {
  min-height: 420px;
}

.fav__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 24px;
  margin-bottom: 28px;
  padding: 14px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.fav__toolbar .seg button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.fav__legend {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  color: var(--muted);
  font-size: 13.5px;
}

.fav__swatch {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  background: var(--sage);
  box-shadow: inset 0 0 0 1px #c9d9cf;
}

.fav__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 40px 28px;
}

.fav__empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  max-width: 560px;
  padding: 24px 0 40px;
}

.fav__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--stone);
  color: var(--brand);
}

.fav__note {
  color: var(--muted);
  font-size: 13px;
}

@media (max-width: 760px) {
  .fav {
    padding-top: 20px;
  }

  .fav__legend {
    margin-left: 0;
  }
}
</style>
