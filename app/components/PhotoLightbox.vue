<script setup>
// Фото на весь экран: стрелки и миниатюры, клавиши ← → и Esc, свайп на телефоне.
// Светлый фон вместо чёрного, как в макете.
const props = defineProps({
  open: { type: Boolean, default: false },
  property: { type: Object, required: true },
  start: { type: Number, default: 0 }
})
const emit = defineEmits(['close'])

const index = ref(props.start)
const count = computed(() => props.property.photos.length)
watch(() => props.open, (open) => open && (index.value = props.start))

const go = (step) => (index.value = (index.value + step + count.value) % count.value)

function onKey(e) {
  if (e.key === 'ArrowLeft') go(-1)
  if (e.key === 'ArrowRight') go(1)
}

let touchX = null
const onTouchStart = (e) => (touchX = e.touches[0].clientX)
function onTouchEnd(e) {
  if (touchX === null) return
  const dx = e.changedTouches[0].clientX - touchX
  if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
  touchX = null
}

const { copyLink } = useToast()
const share = () => copyLink(window.location.href)
</script>

<template>
  <AppDialog :open="open" variant="full" label="Фотографии объекта" @close="emit('close')">
    <div class="lb" @keydown="onKey">
      <div class="lb__bar">
        <span class="lb__count num" aria-live="polite">{{ index + 1 }} / {{ count }}</span>
        <span class="lb__sep" aria-hidden="true" />
        <span class="lb__title">{{ property.title }}</span>
        <div class="lb__actions">
          <FavButton :slug="property.slug" text />
          <button type="button" class="lb__share" @click="share">
            <AppIcon name="share" /> <span>Поделиться</span>
          </button>
          <button type="button" class="icon-btn lb__close" aria-label="Закрыть просмотр" @click="emit('close')">
            <AppIcon name="close" :size="18" :stroke="2" />
          </button>
        </div>
      </div>

      <figure class="lb__stage" @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
        <img
          :key="index"
          :src="photo(property.slug, index + 1, 1600)"
          :alt="property.photos[index]"
          class="lb__img"
        >
        <figcaption class="lb__caption">{{ property.photos[index] }}</figcaption>
      </figure>

      <button type="button" class="lb__nav lb__nav--prev" aria-label="Предыдущее фото" @click="go(-1)">
        <AppIcon name="prev" :size="22" />
      </button>
      <button type="button" class="lb__nav lb__nav--next" aria-label="Следующее фото" @click="go(1)">
        <AppIcon name="next" :size="22" />
      </button>

      <div class="lb__thumbs">
        <button
          v-for="(alt, i) in property.photos"
          :key="i"
          type="button"
          class="lb__thumb"
          :class="{ 'is-on': i === index }"
          :aria-label="`Фото ${i + 1}: ${alt}`"
          :aria-current="i === index ? 'true' : undefined"
          @click="index = i"
        >
          <img :src="photo(property.slug, i + 1, 400)" alt="" width="104" height="70">
        </button>
      </div>
      <span class="lb__keys">Стрелки ← → листают фото, Esc закрывает</span>
    </div>
  </AppDialog>
</template>

<style scoped>
.lb {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--stone);
}

.lb__bar {
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 76px;
  padding: 0 32px;
  border-bottom: 1px solid var(--line);
}

.lb__count {
  font-size: 15px;
  font-weight: 700;
}

.lb__sep {
  width: 1px;
  height: 22px;
  background: var(--line-2);
}

.lb__title {
  overflow: hidden;
  font-family: var(--serif);
  font-size: 24px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lb__actions {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-left: auto;
}

.lb__share {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  font-size: 15px;
  font-weight: 600;
}

.lb__stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 0;
  padding: 24px 120px 12px;
}

.lb__img {
  max-width: 100%;
  max-height: calc(100% - 40px);
  object-fit: contain;
  border-radius: var(--radius);
  box-shadow: 0 30px 80px rgba(30, 36, 34, 0.12);
}

.lb__caption {
  color: var(--muted);
  font-size: 14.5px;
}

.lb__nav {
  position: absolute;
  top: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 10px 30px rgba(30, 36, 34, 0.12), 0 0 0 1px var(--line);
}

.lb__nav--prev {
  left: 40px;
}

.lb__nav--next {
  right: 40px;
}

.lb__thumbs {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px 28px;
}

.lb__thumb {
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--radius);
  background: none;
  opacity: 0.7;
}

.lb__thumb.is-on {
  border-color: var(--brand);
  opacity: 1;
}

.lb__thumb img {
  width: 104px;
  height: 70px;
  object-fit: cover;
  border-radius: 2px;
}

.lb__keys {
  position: absolute;
  right: 32px;
  bottom: 50px;
  color: var(--muted);
  font-size: 13px;
}

@media (max-width: 900px) {
  .lb__bar {
    padding: 0 16px;
    gap: 12px;
  }

  .lb__title,
  .lb__sep,
  .lb__share span,
  .lb__keys {
    display: none;
  }

  .lb__stage {
    padding: 16px 0 8px;
  }

  .lb__img {
    border-radius: 0;
  }

  .lb__nav {
    top: auto;
    bottom: 110px;
    width: 48px;
    height: 48px;
  }

  .lb__nav--prev {
    left: 16px;
  }

  .lb__nav--next {
    right: 16px;
  }

  .lb__thumb img {
    width: 72px;
    height: 54px;
  }
}

@media (max-width: 600px) {
  .lb__actions :deep(.fav--text span) {
    display: none;
  }
}
</style>
