import { useState } from 'react'
import { X } from 'lucide-react'
import type { CurrencyCode } from '../shared/lib/money'
import { G20_REGIONS } from '../shared/constants/regions'

const QUICK_AMOUNTS = [10, 25, 50, 100, 500]

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  currency?: CurrencyCode
  error?: string
}

const CURRENCY_SYMBOL: Record<CurrencyCode, string> = Object.fromEntries(
  G20_REGIONS.map((r) => [r.currency, r.symbol]),
) as Record<CurrencyCode, string>

export function AmountInput({ value, onChange, currency = 'INR', error }: AmountInputProps) {
  const [focused, setFocused] = useState(false)
  const symbol = CURRENCY_SYMBOL[currency] ?? currency

  const handleQuick = (amount: number) => {
    const current = parseFloat(value) || 0
    onChange(String(current + amount))
  }

  return (
    <div className="space-y-3">
      <div
        className={`relative flex items-center rounded-3xl border-2 bg-gray-50 px-4 py-4 transition-all duration-200 sm:px-6 sm:py-5 ${
          focused ? 'border-black bg-white shadow-lg shadow-black/10' : error ? 'border-red-400' : 'border-gray-200'
        }`}
      >
        <span className="mr-2 text-2xl font-bold text-gray-400 sm:text-3xl">{symbol}</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0.00"
          className="flex-1 bg-transparent text-3xl font-bold text-gray-900 placeholder-gray-300 outline-none sm:text-4xl"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 px-1">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => handleQuick(amt)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-black hover:bg-black hover:text-white active:scale-95"
          >
            +{symbol}{amt}
          </button>
        ))}
      </div>
    </div>
  )
}
