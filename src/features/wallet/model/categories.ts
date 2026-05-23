import type { LucideIcon } from 'lucide-react'
import {
  UtensilsCrossed, Receipt, ShoppingBag, TrendingUp, Pill,
  Clapperboard, Plane, Car, BookOpen, AlertTriangle, Tag,
  Banknote, CreditCard, Smartphone, Landmark,
} from 'lucide-react'
import type { ExpenseCategory } from './types'

export interface CategoryMeta {
  key: ExpenseCategory
  label: string
  icon: LucideIcon
  cssClass: string
}

export const EXPENSE_CATEGORIES: CategoryMeta[] = [
  { key: 'food',          label: 'Food',          icon: UtensilsCrossed, cssClass: 'cat-food' },
  { key: 'bills',         label: 'Bills',         icon: Receipt,         cssClass: 'cat-bills' },
  { key: 'shopping',      label: 'Shopping',      icon: ShoppingBag,     cssClass: 'cat-shopping' },
  { key: 'investment',    label: 'Investment',    icon: TrendingUp,      cssClass: 'cat-investment' },
  { key: 'health',        label: 'Health',        icon: Pill,            cssClass: 'cat-health' },
  { key: 'entertainment', label: 'Entertainment', icon: Clapperboard,    cssClass: 'cat-entertainment' },
  { key: 'travel',        label: 'Travel',        icon: Plane,           cssClass: 'cat-travel' },
  { key: 'transport',     label: 'Transport',     icon: Car,             cssClass: 'cat-transport' },
  { key: 'education',     label: 'Education',     icon: BookOpen,        cssClass: 'cat-education' },
  { key: 'emergency',     label: 'Emergency',     icon: AlertTriangle,   cssClass: 'cat-emergency' },
  { key: 'other',         label: 'Other',         icon: Tag,             cssClass: 'cat-other' },
]

export function getCategoryMeta(key: ExpenseCategory): CategoryMeta {
  return EXPENSE_CATEGORIES.find((c) => c.key === key) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]!
}

export const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Rental',
  'Gift',
  'Refund',
  'Other',
]

export interface PaymentTypeMeta {
  key: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other'
  label: string
  icon: LucideIcon
}

export const PAYMENT_TYPES: PaymentTypeMeta[] = [
  { key: 'cash',          label: 'Cash',          icon: Banknote  },
  { key: 'card',          label: 'Card',          icon: CreditCard },
  { key: 'upi',           label: 'UPI',           icon: Smartphone },
  { key: 'bank_transfer', label: 'Bank Transfer', icon: Landmark  },
  { key: 'other',         label: 'Other',         icon: Tag       },
]
