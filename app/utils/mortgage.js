// Ипотека: аннуитетный платёж P = S × r / (1 − (1 + r)^−n), r — ставка в месяц, n — число месяцев.

export const MORTGAGE_DEFAULTS = { rate: 6, downShare: 0.2, years: 20 }

export function annuity(loan, ratePercent, years) {
  const months = Math.round(years * 12)
  if (loan <= 0 || months <= 0) return 0
  const r = ratePercent / 100 / 12
  if (r === 0) return loan / months
  return (loan * r) / (1 - (1 + r) ** -months)
}

export function calcMortgage({ price, down, rate, years }) {
  const loan = Math.max(price - down, 0)
  const monthly = annuity(loan, rate, years)
  const total = monthly * Math.round(years * 12)
  return { loan, monthly, total, overpay: Math.max(total - loan, 0) }
}

// Платёж по объекту при условиях по умолчанию: его показываем в карточках и фильтруем по нему
export function monthlyFor(price) {
  const { rate, downShare, years } = MORTGAGE_DEFAULTS
  return annuity(price * (1 - downShare), rate, years)
}
