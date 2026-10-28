<script setup>
// Ипотечный калькулятор: у каждого параметра поле для точного числа и ползунок.
// Взнос хранится долей от цены, поэтому при смене цены процент взноса сохраняется.
const props = defineProps({
  price: { type: Number, default: 14800000 },
  fixedPrice: { type: Boolean, default: false },
  cta: { type: Boolean, default: true },
  idPrefix: { type: String, default: 'm' }
})

const RATES = [6, 12, 18]
const price = ref(props.price)
const share = ref(MORTGAGE_DEFAULTS.downShare)
const years = ref(MORTGAGE_DEFAULTS.years)
const rate = ref(MORTGAGE_DEFAULTS.rate)

const down = computed({
  get: () => Math.round((price.value * share.value) / 1000) * 1000,
  set: (value) => (share.value = price.value ? Math.min(Math.max(value ?? 0, 0), price.value) / price.value : 0)
})
const percent = computed(() => Math.round(share.value * 100))
const result = computed(() => calcMortgage({ price: price.value || 0, down: down.value, rate: rate.value ?? 0, years: years.value || 1 }))
const customRate = computed({
  get: () => (RATES.includes(rate.value) ? null : rate.value),
  set: (value) => {
    if (value !== null) rate.value = value
  }
})
const catalogLink = computed(() => ({ path: '/catalog', query: { month_to: String(Math.ceil(result.value.monthly / 1000) * 1000) } }))
const id = (name) => `${props.idPrefix}-${name}`
</script>

<template>
  <div class="calc">
    <div class="calc__inputs">
      <div v-if="!fixedPrice" class="calc__row">
        <div class="calc__head">
          <label :for="id('price')">Стоимость объекта</label>
          <span class="input-box calc__box">
            <NumberInput :input-id="id('price')" v-model="price" :min="1000000" :max="300000000" />
            <span>₽</span>
          </span>
        </div>
        <input v-model.number="price" type="range" min="3000000" max="60000000" step="100000" aria-label="Стоимость объекта, ползунок">
      </div>

      <div class="calc__row">
        <div class="calc__head">
          <label :for="id('down')">Первоначальный взнос <span class="calc__percent num">{{ percent }}%</span></label>
          <span class="input-box calc__box">
            <NumberInput :input-id="id('down')" v-model="down" :max="price" />
            <span>₽</span>
          </span>
        </div>
        <input v-model.number="share" type="range" min="0" max="0.9" step="0.01" aria-label="Первоначальный взнос, ползунок" :aria-valuetext="`${percent}%`">
      </div>

      <div class="calc__row">
        <div class="calc__head">
          <label :for="id('years')">Срок</label>
          <span class="input-box calc__box">
            <NumberInput :input-id="id('years')" v-model="years" :min="1" :max="30" />
            <span>{{ plural(years || 0, ['год', 'года', 'лет']) }}</span>
          </span>
        </div>
        <input v-model.number="years" type="range" min="1" max="30" step="1" aria-label="Срок, ползунок">
      </div>

      <fieldset class="calc__rates">
        <legend>Ставка, % годовых</legend>
        <div class="calc__rate-list">
          <button v-for="r in RATES" :key="r" type="button" class="chip" :aria-pressed="rate === r" @click="rate = r">{{ r }}</button>
          <label class="input-box calc__custom">
            своя
            <NumberInput v-model="customRate" decimal :max="40" placeholder="9,5" label="Своя ставка, процентов годовых" />
          </label>
        </div>
      </fieldset>
    </div>

    <div class="calc__result">
      <div class="calc__payment">
        <span class="label">Платёж в месяц</span>
        <output class="calc__monthly serif-num" aria-live="polite">{{ formatPrice(result.monthly) }}</output>
      </div>
      <dl class="calc__list">
        <div><dt>Сумма кредита</dt><dd class="num">{{ formatPrice(result.loan) }}</dd></div>
        <div><dt>Переплата</dt><dd class="num">{{ formatPrice(result.overpay) }}</dd></div>
        <div><dt>Всего выплат</dt><dd class="num">{{ formatPrice(result.total) }}</dd></div>
      </dl>
      <NuxtLink v-if="cta" :to="catalogLink" class="btn btn--primary">Подобрать объекты под этот платёж</NuxtLink>
      <p class="calc__note">Расчёт предварительный, аннуитетный платёж. Точные условия называет банк.</p>
    </div>
  </div>
</template>

<style scoped>
.calc {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: 64px;
  align-items: center;
}

.calc__inputs {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.calc__row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.calc__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.calc__head label {
  color: var(--muted);
  font-size: 15px;
}

.calc__box {
  width: 220px;
}

.calc__box input {
  text-align: right;
  font-size: 16px;
  font-weight: 700;
}

.calc__percent {
  margin-left: 6px;
  padding: 3px 8px;
  border-radius: 3px;
  background: var(--sage);
  color: var(--brand);
  font-size: 13px;
  font-weight: 700;
}

input[type='range'] {
  width: 100%;
  accent-color: var(--brand);
}

.calc__rates {
  margin: 0;
  padding: 0;
  border: 0;
}

.calc__rates legend {
  margin-bottom: 12px;
  padding: 0;
  color: var(--muted);
  font-size: 15px;
}

.calc__rate-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.calc__rate-list .chip {
  min-height: 46px;
  padding: 0 20px;
  font-size: 15px;
}

.calc__custom {
  width: 120px;
}

.calc__result {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: clamp(24px, 3.6vw, 48px);
  border-radius: var(--radius);
  background: var(--stone);
}

.calc__payment {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calc__monthly {
  color: var(--brand);
  font-size: clamp(48px, 5.4vw, 78px);
  line-height: 0.95;
}

.calc__list {
  border-top: 1px solid var(--line-2);
}

.calc__list div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 0;
  border-bottom: 1px solid var(--line-2);
}

.calc__list dt {
  color: var(--muted);
}

.calc__list dd {
  font-weight: 700;
}

.calc__note {
  color: var(--muted);
  font-size: 12.5px;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .calc {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }
}

@media (max-width: 480px) {
  .calc__head {
    flex-wrap: wrap;
  }

  .calc__box {
    width: 100%;
  }
}
</style>
