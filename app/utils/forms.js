// Телефон, проверка полей и отправка заявок. Адрес API подключается в одном месте: LEAD_ENDPOINT.
// Пока он пустой, заявка выводится в консоль браузера.

export const LEAD_ENDPOINT = ''

export function maskPhone(value) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('8')) digits = '7' + digits.slice(1)
  if (!digits.startsWith('7')) digits = '7' + digits
  digits = digits.slice(0, 11)
  const d = digits.slice(1)
  let out = '+7'
  if (d.length) out += ` (${d.slice(0, 3)}`
  if (d.length >= 3) out += ')'
  if (d.length > 3) out += ` ${d.slice(3, 6)}`
  if (d.length > 6) out += `-${d.slice(6, 8)}`
  if (d.length > 8) out += `-${d.slice(8, 10)}`
  return out
}

export const isPhoneValid = (value) => value.replace(/\D/g, '').length === 11

export function validateContact({ name, phone }) {
  const errors = {}
  if (name.trim().length < 2) errors.name = 'Напишите, как к вам обращаться'
  if (!isPhoneValid(phone)) errors.phone = 'Нужен номер из 10 цифр после +7'
  return errors
}

export async function sendLead(data) {
  const lead = { ...data, page: window.location.href, createdAt: new Date().toISOString() }
  if (!LEAD_ENDPOINT) {
    console.info('Заявка (LEAD_ENDPOINT не задан):', lead)
    return
  }
  const res = await fetch(LEAD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  })
  if (!res.ok) throw new Error(`Сервер ответил ${res.status}`)
}
