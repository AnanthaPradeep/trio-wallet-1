import { useWalletContext } from '../context/WalletContext'

export function useWalletApp() {
  return useWalletContext()
}
