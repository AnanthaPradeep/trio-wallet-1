import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { Button } from '../../../shared/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center animate-scale-in">
      <div className="animate-float">
        <MapPin size={64} className="text-gray-300" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Page not found</h2>
        <p className="mt-2 text-gray-500">This route doesn't exist in Trio Wallet.</p>
      </div>
      <Link to={APP_ROUTES.dashboard}>
        <Button size="lg">Back to Dashboard</Button>
      </Link>
    </div>
  )
}
