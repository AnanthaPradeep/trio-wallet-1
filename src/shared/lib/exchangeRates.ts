import type { CurrencyCode } from './money'
import { STORAGE_KEYS } from '../constants/storage'

export type ExchangeRateMap = Record<CurrencyCode, number>

// Rates relative to INR base: value = how many of this currency per 1 INR
export const FALLBACK_RATES: ExchangeRateMap = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.79,
  CNY: 0.087,
  AUD: 0.019,
  CAD: 0.016,
  BRL: 0.061,
  KRW: 16.1,
  MXN: 0.20,
  RUB: 1.08,
  ZAR: 0.22,
  TRY: 0.39,
  SAR: 0.045,
  IDR: 189,
  ARS: 11.5,
  SGD: 0.016,
  AED: 0.044,
}

interface RateCache {
  rates: ExchangeRateMap
  fetchedAt: number
}

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

function loadCache(): RateCache | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.exchangeRates)
    if (!raw) return null
    return JSON.parse(raw) as RateCache
  } catch {
    return null
  }
}

function saveCache(rates: ExchangeRateMap): void {
  try {
    const cache: RateCache = { rates, fetchedAt: Date.now() }
    localStorage.setItem(STORAGE_KEYS.exchangeRates, JSON.stringify(cache))
  } catch {
    // ignore storage errors
  }
}

export async function getExchangeRates(): Promise<ExchangeRateMap> {
  const cached = loadCache()
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rates
  }

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/INR')
    if (!res.ok) throw new Error('API error')
    const data = (await res.json()) as { rates: Record<string, number> }
    const rates: ExchangeRateMap = { ...FALLBACK_RATES }
    for (const key of Object.keys(FALLBACK_RATES) as CurrencyCode[]) {
      if (data.rates[key] !== undefined) {
        rates[key] = data.rates[key]!
      }
    }
    saveCache(rates)
    return rates
  } catch {
    // use stale cache if available, else fallback
    return cached?.rates ?? FALLBACK_RATES
  }
}
