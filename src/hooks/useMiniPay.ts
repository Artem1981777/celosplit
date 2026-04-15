import { useState, useEffect } from 'react'
import { createPublicClient, createWalletClient, custom, http, formatEther } from 'viem'
import { celo } from 'viem/chains'

const USDM_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a' as const
const USDM_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export function useMiniPay() {
  const [address, setAddress] = useState<string>('')
  const [balance, setBalance] = useState<string>('0')
  const [isMiniPay, setIsMiniPay] = useState(false)
  const [loading, setLoading] = useState(false)

  const publicClient = createPublicClient({
    chain: celo,
    transport: http('https://forno.celo.org'),
  })

  useEffect(() => {
    const w = window as any
    if (w.ethereum?.isMiniPay) {
      setIsMiniPay(true)
      init()
    }
  }, [])

  const init = async () => {
    const w = window as any
    const accounts = await w.ethereum.request({ method: 'eth_requestAccounts' })
    if (accounts[0]) {
      setAddress(accounts[0])
      await fetchBalance(accounts[0])
    }
  }

  const fetchBalance = async (addr: string) => {
    try {
      const bal = await publicClient.readContract({
        address: USDM_ADDRESS,
        abi: USDM_ABI,
        functionName: 'balanceOf',
        args: [addr as `0x${string}`],
      })
      setBalance(parseFloat(formatEther(bal as bigint)).toFixed(2))
    } catch (e) {
      setBalance('0')
    }
  }

  const sendUSDm = async (to: string, amount: number): Promise<string> => {
    setLoading(true)
    try {
      const w = window as any
      const walletClient = createWalletClient({
        chain: celo,
        transport: custom(w.ethereum),
      })
      const [from] = await walletClient.getAddresses()
      const amountWei = BigInt(Math.round(amount * 1e18))

      const hash = await walletClient.writeContract({
        address: USDM_ADDRESS,
        abi: USDM_ABI,
        functionName: 'transfer',
        args: [to as `0x${string}`, amountWei],
        account: from,
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      await fetchBalance(from)
      return receipt.status === 'success' ? hash : ''
    } catch (e: any) {
      throw new Error(e.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return { address, balance, isMiniPay, loading, sendUSDm, fetchBalance }
}
