<script setup>
// Поле для числа: пока в нём курсор, видно то, что человек печатает; после выхода из поля
// число приводится к допустимому диапазону и показывается с пробелами между разрядами.
const props = defineProps({
  modelValue: { type: Number, default: null },
  min: { type: Number, default: 0 },
  max: { type: Number, default: Infinity },
  decimal: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  inputId: { type: String, default: undefined },
  label: { type: String, default: undefined }
})
const emit = defineEmits(['update:modelValue', 'commit'])

const focused = ref(false)
const draft = ref('')

const display = computed(() => {
  if (focused.value) return draft.value
  if (props.modelValue === null || props.modelValue === undefined) return ''
  return props.decimal ? String(props.modelValue).replace('.', ',') : formatNumber(props.modelValue)
})

function parse(text) {
  const clean = props.decimal ? text.replace(',', '.').replace(/[^\d.]/g, '') : text.replace(/\D/g, '')
  return clean === '' ? null : Number(clean)
}

function onFocus() {
  focused.value = true
  draft.value = display.value === '' ? '' : String(props.modelValue ?? '').replace('.', props.decimal ? ',' : '.')
}

function onInput(e) {
  draft.value = e.target.value
  const value = parse(e.target.value)
  if (value === null || (value >= props.min && value <= props.max)) emit('update:modelValue', value)
}

function onBlur() {
  focused.value = false
  let value = parse(draft.value)
  if (value !== null) value = Math.min(Math.max(value, props.min), props.max)
  emit('update:modelValue', value)
  emit('commit', value)
}
</script>

<template>
  <input
    :id="inputId"
    :value="display"
    :aria-label="label"
    :placeholder="placeholder"
    type="text"
    :inputmode="decimal ? 'decimal' : 'numeric'"
    autocomplete="off"
    @focus="onFocus"
    @input="onInput"
    @blur="onBlur"
    @keydown.enter.prevent="$event.target.blur()"
  >
</template>
