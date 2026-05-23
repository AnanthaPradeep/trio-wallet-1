import { useMemo } from 'react'
import { groupByCurrency } from '../../../shared/lib/money'
import { useWalletApp } from './useWalletApp'

export function useWalletTotals() {
  const { wallets } = useWalletApp()

  return useMemo(
    () => groupByCurrency(wallets.map((wallet) => ({ currency: wallet.currency, amountMinor: wallet.balanceMinor }))),
    [wallets],
  )
}
