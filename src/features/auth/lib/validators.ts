import type { RegisterInput } from '../types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UPPER_REGEX = /[A-Z]/
const NUMBER_REGEX = /\d/
const SPECIAL_REGEX = /[^A-Za-z0-9]/
const PIN_REGEX = /^\d{4}$/

export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return 'Email is required.'
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Enter a valid email address.'
  }

  return null
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required.'
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters.'
  }

  if (!UPPER_REGEX.test(password)) {
    return 'Password must include at least one uppercase letter.'
  }

  if (!NUMBER_REGEX.test(password)) {
    return 'Password must include at least one number.'
  }

  if (!SPECIAL_REGEX.test(password)) {
    return 'Password must include at least one special character.'
  }

  return null
}

export function validatePin(pin?: string): string | null {
  if (!pin) {
    return null
  }

  if (!PIN_REGEX.test(pin)) {
    return 'PIN must be exactly 4 digits.'
  }

  return null
}

export function validateRegisterInput(input: RegisterInput): string | null {
  if (!input.name.trim()) {
    return 'Full name is required.'
  }

  const emailError = validateEmail(input.email)
  if (emailError) {
    return emailError
  }

  const passwordError = validatePassword(input.password)
  if (passwordError) {
    return passwordError
  }

  if (input.password !== input.confirmPassword) {
    return 'Password and confirm password must match.'
  }

  return validatePin(input.pin)
}
