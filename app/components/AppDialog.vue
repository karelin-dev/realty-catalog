<script setup>
// Модальное окно: фокус не уходит за пределы окна, Esc и клик по фону закрывают,
// страница под окном не прокручивается, после закрытия фокус возвращается на кнопку.
const props = defineProps({
  open: { type: Boolean, default: false },
  labelledby: { type: String, default: undefined },
  label: { type: String, default: undefined },
  variant: { type: String, default: 'center' } // center | drawer | full
})
const emit = defineEmits(['close'])

const panel = ref(null)
let lastFocus = null

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

function onKey(e) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    emit('close')
  }
  if (e.key !== 'Tab' || !panel.value) return
  const items = [...panel.value.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null)
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

watch(
  () => props.open,
  async (open) => {
    if (!import.meta.client) return
    if (open) {
      lastFocus = document.activeElement
      const width = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${width}px`
      await nextTick()
      const target = panel.value?.querySelector('[autofocus]') || panel.value?.querySelector(FOCUSABLE) || panel.value
      target?.focus()
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      lastFocus?.focus?.()
    }
  }
)

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="open" class="dialog" :class="`dialog--${variant}`" @keydown="onKey">
        <div class="dialog__backdrop" aria-hidden="true" @click="emit('close')" />
        <div
          ref="panel"
          class="dialog__panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="labelledby"
          :aria-label="label"
          tabindex="-1"
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.dialog__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(239, 235, 229, 0.88);
}

.dialog__panel {
  position: relative;
  width: 100%;
  max-width: 640px;
  max-height: 100%;
  overflow-y: auto;
  border-radius: var(--radius);
  background: #fff;
  box-shadow: 0 40px 100px rgba(30, 36, 34, 0.18), 0 0 0 1px var(--line);
  outline: 0;
}

.dialog--drawer {
  justify-content: flex-end;
  padding: 0;
}

.dialog--drawer .dialog__panel {
  max-width: 460px;
  height: 100%;
  border-radius: 0;
}

.dialog--full {
  padding: 0;
}

.dialog--full .dialog__backdrop {
  background: var(--stone);
}

.dialog--full .dialog__panel {
  max-width: none;
  height: 100%;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  overflow: hidden;
}

@media (max-width: 600px) {
  .dialog {
    padding: 0;
  }

  .dialog__panel {
    max-width: none;
    height: 100%;
    border-radius: 0;
  }
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>
