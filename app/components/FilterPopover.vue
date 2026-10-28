<script setup>
// Кнопка фильтра с выпадающей панелью. Одновременно открыта только одна,
// закрывается по Esc, клику мимо и после выбора «Готово».
const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  active: { type: Boolean, default: false },
  width: { type: String, default: '320px' }
})

const openId = useState('filter-popover', () => null)
const open = computed(() => openId.value === props.id)
const root = ref(null)
const button = ref(null)

function toggle() {
  openId.value = open.value ? null : props.id
}

function close(focus = false) {
  if (open.value) openId.value = null
  if (focus) button.value?.focus()
}

function onDocDown(e) {
  if (open.value && root.value && !root.value.contains(e.target)) close()
}

function onKey(e) {
  if (e.key === 'Escape' && open.value) close(true)
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocDown)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocDown)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="pop">
    <button
      ref="button"
      type="button"
      class="pop__btn"
      :class="{ 'is-active': active, 'is-open': open }"
      :aria-expanded="open"
      :aria-controls="`pop-${id}`"
      @click="toggle"
    >
      {{ label }}
      <AppIcon name="down" :size="14" :stroke="2.2" />
    </button>
    <div v-show="open" :id="`pop-${id}`" class="pop__panel" :style="{ width }">
      <slot :close="() => close(true)" />
    </div>
  </div>
</template>

<style scoped>
.pop {
  position: relative;
}

.pop__btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  max-width: 260px;
  padding: 0 16px;
  border: 1px solid var(--line-2);
  border-radius: 3px;
  background: #fff;
  color: var(--ink);
  font-size: 14.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pop__btn:hover,
.pop__btn.is-open {
  border-color: var(--ink);
}

.pop__btn.is-active {
  border-color: var(--brand);
  background: var(--sage);
  color: var(--brand);
  font-weight: 700;
}

.pop__btn svg {
  flex-shrink: 0;
  transition: transform 0.2s;
}

.pop__btn.is-open svg {
  transform: rotate(180deg);
}

.pop__panel {
  position: absolute;
  left: 0;
  top: calc(100% + 8px);
  z-index: 30;
  max-width: calc(100vw - 32px);
  padding: 20px;
  border-radius: var(--radius);
  background: #fff;
  box-shadow: var(--shadow), 0 0 0 1px var(--line);
}
</style>
