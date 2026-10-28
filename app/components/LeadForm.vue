<script setup>
// Заявка на подбор: имя, телефон с маской, бюджет. Ошибки показываются рядом с полем.
const name = ref('')
const phone = ref('')
const BUDGETS = ['Пока не знаю', 'до 10 млн ₽', '10–20 млн ₽', '20–40 млн ₽', 'от 40 млн ₽'].map((b) => ({ value: b, label: b }))
const budget = ref(BUDGETS[0].value)
const errors = ref({})
const status = ref('idle')

function onPhone(e) {
  phone.value = maskPhone(e.target.value)
}

async function submit() {
  errors.value = validateContact({ name: name.value, phone: phone.value })
  if (Object.keys(errors.value).length) return
  status.value = 'sending'
  try {
    await sendLead({ form: 'selection', name: name.value.trim(), phone: phone.value, budget: budget.value })
    status.value = 'done'
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <div v-if="status === 'done'" class="lead-done" role="status">
    <AppIcon name="check" :size="26" :stroke="2" />
    <p><strong>Заявка принята.</strong> Агент перезвонит в течение дня и пришлёт подборку.</p>
  </div>
  <form v-else class="lead-form" novalidate aria-label="Заявка на подбор" @submit.prevent="submit">
    <div class="lead-form__fields">
      <label class="field">
        <span class="label">Имя</span>
        <input v-model="name" class="field__input" type="text" autocomplete="name" placeholder="Как к вам обращаться" :aria-invalid="!!errors.name" aria-describedby="lead-name-error">
        <span id="lead-name-error" class="field__error">{{ errors.name }}</span>
      </label>
      <label class="field">
        <span class="label">Телефон</span>
        <input :value="phone" class="field__input" type="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" :aria-invalid="!!errors.phone" aria-describedby="lead-phone-error" @input="onPhone">
        <span id="lead-phone-error" class="field__error">{{ errors.phone }}</span>
      </label>
      <div class="field">
        <span id="lead-budget" class="label">Бюджет</span>
        <SelectMenu v-model="budget" :options="BUDGETS" labelledby="lead-budget" variant="box" />
      </div>
    </div>
    <div class="lead-form__actions">
      <button class="btn btn--primary" type="submit" :disabled="status === 'sending'">Получить подборку</button>
      <p class="lead-form__note">Нажимая кнопку, вы соглашаетесь на обработку данных для ответа на заявку.</p>
    </div>
    <p v-if="status === 'error'" class="field__error" role="alert">Не получилось отправить. Позвоните нам: +7 812 000-00-00.</p>
  </form>
</template>

<style scoped>
.lead-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lead-form__fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.field__error {
  min-height: 18px;
}

.lead-form__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 24px;
}

.lead-form__note {
  max-width: 380px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.lead-done {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 28px;
  border-radius: var(--radius);
  background: #fff;
  color: var(--brand);
}

.lead-done p {
  color: var(--ink);
  font-size: 17px;
}

@media (max-width: 860px) {
  .lead-form__fields {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
