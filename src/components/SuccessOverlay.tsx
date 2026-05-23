import { useEffect } from 'react'

interface SuccessOverlayProps {
  message: string
  onDone: () => void
}

export function SuccessOverlay({ message, onDone }: SuccessOverlayProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="animate-scale-pop glass flex flex-col items-center gap-4 rounded-3xl px-10 py-8 text-center shadow-2xl">
        {/* Animated check */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
          <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
            <path
              className="check-path"
              d="M8 20 L17 29 L32 12"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-900">{message}</p>
        <p className="text-sm text-gray-500">Transaction saved successfully</p>
      </div>
    </div>
  )
}
