export const SUPPORTED_CURRENCIES = [
  'INR', 'USD', 'EUR', 'GBP', 'JPY', 'CNY',
  'AUD', 'CAD', 'BRL', 'KRW', 'MXN', 'RUB',
  'ZAR', 'TRY', 'SAR', 'IDR', 'ARS', 'SGD', 'AED',
] as const

export const TRANSACTION_TYPES = ['spend', 'internal_transfer', 'bank_transfer', 'bank_to_wallet'] as const
export const TRANSACTION_STATUSES = ['completed', 'pending', 'failed'] as const
