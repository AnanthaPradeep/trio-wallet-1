import { ArrowUpRight, Coffee, ShoppingBag, Settings2 } from 'lucide-react'

interface TransactionRow {
  id: string
  merchant: string
  dateTime: string
  amount: string
  icon: typeof Coffee
}

const TRANSACTIONS: TransactionRow[] = [
  {
    id: 'starbucks',
    merchant: 'Starbucks',
    dateTime: 'Jul 08, 7:30am',
    amount: '$19.99',
    icon: Coffee,
  },
  {
    id: 'henry-and-smith',
    merchant: 'Henry & Smith',
    dateTime: 'Jul 08, 12:30pm',
    amount: '$155.87',
    icon: ShoppingBag,
  },
  {
    id: 'apple-service',
    merchant: 'Apple Service',
    dateTime: 'Jul 09, 9:45am',
    amount: '$120.99',
    icon: Settings2,
  },
]

export function FinanceDashboardCard() {
  return (
    <section className="w-full rounded-[20px] bg-white p-3 shadow-[0_22px_50px_rgba(17,24,39,0.14)] sm:p-4">
      <div className="rounded-2xl bg-linear-to-br from-blue-500 via-blue-600 to-sky-500 p-4 text-white sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-blue-100">Credit Balance</p>
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-xs font-semibold backdrop-blur">
            <ArrowUpRight size={12} />
            +4.67%
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold leading-none tracking-tight sm:text-4xl">$4,593.46</p>
      </div>

      <div className="mt-4 space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Recent Transactions</p>

        {TRANSACTIONS.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-500">
                <Icon size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">{item.merchant}</p>
                <p className="truncate text-xs text-gray-400">{item.dateTime}</p>
              </div>

              <p className="shrink-0 text-sm font-bold text-gray-700">{item.amount}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
