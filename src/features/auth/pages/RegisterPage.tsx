import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { useFormFeedback } from '../../../shared/hooks/useFormFeedback'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const { feedback, clearFeedback, setError } = useFormFeedback()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pin, setPin] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearFeedback()
    setIsSubmitting(true)

    try {
      await register({ name, email, password, confirmPassword, pin })
      navigate(APP_ROUTES.dashboard, { replace: true })
    } catch (error) {
      setError(error, 'Registration failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-8 sm:px-6">
      <Card className="w-full">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Account Setup</p>
          <h1 className="text-2xl font-bold text-gray-900">Create your secure account</h1>
          <p className="text-sm text-gray-500">Register to access wallet balances and transactions safely.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(event) => {
              clearFeedback()
              setName(event.target.value)
            }}
            placeholder="Your full name"
            autoComplete="name"
          />

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
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-xs font-medium text-gray-500 hover:text-gray-900"
            >
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
            <p className="text-xs text-gray-500">Use 8+ chars with uppercase, number, and symbol.</p>
          </div>

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => {
              clearFeedback()
              setConfirmPassword(event.target.value)
            }}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />

          <Input
            label="Security PIN (optional)"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(event) => {
              clearFeedback()
              setPin(event.target.value.replace(/\D/g, ''))
            }}
            placeholder="4-digit PIN"
          />

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        {feedback ? <p className="mt-4 text-sm text-red-600">{feedback}</p> : null}

        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link className="font-semibold text-black underline" to={APP_ROUTES.login}>
            Login
          </Link>
        </p>
      </Card>
    </div>
  )
}
