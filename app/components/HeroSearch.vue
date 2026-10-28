<script setup>
// Поиск на главной: собирает фильтры и открывает каталог с ними в адресе.
// Число на кнопке пересчитывается сразу, ещё до перехода.
import { DISTRICTS, properties } from '~/data/properties'

const kind = ref('')
const rooms = ref([])
const mode = ref('month')
const amount = ref(null)
const district = ref('')

const KINDS = [
  { value: '', label: 'Любую недвижимость' },
  { value: 'flat', label: 'Квартиру' },
  { value: 'apartments', label: 'Апартаменты' },
  { value: 'house,townhouse', label: 'Дом или таунхаус' }
]
const DISTRICT_OPTIONS = [{ value: '', label: 'Любой' }, ...DISTRICTS.map((d) => ({ value: d.key, label: d.name }))]
const ROOMS = [{ value: 0, label: 'Ст' }, { value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4+' }]

const query = computed(() => {
  const q = {}
  if (kind.value) q.type = kind.value
  if (rooms.value.length) q.rooms = [...rooms.value].sort().join(',')
  if (amount.value) q[mode.value === 'month' ? 'month_to' : 'price_to'] = String(amount.value)
  if (district.value) q.district = district.value
  return q
})

const count = computed(() => applyFilters(properties, parseFilters(query.value)).length)

function toggleRoom(value) {
  rooms.value = rooms.value.includes(value) ? rooms.value.filter((r) => r !== value) : [...rooms.value, value]
}

function setMode(value) {
  mode.value = value
  amount.value = null
}

function submit() {
  navigateTo({ path: '/catalog', query: query.value })
}
</script>

<template>
  <form class="search" role="search" aria-label="Поиск недвижимости" @submit.prevent="submit">
    <div class="search__cell">
      <span id="search-kind" class="label">Что ищете</span>
      <SelectMenu v-model="kind" :options="KINDS" labelledby="search-kind" />
    </div>

    <fieldset class="search__cell">
      <legend class="label search__legend">Комнаты</legend>
      <div class="search__rooms">
        <button
          v-for="r in ROOMS"
          :key="r.value"
          type="button"
          class="chip"
          :aria-pressed="rooms.includes(r.value)"
          :aria-label="r.value === 0 ? 'Студия' : r.value === 4 ? '4 комнаты и больше' : `${r.label} комн.`"
          @click="toggleRoom(r.value)"
        >
          {{ r.label }}
        </button>
      </div>
    </fieldset>

    <div class="search__cell">
      <div class="search__budget-head">
        <span id="budget-label" class="label">Бюджет</span>
        <div class="toggle" role="group" aria-label="Считать бюджет">
          <button type="button" :aria-pressed="mode === 'price'" @click="setMode('price')">цена</button>
          <button type="button" :aria-pressed="mode === 'month'" @click="setMode('month')">в месяц</button>
        </div>
      </div>
      <label class="search__amount">
        <span class="search__muted">до</span>
        <NumberInput
          v-model="amount"
          :max="mode === 'month' ? 1000000 : 500000000"
          :placeholder="mode === 'month' ? '90 000' : '20 000 000'"
          :label="mode === 'month' ? 'Платёж в месяц до, рублей' : 'Цена до, рублей'"
        />
        <span>₽</span>
      </label>
    </div>

    <div class="search__cell">
      <span id="search-district" class="label">Район</span>
      <SelectMenu v-model="district" :options="DISTRICT_OPTIONS" labelledby="search-district" />
    </div>

    <button class="search__submit" type="submit">
      <AppIcon name="search" :size="18" />
      <span aria-live="polite">Показать {{ objectsWord(count) }}</span>
    </button>
  </form>
</template>

<style scoped>
.search {
  display: grid;
  /* Ширины подобраны так, чтобы «Любую недвижимость» и «Василеостровский» помещались целиком */
  grid-template-columns: 1.13fr 0.94fr 1.12fr 1fr minmax(210px, auto);
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow), 0 0 0 1px #ece7e0;
}

.search__cell {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  margin: 0;
  padding: 16px 20px;
  border: 0;
}

.search__cell + .search__cell {
  border-left: 1px solid var(--line);
}

.search__legend {
  float: left;
  padding: 0;
}

.search__rooms {
  clear: both;
  display: flex;
  gap: 6px;
}

.search__rooms .chip {
  flex: 1;
  min-height: 36px;
  padding: 0;
}

.search__budget-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.toggle {
  display: flex;
  padding: 3px;
  border-radius: var(--radius);
  background: var(--stone);
}

.toggle button {
  min-height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
}

.toggle button[aria-pressed='true'] {
  background: #fff;
  color: var(--ink);
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(30, 36, 34, 0.16);
}

.search__amount {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 17px;
  font-weight: 600;
}

.search__amount input {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 17px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.search__amount:focus-within {
  box-shadow: inset 0 -1px 0 var(--brand);
}

.search__muted {
  color: var(--muted);
  font-weight: 500;
}

.search__submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 64px;
  padding: 0 26px;
  border: 0;
  border-radius: 0 var(--radius) var(--radius) 0;
  background: var(--brand);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}

.search__submit:hover {
  background: var(--brand-dark);
}

@media (max-width: 1259px) {
  .search {
    grid-template-columns: 1fr 1fr;
  }

  .search__cell + .search__cell {
    border-left: 0;
  }

  .search__cell {
    border-top: 1px solid var(--line) !important;
  }

  .search__cell:nth-child(-n + 2) {
    border-top: 0 !important;
  }

  .search__cell:nth-child(even) {
    border-left: 1px solid var(--line) !important;
  }

  .search__submit {
    grid-column: 1 / -1;
    border-radius: 0 0 var(--radius) var(--radius);
  }
}

@media (max-width: 600px) {
  .search {
    grid-template-columns: 1fr;
  }

  .search__cell:nth-child(even) {
    border-left: 0 !important;
  }

  .search__cell:nth-child(2) {
    border-top: 1px solid var(--line) !important;
  }

  .search__cell {
    padding: 14px 16px;
  }
}
</style>
