<script setup>
// Шрифты заголовка и текста грузим заранее (preload), чтобы заголовок быстрее отрисовался
// своим шрифтом. Адреса файлов с хешем даёт сборщик (?url). Курсив нужен только главной.
import cormorantUrl from '~/assets/fonts/cormorant-garamond-cyrillic-wght-normal.woff2?url'
import manropeUrl from '~/assets/fonts/manrope-cyrillic-wght-normal.woff2?url'

const { load } = useFavorites()
const { message } = useToast()
const config = useRuntimeConfig()

useHead({
  titleTemplate: (title) => (title ? `${title} · Литера` : 'Литера: недвижимость Петербурга'),
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: `${config.app.baseURL}favicon.svg` },
    fontPreload(manropeUrl),
    fontPreload(cormorantUrl)
  ]
})

useSeoMeta({
  ogSiteName: 'Литера',
  ogType: 'website',
  ogLocale: 'ru_RU',
  ogImage: `${config.public.siteUrl}/og.jpg`,
  twitterCard: 'summary_large_image'
})

onMounted(load)
</script>

<template>
  <a class="skip-link" href="#main">Перейти к содержимому</a>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <div class="toast" role="status" aria-live="polite">
    <span v-if="message" class="toast__body">{{ message }}</span>
  </div>
</template>

<style>
.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  z-index: 90;
  transform: translateX(-50%);
  pointer-events: none;
}

.toast__body {
  display: block;
  padding: 14px 20px;
  border-radius: var(--radius);
  background: var(--ink);
  color: #fff;
  font-size: 14.5px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: var(--shadow);
}
</style>
