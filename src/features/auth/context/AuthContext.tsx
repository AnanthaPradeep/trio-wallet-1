import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../../../shared/constants/storage'
import { validateEmail, validatePassword, validateRegisterInput } from '../lib/validators'
import { getStoredUsers, saveUsers } from '../model/mockData'
import type { AuthContextValue, AuthUser, LoginInput, RegisterInput, StoredAuthUser } from '../types'

const TWO_FACTOR_CODE = '123456'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function toPublicUser(user: StoredAuthUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    pin: user.pin,
  }
}

function createToken(email: string): string {
  const base = `${email}:${Date.now()}`
  return btoa(base)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingTwoFactorEmail, setPendingTwoFactorEmail] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = window.localStorage.getItem(STORAGE_KEYS.authToken)
    const storedUser = window.localStorage.getItem(STORAGE_KEYS.authUser)

    if (!storedToken || !storedUser) {
      setIsLoading(false)
      return
    }

    try {
      const parsedUser = JSON.parse(storedUser) as AuthUser
      setToken(storedToken)
      setUser(parsedUser)
    } catch {
      window.localStorage.removeItem(STORAGE_KEYS.authToken)
      window.localStorage.removeItem(STORAGE_KEYS.authUser)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (input: LoginInput) => {
    const emailError = validateEmail(input.email)
    if (emailError) {
      throw new Error(emailError)
    }

    const passwordError = validatePassword(input.password)
    if (passwordError) {
      throw new Error(passwordError)
    }

    const users = getStoredUsers()
    const found = users.find((item) => item.email.toLowerCase() === input.email.trim().toLowerCase())

    if (!found || found.password !== input.password) {
      throw new Error('Invalid email or password.')
    }

    if (input.require2FA) {
      setPendingTwoFactorEmail(found.email)
      return
    }

    const nextToken = createToken(found.email)
    const nextUser = toPublicUser(found)
    setToken(nextToken)
    setUser(nextUser)
    setPendingTwoFactorEmail(null)
    window.localStorage.setItem(STORAGE_KEYS.authToken, nextToken)
    window.localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(nextUser))
  }

  const register = async (input: RegisterInput) => {
    const validationError = validateRegisterInput(input)
    if (validationError) {
      throw new Error(validationError)
    }

    const users = getStoredUsers()
    const exists = users.some((item) => item.email.toLowerCase() === input.email.trim().toLowerCase())

    if (exists) {
      throw new Error('A user with this email already exists.')
    }

    const newUser: StoredAuthUser = {
      id: `u-${crypto.randomUUID()}`,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      pin: input.pin,
    }

    const nextUsers = [newUser, ...users]
    saveUsers(nextUsers)

    const nextToken = createToken(newUser.email)
    const publicUser = toPublicUser(newUser)
    setToken(nextToken)
    setUser(publicUser)
    setPendingTwoFactorEmail(null)
    window.localStorage.setItem(STORAGE_KEYS.authToken, nextToken)
    window.localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(publicUser))
  }

  const verifyTwoFactor = async (code: string) => {
    if (!pendingTwoFactorEmail) {
      throw new Error('No 2FA verification pending.')
    }

    if (code !== TWO_FACTOR_CODE) {
      throw new Error('Invalid verification code. Use 123456 for demo.')
    }

    const users = getStoredUsers()
    const found = users.find((item) => item.email.toLowerCase() === pendingTwoFactorEmail.toLowerCase())

    if (!found) {
      throw new Error('User not found for verification.')
    }

    const nextToken = createToken(found.email)
    const publicUser = toPublicUser(found)
    setToken(nextToken)
    setUser(publicUser)
    setPendingTwoFactorEmail(null)
    window.localStorage.setItem(STORAGE_KEYS.authToken, nextToken)
    window.localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(publicUser))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setPendingTwoFactorEmail(null)
    window.localStorage.removeItem(STORAGE_KEYS.authToken)
    window.localStorage.removeItem(STORAGE_KEYS.authUser)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      pendingTwoFactorEmail,
      login,
      register,
      verifyTwoFactor,
      logout,
    }),
    [isLoading, pendingTwoFactorEmail, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuthContext must be used inside AuthProvider.')
  }

  return context
}
