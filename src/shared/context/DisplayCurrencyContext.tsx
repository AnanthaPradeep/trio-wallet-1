import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CurrencyCode } from '../lib/money'
import { minorToMajor, majorToMinor, formatMinor } from '../lib/money'
import type { ExchangeRateMap } from '../lib/exchangeRates'
import { FALLBACK_RATES, getExchangeRates } from '../lib/exchangeRates'
import type { G20Region } from '../constants/regions'
import { G20_REGIONS, DEFAULT_REGION_CODE } from '../constants/regions'
import { STORAGE_KEYS } from '../constants/storage'

interface DisplayCurrencyContextValue {
  region: G20Region
  displayCurrency: CurrencyCode
  rates: ExchangeRateMap
  isLoadingRates: boolean
  setRegion: (regionCode: string) => void
  convertToDisplay: (amountMinor: number, fromCurrency: CurrencyCode) => number
  formatDisplay: (amountMinor: number, fromCurrency: CurrencyCode) => string
}

const DisplayCurrencyContext = createContext<DisplayCurrencyContextValue | null>(null)

function findRegion(code: string): G20Region {
  return G20_REGIONS.find((r) => r.code === code) ?? G20_REGIONS[0]!
}

export function DisplayCurrencyProvider({ children }: { children: ReactNode }) {
  const [regionCode, setRegionCode] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.displayRegion) ?? DEFAULT_REGION_CODE
  })
  const [rates, setRates] = useState<ExchangeRateMap>(FALLBACK_RATES)
  const [isLoadingRates, setIsLoadingRates] = useState(true)

  useEffect(() => {
    getExchangeRates().then((r) => {
      setRates(r)
      setIsLoadingRates(false)
    })
  }, [])

  const setRegion = useCallback((code: string) => {
    setRegionCode(code)
    localStorage.setItem(STORAGE_KEYS.displayRegion, code)
  }, [])

  const region = useMemo(() => findRegion(regionCode), [regionCode])
  const displayCurrency = region.currency

  const convertToDisplay = useCallback(
    (amountMinor: number, fromCurrency: CurrencyCode): number => {
      const fromMajor = minorToMajor(amountMinor, fromCurrency)
      const displayMajor = (fromMajor / rates[fromCurrency]) * rates[displayCurrency]
      return majorToMinor(displayMajor, displayCurrency)
    },
    [rates, displayCurrency],
  )

  const formatDisplay = useCallback(
    (amountMinor: number, fromCurrency: CurrencyCode): string => {
      const displayMinor = convertToDisplay(amountMinor, fromCurrency)
      return formatMinor(displayMinor, displayCurrency)
    },
    [convertToDisplay, displayCurrency],
  )

  const value = useMemo<DisplayCurrencyContextValue>(
    () => ({ region, displayCurrency, rates, isLoadingRates, setRegion, convertToDisplay, formatDisplay }),
    [region, displayCurrency, rates, isLoadingRates, setRegion, convertToDisplay, formatDisplay],
  )

  return <DisplayCurrencyContext.Provider value={value}>{children}</DisplayCurrencyContext.Provider>
}

export function useDisplayCurrencyContext(): DisplayCurrencyContextValue {
  const ctx = useContext(DisplayCurrencyContext)
  if (!ctx) throw new Error('useDisplayCurrencyContext must be used within DisplayCurrencyProvider')
  return ctx
}
