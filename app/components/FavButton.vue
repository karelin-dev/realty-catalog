<script setup>
const props = defineProps({
  slug: { type: String, required: true },
  title: { type: String, default: '' },
  text: { type: Boolean, default: false }
})
const { has, toggle } = useFavorites()
const { show } = useToast()
const on = computed(() => has(props.slug))

function onClick() {
  toggle(props.slug)
  show(on.value ? 'Добавлено в избранное' : 'Убрано из избранного')
}
</script>

<template>
  <button
    type="button"
    class="fav"
    :class="{ 'fav--text': text, 'is-on': on }"
    :aria-pressed="on"
    :aria-label="text ? undefined : `${on ? 'Убрать из избранного' : 'В избранное'}${title ? ': ' + title : ''}`"
    @click.prevent="onClick"
  >
    <AppIcon name="heart" :filled="on" :size="20" />
    <span v-if="text">{{ on ? 'В избранном' : 'В избранное' }}</span>
  </button>
</template>

<style scoped>
.fav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  color: var(--ink);
  transition: color 0.2s, transform 0.2s;
}

.fav:hover {
  color: var(--brand);
}

.fav:active {
  transform: scale(0.92);
}

.fav.is-on {
  color: var(--brand);
}

.fav--text {
  width: auto;
  gap: 9px;
  padding: 0;
  background: none;
  font-size: 15px;
  font-weight: 600;
  border-radius: 0;
}
</style>
