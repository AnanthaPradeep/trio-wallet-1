import { SUPPORTED_CURRENCIES } from '../constants/wallet'

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]

const ZERO_DECIMAL_CURRENCIES = new Set<CurrencyCode>(['JPY', 'KRW', 'IDR', 'ARS'])

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  CNY: 'zh-CN',
  AUD: 'en-AU',
  CAD: 'en-CA',
  BRL: 'pt-BR',
  KRW: 'ko-KR',
  MXN: 'es-MX',
  RUB: 'ru-RU',
  ZAR: 'en-ZA',
  TRY: 'tr-TR',
  SAR: 'ar-SA',
  IDR: 'id-ID',
  ARS: 'es-AR',
  SGD: 'en-SG',
  AED: 'ar-AE',
}

export function isZeroDecimal(currency: CurrencyCode): boolean {
  return ZERO_DECIMAL_CURRENCIES.has(currency)
}

export function minorToMajor(minor: number, currency: CurrencyCode): number {
  return isZeroDecimal(currency) ? minor : minor / 100
}

export function majorToMinor(major: number, currency: CurrencyCode): number {
  return isZeroDecimal(currency) ? Math.round(major) : Math.round(major * 100)
}

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
}

export function formatMinor(amountMinor: number, currency: CurrencyCode): string {
  const fractionDigits = isZeroDecimal(currency) ? 0 : 2
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(minorToMajor(amountMinor, currency))
}

export function parseMajorToMinor(input: string, currency: CurrencyCode = 'INR'): number {
  const value = Number.parseFloat(input)
  if (Number.isNaN(value) || value <= 0) return 0
  return majorToMinor(value, currency)
}

export function groupByCurrency(items: Array<{ currency: CurrencyCode; amountMinor: number }>): Partial<Record<CurrencyCode, number>> {
  const totals: Partial<Record<CurrencyCode, number>> = {}
  for (const item of items) {
    totals[item.currency] = (totals[item.currency] ?? 0) + item.amountMinor
  }
  return totals
}
