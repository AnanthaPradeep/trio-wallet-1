import { STORAGE_KEYS } from '../../../shared/constants/storage'
import type { StoredAuthUser } from '../types'

const DEFAULT_USERS: StoredAuthUser[] = [
  {
    id: 'u-demo',
    name: 'Demo User',
    email: 'anan@gmail.com',
    password: 'A12345678@',
    pin: '1234',
    language: 'English',
  },
]

export function getStoredUsers(): StoredAuthUser[] {
  if (typeof window === 'undefined') {
    return DEFAULT_USERS
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.authUsers)

  if (!raw) {
    window.localStorage.setItem(STORAGE_KEYS.authUsers, JSON.stringify(DEFAULT_USERS))
    return DEFAULT_USERS
  }

  try {
    const parsed = JSON.parse(raw) as StoredAuthUser[]
    return Array.isArray(parsed) ? parsed : DEFAULT_USERS
  } catch {
    return DEFAULT_USERS
  }
}

export function saveUsers(users: StoredAuthUser[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEYS.authUsers, JSON.stringify(users))
}
