<script setup>
// Строка фильтров каталога. На десктопе основные фильтры в выпадающих панелях,
// на телефоне одна кнопка «Фильтры», которая открывает панель на весь экран.
import { DISTRICTS, TYPES } from '~/data/properties'

const props = defineProps({ filters: { type: Object, required: true } })
const emit = defineEmits(['update', 'open-panel', 'open-map'])

const f = computed(() => props.filters)
const activeCount = computed(() => activeChips(f.value).length)
const budgetMode = ref(props.filters.priceFrom || props.filters.priceTo ? 'price' : 'month')

const ROOMS = [{ value: 0, label: 'Студия' }, { value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4+' }]
const MONTH_PICKS = [50000, 90000, 150000]
const PRICE_PICKS = [10000000, 15000000, 25000000]
const SORT_OPTIONS = Object.entries(SORTS).map(([value, label]) => ({ value, label }))

const typeLabel = computed(() => (f.value.types.length ? f.value.types.map((t) => TYPES[t]).join(', ') : 'Тип'))
const roomsText = computed(() => (f.value.rooms.length ? roomsLabel(f.value.rooms) : 'Комнаты'))
const budgetLabel = computed(() => {
  const chip = activeChips(f.value).find((c) => c.key === 'month' || c.key === 'price')
  return chip ? chip.label.charAt(0).toUpperCase() + chip.label.slice(1) : 'Бюджет'
})
const districtText = computed(() => {
  const n = f.value.districts.length
  if (!n) return 'Район'
  return n > 2 ? `Районы: ${n}` : f.value.districts.map((k) => DISTRICTS.find((d) => d.key === k).name).join(', ')
})

// Передаём функцию: страница применит её к самому свежему состоянию фильтров
const toggleIn = (key, value) => {
  emit('update', (current) => {
    const list = current[key]
    return { [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] }
  })
}

function setBudgetMode(value) {
  budgetMode.value = value
  emit('update', { priceFrom: null, priceTo: null, monthTo: null })
}
</script>

<template>
  <div class="bar">
    <div class="bar__row side">
      <div class="bar__filters">
        <FilterPopover id="type" :label="typeLabel" :active="!!f.types.length">
          <template #default="{ close }">
            <div class="pop-list">
              <label v-for="(name, key) in TYPES" :key="key" class="checkbox">
                <input type="checkbox" :checked="f.types.includes(key)" @change="toggleIn('types', key)"> {{ name }}
              </label>
            </div>
            <button type="button" class="btn btn--outline pop-done" @click="close">Готово</button>
          </template>
        </FilterPopover>

        <FilterPopover id="rooms" :label="roomsText" :active="!!f.rooms.length" width="340px">
          <template #default="{ close }">
            <div class="pop-row">
              <button v-for="r in ROOMS" :key="r.value" type="button" class="chip" :aria-pressed="f.rooms.includes(r.value)" @click="toggleIn('rooms', r.value)">{{ r.label }}</button>
            </div>
            <button type="button" class="btn btn--outline pop-done" @click="close">Готово</button>
          </template>
        </FilterPopover>

        <FilterPopover id="budget" :label="budgetLabel" :active="!!(f.monthTo || f.priceFrom || f.priceTo)" width="360px">
          <template #default="{ close }">
            <div class="seg">
              <button type="button" :aria-pressed="budgetMode === 'price'" @click="setBudgetMode('price')">Цена объекта</button>
              <button type="button" :aria-pressed="budgetMode === 'month'" @click="setBudgetMode('month')">Платёж в месяц</button>
            </div>
            <div v-if="budgetMode === 'price'" class="pop-pair">
              <label class="input-box">от <NumberInput :model-value="f.priceFrom" label="Цена от, рублей" placeholder="0" @commit="(v) => emit('update', { priceFrom: v })" /></label>
              <label class="input-box">до <NumberInput :model-value="f.priceTo" label="Цена до, рублей" placeholder="20 000 000" @commit="(v) => emit('update', { priceTo: v })" /></label>
            </div>
            <div v-else class="pop-pair">
              <label class="input-box">до <NumberInput :model-value="f.monthTo" label="Платёж в месяц до, рублей" placeholder="90 000" @commit="(v) => emit('update', { monthTo: v })" /> ₽</label>
            </div>
            <div class="pop-row">
              <template v-if="budgetMode === 'month'">
                <button v-for="v in MONTH_PICKS" :key="v" type="button" class="chip" :aria-pressed="f.monthTo === v" @click="emit('update', { monthTo: v })">до {{ formatNumber(v / 1000) }} тыс.</button>
              </template>
              <template v-else>
                <button v-for="v in PRICE_PICKS" :key="v" type="button" class="chip" :aria-pressed="f.priceTo === v && !f.priceFrom" @click="emit('update', { priceFrom: null, priceTo: v })">до {{ formatMillions(v) }}</button>
              </template>
            </div>
            <p v-if="budgetMode === 'month'" class="pop-hint">Ставка 6%, взнос 20%, срок 20 лет.</p>
            <button type="button" class="btn btn--outline pop-done" @click="close">Готово</button>
          </template>
        </FilterPopover>

        <FilterPopover id="district" :label="districtText" :active="!!f.districts.length" width="380px">
          <template #default="{ close }">
            <div class="pop-grid">
              <label v-for="d in DISTRICTS" :key="d.key" class="checkbox">
                <input type="checkbox" :checked="f.districts.includes(d.key)" @change="toggleIn('districts', d.key)"> {{ d.name }}
              </label>
            </div>
            <button type="button" class="btn btn--outline pop-done" @click="close">Готово</button>
          </template>
        </FilterPopover>

        <button type="button" class="bar__all" @click="emit('open-panel')">
          <AppIcon name="filters" :size="16" />
          <span class="bar__all-desktop">Все фильтры</span>
          <span class="bar__all-mobile">Фильтры</span>
          <span v-if="activeCount" class="bar__badge">{{ activeCount }}</span>
        </button>
      </div>

      <div class="bar__tools">
        <div class="bar__sort">
          <span class="bar__sort-label" aria-hidden="true">Сортировка:</span>
          <SelectMenu
            :model-value="f.sort"
            :options="SORT_OPTIONS"
            label="Сортировка"
            variant="inline"
            align="right"
            @update:model-value="emit('update', { sort: $event })"
          />
        </div>
        <div class="seg bar__view" role="group" aria-label="Вид каталога">
          <button type="button" :aria-pressed="f.view === 'grid'" @click="emit('update', { view: 'grid' })"><AppIcon name="grid" :size="16" /> Плиткой</button>
          <button type="button" :aria-pressed="f.view === 'map'" @click="emit('update', { view: 'map' })"><AppIcon name="map" :size="16" /> С картой</button>
        </div>
        <button type="button" class="icon-btn bar__map-btn" aria-label="Показать на карте" @click="emit('open-map')">
          <AppIcon name="pin" :size="19" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bar {
  position: sticky;
  top: 0;
  z-index: 30;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: #fff;
}

.bar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  padding-top: 14px;
  padding-bottom: 14px;
}

.bar__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.bar__all {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--line-2);
  border-radius: 3px;
  background: #fff;
  font-size: 14.5px;
  font-weight: 600;
}

.bar__all:hover {
  border-color: var(--ink);
}

.bar__all-mobile {
  display: none;
}

.bar__badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: var(--brand);
  color: #fff;
  font-size: 12px;
  line-height: 20px;
}

.bar__tools {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.bar__sort {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--muted);
  font-size: 14.5px;
}

.bar__view button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.bar__map-btn {
  display: none;
  border-radius: 3px;
  border-color: var(--line-2);
}

.pop-list,
.pop-grid {
  display: grid;
  gap: 0 16px;
}

.pop-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.pop-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.pop-row:first-child {
  margin-top: 0;
}

.pop-pair {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.pop-pair .input-box {
  flex: 1;
}

.pop-hint {
  margin-top: 10px;
  color: var(--muted);
  font-size: 12.5px;
}

.pop-done {
  width: 100%;
  min-height: 44px;
  margin-top: 16px;
}

@media (max-width: 1180px) {
  .bar__view {
    display: none;
  }

  .bar__map-btn {
    display: inline-flex;
  }
}

@media (max-width: 860px) {
  .bar__filters > :not(.bar__all) {
    display: none;
  }

  .bar__all-desktop,
  .bar__sort-label {
    display: none;
  }

  .bar__all-mobile {
    display: inline;
  }

  .bar__row {
    flex-wrap: nowrap;
    gap: 8px;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .bar__tools {
    gap: 8px;
  }
}
</style>
