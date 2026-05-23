import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { useFormFeedback } from '../../../shared/hooks/useFormFeedback'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { useAuth } from '../hooks/useAuth'

interface LoginLocationState {
  from?: string
}

export function LoginPage() {
  const { login, verifyTwoFactor, pendingTwoFactorEmail } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { feedback, clearFeedback, setError } = useFormFeedback()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [useTwoFactor, setUseTwoFactor] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const state = location.state as LoginLocationState | null
  const redirectTo = state?.from ?? APP_ROUTES.dashboard

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearFeedback()
    setIsSubmitting(true)

    try {
      await login({ email, password, require2FA: useTwoFactor })

      if (!useTwoFactor) {
        navigate(redirectTo, { replace: true })
      }
    } catch (error) {
      setError(error, 'Login failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearFeedback()
    setIsSubmitting(true)

    try {
      await verifyTwoFactor(twoFactorCode.trim())
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setError(error, 'Verification failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-8 sm:px-6">
      <Card className="w-full">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Secure Access</p>
          <h1 className="text-2xl font-bold text-gray-900">Login to Trio Wallet</h1>
          <p className="text-sm text-gray-500">Use your registered account credentials to continue.</p>
        </div>

        {!pendingTwoFactorEmail ? (
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => {
                clearFeedback()
                setEmail(event.target.value)
              }}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <div className="space-y-1.5">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  clearFeedback()
                  setPassword(event.target.value)
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>

            <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={useTwoFactor}
                onChange={(event) => {
                  clearFeedback()
                  setUseTwoFactor(event.target.checked)
                }}
              />
              Use 2FA verification step (demo)
            </label>

            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Login'}
            </Button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleVerifyCode}>
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              2FA placeholder enabled for {pendingTwoFactorEmail}. Use demo code: 123456
            </p>

            <Input
              label="Verification Code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={twoFactorCode}
              onChange={(event) => {
                clearFeedback()
                setTwoFactorCode(event.target.value.replace(/\D/g, ''))
              }}
              placeholder="6-digit code"
            />

            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify and Continue'}
            </Button>
          </form>
        )}

        {feedback ? <p className="mt-4 text-sm text-red-600">{feedback}</p> : null}

        <p className="mt-6 text-sm text-gray-600">
          New here?{' '}
          <Link className="font-semibold text-black underline" to={APP_ROUTES.register}>
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  )
}
