import { useState } from 'react'
import { ArrowLeft, Send, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import type { Group } from '../types'
import { useMiniPay } from '../hooks/useMiniPay'

interface Props {
  group: Group
  address: string
  isMiniPay: boolean
  onBack: () => void
  onUpdateGroup: (g: Group) => void
}

export default function SettlePage({ group, address, isMiniPay, onBack, onUpdateGroup }: Props) {
  const { sendUSDm, loading, balance } = useMiniPay()
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')
  const [settling, setSettling] = useState<string | null>(null)

  const getDebts = () => {
    const debts: { to: string; toName: string; amount: number; expenseIds: string[] }[] = []
    const balances: Record<string, number> = {}
    group.members.forEach(m => { balances[m.id] = 0 })

    group.expenses.filter(e => !e.settled).forEach(exp => {
      const share = exp.amount / exp.splitBetween.length
      exp.splitBetween.forEach(memberId => {
        if (memberId !== exp.paidBy) {
          balances[memberId] = (balances[memberId] || 0) - share
          balances[exp.paidBy] = (balances[exp.paidBy] || 0) + share
        }
      })
    })

    // What current user owes to others
    if (balances[address] < 0) {
      Object.entries(balances).forEach(([id, bal]) => {
        if (bal > 0 && id !== address) {
          const member = group.members.find(m => m.id === id)
          const expenseIds = group.expenses
            .filter(e => !e.settled && e.paidBy === id && e.splitBetween.includes(address))
            .map(e => e.id)
          if (member && expenseIds.length > 0) {
            debts.push({
              to: id,
              toName: member.name,
              amount: Math.min(Math.abs(balances[address]), bal),
              expenseIds,
            })
          }
        }
      })
    }
    return debts
  }

  const debts = getDebts()

  const handleSettle = async (debt: typeof debts[0]) => {
    setError('')
    setTxHash('')
    setSettling(debt.to)
    try {
      const hash = await sendUSDm(debt.to, debt.amount)
      if (hash) {
        setTxHash(hash)
        const updated = {
          ...group,
          expenses: group.expenses.map(e =>
            debt.expenseIds.includes(e.id) ? { ...e, settled: true } : e
          ),
        }
        onUpdateGroup(updated)
      }
    } catch (e: any) {
      setError(e.message || 'Transaction failed')
    } finally {
      setSettling(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        padding: '20px 16px', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none',
          borderRadius: 8, padding: 6, cursor: 'pointer',
        }}>
          <ArrowLeft size={18} color="#fff" />
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Settle Up</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Pay your share in USDm</div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Balance info */}
        <div style={{
          background: '#f0fdf4', border: '1.5px solid #bbf7d0',
          borderRadius: 14, padding: '14px 16px', marginBottom: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 13, color: '#166534' }}>Your USDm balance</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}>
            ${balance} USDm
          </div>
        </div>

        {/* Success */}
        {txHash && (
          <div style={{
            background: '#f0fdf4', border: '1.5px solid #16a34a',
            borderRadius: 14, padding: 16, marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <CheckCircle size={20} color="#16a34a" />
              <span style={{ fontWeight: 700, color: '#166534' }}>Payment Sent!</span>
            </div>
            <div style={{ fontSize: 12, color: '#4ade80', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 8 }}>
              {txHash}
            </div>
            <a
              href={`https://celoscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                color: '#16a34a', fontSize: 13, textDecoration: 'none', fontWeight: 600,
              }}
            >
              <ExternalLink size={14} /> View on Celoscan
            </a>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1.5px solid #fca5a5',
            borderRadius: 14, padding: 14, marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
          </div>
        )}

        {/* Debts */}
        {debts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
            <CheckCircle size={48} color="#d1fae5" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>All settled!</div>
            <div style={{ fontSize: 13 }}>You don't owe anything in this group</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
              You owe
            </div>
            {debts.map(debt => (
              <div key={debt.to} style={{
                background: '#fff', border: '1.5px solid #e2e8f0',
                borderRadius: 14, padding: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{debt.toName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                      {debt.to.slice(0, 10)}...
                    </div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>
                    ${debt.amount.toFixed(2)}
                  </div>
                </div>

                {!isMiniPay ? (
                  <div style={{
                    background: '#fef3c7', borderRadius: 10, padding: '10px 12px',
                    fontSize: 13, color: '#92400e', textAlign: 'center',
                  }}>
                    ⚠️ Open in MiniPay to pay
                  </div>
                ) : (
                  <button
                    onClick={() => handleSettle(debt)}
                    disabled={loading && settling === debt.to}
                    style={{
                      width: '100%', background: '#16a34a', color: '#fff',
                      border: 'none', borderRadius: 12, padding: '13px',
                      fontSize: 15, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      opacity: loading && settling === debt.to ? 0.7 : 1,
                    }}
                  >
                    <Send size={16} />
                    {loading && settling === debt.to
                      ? 'Sending...'
                      : `Pay $${debt.amount.toFixed(2)} USDm`}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
