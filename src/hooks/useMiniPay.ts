import { useState, useEffect } from 'react'
import { createWalletClient, custom, http, erc20Abi, formatUnits, parseUnits } from 'viem'
import { celoSepolia } from 'viem/chains'
import { createPublicClient } from 'viem'

const USDC_ADDRESS = '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B' as const

export function useMiniPay() {
  const [address, setAddress] = useState<string>('')
  const [balance, setBalance] = useState<string>('0')
  const [isMiniPay, setIsMiniPay] = useState(false)
  const [loading, setLoading] = useState(false)

  const publicClient = createPublicClient({
    chain: celoSepolia,
    transport: http('https://alfajores-forno.celo-testnet.org'),
  })

  useEffect(() => {
    const w = window as any
    const ethereum = w.ethereum
    if (ethereum?.isMiniPay || navigator.userAgent.toLowerCase().includes('minipay')) {
      setIsMiniPay(true)
    }
    if (ethereum) {
      init(ethereum)
    }
  }, [])

  const init = async (ethereum: any) => {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts[0]) {
        setAddress(accounts[0])
        await fetchBalance(accounts[0])
      }
    } catch (e) {
      console.error('Init error:', e)
    }
  }

  const fetchBalance = async (addr: string) => {
    try {
      const bal = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [addr as `0x${string}`],
      })
      const decimals = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'decimals',
      })
      setBalance(parseFloat(formatUnits(bal as bigint, decimals as number)).toFixed(2))
    } catch (e) {
      console.error('Balance error:', e)
      setBalance('0')
    }
  }

  const sendUSDm = async (to: string, amount: number): Promise<string> => {
    setLoading(true)
    try {
      const w = window as any
      const walletClient = createWalletClient({
        chain: celoSepolia,
        transport: custom(w.ethereum),
      })
      const [from] = await walletClient.getAddresses()
      const decimals = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'decimals',
      })
      const hash = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [to as `0x${string}`, parseUnits(amount.toString(), decimals as number)],
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
