<script setup>
// Запись на просмотр: день, время, формат, контакты. После записи можно скачать событие в календарь.
const props = defineProps({
  open: { type: Boolean, default: false },
  property: { type: Object, required: true },
  agent: { type: Object, required: true }
})
const emit = defineEmits(['close'])

const now = ref(new Date())
const days = ref([])
const dayKey = ref('')
const time = ref('')
const format = ref('flat')
const name = ref('')
const phone = ref('')
const errors = ref({})
const step = ref('form')

const day = computed(() => days.value.find((d) => d.key === dayKey.value))
const slots = computed(() => (day.value ? getSlots(props.property.slug, day.value.date, now.value) : []))
const title = computed(() => shortTitle(props.property))

watch(
  () => props.open,
  (open) => {
    if (!open) return
    now.value = new Date()
    days.value = getDays(props.property.slug, now.value)
    dayKey.value = days.value[0]?.key || ''
    time.value = ''
    errors.value = {}
    step.value = 'form'
  }
)

function pickDay(key) {
  dayKey.value = key
  if (!slots.value.find((s) => s.time === time.value)?.free) time.value = ''
}

async function submit() {
  errors.value = validateContact({ name: name.value, phone: phone.value })
  if (!time.value) errors.value.time = 'Выберите время просмотра'
  if (Object.keys(errors.value).length) return
  try {
    await sendLead({
      form: 'viewing',
      object: props.property.slug,
      date: dayKey.value,
      time: time.value,
      format: format.value === 'flat' ? 'в квартире' : 'по видеосвязи',
      name: name.value.trim(),
      phone: phone.value
    })
    step.value = 'done'
  } catch {
    errors.value = { send: 'Не получилось отправить. Позвоните агенту: ' + props.agent.phone }
  }
}

function downloadIcs() {
  const ics = makeIcs({
    date: day.value.date,
    time: time.value,
    title: `Просмотр: ${title.value}`,
    location: `Санкт-Петербург, ${props.property.address}`,
    description: `Агент ${props.agent.name}, ${props.agent.phone}`
  })
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `prosmotr-${props.property.slug}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <AppDialog :open="open" labelledby="booking-title" @close="emit('close')">
    <div v-if="step === 'form'" class="book">
      <div class="book__head">
        <h2 id="booking-title" class="book__title">Запись на просмотр</h2>
        <button type="button" class="icon-btn" aria-label="Закрыть" @click="emit('close')"><AppIcon name="close" :size="16" :stroke="2" /></button>
      </div>

      <div class="book__object">
        <img :src="photo(property.slug, 1, 400)" width="96" height="72" alt="">
        <div class="book__object-text">
          <strong>{{ title }}</strong>
          <span>{{ property.address }}<template v-if="property.metro && property.district !== 'suburbs'"> · {{ property.metro.name }}, {{ metroLabel(property) }}</template></span>
        </div>
        <span class="book__price num">{{ formatPrice(property.price) }}</span>
      </div>

      <form novalidate @submit.prevent="submit">
        <fieldset class="book__group">
          <legend class="label">День</legend>
          <div class="book__days">
            <button
              v-for="d in days"
              :key="d.key"
              type="button"
              class="book__day"
              :aria-pressed="d.key === dayKey"
              :aria-label="dayFull(d.date)"
              @click="pickDay(d.key)"
            >
              <span>{{ d.weekday }}</span><strong>{{ d.day }}</strong><span>{{ d.month }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset class="book__group">
          <legend class="label">Время</legend>
          <div class="book__slots">
            <button
              v-for="s in slots"
              :key="s.time"
              type="button"
              class="chip book__slot"
              :aria-pressed="time === s.time"
              :disabled="!s.free"
              :aria-label="s.free ? s.time : `${s.time}, занято`"
              @click="time = s.time"
            >
              {{ s.time }}
            </button>
          </div>
          <p class="book__hint">Зачёркнутое время уже занято или прошло.</p>
          <p v-if="errors.time" class="field__error" role="alert">{{ errors.time }}</p>
        </fieldset>

        <div class="seg book__format" role="group" aria-label="Как смотреть">
          <button type="button" :aria-pressed="format === 'flat'" @click="format = 'flat'"><AppIcon name="home" :size="17" /> {{ property.type === 'house' ? 'В доме' : 'На месте' }}</button>
          <button type="button" :aria-pressed="format === 'video'" @click="format = 'video'"><AppIcon name="video" :size="17" /> По видеосвязи</button>
        </div>

        <div class="book__fields">
          <label class="field">
            <span class="label">Имя</span>
            <input v-model="name" class="field__input" type="text" autocomplete="name" :aria-invalid="!!errors.name" aria-describedby="book-name-error">
            <span id="book-name-error" class="field__error">{{ errors.name }}</span>
          </label>
          <label class="field">
            <span class="label">Телефон</span>
            <input :value="phone" class="field__input" type="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" :aria-invalid="!!errors.phone" aria-describedby="book-phone-error" @input="phone = maskPhone($event.target.value)">
            <span id="book-phone-error" class="field__error">{{ errors.phone }}</span>
          </label>
        </div>

        <button type="submit" class="btn btn--primary btn--block">
          {{ time && day ? `Записаться на ${dayTitle(day.date)}, ${time}` : 'Записаться на просмотр' }}
        </button>
        <p v-if="errors.send" class="field__error" role="alert">{{ errors.send }}</p>
        <div class="book__agent">
          <img :src="asset(`img/agents/${agent.photo}-240.webp`)" width="40" height="50" alt="">
          <span>{{ agent.name }} подтвердит время звонком. Просмотр бесплатный, ни к чему не обязывает.</span>
        </div>
      </form>
    </div>

    <div v-else class="book book--done">
      <span class="book__check"><AppIcon name="check" :size="28" :stroke="1.8" /></span>
      <h2 id="booking-title" class="book__title">Вы записаны</h2>
      <dl class="book__summary">
        <div><dt>Когда</dt><dd>{{ dayFull(day.date) }}, {{ time }}</dd></div>
        <div><dt>Где</dt><dd>{{ property.address }}</dd></div>
        <div><dt>Формат</dt><dd>{{ format === 'flat' ? 'просмотр на месте' : 'по видеосвязи' }}</dd></div>
        <div><dt>Агент</dt><dd>{{ agent.name }}</dd></div>
      </dl>
      <p class="book__note">{{ agent.name.split(' ')[0] }} перезвонит, чтобы подтвердить время, и пришлёт точный адрес в сообщении.</p>
      <button type="button" class="btn btn--outline btn--block" @click="downloadIcs"><AppIcon name="calendarPlus" :size="18" /> Добавить в календарь</button>
      <button type="button" class="text-btn book__back" @click="emit('close')">Вернуться к объекту</button>
    </div>
  </AppDialog>
</template>

<style scoped>
.book {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 32px 34px;
}

.book form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.book__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.book__title {
  font-family: var(--serif);
  font-size: 38px;
  font-weight: 600;
  line-height: 1;
}

.book__object {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.book__object img {
  width: 96px;
  height: 72px;
  object-fit: cover;
  border-radius: 3px;
}

.book__object-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
  font-size: 14px;
  color: var(--muted);
}

.book__object-text strong {
  color: var(--ink);
  font-size: 16px;
}

.book__price {
  font-size: 17px;
  font-weight: 700;
  white-space: nowrap;
}

.book__group {
  margin: 0;
  padding: 0;
  border: 0;
}

.book__group legend {
  margin-bottom: 10px;
  padding: 0;
}

.book__days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.book__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 68px;
  border: 1px solid var(--line-2);
  border-radius: 3px;
  background: #fff;
  font-size: 12px;
  font-weight: 600;
}

.book__day strong {
  font-size: 19px;
  line-height: 1;
}

.book__day:hover {
  border-color: var(--ink);
}

.book__day[aria-pressed='true'] {
  border-color: var(--brand);
  background: var(--sage);
  color: var(--brand);
}

.book__slots {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.book__slot {
  min-height: 46px;
  font-size: 15px;
}

.book__slot:disabled {
  background: var(--stone);
  border-color: var(--line);
  color: var(--faint);
  text-decoration: line-through;
  cursor: not-allowed;
}

.book__hint {
  margin-top: 8px;
  color: var(--muted);
  font-size: 12.5px;
}

.book__format button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
}

.book__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.book__agent {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--muted);
  font-size: 13.5px;
  line-height: 1.5;
}

.book__agent img {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  object-fit: cover;
  object-position: top;
  border-radius: 50%;
}

.book--done {
  max-width: 460px;
  margin: 0 auto;
}

.book__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--stone);
  color: var(--brass-text);
}

.book__summary {
  border-top: 1px solid var(--line);
}

.book__summary div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
}

.book__summary dt {
  color: var(--muted);
}

.book__summary dd {
  font-weight: 700;
  text-align: right;
}

.book__note {
  color: var(--ink-2);
  font-size: 15px;
  line-height: 1.6;
}

.book__back {
  align-self: center;
}

@media (max-width: 600px) {
  .book {
    padding: 20px 16px 28px;
  }

  .book__title {
    font-size: 30px;
  }

  .book__days {
    display: flex;
    overflow-x: auto;
    margin-right: -16px;
    padding-right: 16px;
  }

  .book__day {
    flex: 0 0 58px;
  }

  .book__price {
    display: none;
  }

  .book__fields {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
