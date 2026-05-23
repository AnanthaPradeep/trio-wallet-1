import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  children: ReactNode
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}
