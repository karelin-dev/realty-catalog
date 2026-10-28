// Форматирование чисел, цен и подписей по-русски. Без toLocaleString: на сервере и в браузере
// он может дать разные пробелы, и тогда страница пересоберётся при гидратации.
import { DISTRICTS, METRO_LINES, TYPES } from '~/data/properties'

const NBSP = ' '
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

export function formatNumber(value) {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
}

export function formatPrice(value) {
  return `${formatNumber(value)}${NBSP}₽`
}

// 14 800 000 → «14,8 млн», 7 150 000 → «7,15 млн»
export function formatMillions(value) {
  const millions = Math.round(value / 10000) / 100
  return `${String(millions).replace('.', ',')}${NBSP}млн`
}

export function formatArea(value) {
  return `${String(value).replace('.', ',')}${NBSP}м²`
}

export function plural(n, [one, few, many]) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export const objectsWord = (n) => `${n}${NBSP}${plural(n, ['объект', 'объекта', 'объектов'])}`

export function formatDate(iso) {
  const [, month, day] = iso.split('-').map(Number)
  return `${day} ${MONTHS[month - 1]}`
}

export const isCountry = (p) => p.type === 'house' || p.type === 'townhouse'

export const lineColor = (line) => METRO_LINES[line] || '#5f6763'

export const districtName = (key) => DISTRICTS.find((d) => d.key === key)?.name || ''

// «2-комнатная квартира, 64 м²», «Студия, 27,5 м²», «Дом, 180 м², участок 15 сот.»
export function shortTitle(p) {
  const area = formatArea(p.area)
  if (isCountry(p)) return `${TYPES[p.type]}, ${area}, участок ${p.plot}${NBSP}сот.`
  if (p.type === 'apartments') return `Апартаменты, ${area}`
  if (p.rooms === 0) return `Студия, ${area}`
  return `${p.rooms}-комнатная квартира, ${area}`
}

export function subTitle(p) {
  if (isCountry(p)) return `${p.storeys} ${plural(p.storeys, ['этаж', 'этажа', 'этажей'])} · построен в ${p.year} году`
  return `${p.floor} из ${p.floors} этажей · дом ${p.year} года`
}

const MODE = { walk: '', transport: ' на транспорте', car: ' на машине' }

// Подпись «как добраться» в карточке: метро для города, расстояние для пригорода
export function whereLabel(p) {
  if (isCountry(p)) return `${p.address}, ${p.distance}`
  return `${p.metro.name}, ${p.metro.minutes}${NBSP}мин${MODE[p.metro.mode]}`
}

export function metroLabel(p) {
  return `${p.metro.minutes}${NBSP}мин${MODE[p.metro.mode] || ' пешком'}`
}

export function districtLabel(p) {
  const name = p.district === 'suburbs' ? p.place.replace(' район', '') : districtName(p.district)
  return `${name}${NBSP}р-н`
}
