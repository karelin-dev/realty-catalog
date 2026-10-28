<script setup>
// Все фильтры в одной панели: справа на десктопе, на весь экран на телефоне.
// Изменения копятся в черновике, число на кнопке пересчитывается сразу,
// а в каталог фильтры попадают по кнопке «Показать».
import { DISTRICTS, TYPES, properties } from '~/data/properties'

const props = defineProps({
  open: { type: Boolean, default: false },
  filters: { type: Object, required: true }
})
const emit = defineEmits(['close', 'apply'])

const draft = ref({ ...EMPTY_FILTERS })
const mode = ref('month')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    draft.value = structuredClone(toRaw(props.filters))
    mode.value = props.filters.priceFrom || props.filters.priceTo ? 'price' : 'month'
  }
)

const count = computed(() => applyFilters(properties, draft.value).length)
const countBy = (key, value) => properties.filter((p) => p[key] === value).length

const ROOMS = [{ value: 0, label: 'Ст' }, { value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4+' }]
const METRO = [{ value: null, label: 'Неважно' }, { value: 5, label: 'до 5 мин' }, { value: 10, label: 'до 10 мин' }, { value: 15, label: 'до 15 мин' }]

function toggleIn(key, value) {
  const list = draft.value[key]
  draft.value[key] = list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function setMode(value) {
  mode.value = value
  Object.assign(draft.value, { priceFrom: null, priceTo: null, monthTo: null })
}

function reset() {
  draft.value = { ...EMPTY_FILTERS, sort: props.filters.sort, view: props.filters.view }
}

function apply() {
  emit('apply', { ...draft.value })
  emit('close')
}
</script>

<template>
  <AppDialog :open="open" variant="drawer" labelledby="all-filters-title" @close="emit('close')">
    <div class="panel">
      <div class="panel__head">
        <h2 id="all-filters-title" class="panel__title">Все фильтры</h2>
        <button type="button" class="icon-btn" aria-label="Закрыть фильтры" @click="emit('close')">
          <AppIcon name="close" :size="16" :stroke="2" />
        </button>
      </div>

      <div class="panel__body">
        <fieldset class="group">
          <legend class="label">Бюджет</legend>
          <div class="seg">
            <button type="button" :aria-pressed="mode === 'price'" @click="setMode('price')">Цена объекта</button>
            <button type="button" :aria-pressed="mode === 'month'" @click="setMode('month')">Платёж в месяц</button>
          </div>
          <div v-if="mode === 'price'" class="pair">
            <label class="input-box">от <NumberInput v-model="draft.priceFrom" label="Цена от, рублей" placeholder="7 150 000" /></label>
            <label class="input-box">до <NumberInput v-model="draft.priceTo" label="Цена до, рублей" placeholder="56 000 000" /></label>
          </div>
          <div v-else class="pair">
            <label class="input-box">до <NumberInput v-model="draft.monthTo" label="Платёж в месяц до, рублей" placeholder="90 000" /> ₽</label>
          </div>
          <p v-if="mode === 'month'" class="hint">Ставка 6%, взнос 20%, срок 20 лет. Другие условия можно посчитать в калькуляторе.</p>
        </fieldset>

        <fieldset class="group">
          <legend class="label">Тип</legend>
          <div class="grid2">
            <label v-for="(name, key) in TYPES" :key="key" class="checkbox">
              <input type="checkbox" :checked="draft.types.includes(key)" @change="toggleIn('types', key)">
              {{ name }}
              <span class="count">{{ countBy('type', key) }}</span>
            </label>
          </div>
          <div class="seg seg--market">
            <button type="button" :aria-pressed="!draft.market" @click="draft.market = ''">Все</button>
            <button type="button" :aria-pressed="draft.market === 'new'" @click="draft.market = 'new'">Новостройки</button>
            <button type="button" :aria-pressed="draft.market === 'resale'" @click="draft.market = 'resale'">Вторичное</button>
          </div>
        </fieldset>

        <fieldset class="group">
          <legend class="label">Комнаты</legend>
          <div class="row">
            <button v-for="r in ROOMS" :key="r.value" type="button" class="chip" :aria-pressed="draft.rooms.includes(r.value)" @click="toggleIn('rooms', r.value)">{{ r.label }}</button>
          </div>
        </fieldset>

        <fieldset class="group">
          <legend class="label">Площадь, м²</legend>
          <div class="pair">
            <label class="input-box">от <NumberInput v-model="draft.areaFrom" label="Площадь от, квадратных метров" placeholder="27" /></label>
            <label class="input-box">до <NumberInput v-model="draft.areaTo" label="Площадь до, квадратных метров" placeholder="210" /></label>
          </div>
        </fieldset>

        <fieldset class="group">
          <legend class="label">Район</legend>
          <div class="grid2">
            <label v-for="d in DISTRICTS" :key="d.key" class="checkbox">
              <input type="checkbox" :checked="draft.districts.includes(d.key)" @change="toggleIn('districts', d.key)">
              {{ d.name }}
              <span class="count">{{ countBy('district', d.key) }}</span>
            </label>
          </div>
        </fieldset>

        <fieldset class="group">
          <legend class="label">До метро пешком</legend>
          <div class="row">
            <button v-for="m in METRO" :key="String(m.value)" type="button" class="chip" :aria-pressed="draft.metro === m.value" @click="draft.metro = m.value">{{ m.label }}</button>
          </div>
        </fieldset>

        <fieldset class="group">
          <legend class="label">Дополнительно</legend>
          <div class="grid2">
            <label class="checkbox"><input v-model="draft.notFirst" type="checkbox"> Не первый этаж</label>
            <label class="checkbox"><input v-model="draft.renovated" type="checkbox"> С ремонтом</label>
            <label class="checkbox"><input v-model="draft.parking" type="checkbox"> С парковкой</label>
          </div>
        </fieldset>
      </div>

      <div class="panel__foot">
        <button type="button" class="text-btn" @click="reset">Сбросить</button>
        <button type="button" class="btn btn--primary panel__apply" :disabled="!count" @click="apply">
          {{ count ? `Показать ${objectsWord(count)}` : 'Ничего не найдено' }}
        </button>
      </div>
    </div>
  </AppDialog>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.panel__head {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 0 24px;
  border-bottom: 1px solid var(--line);
  background: #fff;
}

.panel__title {
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 600;
}

.panel__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 26px;
  padding: 22px 24px 28px;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  border: 0;
}

.group legend {
  margin-bottom: 10px;
  padding: 0;
}

.pair {
  display: flex;
  gap: 8px;
}

.pair .input-box {
  flex: 1;
}

.hint {
  color: var(--muted);
  font-size: 12.5px;
  line-height: 1.5;
}

.grid2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.count {
  margin-left: auto;
  color: var(--muted);
}

.seg--market {
  margin-top: 4px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.row .chip {
  flex: 1;
  padding: 0 8px;
}

.panel__foot {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px 18px;
  border-top: 1px solid var(--line);
  background: #fff;
}

.panel__apply {
  flex: 1;
}
</style>
