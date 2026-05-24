import { useEffect, useMemo, useState } from 'react'
import { AppRouter } from './app/router/AppRouter'
import { useAuth } from './features/auth/hooks/useAuth'
import logo1 from './assets/logo1.png'

const MIN_LOADER_MS = 1500
const EXIT_MS = 380

function AppInitialLoader() {
  const { isLoading } = useAuth()
  const [minElapsed, setMinElapsed] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const isReady = useMemo(() => minElapsed && !isLoading, [minElapsed, isLoading])

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), MIN_LOADER_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isReady || !isVisible) return
    setIsExiting(true)
    const timer = window.setTimeout(() => setIsVisible(false), EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [isReady, isVisible])

  if (!isVisible) return null

  return (
    <div
      className={`pointer-events-auto fixed inset-0 z-120 flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-black px-6 transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      aria-live="polite"
      role="status"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(56,189,248,0.18),transparent_48%),radial-gradient(circle_at_80%_75%,rgba(99,102,241,0.18),transparent_46%)]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl border border-white/15 bg-white/8 px-8 py-10 text-center shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl">
        <div className="relative motion-safe:animate-pulse">
          <span className="absolute inset-0 rounded-full bg-blue-400/30 blur-xl" />
          <span className="absolute -inset-3 rounded-full border border-blue-300/35 motion-safe:animate-ping motion-reduce:animate-none" />
          <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-white/20 bg-black/85 shadow-[0_10px_30px_rgba(59,130,246,0.35)]">
            <img src={logo1} alt="Trio Wallet logo" className="h-50 w-50 object-contain" />
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">Trio Wallet</h1>
        <p className="mt-2 text-sm font-medium text-slate-200">Preparing your secure workspace</p>

        <div className="mt-5 flex items-center gap-1 text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-300 motion-safe:animate-bounce motion-reduce:animate-none" />
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 [animation-delay:120ms] motion-safe:animate-bounce motion-reduce:animate-none" />
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-300 [animation-delay:240ms] motion-safe:animate-bounce motion-reduce:animate-none" />
        </div>

        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-1/2 rounded-full bg-linear-to-r from-blue-400 via-cyan-300 to-indigo-400 motion-safe:animate-[loaderSlide_1.2s_ease-in-out_infinite] motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <AppInitialLoader />
      <AppRouter />
    </>
  )
}

export default App
