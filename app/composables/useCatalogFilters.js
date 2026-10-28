// Фильтры каталога читаются из адреса и записываются в него же (router.replace без прокрутки страницы).
// Адрес обновляется асинхронно, поэтому быстрые клики подряд считаются от последнего
// запрошенного состояния, а не от ещё не обновлённого адреса.

export function useCatalogFilters() {
  const route = useRoute()
  const router = useRouter()
  const filters = computed(() => parseFilters(route.query))
  let pending = null

  // patch: объект с новыми значениями или функция (текущие фильтры) => объект
  function update(patch) {
    const base = pending || filters.value
    const next = { ...base, ...(typeof patch === 'function' ? patch(base) : patch) }
    pending = next
    router.replace({ query: filtersToQuery(next) }).finally(() => {
      if (pending === next) pending = null
    })
  }

  function reset() {
    update({ ...EMPTY_FILTERS, sort: filters.value.sort, view: filters.value.view })
  }

  return { filters, update, reset }
}
