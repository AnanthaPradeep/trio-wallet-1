import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { APP_ROUTES } from '../../shared/constants/routes'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { RegisterPage } from '../../features/auth/pages/RegisterPage'
import { ProtectedRoute } from '../../features/auth/components/ProtectedRoute'
import { AddExpensePage } from '../../features/wallet/pages/AddExpensePage'
import { AddIncomePage } from '../../features/wallet/pages/AddIncomePage'
import { AllocateFundsPage } from '../../features/wallet/pages/AllocateFundsPage'
import { AnalyticsPage } from '../../features/wallet/pages/AnalyticsPage'
import { BankToWalletPage } from '../../features/wallet/pages/BankToWalletPage'
import { BankTransferPage } from '../../features/wallet/pages/BankTransferPage'
import { DashboardPage } from '../../features/wallet/pages/DashboardPage'
import { HistoryPage } from '../../features/wallet/pages/HistoryPage'
import { InternalTransferPage } from '../../features/wallet/pages/InternalTransferPage'
import { ManagePage } from '../../features/wallet/pages/ManagePage'
import { NotFoundPage } from '../../features/wallet/pages/NotFoundPage'
import { SpendPage } from '../../features/wallet/pages/SpendPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path={APP_ROUTES.login} element={<LoginPage />} />
      <Route path={APP_ROUTES.register} element={<RegisterPage />} />

      <Route
        element={(
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        )}
      >
        <Route index element={<DashboardPage />} />
        <Route path={APP_ROUTES.addExpense} element={<AddExpensePage />} />
        <Route path={APP_ROUTES.addIncome} element={<AddIncomePage />} />
        <Route path={APP_ROUTES.allocateFunds} element={<AllocateFundsPage />} />
        <Route path={APP_ROUTES.analytics} element={<AnalyticsPage />} />
        <Route path={APP_ROUTES.spend} element={<SpendPage />} />
        <Route path={APP_ROUTES.transferInternal} element={<InternalTransferPage />} />
        <Route path={APP_ROUTES.transferBank} element={<BankTransferPage />} />
        <Route path={APP_ROUTES.bankToWallet} element={<BankToWalletPage />} />
        <Route path={APP_ROUTES.history} element={<HistoryPage />} />
        <Route path={APP_ROUTES.manage} element={<ManagePage />} />
        <Route path={APP_ROUTES.notFound} element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to={APP_ROUTES.notFound} replace />} />
      </Route>
    </Routes>
  )
}
