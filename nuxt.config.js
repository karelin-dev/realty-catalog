// Сайт собирается в статику (nuxt generate) и публикуется на GitHub Pages по адресу /realty-catalog/.
// В разработке базовый путь «/», в сборке для продакшена «/realty-catalog/».
import { properties } from './app/data/properties.js'

const SITE = 'https://karelin-dev.github.io/realty-catalog'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-28',
  devtools: { enabled: false },
  telemetry: false,

  css: ['~/assets/css/fonts.css', '~/assets/css/base.css'],

  // Все стили встраиваются в HTML страницы: браузеру не нужно ждать отдельный CSS-файл
  features: { inlineStyles: true },

  // Данные каталога лежат в коде, загружать с сервера нечего: убираем лишние запросы
  // _payload.json и манифеста сборки при открытии страницы
  experimental: { payloadExtraction: false, appManifest: false },

  app: {
    baseURL: '/',
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'format-detection', content: 'telephone=no' }
      ]
    }
  },

  $production: {
    app: { baseURL: '/realty-catalog/' }
  },

  runtimeConfig: {
    public: { siteUrl: SITE }
  },

  components: [{ path: '~/components', pathPrefix: false }],

  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: ['/', '/catalog', '/favorites', ...properties.map((p) => `/catalog/${p.slug}`)]
    }
  }
})
