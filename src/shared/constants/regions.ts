import type { CurrencyCode } from '../lib/money'

export interface G20Region {
  code: string
  name: string
  currency: CurrencyCode
  symbol: string
}

export const G20_REGIONS: readonly G20Region[] = [
  { code: 'IN', name: 'India',          currency: 'INR', symbol: '₹'   },
  { code: 'US', name: 'United States',  currency: 'USD', symbol: '$'   },
  { code: 'EU', name: 'Eurozone',       currency: 'EUR', symbol: '€'   },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£'   },
  { code: 'JP', name: 'Japan',          currency: 'JPY', symbol: '¥'   },
  { code: 'CN', name: 'China',          currency: 'CNY', symbol: '¥'   },
  { code: 'AU', name: 'Australia',      currency: 'AUD', symbol: 'A$'  },
  { code: 'CA', name: 'Canada',         currency: 'CAD', symbol: 'C$'  },
  { code: 'BR', name: 'Brazil',         currency: 'BRL', symbol: 'R$'  },
  { code: 'KR', name: 'South Korea',    currency: 'KRW', symbol: '₩'   },
  { code: 'MX', name: 'Mexico',         currency: 'MXN', symbol: 'MX$' },
  { code: 'RU', name: 'Russia',         currency: 'RUB', symbol: '₽'   },
  { code: 'ZA', name: 'South Africa',   currency: 'ZAR', symbol: 'R'   },
  { code: 'TR', name: 'Turkey',         currency: 'TRY', symbol: '₺'   },
  { code: 'SA', name: 'Saudi Arabia',   currency: 'SAR', symbol: '﷼'   },
  { code: 'ID', name: 'Indonesia',      currency: 'IDR', symbol: 'Rp'  },
  { code: 'AR', name: 'Argentina',      currency: 'ARS', symbol: 'AR$' },
  { code: 'SG', name: 'Singapore',      currency: 'SGD', symbol: 'S$'  },
  { code: 'AE', name: 'UAE',            currency: 'AED', symbol: 'د.إ' },
]

export const DEFAULT_REGION_CODE = 'IN'
