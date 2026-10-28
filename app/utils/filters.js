// Фильтры каталога. Состояние живёт в адресе страницы (?rooms=2,3&month_to=90000), поэтому
// подборкой можно поделиться ссылкой, а кнопка «назад» возвращает прошлые фильтры.
import { DISTRICTS, TYPES } from '~/data/properties'
import { formatMillions, formatPrice, objectsWord } from './format'
import { monthlyFor } from './mortgage'

export const SORTS = {
  new: 'сначала новые',
  cheap: 'сначала дешевле',
  expensive: 'сначала дороже',
  area: 'по площади'
}

export const EMPTY_FILTERS = {
  types: [],
  market: '',
  rooms: [],
  priceFrom: null,
  priceTo: null,
  monthTo: null,
  areaFrom: null,
  areaTo: null,
  districts: [],
  metro: null,
  notFirst: false,
  renovated: false,
  parking: false,
  sort: 'new',
  view: 'map'
}

const list = (value, allowed) => String(value || '').split(',').filter((v) => allowed.includes(v))
const num = (value) => (value === undefined || value === '' || Number.isNaN(Number(value)) ? null : Number(value))
const flag = (value) => value === '1'

export function parseFilters(query) {
  const rooms = query.rooms ? String(query.rooms).split(',').map(Number).filter((r) => [0, 1, 2, 3, 4].includes(r)) : []
  return {
    types: list(query.type, Object.keys(TYPES)),
    market: ['new', 'resale'].includes(query.market) ? query.market : '',
    rooms,
    priceFrom: num(query.price_from),
    priceTo: num(query.price_to),
    monthTo: num(query.month_to),
    areaFrom: num(query.area_from),
    areaTo: num(query.area_to),
    districts: list(query.district, DISTRICTS.map((d) => d.key)),
    metro: [5, 10, 15].includes(num(query.metro)) ? num(query.metro) : null,
    notFirst: flag(query.not_first),
    renovated: flag(query.renovated),
    parking: flag(query.parking),
    sort: query.sort in SORTS ? query.sort : 'new',
    view: query.view === 'grid' ? 'grid' : 'map'
  }
}

export function filtersToQuery(f) {
  const q = {}
  if (f.types.length) q.type = f.types.join(',')
  if (f.market) q.market = f.market
  if (f.rooms.length) q.rooms = [...f.rooms].sort().join(',')
  if (f.priceFrom) q.price_from = String(f.priceFrom)
  if (f.priceTo) q.price_to = String(f.priceTo)
  if (f.monthTo) q.month_to = String(f.monthTo)
  if (f.areaFrom) q.area_from = String(f.areaFrom)
  if (f.areaTo) q.area_to = String(f.areaTo)
  if (f.districts.length) q.district = f.districts.join(',')
  if (f.metro) q.metro = String(f.metro)
  if (f.notFirst) q.not_first = '1'
  if (f.renovated) q.renovated = '1'
  if (f.parking) q.parking = '1'
  if (f.sort !== 'new') q.sort = f.sort
  if (f.view === 'grid') q.view = 'grid'
  return q
}

// Каждое условие отдельно: так можно посчитать, сколько объектов даст отмена одного фильтра
const CHECKS = {
  types: (p, f) => !f.types.length || f.types.includes(p.type),
  market: (p, f) => !f.market || p.market === f.market,
  rooms: (p, f) => !f.rooms.length || f.rooms.includes(Math.min(p.rooms, 4)),
  price: (p, f) => (!f.priceFrom || p.price >= f.priceFrom) && (!f.priceTo || p.price <= f.priceTo),
  month: (p, f) => !f.monthTo || monthlyFor(p.price) <= f.monthTo,
  area: (p, f) => (!f.areaFrom || p.area >= f.areaFrom) && (!f.areaTo || p.area <= f.areaTo),
  districts: (p, f) => !f.districts.length || f.districts.includes(p.district),
  metro: (p, f) => !f.metro || (p.metro?.mode === 'walk' && p.metro.minutes <= f.metro),
  notFirst: (p, f) => !f.notFirst || !p.floor || p.floor > 1,
  renovated: (p, f) => !f.renovated || p.renovated,
  parking: (p, f) => !f.parking || p.parking
}

export const matches = (p, f, skip) => Object.entries(CHECKS).every(([key, check]) => key === skip || check(p, f))

const SORTERS = {
  new: (a, b) => b.addedAt.localeCompare(a.addedAt),
  cheap: (a, b) => a.price - b.price,
  expensive: (a, b) => b.price - a.price,
  area: (a, b) => b.area - a.area
}

export function applyFilters(items, f) {
  return items.filter((p) => matches(p, f)).sort(SORTERS[f.sort])
}

export function roomsLabel(rooms) {
  const sorted = [...rooms].sort()
  const parts = sorted.map((r) => (r === 0 ? 'студия' : r === 4 ? '4+' : String(r)))
  const text = parts.join(', ') + (sorted.some((r) => r > 0) ? ' комн.' : '')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function rangeLabel(from, to, format) {
  if (from && to) return `${format(from)}–${format(to)}`
  return from ? `от ${format(from)}` : `до ${format(to)}`
}

// Активные фильтры чипами: подпись и что сбросить при нажатии на крестик
export function activeChips(f) {
  const chips = []
  if (f.types.length) chips.push({ key: 'types', label: f.types.map((t) => TYPES[t]).join(', '), reset: { types: [] } })
  if (f.market) chips.push({ key: 'market', label: f.market === 'new' ? 'Новостройки' : 'Вторичное жильё', reset: { market: '' } })
  if (f.rooms.length) chips.push({ key: 'rooms', label: roomsLabel(f.rooms), reset: { rooms: [] } })
  if (f.priceFrom || f.priceTo) chips.push({ key: 'price', label: `${rangeLabel(f.priceFrom, f.priceTo, formatMillions)} ₽`, reset: { priceFrom: null, priceTo: null } })
  if (f.monthTo) chips.push({ key: 'month', label: `до ${formatPrice(f.monthTo)} в месяц`, reset: { monthTo: null } })
  if (f.areaFrom || f.areaTo) chips.push({ key: 'area', label: `${rangeLabel(f.areaFrom, f.areaTo, String)} м²`, reset: { areaFrom: null, areaTo: null } })
  if (f.districts.length) {
    const names = f.districts.map((k) => DISTRICTS.find((d) => d.key === k)?.name)
    chips.push({ key: 'districts', label: names.length > 2 ? `Районы: ${names.length}` : names.join(', '), reset: { districts: [] } })
  }
  if (f.metro) chips.push({ key: 'metro', label: `до ${f.metro} мин до метро`, reset: { metro: null } })
  if (f.notFirst) chips.push({ key: 'notFirst', label: 'не первый этаж', reset: { notFirst: false } })
  if (f.renovated) chips.push({ key: 'renovated', label: 'с ремонтом', reset: { renovated: false } })
  if (f.parking) chips.push({ key: 'parking', label: 'с парковкой', reset: { parking: false } })
  return chips
}

const roundUp = (value, step) => Math.ceil(value / step) * step

// Подсказка для пустой выдачи: какой фильтр отсекает больше всего вариантов.
// Если это бюджет, считаем, до скольки его поднять, чтобы появился хотя бы один объект.
export function relaxHint(items, f) {
  const chips = activeChips(f)
  let best = null
  for (const chip of chips) {
    const count = items.filter((p) => matches(p, f, chip.key)).length
    if (count && (!best || count > best.count)) best = { ...chip, count }
  }
  if (!best) return null
  const others = items.filter((p) => matches(p, f, best.key))
  if (best.key === 'month') {
    const value = roundUp(Math.min(...others.map((p) => monthlyFor(p.price))), 5000)
    const count = others.filter((p) => monthlyFor(p.price) <= value).length
    return { ...best, count, patch: { monthTo: value }, text: `Если поднять бюджет до ${formatPrice(value)} в месяц, появится ${objectsWord(count)}.` }
  }
  if (best.key === 'price' && f.priceTo) {
    const value = roundUp(Math.min(...others.map((p) => p.price)), 500000)
    const count = others.filter((p) => p.price <= value).length
    return { ...best, count, patch: { priceFrom: f.priceFrom, priceTo: value }, text: `Если поднять бюджет до ${formatMillions(value)} ₽, появится ${objectsWord(count)}.` }
  }
  return { ...best, patch: best.reset, text: `Больше всего вариантов отсекает фильтр «${best.label}». Без него найдётся ${objectsWord(best.count)}.` }
}
