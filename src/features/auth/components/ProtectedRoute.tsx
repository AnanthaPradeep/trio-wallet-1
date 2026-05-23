import { Navigate, useLocation } from 'react-router-dom'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="glass rounded-3xl px-6 py-5 text-sm font-semibold text-gray-700">Loading secure session...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.login} replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
