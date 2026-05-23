import { createContext, useContext, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../constants/storage'
import { translations, type LanguageCode, type TranslationKey } from './translations'

interface I18nContextValue {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function readStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const value = window.localStorage.getItem(STORAGE_KEYS.language)

  if (value === 'en') {
    return value
  }

  return 'en'
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>(() => readStoredLanguage())

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        setLanguage(nextLanguage)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEYS.language, nextLanguage)
        }
      },
      t: (key) => translations[language][key] ?? translations.en[key],
    }),
    [language],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18nContext(): I18nContextValue {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18nContext must be used inside I18nProvider.')
  }

  return context
}
