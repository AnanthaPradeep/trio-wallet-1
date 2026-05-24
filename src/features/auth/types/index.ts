export interface AuthUser {
  id: string
  name: string
  email: string
  pin?: string
  phone?: string
  address?: string
  language?: string
  defaultWalletId?: string
}

export interface StoredAuthUser extends AuthUser {
  password: string
}

export interface LoginInput {
  email: string
  password: string
  require2FA?: boolean
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  confirmPassword: string
  pin?: string
}

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  pendingTwoFactorEmail: string | null
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  verifyTwoFactor: (code: string) => Promise<void>
  updateUserProfile: (updates: Partial<Pick<AuthUser, 'name' | 'phone' | 'address' | 'language' | 'defaultWalletId'>>) => Promise<void>
  logout: () => void
}
