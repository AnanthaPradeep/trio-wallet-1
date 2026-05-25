import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ScanLine, QrCode, Camera, User, Zap, Coffee, Car, ShoppingCart, UtensilsCrossed } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../../shared/ui/Button'
import { cn } from '../../../shared/lib/cn'
import { useAuth } from '../../auth/hooks/useAuth'
import { APP_ROUTES } from '../../../shared/constants/routes'

declare global {
  interface Window {
    BarcodeDetector: new (options?: { formats: string[] }) => {
      detect(image: HTMLVideoElement): Promise<Array<{ rawValue: string }>>
    }
  }
}

interface PaymentQRPayload {
  recipient: string
  phone?: string
  note?: string
  amount?: number
}

type CameraState = 'idle' | 'requesting' | 'active' | 'error' | 'scanned'

const DEMO_MERCHANTS: Array<{ name: string; note: string; amount: number; icon: LucideIcon }> = [
  { name: 'Raj Kumar',   note: 'Chai Shop',   amount: 50,  icon: Coffee          },
  { name: 'Auto Driver', note: 'Auto Ride',   amount: 150, icon: Car             },
  { name: 'Fresh Mart',  note: 'Groceries',   amount: 500, icon: ShoppingCart    },
  { name: 'Pizza Palace',note: 'Food Order',  amount: 320, icon: UtensilsCrossed },
]

function CameraScanner({ onScanned }: { onScanned: (payload: PaymentQRPayload) => void }) {
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const startCamera = async () => {
    setCameraState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraState('active')
      scanLoop()
    } catch {
      setCameraState('error')
      setErrorMsg('Camera access denied. Please allow camera permissions and try again.')
    }
  }

  const scanLoop = () => {
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
    const tick = async () => {
      if (!videoRef.current || cameraState === 'scanned') return
      try {
        const results = await detector.detect(videoRef.current)
        if (results.length > 0) {
          const raw = results[0]!.rawValue
          try {
            const payload = JSON.parse(raw) as PaymentQRPayload
            if (payload.recipient) {
              setCameraState('scanned')
              streamRef.current?.getTracks().forEach((t) => t.stop())
              onScanned(payload)
              return
            }
          } catch {
            // not a valid payment QR, keep scanning
          }
        }
      } catch {
        // detect can throw if video not ready
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  if (cameraState === 'idle') {
    return (
      <div className="flex flex-col items-center gap-5 py-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100">
          <Camera size={36} className="text-gray-400" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-gray-800">Scan a payment QR code</p>
          <p className="text-sm text-gray-500">Point your camera at a QR code to pay instantly</p>
        </div>
        <Button variant="primary" onClick={startCamera}>Start Camera</Button>
      </div>
    )
  }

  if (cameraState === 'requesting') {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
        <p className="text-sm text-gray-500">Requesting camera access…</p>
      </div>
    )
  }

  if (cameraState === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-sm text-red-500">{errorMsg}</p>
        <Button variant="secondary" onClick={() => { setCameraState('idle'); setErrorMsg('') }}>Try Again</Button>
      </div>
    )
  }

  if (cameraState === 'scanned') {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Zap size={28} className="text-emerald-600" />
        </div>
        <p className="font-semibold text-emerald-700">QR scanned! Redirecting…</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl border-2 border-dashed border-gray-300 bg-black">
        <video ref={videoRef} className="h-64 w-full object-cover" muted playsInline />
      </div>
      <p className="text-center text-sm text-gray-500">Point at a Trio Wallet QR code</p>
    </div>
  )
}

function DemoScanFallback({ onSelect }: { onSelect: (payload: PaymentQRPayload) => void }) {
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 text-center space-y-1">
        <p className="text-sm font-semibold text-gray-700">Demo Mode</p>
        <p className="text-xs text-gray-500">QR scanning requires a browser with BarcodeDetector support (Chrome/Edge). Tap a merchant below to simulate a scan.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {DEMO_MERCHANTS.map((m) => (
          <button
            key={m.name}
            type="button"
            onClick={() => onSelect({ recipient: m.name, note: m.note, amount: m.amount })}
            className="glass-control rounded-2xl p-4 text-left space-y-1 transition hover:bg-white/70 active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600"><m.icon size={20} /></div>
            <p className="text-sm font-bold text-gray-800">{m.name}</p>
            <p className="text-xs text-gray-500">{m.note}</p>
            <p className="text-sm font-semibold text-sky-600">₹{m.amount}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ScanPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState<'scan' | 'myqr'>('scan')

  const hasBarcodeDetector = 'BarcodeDetector' in window

  const qrValue = JSON.stringify({
    recipient: user?.name ?? 'Unknown',
    phone: user?.phone ?? '',
    note: `Payment to ${user?.name ?? 'user'}`,
  })

  const handleScanned = (payload: PaymentQRPayload) => {
    const params = new URLSearchParams()
    params.set('recipient', payload.recipient)
    if (payload.note) params.set('note', payload.note)
    if (payload.amount) params.set('amount', String(payload.amount))
    navigate(`${APP_ROUTES.pay}?${params.toString()}`)
  }

  return (
    <div className="mx-auto w-full max-w-full space-y-5 pb-20 sm:max-w-lg sm:space-y-6 sm:pb-24 md:max-w-lg md:pb-10 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Scan & QR</h1>
        <p className="text-sm text-gray-500">Pay by scanning, or share your QR to receive</p>
      </div>

      {/* Tab switcher */}
      <div className="glass-control flex rounded-2xl p-1">
        <button
          type="button"
          onClick={() => setTab('scan')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition-all duration-200',
            tab === 'scan' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <ScanLine size={16} />
          Scan QR
        </button>
        <button
          type="button"
          onClick={() => setTab('myqr')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition-all duration-200',
            tab === 'myqr' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <QrCode size={16} />
          My QR
        </button>
      </div>

      {tab === 'scan' && (
        <div className="glass rounded-3xl p-5">
          {hasBarcodeDetector
            ? <CameraScanner onScanned={handleScanned} />
            : <DemoScanFallback onSelect={handleScanned} />
          }
        </div>
      )}

      {tab === 'myqr' && (
        <div className="glass rounded-3xl p-6 space-y-5">
          <div className="flex flex-col items-center gap-5">
            <div className="rounded-2xl bg-white p-4 shadow-md">
              {user?.name
                ? <QRCodeSVG value={qrValue} size={200} />
                : (
                  <div className="flex h-50 w-50 flex-col items-center justify-center gap-3 text-center">
                    <User size={36} className="text-gray-300" />
                    <p className="text-sm text-gray-400">Complete your profile to generate a QR code</p>
                  </div>
                )
              }
            </div>

            {user?.name && (
              <div className="text-center space-y-1">
                <p className="text-lg font-bold text-gray-900">{user.name}</p>
                {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
              </div>
            )}

            <p className="text-center text-xs text-gray-400">
              Share this QR code so others can scan and pay you instantly
            </p>

            {!user?.name && (
              <Button variant="secondary" onClick={() => navigate(APP_ROUTES.profile)}>
                Complete Profile
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
