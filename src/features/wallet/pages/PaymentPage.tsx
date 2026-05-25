import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Smartphone, CreditCard, Landmark, Banknote,
  ArrowRightLeft, ScanLine, CheckCircle2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AmountInput } from '../../../components/AmountInput'
import { SuccessOverlay } from '../../../components/SuccessOverlay'
import { WalletCard } from '../components/WalletCard'
import { parseMajorToMinor } from '../../../shared/lib/money'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { useWalletApp } from '../hooks/useWalletApp'
import { cn } from '../../../shared/lib/cn'
import { APP_ROUTES } from '../../../shared/constants/routes'

type PayMethod = 'upi' | 'card' | 'net_banking' | 'cash' | 'bank_transfer'

interface MethodConfig {
  key: PayMethod | 'scan'
  label: string
  subtitle: string
  icon: LucideIcon
  from: string
  to: string
}

const METHODS: MethodConfig[] = [
  { key: 'upi',          label: 'UPI',           subtitle: 'Pay via UPI ID',       icon: Smartphone,      from: '#38bdf8', to: '#2563eb' },
  { key: 'card',         label: 'Card',           subtitle: 'Debit / Credit card',  icon: CreditCard,      from: '#a78bfa', to: '#4338ca' },
  { key: 'net_banking',  label: 'Net Banking',    subtitle: 'Direct bank transfer',  icon: Landmark,        from: '#34d399', to: '#0d9488' },
  { key: 'cash',         label: 'Cash',           subtitle: 'Physical cash payment', icon: Banknote,        from: '#fbbf24', to: '#f97316' },
  { key: 'bank_transfer',label: 'Bank Transfer',  subtitle: 'NEFT / RTGS / IMPS',   icon: ArrowRightLeft,  from: '#fb7185', to: '#db2777' },
  { key: 'scan',         label: 'Scan & Pay',     subtitle: 'Scan a QR code',        icon: ScanLine,        from: '#374151', to: '#111827' },
]

function formatCardDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

export function PaymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { wallets, spendFromWallet } = useWalletApp()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [method, setMethod] = useState<PayMethod | null>(null)

  // Common
  const [recipient, setRecipient] = useState(searchParams.get('recipient') ?? '')

  // UPI
  const [upiId, setUpiId] = useState('')
  const [upiNote, setUpiNote] = useState(searchParams.get('note') ?? '')

  // Card
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  // Net Banking
  const [nbBank, setNbBank] = useState('')
  const [nbAccount, setNbAccount] = useState('')
  const [nbIfsc, setNbIfsc] = useState('')

  // Bank Transfer
  const [btHolder, setBtHolder] = useState('')
  const [btAccount, setBtAccount] = useState('')
  const [btIfsc, setBtIfsc] = useState('')
  const [btBank, setBtBank] = useState('')

  // Step 3
  const [amount, setAmount] = useState(searchParams.get('amount') ?? '')
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? '')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedWallet = wallets.find((w) => w.id === walletId)
  const amountMinor = parseMajorToMinor(amount, selectedWallet?.currency ?? 'INR')
  const selectedMethod = METHODS.find((m) => m.key === method)

  const handleMethodSelect = (key: PayMethod | 'scan') => {
    if (key === 'scan') { navigate(APP_ROUTES.scan); return }
    setMethod(key)
    setError('')
    setStep(2)
  }

  const validateStep2 = (): boolean => {
    if (!recipient.trim()) { setError('Recipient name is required.'); return false }
    if (method === 'upi') {
      if (!upiId.trim() || !upiId.includes('@') || upiId.length < 4) {
        setError('Enter a valid UPI ID (e.g. name@oksbi)'); return false
      }
    }
    if (method === 'card') {
      const digits = cardNumber.replace(/\D/g, '')
      if (digits.length !== 16) { setError('Card number must be 16 digits.'); return false }
      if (!cardName.trim()) { setError('Name on card is required.'); return false }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) { setError('Expiry must be MM/YY format.'); return false }
      if (cardCvv.length < 3) { setError('CVV must be 3 or 4 digits.'); return false }
    }
    if (method === 'net_banking') {
      if (!nbBank.trim()) { setError('Bank name is required.'); return false }
      if (!nbAccount.trim()) { setError('Account number is required.'); return false }
      if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(nbIfsc)) { setError('Enter a valid IFSC code (e.g. SBIN0001234).'); return false }
    }
    if (method === 'bank_transfer') {
      if (!btHolder.trim()) { setError('Account holder name is required.'); return false }
      if (!btAccount.trim()) { setError('Account number is required.'); return false }
      if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(btIfsc)) { setError('Enter a valid IFSC code (e.g. SBIN0001234).'); return false }
      if (!btBank.trim()) { setError('Bank name is required.'); return false }
    }
    return true
  }

  const goToStep3 = () => {
    if (!validateStep2()) return
    setError('')
    setStep(3)
  }

  const buildNote = (): string => {
    switch (method) {
      case 'upi':
        return `${recipient.trim()} · ${upiId.trim()} via UPI${upiNote.trim() ? ` — ${upiNote.trim()}` : ''}`
      case 'card': {
        const last4 = cardNumber.replace(/\D/g, '').slice(-4)
        return `${recipient.trim()} · Card ****${last4} (${cardName.trim()})`
      }
      case 'net_banking':
        return `${recipient.trim()} · ${nbBank.trim()} Acct ${nbAccount.trim()} via Net Banking`
      case 'cash':
        return `${recipient.trim()} via Cash${upiNote.trim() ? ` — ${upiNote.trim()}` : ''}`
      case 'bank_transfer':
        return `${recipient.trim()} · ${btHolder.trim()} ${btBank.trim()} ${btAccount.trim()} via NEFT`
      default:
        return recipient.trim()
    }
  }

  const confirmPay = () => {
    if (!amount || amountMinor <= 0) { setError('Enter a valid amount.'); return }
    const balance = selectedWallet?.balanceMinor ?? 0
    if (amountMinor > balance) { setError('Insufficient balance in selected wallet.'); return }
    try {
      spendFromWallet({ walletId, amountMinor, note: buildNote() })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed.')
    }
  }

  const goBack = () => {
    setError('')
    if (step === 3) { setStep(2); return }
    if (step === 2) { setMethod(null); setStep(1); return }
    navigate(-1)
  }

  if (success) {
    return <SuccessOverlay message={`Paid ${recipient}!`} onDone={() => navigate('/')} />
  }

  if (wallets.length === 0) {
    return (
      <div className="mx-auto w-full max-w-full space-y-5 pb-20 sm:max-w-2xl animate-slide-up">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate(-1)} className="glass-control flex h-10 w-10 items-center justify-center rounded-2xl text-gray-700 transition hover:bg-white/75">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Pay</h1>
        </div>
        <div className="glass rounded-3xl p-6 text-center space-y-3">
          <p className="text-gray-600">No wallets found. Create one first to make payments.</p>
          <Button variant="primary" onClick={() => navigate(APP_ROUTES.manage)}>Manage Wallets</Button>
        </div>
      </div>
    )
  }

  const stepLabels = ['Choose Method', 'Enter Details', 'Confirm & Pay']

  return (
    <div className="mx-auto w-full max-w-full space-y-5 pb-20 sm:max-w-2xl sm:space-y-6 sm:pb-24 md:max-w-2xl md:pb-10 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={goBack}
          className="glass-control flex h-10 w-10 items-center justify-center rounded-2xl text-gray-700 transition hover:bg-white/75"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Pay</h1>
          <p className="text-sm text-gray-500">{stepLabels[step - 1]}</p>
        </div>
      </div>

      {/* Step progress dots */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              s <= step ? 'bg-black' : 'bg-gray-200'
            )}
          />
        ))}
      </div>

      {/* ── STEP 1: Method Selection ── */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">How would you like to pay?</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {METHODS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => handleMethodSelect(m.key as PayMethod | 'scan')}
                className="group flex flex-col gap-2 rounded-3xl p-4 text-left transition-all duration-200 hover:scale-[1.03] active:scale-95"
                style={{ background: `linear-gradient(135deg, ${m.from}, ${m.to})` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                  <m.icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{m.label}</p>
                  <p className="text-xs text-white/70">{m.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Method Details ── */}
      {step === 2 && method && (
        <div className="space-y-4">
          {/* Selected method badge */}
          {selectedMethod && (
            <div
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: `linear-gradient(135deg, ${selectedMethod.from}, ${selectedMethod.to})` }}
            >
              <selectedMethod.icon size={18} className="text-white" />
              <span className="text-sm font-bold text-white">{selectedMethod.label}</span>
            </div>
          )}

          <div className="glass rounded-3xl p-5 space-y-4">
            {/* Recipient — always shown */}
            <Input
              label="Recipient Name"
              type="text"
              value={recipient}
              onChange={(e) => { setRecipient(e.target.value); setError('') }}
              placeholder="Name, shop, or merchant"
            />

            {/* UPI fields */}
            {method === 'upi' && (
              <>
                <Input
                  label="UPI ID"
                  type="text"
                  value={upiId}
                  onChange={(e) => { setUpiId(e.target.value); setError('') }}
                  placeholder="name@oksbi / 9876543210@upi"
                />
                <Input
                  label="Note (optional)"
                  type="text"
                  value={upiNote}
                  onChange={(e) => setUpiNote(e.target.value)}
                  placeholder="e.g. Dinner, rent, etc."
                />
              </>
            )}

            {/* Card fields */}
            {method === 'card' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCardDisplay(cardNumber)}
                    onChange={(e) => { setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16)); setError('') }}
                    placeholder="●●●● ●●●● ●●●● ●●●●"
                    className="glass-control w-full rounded-2xl px-4 py-3 font-mono text-base tracking-widest text-gray-900 outline-none focus:ring-2 focus:ring-black/20"
                    maxLength={19}
                  />
                </div>
                <Input
                  label="Name on Card"
                  type="text"
                  value={cardName}
                  onChange={(e) => { setCardName(e.target.value); setError('') }}
                  placeholder="As printed on card"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardExpiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                        if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`
                        setCardExpiry(v); setError('')
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="glass-control w-full rounded-2xl px-4 py-3 text-base text-gray-900 outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={cardCvv}
                      onChange={(e) => { setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }}
                      placeholder="●●●"
                      maxLength={4}
                      className="glass-control w-full rounded-2xl px-4 py-3 text-base text-gray-900 outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Net Banking fields */}
            {method === 'net_banking' && (
              <>
                <Input
                  label="Bank Name"
                  type="text"
                  value={nbBank}
                  onChange={(e) => { setNbBank(e.target.value); setError('') }}
                  placeholder="e.g. State Bank of India"
                />
                <Input
                  label="Account Number"
                  type="text"
                  inputMode="numeric"
                  value={nbAccount}
                  onChange={(e) => { setNbAccount(e.target.value.replace(/\D/g, '')); setError('') }}
                  placeholder="Enter account number"
                />
                <Input
                  label="IFSC Code"
                  type="text"
                  value={nbIfsc}
                  onChange={(e) => { setNbIfsc(e.target.value.toUpperCase()); setError('') }}
                  placeholder="SBIN0001234"
                />
              </>
            )}

            {/* Cash fields */}
            {method === 'cash' && (
              <Input
                label="Note (optional)"
                type="text"
                value={upiNote}
                onChange={(e) => setUpiNote(e.target.value)}
                placeholder="e.g. Groceries, auto fare, etc."
              />
            )}

            {/* Bank Transfer fields */}
            {method === 'bank_transfer' && (
              <>
                <Input
                  label="Account Holder Name"
                  type="text"
                  value={btHolder}
                  onChange={(e) => { setBtHolder(e.target.value); setError('') }}
                  placeholder="Full name on bank account"
                />
                <Input
                  label="Account Number"
                  type="text"
                  inputMode="numeric"
                  value={btAccount}
                  onChange={(e) => { setBtAccount(e.target.value.replace(/\D/g, '')); setError('') }}
                  placeholder="Enter account number"
                />
                <Input
                  label="IFSC Code"
                  type="text"
                  value={btIfsc}
                  onChange={(e) => { setBtIfsc(e.target.value.toUpperCase()); setError('') }}
                  placeholder="SBIN0001234"
                />
                <Input
                  label="Bank Name"
                  type="text"
                  value={btBank}
                  onChange={(e) => { setBtBank(e.target.value); setError('') }}
                  placeholder="e.g. HDFC Bank"
                />
              </>
            )}
          </div>

          {error && <p className="text-sm text-red-500 px-1">{error}</p>}
          <Button type="button" variant="primary" fullWidth size="lg" onClick={goToStep3}>
            Continue
          </Button>
        </div>
      )}

      {/* ── STEP 3: Amount + Wallet + Confirm ── */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Amount input */}
          <div className="glass rounded-3xl p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-500">Amount</p>
            <AmountInput
              value={amount}
              onChange={(v) => { setAmount(v); setError('') }}
              currency={selectedWallet?.currency ?? 'INR'}
            />
          </div>

          {/* Wallet selector */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Pay From</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {wallets.map((w) => (
                <WalletCard
                  key={w.id}
                  wallet={w}
                  compact
                  selected={walletId === w.id}
                  onClick={() => { setWalletId(w.id); setError('') }}
                />
              ))}
            </div>
          </div>

          {/* Payment summary */}
          {selectedMethod && (
            <div
              className="rounded-3xl p-5 space-y-3"
              style={{ background: `linear-gradient(135deg, ${selectedMethod.from}22, ${selectedMethod.to}33)` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${selectedMethod.from}, ${selectedMethod.to})` }}
                >
                  <selectedMethod.icon size={16} className="text-white" />
                </div>
                <span className="text-sm font-bold text-gray-800">{selectedMethod.label}</span>
                <CheckCircle2 size={16} className="ml-auto text-emerald-500" />
              </div>

              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">To</span>
                  <span className="font-semibold">{recipient}</span>
                </div>
                {method === 'upi' && upiId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">UPI ID</span>
                    <span className="font-mono font-semibold">{upiId}</span>
                  </div>
                )}
                {method === 'card' && cardNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Card</span>
                    <span className="font-mono font-semibold">****{cardNumber.slice(-4)}</span>
                  </div>
                )}
                {(method === 'net_banking' || method === 'bank_transfer') && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bank</span>
                    <span className="font-semibold">{method === 'net_banking' ? nbBank : btBank}</span>
                  </div>
                )}
                {method === 'bank_transfer' && btIfsc && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">IFSC</span>
                    <span className="font-mono font-semibold">{btIfsc}</span>
                  </div>
                )}
                {amount && (
                  <div className="flex justify-between border-t border-black/5 pt-1 mt-1">
                    <span className="text-gray-500">From</span>
                    <span className="font-semibold">{selectedWallet?.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500 px-1">{error}</p>}
          <Button type="button" variant="primary" fullWidth size="lg" onClick={confirmPay}>
            Confirm & Pay
          </Button>
        </div>
      )}
    </div>
  )
}
