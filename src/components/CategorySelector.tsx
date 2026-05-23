import { EXPENSE_CATEGORIES } from '../features/wallet/model/categories'
import type { ExpenseCategory } from '../features/wallet/model/types'
import { cn } from '../shared/lib/cn'

interface CategorySelectorProps {
  value: ExpenseCategory
  onChange: (category: ExpenseCategory) => void
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
      {EXPENSE_CATEGORIES.map((cat, i) => {
        const selected = value === cat.key
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onChange(cat.key)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all duration-200 active:scale-95',
              'opacity-0 animate-scale-in',
              selected
                ? 'border-black bg-black text-white shadow-lg shadow-black/20 scale-105'
                : `${cat.cssClass} border hover:scale-105`,
            )}
            style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'forwards' }}
          >
            <cat.icon size={20} />
            <span className="text-xs font-medium leading-tight text-center">{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}
