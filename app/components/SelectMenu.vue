<script setup>
// Выпадающий список вместо системного <select>: выглядит одинаково во всех браузерах.
// Клавиатура по образцу ARIA combobox: стрелки, Home, End, Enter, Esc, поиск по первым буквам.
// Открыт только один список или фильтр на странице (общее состояние с FilterPopover).
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, required: true },
  labelledby: { type: String, default: null },
  label: { type: String, default: null },
  variant: { type: String, default: 'plain' },
  align: { type: String, default: 'left' }
})
const emit = defineEmits(['update:modelValue'])

const OPTION_HEIGHT = 42
const MAX_HEIGHT = 440

const uid = useId()
const openId = useState('filter-popover', () => null)
const open = computed(() => openId.value === uid)
const active = ref(0)
const up = ref(false)
const root = ref(null)
const trigger = ref(null)
const list = ref(null)

const selectedIndex = computed(() => Math.max(0, props.options.findIndex((o) => o.value === props.modelValue)))
const optionId = (i) => `${uid}-opt-${i}`

function show(index = selectedIndex.value) {
  const rect = trigger.value.getBoundingClientRect()
  const below = window.innerHeight - rect.bottom
  const need = Math.min(props.options.length * OPTION_HEIGHT + 12, MAX_HEIGHT, window.innerHeight * 0.6) + 24
  up.value = below < need && rect.top > below
  active.value = index
  openId.value = uid
  nextTick(scrollToActive)
}

function hide(focus = false) {
  if (open.value) openId.value = null
  if (focus) trigger.value?.focus()
}

function choose(index, focus = true) {
  emit('update:modelValue', props.options[index].value)
  hide(focus)
}

function move(index) {
  active.value = Math.min(props.options.length - 1, Math.max(0, index))
  nextTick(scrollToActive)
}

// Прокручиваем только сам список, страницу не трогаем
function scrollToActive() {
  const box = list.value
  const el = box?.children[active.value]
  if (!el) return
  if (el.offsetTop < box.scrollTop) box.scrollTop = el.offsetTop - 6
  else if (el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight) {
    box.scrollTop = el.offsetTop + el.offsetHeight - box.clientHeight + 6
  }
}

let typed = ''
let typedAt = 0

function findByText(char) {
  const now = Date.now()
  typed = now - typedAt > 700 ? char.toLowerCase() : typed + char.toLowerCase()
  typedAt = now
  const n = props.options.length
  const start = typed.length === 1 ? active.value + 1 : active.value
  for (let k = 0; k < n; k++) {
    const i = (start + k) % n
    if (props.options[i].label.toLowerCase().startsWith(typed)) return i
  }
  return -1
}

function onKey(e) {
  const last = props.options.length - 1
  const printable = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
  const typing = e.key === ' ' && Date.now() - typedAt < 700

  if (!open.value) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault()
      show()
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      show(e.key === 'Home' ? 0 : last)
    } else if (printable) {
      const i = findByText(e.key)
      if (i >= 0) show(i)
    }
    return
  }

  const keys = {
    ArrowDown: () => move(active.value + 1),
    ArrowUp: () => (e.altKey ? choose(active.value) : move(active.value - 1)),
    PageDown: () => move(active.value + 5),
    PageUp: () => move(active.value - 5),
    Home: () => move(0),
    End: () => move(last),
    Enter: () => choose(active.value),
    ' ': () => choose(active.value),
    Escape: () => hide()
  }
  if (keys[e.key] && !typing) {
    e.preventDefault()
    keys[e.key]()
  } else if (e.key === 'Tab') {
    choose(active.value, false)
  } else if (printable) {
    e.preventDefault()
    const i = findByText(e.key)
    if (i >= 0) move(i)
  }
}

function onDocDown(e) {
  if (open.value && !root.value?.contains(e.target)) hide()
}

onMounted(() => document.addEventListener('pointerdown', onDocDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocDown))
</script>

<template>
  <div ref="root" class="sm" :class="[`sm--${variant}`, { 'is-open': open }]">
    <div
      ref="trigger"
      class="sm__trigger"
      role="combobox"
      tabindex="0"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="`${uid}-list`"
      :aria-labelledby="labelledby || undefined"
      :aria-label="label || undefined"
      :aria-activedescendant="open ? optionId(active) : undefined"
      @click="open ? hide() : show()"
      @keydown="onKey"
    >
      <span class="sm__value">{{ options[selectedIndex]?.label }}</span>
      <AppIcon class="sm__chevron" name="down" :size="variant === 'inline' ? 14 : 16" :stroke="2.2" />
    </div>
    <Transition name="sm">
      <ul
        v-show="open"
        :id="`${uid}-list`"
        ref="list"
        class="sm__list"
        :class="{ 'sm__list--up': up, 'sm__list--right': align === 'right' }"
        role="listbox"
        :aria-labelledby="labelledby || undefined"
        :aria-label="label || undefined"
        @mousedown.prevent
      >
        <li
          v-for="(o, i) in options"
          :id="optionId(i)"
          :key="o.value"
          class="sm__option"
          :class="{ 'is-active': i === active }"
          role="option"
          :aria-selected="i === selectedIndex"
          @mousemove="active = i"
          @click="choose(i)"
        >
          <span>{{ o.label }}</span>
          <AppIcon v-if="i === selectedIndex" name="check" :size="16" :stroke="2.2" />
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.sm {
  position: relative;
  min-width: 0;
}

.sm__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  color: var(--ink);
  cursor: pointer;
  user-select: none;
}

.sm__value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sm__chevron {
  flex-shrink: 0;
  color: var(--muted);
  transition: transform 0.2s;
}

.is-open .sm__chevron {
  transform: rotate(180deg);
}

/* Без рамки: ячейки поиска на главной */
.sm--plain .sm__trigger {
  min-height: 28px;
  font-size: 17px;
  font-weight: 600;
}

/* В рамке, как поле формы */
.sm--box .sm__trigger {
  min-height: 52px;
  padding: 0 14px 0 16px;
  border: 1px solid var(--line-2);
  border-radius: 3px;
  background: #fff;
  font-size: 16px;
  font-weight: 500;
}

.sm--box .sm__trigger:hover {
  border-color: var(--faint);
}

.sm--box .sm__trigger:focus-visible,
.sm--box.is-open .sm__trigger {
  border-color: var(--brand);
  outline: 0;
  box-shadow: 0 0 0 1px var(--brand);
}

/* В строке текста: сортировка в каталоге */
.sm--inline .sm__trigger {
  min-height: 44px;
  padding: 0 6px;
  gap: 6px;
  font-size: 14.5px;
  font-weight: 600;
}

.sm__list {
  position: absolute;
  left: 0;
  top: calc(100% + 6px);
  z-index: 40;
  min-width: 100%;
  width: max-content;
  max-width: calc(100vw - 32px);
  max-height: min(440px, 60vh);
  margin: 0;
  padding: 6px;
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
  border-radius: var(--radius);
  background: #fff;
  box-shadow: 0 18px 48px rgba(30, 36, 34, 0.16), 0 0 0 1px var(--line);
}

/* На главной список открывается под всей ячейкой поиска (у ячейки position: relative),
   текст пунктов стоит ровно под текстом ячейки */
.sm--plain {
  position: static;
}

.sm--plain .sm__list {
  top: calc(100% + 6px);
  padding: 8px;
}

.sm__list--up,
.sm--plain .sm__list--up {
  top: auto;
  bottom: calc(100% + 6px);
}

.sm__list--right {
  left: auto;
  right: 0;
}

.sm__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 42px;
  padding: 0 12px;
  border-radius: 3px;
  color: var(--ink);
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
}

.sm__option.is-active {
  background: var(--stone);
}

.sm__option[aria-selected='true'] {
  color: var(--brand);
  font-weight: 700;
}

.sm__option svg {
  flex-shrink: 0;
}

.sm-enter-active,
.sm-leave-active {
  transition: opacity 0.14s, transform 0.14s;
}

.sm-enter-from,
.sm-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.sm__list--up.sm-enter-from,
.sm__list--up.sm-leave-to {
  transform: translateY(4px);
}
</style>
