import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { useFormFeedback } from '../../../shared/hooks/useFormFeedback'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { useWalletApp } from '../../wallet/hooks/useWalletApp'
import { useAuth } from '../hooks/useAuth'
import { validateAddress, validatePhone } from '../lib/validators'

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Spanish', 'Arabic']

export function ProfilePage() {
  const { user, updateUserProfile } = useAuth()
  const { wallets } = useWalletApp()
  const { feedback, clearFeedback, setError, setSuccess } = useFormFeedback()

  const [isError, setIsError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [language, setLanguage] = useState('English')
  const [defaultWalletId, setDefaultWalletId] = useState('')

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setPhone(user.phone ?? '')
    setAddress(user.address ?? '')
    setLanguage(user.language ?? 'English')
    setDefaultWalletId(user.defaultWalletId ?? '')
  }, [user])

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearFeedback()

    if (!name.trim()) {
      setIsError(true)
      setError(new Error('Full name is required.'), 'Validation failed.')
      return
    }

    const phoneError = validatePhone(phone)
    if (phoneError) {
      setIsError(true)
      setError(new Error(phoneError), 'Validation failed.')
      return
    }

    const addressError = validateAddress(address)
    if (addressError) {
      setIsError(true)
      setError(new Error(addressError), 'Validation failed.')
      return
    }

    setIsSaving(true)
    try {
      await updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        language,
        defaultWalletId: defaultWalletId || undefined,
      })
      setIsError(false)
      setSuccess('Profile updated successfully.')
    } catch (error) {
      setIsError(true)
      setError(error, 'Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 sm:space-y-7 sm:pb-24 md:space-y-8 md:pb-10 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500">Manage your personal info and app preferences.</p>
        </div>
        <Link to={APP_ROUTES.dashboard} className="text-sm font-semibold text-gray-700 underline hover:text-gray-900">
          Back to Dashboard
        </Link>
      </div>

      <form className="space-y-4" onSubmit={saveProfile}>
        <Card>
          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-800">Account Basics</p>
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(event) => {
                clearFeedback()
                setName(event.target.value)
              }}
              placeholder="Your full name"
            />
            <Input label="Email" type="email" value={user?.email ?? ''} disabled className="cursor-not-allowed bg-gray-50" />
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-800">Contact</p>
            <Input
              label="Phone"
              type="text"
              value={phone}
              onChange={(event) => {
                clearFeedback()
                setPhone(event.target.value)
              }}
              placeholder="e.g. +919876543210"
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                value={address}
                onChange={(event) => {
                  clearFeedback()
                  setAddress(event.target.value)
                }}
                placeholder="Your address"
                rows={3}
                className="glass-control w-full resize-none rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 sm:px-4 sm:py-3 sm:text-base"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-800">Preferences</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <Select
                  value={language}
                  onChange={(event) => {
                    clearFeedback()
                    setLanguage(event.target.value)
                  }}
                >
                  {LANGUAGE_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Default Wallet</label>
                <Select
                  value={defaultWalletId}
                  onChange={(event) => {
                    clearFeedback()
                    setDefaultWalletId(event.target.value)
                  }}
                >
                  <option value="">No default wallet</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="subtle">
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-800">Security Status</p>
            <p className="text-sm text-gray-700">Password and 2FA management will be added in the next security upgrade.</p>
            <p className="text-xs text-gray-500">Current 2FA mode: Demo placeholder</p>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
          <Button type="button" variant="secondary" onClick={() => {
            clearFeedback()
            setName(user?.name ?? '')
            setPhone(user?.phone ?? '')
            setAddress(user?.address ?? '')
            setLanguage(user?.language ?? 'English')
            setDefaultWalletId(user?.defaultWalletId ?? '')
          }}>
            Reset
          </Button>
        </div>
      </form>

      {feedback ? (
        <p className={`text-sm font-medium ${isError ? 'text-red-600' : 'text-emerald-600'}`}>
          {feedback}
        </p>
      ) : null}
    </div>
  )
}
