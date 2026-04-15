import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Group, Expense } from '../types'

interface Props {
  group: Group
  address: string
  onBack: () => void
  onUpdateGroup: (g: Group) => void
}

export default function AddExpensePage({ group, address, onBack, onUpdateGroup }: Props) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(address)
  const [splitBetween, setSplitBetween] = useState<string[]>(group.members.map(m => m.id))

  const toggleMember = (id: string) => {
    setSplitBetween(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleAdd = () => {
    if (!description.trim() || !amount || splitBetween.length === 0) return
    const expense: Expense = {
      id: Date.now().toString(),
      description: description.trim(),
      amount: parseFloat(amount),
      paidBy,
      splitBetween,
      createdAt: Date.now(),
      settled: false,
    }
    onUpdateGroup({ ...group, expenses: [...group.expenses, expense] })
  }

  const perPerson = splitBetween.length > 0
    ? (parseFloat(amount) / splitBetween.length).toFixed(2)
    : '0.00'

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        padding: '20px 16px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none',
          borderRadius: 8, padding: 6, cursor: 'pointer',
        }}>
          <ArrowLeft size={18} color="#fff" />
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Add Expense</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>{group.name}</div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
            DESCRIPTION
          </div>
          <input
            placeholder="e.g. Dinner, Taxi, Hotel..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px',
              border: '1.5px solid #e2e8f0', borderRadius: 12,
              fontSize: 15, outline: 'none', background: '#fff',
            }}
          />
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
            AMOUNT (USDm)
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 18, fontWeight: 700, color: '#16a34a',
            }}>$</span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px 12px 32px',
                border: '1.5px solid #e2e8f0', borderRadius: 12,
                fontSize: 22, fontWeight: 700, outline: 'none',
                background: '#fff', color: '#1a1a1a',
              }}
            />
          </div>
        </div>

        {/* Paid by */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
            PAID BY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.members.map(m => (
              <div
                key={m.id}
                onClick={() => setPaidBy(m.id)}
                style={{
                  padding: '10px 14px',
                  border: `1.5px solid ${paidBy === m.id ? '#16a34a' : '#e2e8f0'}`,
                  borderRadius: 10,
                  background: paidBy === m.id ? '#f0fdf4' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  {m.name} {m.address === address ? '(you)' : ''}
                </span>
                {paidBy === m.id && (
                  <span style={{ color: '#16a34a', fontSize: 18 }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Split between */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
            SPLIT BETWEEN
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.members.map(m => (
              <div
                key={m.id}
                onClick={() => toggleMember(m.id)}
                style={{
                  padding: '10px 14px',
                  border: `1.5px solid ${splitBetween.includes(m.id) ? '#16a34a' : '#e2e8f0'}`,
                  borderRadius: 10,
                  background: splitBetween.includes(m.id) ? '#f0fdf4' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  {m.name} {m.address === address ? '(you)' : ''}
                </span>
                {splitBetween.includes(m.id) && (
                  <span style={{ color: '#16a34a', fontSize: 18 }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {amount && splitBetween.length > 0 && (
          <div style={{
            background: '#f0fdf4', border: '1.5px solid #bbf7d0',
            borderRadius: 12, padding: '12px 16px', marginBottom: 20,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: '#166534' }}>Each person pays</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>
              ${perPerson} USDm
            </div>
            <div style={{ fontSize: 12, color: '#4ade80' }}>
              {splitBetween.length} people · ${amount} total
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleAdd}
          disabled={!description.trim() || !amount || splitBetween.length === 0}
          style={{
            width: '100%', background: '#16a34a', color: '#fff',
            border: 'none', borderRadius: 14, padding: '16px',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            opacity: (!description.trim() || !amount || splitBetween.length === 0) ? 0.5 : 1,
          }}
        >
          Add Expense
        </button>
      </div>
    </div>
  )
}
