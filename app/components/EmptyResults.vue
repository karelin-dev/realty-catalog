<script setup>
// Пустая выдача: подсказываем, какой фильтр мешает больше всего, и даём исправить в один клик
import { properties } from '~/data/properties'

const props = defineProps({ filters: { type: Object, required: true } })
const emit = defineEmits(['update', 'reset'])

const hint = computed(() => relaxHint(properties, props.filters))
const chips = computed(() => activeChips(props.filters))
</script>

<template>
  <section class="empty" aria-labelledby="empty-title">
    <svg width="88" height="72" viewBox="0 0 88 72" fill="none" aria-hidden="true">
      <path d="M8 66V30L34 10l26 20v36" stroke="#C9C0B3" stroke-width="2" />
      <path d="M2 66h66" stroke="var(--brass)" stroke-width="1.6" />
      <rect x="28" y="40" width="12" height="16" stroke="#C9C0B3" stroke-width="2" />
      <circle cx="62" cy="40" r="13" fill="#fff" stroke="var(--brand)" stroke-width="2.4" />
      <path d="m71.5 49.5 9 9" stroke="var(--brand)" stroke-width="2.6" stroke-linecap="round" />
    </svg>
    <h2 id="empty-title" class="h3">Под эти условия ничего не&nbsp;нашлось</h2>
    <p v-if="hint" class="lead">{{ hint.text }}</p>
    <div class="empty__chips">
      <button v-for="c in chips" :key="c.key" type="button" class="chip empty__chip" :aria-label="`Убрать фильтр: ${c.label}`" @click="emit('update', c.reset)">
        {{ c.label }} <AppIcon name="close" :size="12" :stroke="2.4" />
      </button>
    </div>
    <div class="empty__actions">
      <button v-if="hint" type="button" class="btn btn--primary" @click="emit('update', hint.patch)">
        Показать {{ objectsWord(hint.count) }}
      </button>
      <button type="button" class="btn btn--outline" @click="emit('reset')">Сбросить все фильтры</button>
      <NuxtLink to="/#lead" class="link-arrow">Попросить агента подобрать <AppIcon name="arrow" :size="16" /></NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  max-width: 560px;
  padding: 40px 0 24px;
}

.empty__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty__chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.empty__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  margin-top: 6px;
}
</style>
