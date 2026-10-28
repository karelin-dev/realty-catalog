// Избранное хранится в localStorage этого браузера, регистрация не нужна.
// Загружается после монтирования приложения (app.vue), иначе HTML со статичной сборки
// разойдётся с тем, что нарисует браузер.

const KEY = 'litera:favorites'

export function useFavorites() {
  const slugs = useState('favorites', () => [])
  const ready = useState('favorites-ready', () => false)

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(slugs.value))
    } catch {
      // приватный режим или запрет хранилища: избранное живёт до перезагрузки
    }
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
      slugs.value = Array.isArray(saved) ? saved.filter((s) => typeof s === 'string') : []
    } catch {
      slugs.value = []
    }
    ready.value = true
  }

  const has = (slug) => slugs.value.includes(slug)

  function toggle(slug) {
    slugs.value = has(slug) ? slugs.value.filter((s) => s !== slug) : [...slugs.value, slug]
    save()
  }

  function set(list) {
    slugs.value = [...new Set(list)]
    save()
  }

  return { slugs, ready, load, has, toggle, set, count: computed(() => slugs.value.length) }
}
