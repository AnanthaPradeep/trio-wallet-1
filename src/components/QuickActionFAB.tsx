import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingDown, Wallet, ArrowLeftRight, PlusSquare, X, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { APP_ROUTES } from '../shared/constants/routes'

interface FabAction {
  label: string
  icon: LucideIcon
  to: string
  color: string
}

const FAB_ACTIONS: FabAction[] = [
  { label: 'Add Expense', icon: TrendingDown,    to: APP_ROUTES.addExpense,      color: '#ef4444' },
  { label: 'Add Income',  icon: Wallet,          to: APP_ROUTES.addIncome,       color: '#10b981' },
  { label: 'Transfer',    icon: ArrowLeftRight,  to: APP_ROUTES.transferInternal, color: '#3b82f6' },
  { label: 'Add Wallet',  icon: PlusSquare,      to: APP_ROUTES.manage,          color: '#8b5cf6' },
]

export function QuickActionFAB() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleAction = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <div ref={ref} className="fixed bottom-24 right-5 z-50 flex flex-col-reverse items-end gap-3 md:bottom-8">
      {open && FAB_ACTIONS.map((action, i) => (
        <div
          key={action.to}
          className="animate-fab flex items-center gap-3 opacity-0"
          style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
        >
          <span className="glass rounded-2xl px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg whitespace-nowrap">
            {action.label}
          </span>
          <button
            onClick={() => handleAction(action.to)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-xl transition-all duration-200 active:scale-90 hover:scale-110"
            style={{ backgroundColor: action.color }}
          >
            <action.icon size={22} />
          </button>
        </div>
      ))}

      {/* Main FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-2xl shadow-black/30 transition-all duration-300 active:scale-90 hover:scale-105 animate-pulse-glow"
        aria-label="Quick actions"
      >
        <span className="transition-transform duration-300" style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          {open ? <X size={24} /> : <Plus size={24} />}
        </span>
      </button>
    </div>
  )
}
