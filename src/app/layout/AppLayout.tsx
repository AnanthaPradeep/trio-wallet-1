import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import type { SVGProps } from 'react'
import { ChevronDown, Globe, Mail, MapPin, Phone, Plus } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { NAV_ITEMS } from '../../shared/constants/routes'
import { APP_ROUTES } from '../../shared/constants/routes'
import { G20_REGIONS } from '../../shared/constants/regions'
import { QuickActionFAB } from '../../components/QuickActionFAB'
import { useDisplayCurrency } from '../../shared/hooks/useDisplayCurrency'
import { cn } from '../../shared/lib/cn'
import { useAuth } from '../../features/auth/hooks/useAuth'
import logo1 from '../../assets/logo1.png'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/add-expense': 'Add Expense',
  '/add-income': 'Add Income',
  '/analytics': 'Analytics',
  '/history': 'History',
  '/manage': 'Manage',
  '/allocate-funds': 'Allocate Funds',
  '/spend': 'Spend',
  '/transfer-internal': 'Transfer',
  '/transfer-bank': 'Wallet to Bank',
  '/bank-to-wallet': 'Bank to Wallet',
}

const NAV_LABELS: Record<string, string> = {
  '/': 'Home',
  '/add-expense': 'Expense',
  '/add-income': 'Income',
  '/analytics': 'Analytics',
  '/history': 'History',
  '/manage': 'Manage',
}

const DESKTOP_PRIMARY_LINKS = [
  { to: APP_ROUTES.dashboard, label: 'Home' },
  { to: APP_ROUTES.analytics, label: 'Analytics' },
  { to: APP_ROUTES.history, label: 'History' },
]

const ACTION_MENU_LINKS = [
  { to: APP_ROUTES.addIncome, label: 'Pool Add' },
  { to: APP_ROUTES.addExpense, label: 'Add Expense' },
  { to: APP_ROUTES.allocateFunds, label: 'Allocate Funds' },
  { to: APP_ROUTES.manage, label: 'Manage Wallets' },
]

const TRANSFER_MENU_LINKS = [
  { to: APP_ROUTES.transferInternal, label: 'Wallet to Wallet' },
  { to: APP_ROUTES.transferBank, label: 'Wallet to Bank' },
  { to: APP_ROUTES.bankToWallet, label: 'Bank to Pool' },
]

const TABLET_NAV_LINKS = [
  { to: APP_ROUTES.dashboard, label: 'Home' },
  { to: APP_ROUTES.analytics, label: 'Analytics' },
  { to: APP_ROUTES.history, label: 'History' },
  { to: APP_ROUTES.transferInternal, label: 'Transfers' },
  { to: APP_ROUTES.manage, label: 'Manage' },
]

const FOOTER_LINK_GROUPS = [
  {
    title: 'Platform',
    links: [
      { to: APP_ROUTES.dashboard, label: 'Dashboard' },
      { to: APP_ROUTES.analytics, label: 'Analytics' },
      { to: APP_ROUTES.history, label: 'History' },
      { to: APP_ROUTES.manage, label: 'Manage Wallets' },
    ],
  },
  {
    title: 'Money Actions',
    links: [
      { to: APP_ROUTES.addIncome, label: 'Add to Pool' },
      { to: APP_ROUTES.addExpense, label: 'Add Expense' },
      { to: APP_ROUTES.allocateFunds, label: 'Allocate Funds' },
      { to: APP_ROUTES.spend, label: 'Spend' },
    ],
  },
  {
    title: 'Transfers',
    links: [
      { to: APP_ROUTES.transferInternal, label: 'Wallet to Wallet' },
      { to: APP_ROUTES.transferBank, label: 'Wallet to Bank' },
      { to: APP_ROUTES.bankToWallet, label: 'Bank to Pool' },
      { to: APP_ROUTES.history, label: 'Transfer History' },
    ],
  },
  {
    title: 'Security & Access',
    links: [
      { to: APP_ROUTES.manage, label: 'Access & Wallet Rules' },
      { to: APP_ROUTES.analytics, label: 'Risk Insights' },
      { to: APP_ROUTES.history, label: 'Audit Timeline' },
      { to: APP_ROUTES.dashboard, label: 'Account Overview' },
    ],
  },
]

function XBrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2H21l-6.452 7.373L22.136 22h-5.94l-4.65-6.104L6.2 22H3.44l6.901-7.892L2 2h6.09l4.203 5.557L18.244 2Zm-1.04 18h1.527L7.258 3.895H5.62L17.204 20Z" />
    </svg>
  )
}

function InstagramBrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.85 1.35a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1ZM12 7.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 1.8A3 3 0 1 0 15 12a3 3 0 0 0-3-3Z" />
    </svg>
  )
}

function LinkedInBrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4.5 3A1.5 1.5 0 1 1 3 4.5 1.5 1.5 0 0 1 4.5 3ZM3.25 8h2.5v12h-2.5V8Zm6 0h2.4v1.64h.03a3.1 3.1 0 0 1 2.79-1.78c2.98 0 3.53 1.96 3.53 4.5V20h-2.5v-6.75c0-1.61-.03-3.68-2.24-3.68-2.24 0-2.58 1.75-2.58 3.56V20h-2.5V8Z" />
    </svg>
  )
}

const SOCIAL_MEDIA_LINKS = [
  {
    label: 'X',
    href: 'https://x.com',
    icon: XBrandIcon,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: InstagramBrandIcon,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: LinkedInBrandIcon,
  },
]

const FOOTER_QR_VALUE = 'https://triowallet.app'

export function AppLayout() {
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Trio Wallet'
  const isHome = location.pathname === '/'
  const { region, setRegion } = useDisplayCurrency()
  const { user, logout } = useAuth()
  const initials = user?.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  const [openMenu, setOpenMenu] = useState<'actions' | 'transfers' | 'user' | null>(null)
  const menuRootRef = useRef<HTMLDivElement | null>(null)

  const isActionsActive =
    location.pathname === APP_ROUTES.addIncome ||
    location.pathname === APP_ROUTES.addExpense ||
    location.pathname === APP_ROUTES.allocateFunds ||
    location.pathname === APP_ROUTES.manage

  const isTransfersActive =
    location.pathname === APP_ROUTES.transferInternal ||
    location.pathname === APP_ROUTES.transferBank ||
    location.pathname === APP_ROUTES.bankToWallet

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenMenu(null)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-linear-to-br from-white via-blue-50/30 to-purple-50/30 text-gray-900">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none fixed -right-32 top-1/3 h-80 w-80 rounded-full bg-purple-100/50 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-pink-50/40 blur-3xl" />

      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div ref={menuRootRef} className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 lg:px-8">
          {/* Left: brand */}
          <Link to={APP_ROUTES.dashboard} className="min-w-0 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-black">
                <img src={logo1} alt="Trio Wallet logo" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium leading-none text-gray-400">Trio Wallet</p>
                <p className="truncate text-sm font-bold leading-tight text-gray-900 sm:text-base">
                  {isHome ? 'Smart Money' : pageTitle}
                </p>
              </div>
            </div>
          </Link>

          {/* Center: desktop nav */}
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {DESKTOP_PRIMARY_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === APP_ROUTES.dashboard}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-3.5 py-2 text-sm font-medium transition',
                    isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu((prev) => (prev === 'actions' ? null : 'actions'))}
                className={cn(
                  'flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-medium transition',
                  isActionsActive || openMenu === 'actions'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                Actions
                <ChevronDown size={16} className={cn('transition', openMenu === 'actions' ? 'rotate-180' : '')} />
              </button>

              {openMenu === 'actions' && (
                <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
                  {ACTION_MENU_LINKS.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpenMenu(null)}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu((prev) => (prev === 'transfers' ? null : 'transfers'))}
                className={cn(
                  'flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-medium transition',
                  isTransfersActive || openMenu === 'transfers'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                Transfers
                <ChevronDown size={16} className={cn('transition', openMenu === 'transfers' ? 'rotate-180' : '')} />
              </button>

              {openMenu === 'transfers' && (
                <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
                  {TRANSFER_MENU_LINKS.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpenMenu(null)}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right: controls */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-1.5 md:flex">
              <Globe size={15} className="shrink-0 text-gray-400" />
              <select
                value={region.code}
                onChange={(e) => setRegion(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-700 outline-none focus:border-black focus:ring-2 focus:ring-black/10 xl:px-2.5 xl:py-2 xl:text-xs"
              >
                {G20_REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>{r.symbol} {r.name}</option>
                ))}
              </select>
            </div>

            <Link
              to={APP_ROUTES.addIncome}
              className="hidden items-center gap-1.5 rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 lg:inline-flex"
            >
              <Plus size={14} />
              Pool Add
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu((prev) => (prev === 'user' ? null : 'user'))}
                className={cn(
                  'flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-2 py-1.5 transition',
                  openMenu === 'user' ? 'ring-2 ring-black/10' : 'hover:border-black/20',
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-[10px] font-bold text-white">
                  {initials || 'U'}
                </div>
                <div className="hidden max-w-24 truncate text-xs font-semibold text-gray-700 xl:block">{user?.name ?? 'User'}</div>
                <ChevronDown size={14} className={cn('text-gray-500 transition', openMenu === 'user' ? 'rotate-180' : '')} />
              </button>

              {openMenu === 'user' && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
                  <p className="truncate px-2 py-1 text-xs font-semibold text-gray-500">{user?.name ?? 'User'}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null)
                      logout()
                    }}
                    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tablet nav row */}
        <div className="hidden border-t border-black/5 md:block lg:hidden">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-3 py-2 sm:px-4 md:px-6">
            {TABLET_NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === APP_ROUTES.dashboard}
                className={({ isActive }) =>
                  cn(
                    'shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition',
                    isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to={APP_ROUTES.addIncome}
              className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-xl bg-black px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800"
            >
              <Plus size={13} />
              Pool Add
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative mx-auto w-full max-w-6xl px-3 py-5 pb-24 sm:px-4 sm:py-6 sm:pb-24 md:px-6 md:py-8 md:pb-10 lg:px-8">
        <Outlet />
      </main>

      {/* Bottom tab bar (mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/90 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-xs font-medium transition-all',
                  isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                      isActive ? 'bg-black/10 scale-110' : '',
                    )}
                  >
                    <item.icon size={18} />
                  </span>
                  <span className="max-w-full truncate text-center text-[10px]">
                    {NAV_LABELS[item.to] ?? item.to}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Smart glass footer */}
      <footer className="relative mt-8 overflow-hidden border-t border-white/30 bg-white/45 backdrop-blur-2xl">
        <div className="pointer-events-none absolute -left-28 top-1/3 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 md:py-12 lg:px-8">
          <div className="grid gap-6 border-b border-black/10 pb-8 md:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-black">
                  <img src={logo1} alt="Trio Wallet logo" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Trio Wallet</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Smart pool-first money system</p>
                </div>
              </div>
              <p className="max-w-xl text-sm leading-6 text-gray-700">
                Track what you add, allocate to wallets with control, and move money across wallets and banks with a clear audit trail.
              </p>
            </div>

            <div className="rounded-2xl border border-white/40 bg-linear-to-br from-white/65 to-white/40 p-4 shadow-[0_8px_24px_rgba(31,41,55,0.08)] backdrop-blur-lg sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Weekly Summary</p>
              <p className="mt-1 text-sm font-medium text-gray-800">Get your finance pulse in one click.</p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <Link
                  to={APP_ROUTES.analytics}
                  className="inline-flex items-center rounded-xl bg-black px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                >
                  Open Analytics
                </Link>
                <Link
                  to={APP_ROUTES.history}
                  className="inline-flex items-center rounded-xl border border-white/40 bg-white/50 px-3.5 py-2 text-xs font-semibold text-gray-800 transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                >
                  View History
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-8 border-b border-black/10 py-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {FOOTER_LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">{group.title}</h3>
                <div className="mt-3 flex flex-col gap-2.5">
                  {group.links.map((item) => (
                    <NavLink
                      key={`${group.title}-${item.to}-${item.label}`}
                      to={item.to}
                      end={item.to === APP_ROUTES.dashboard}
                      className={({ isActive }) =>
                        cn(
                          'w-fit text-sm font-medium underline-offset-4 transition focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
                          isActive
                            ? 'text-black'
                            : 'text-gray-700 hover:text-gray-900 hover:underline',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 border-b border-black/10 py-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[1fr_1fr_auto]">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Social Media</h3>
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                {SOCIAL_MEDIA_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/45 px-3.5 py-2 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-md transition hover:bg-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                    aria-label={social.label}
                  >
                    <social.icon className="h-3.5 w-3.5" />
                    {social.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Contact Details</h3>
              <div className="mt-3 space-y-2.5 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <Mail size={14} className="shrink-0 text-gray-500" />
                  support@triowallet.app
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="shrink-0 text-gray-500" />
                  +91 98765 43210
                </p>
                <p className="flex items-start gap-2 leading-6">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-gray-500" />
                  <span>
                    Trio Wallet HQ, Brigade Tech Gardens,
                    <br />
                    Whitefield Main Road, Bengaluru, Karnataka 560066
                  </span>
                </p>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Scan QR</h3>
              <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border border-white/40 bg-white/45 p-3 shadow-sm backdrop-blur-md">
                <div className="rounded-xl border border-black/10 bg-white p-2">
                  <QRCodeSVG
                    value={FOOTER_QR_VALUE}
                    size={92}
                    level="M"
                    includeMargin={false}
                    bgColor="#FFFFFF"
                    fgColor="#111827"
                  />
                </div>
                <div className="max-w-44">
                  <p className="text-xs font-semibold text-gray-800">Open Trio Wallet</p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">Keep this QR for app download, payment links, or future deep-link flows.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-3 pt-6 sm:flex-row sm:items-center">
            <p className="text-xs font-medium text-gray-600">© {new Date().getFullYear()} Trio Wallet. Designed for secure personal finance workflows.</p>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={APP_ROUTES.manage}
                className="rounded-xl border border-white/40 bg-white/45 px-3.5 py-2 text-xs font-semibold text-gray-700 backdrop-blur-md transition hover:bg-white/65 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              >
                Preferences
              </Link>
              <Link
                to={APP_ROUTES.allocateFunds}
                className="rounded-xl border border-white/40 bg-white/45 px-3.5 py-2 text-xs font-semibold text-gray-700 backdrop-blur-md transition hover:bg-white/65 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              >
                Allocate Now
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* FAB */}
      <QuickActionFAB />
    </div>
  )
}
