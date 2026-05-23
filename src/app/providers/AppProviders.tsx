import { BrowserRouter } from 'react-router-dom'
import { WalletProvider } from '../../features/wallet/context/WalletContext'
import { I18nProvider } from '../../shared/i18n/I18nContext'
import { DisplayCurrencyProvider } from '../../shared/context/DisplayCurrencyContext'
import { AuthProvider } from '../../features/auth/context/AuthContext'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <I18nProvider>
          <DisplayCurrencyProvider>
            <WalletProvider>{children}</WalletProvider>
          </DisplayCurrencyProvider>
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
