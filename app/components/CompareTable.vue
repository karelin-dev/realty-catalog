<script setup>
// Сравнение объектов таблицей. В каждой строке, где есть что сравнивать,
// подсвечено лучшее значение: ниже цена, больше площадь, ближе метро и т. д.
const props = defineProps({
  items: { type: Array, required: true },
  onlyDiff: { type: Boolean, default: false }
})
const emit = defineEmits(['remove', 'book'])

const metroScore = (p) => (p.metro && p.metro.mode === 'walk' ? -p.metro.minutes : -100 - p.metro.minutes)

const ROWS = [
  { label: 'Цена', value: (p) => formatPrice(p.price), score: (p) => -p.price },
  { label: 'Платёж в месяц', value: (p) => formatPrice(monthlyFor(p.price)), score: (p) => -p.price },
  { label: 'Цена за м²', value: (p) => formatPrice(p.price / p.area), score: (p) => -p.price / p.area },
  { label: 'Площадь', value: (p) => formatArea(p.area), score: (p) => p.area },
  { label: 'Кухня', value: (p) => `${formatArea(p.kitchenArea)}${p.kitchenLabel === 'Кухня-гостиная' ? ', с гостиной' : ''}`, score: (p) => p.kitchenArea },
  { label: 'Комнаты', value: (p) => (p.rooms === 0 ? 'Студия' : String(p.rooms)) },
  { label: 'Этаж', value: (p) => (isCountry(p) ? `дом в ${p.storeys} ${plural(p.storeys, ['этаж', 'этажа', 'этажей'])}` : `${p.floor} из ${p.floors}`) },
  { label: 'Год постройки', value: (p) => String(p.year), score: (p) => p.year },
  { label: 'До метро', value: (p) => `${p.metro.name}, ${metroLabel(p)}`, score: metroScore, dot: (p) => lineColor(p.metro.line) },
  { label: 'Район', value: (p) => districtLabel(p) },
  { label: 'Ремонт', value: (p) => p.renovation },
  { label: 'Рынок', value: (p) => (p.market === 'new' ? 'Новостройка' : 'Вторичное') }
]

const rows = computed(() =>
  ROWS.map((row) => {
    const values = props.items.map(row.value)
    const scores = row.score ? props.items.map(row.score) : null
    const max = scores ? Math.max(...scores) : null
    const comparable = scores && props.items.length > 1 && new Set(scores).size > 1
    return {
      label: row.label,
      same: new Set(values).size === 1,
      cells: props.items.map((p, i) => ({ value: values[i], best: comparable && scores[i] === max, dot: row.dot?.(p) }))
    }
  }).filter((row) => !props.onlyDiff || !row.same || props.items.length < 2)
)

const columns = computed(() => `190px repeat(${props.items.length}, minmax(240px, 1fr)) 200px`)
const minWidth = computed(() => `${190 + props.items.length * 240 + 200}px`)
</script>

<template>
  <div class="scroll">
    <div class="cmp" role="table" aria-label="Сравнение избранных объектов" :style="{ gridTemplateColumns: columns, minWidth }">
      <div role="row" class="cmp__row">
        <div role="columnheader" class="cmp__corner label">Объект</div>
        <div v-for="p in items" :key="p.slug" role="columnheader" class="cmp__head">
          <div class="cmp__photo">
            <NuxtLink :to="`/catalog/${p.slug}`" :aria-label="shortTitle(p)">
              <img :src="photo(p.slug, 1, 400)" :srcset="photoSrcset(p.slug, 1)" sizes="300px" width="400" height="300" alt="" loading="lazy">
            </NuxtLink>
            <button type="button" class="cmp__remove" :aria-label="`Убрать из избранного: ${shortTitle(p)}`" @click="emit('remove', p.slug)">
              <AppIcon name="close" :size="15" :stroke="2.2" />
            </button>
          </div>
          <NuxtLink :to="`/catalog/${p.slug}`" class="cmp__title">{{ shortTitle(p) }}</NuxtLink>
          <span class="cmp__address">{{ districtLabel(p) }}, {{ p.address }}</span>
        </div>
        <div role="columnheader" class="cmp__head">
          <NuxtLink to="/catalog" class="cmp__add">
            <span class="cmp__plus"><AppIcon name="plus" :size="18" :stroke="2" /></span>
            Добавить объект из каталога
          </NuxtLink>
        </div>
      </div>

      <div v-for="row in rows" :key="row.label" role="row" class="cmp__row">
        <div role="rowheader" class="cmp__label">{{ row.label }}</div>
        <div v-for="(c, i) in row.cells" :key="i" role="cell" class="cmp__cell num" :class="{ 'is-best': c.best }">
          <span v-if="c.dot" class="dot" :style="{ background: c.dot }" />
          <span>{{ c.value }}</span>
          <span v-if="c.best" class="cmp__best"><AppIcon name="check" :size="16" :stroke="2.4" /><span class="sr-only">лучшее значение</span></span>
        </div>
        <div role="cell" class="cmp__cell cmp__cell--empty" />
      </div>

      <div role="row" class="cmp__row">
        <div role="rowheader" class="cmp__label cmp__label--empty"><span class="sr-only">Запись</span></div>
        <div v-for="p in items" :key="p.slug" role="cell" class="cmp__cell cmp__cell--cta">
          <button type="button" class="btn btn--outline btn--block" @click="emit('book', p.slug)">Записаться на просмотр</button>
        </div>
        <div role="cell" class="cmp__cell cmp__cell--empty" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll {
  overflow-x: auto;
}

.cmp {
  display: grid;
}

.cmp__row {
  display: contents;
}

.cmp__corner {
  align-self: end;
  padding: 0 16px 24px 0;
}

.cmp__head {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 12px 24px;
}

.cmp__photo {
  position: relative;
  margin-bottom: 10px;
}

.cmp__photo img {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--radius);
}

.cmp__remove {
  position: absolute;
  right: 10px;
  top: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: #fff;
}

.cmp__remove:hover {
  color: var(--error);
}

.cmp__title {
  color: var(--ink);
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
}

.cmp__title:hover {
  color: var(--brand);
}

.cmp__address {
  color: var(--muted);
  font-size: 13.5px;
}

.cmp__add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  aspect-ratio: 4 / 3;
  padding: 12px;
  border: 1px dashed #c9c0b3;
  border-radius: var(--radius);
  color: var(--ink-2);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
}

.cmp__add:hover {
  border-color: var(--brand);
  color: var(--brand);
}

.cmp__plus {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--stone);
}

.cmp__label,
.cmp__cell {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 12px;
  border-top: 1px solid var(--line);
  font-size: 15.5px;
}

.cmp__label {
  padding-left: 0;
  color: var(--muted);
  font-size: 14.5px;
}

.cmp__cell.is-best {
  background: var(--sage);
  font-weight: 700;
}

.cmp__best {
  margin-left: auto;
  color: var(--brand);
}

.cmp__cell--cta {
  padding-top: 20px;
}

.cmp__cell--cta .btn {
  min-height: 48px;
  font-size: 14.5px;
}
</style>
