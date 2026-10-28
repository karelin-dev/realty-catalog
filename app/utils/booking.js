// Запись на просмотр: дни на неделю вперёд, слоты и занятость.
// Занятость детерминированная (хеш «объект + дата + время»): одинаковая при каждом открытии,
// как будто пришла из календаря агента. Функции чистые, их легко заменить запросом к API.

export const SLOT_TIMES = ['10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '19:00']

const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const WEEKDAYS_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

const pad = (n) => String(n).padStart(2, '0')
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function hash(text) {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

// Время в прошлом и ближайший час недоступны: агент не успеет приехать
function isPast(day, time, now) {
  const [h, m] = time.split(':').map(Number)
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m)
  return start - now < 60 * 60 * 1000
}

export function getSlots(slug, day, now) {
  const key = dateKey(day)
  return SLOT_TIMES.map((time) => {
    const busy = hash(`${slug}|${key}|${time}`) % 4 === 0
    return { time, busy, past: isPast(day, time, now), free: !busy && !isPast(day, time, now) }
  })
}

// 7 дней, начиная с сегодняшнего; сегодня пропускаем, если свободного времени уже нет
export function getDays(slug, now, count = 7) {
  const days = []
  for (let i = 0; days.length < count && i < count + 1; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    if (i === 0 && !getSlots(slug, date, now).some((s) => s.free)) continue
    days.push({
      key: dateKey(date),
      date,
      weekday: WEEKDAYS[date.getDay()],
      day: date.getDate(),
      month: MONTHS_SHORT[date.getMonth()]
    })
  }
  return days
}

export const dayTitle = (date) => `${date.getDate()} ${MONTHS[date.getMonth()]}`
export const dayFull = (date) => `${WEEKDAYS_FULL[date.getDay()]}, ${dayTitle(date)}`

// Файл .ics для календаря. Петербург живёт по UTC+3 без перехода на летнее время.
export function makeIcs({ date, time, title, location, description }) {
  const [h, m] = time.split(':').map(Number)
  const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), h - 3, m))
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const escape = (s) => s.replace(/[\\,;]/g, (c) => `\\${c}`)
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Litera//Realty demo//RU', 'BEGIN:VEVENT',
    `UID:${stamp(start)}-${hash(title)}@litera.demo`, `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(title)}`, `LOCATION:${escape(location)}`, `DESCRIPTION:${escape(description)}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n')
}
