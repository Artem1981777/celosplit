import { useState } from 'react'
import { ArrowLeft, Plus, UserPlus, Receipt, CheckCircle, Clock } from 'lucide-react'
import type { Group, Member } from '../types'

interface Props {
  group: Group
  address: string
  onBack: () => void
  onAddExpense: () => void
  onSettle: (expenseId: string) => void
  onUpdateGroup: (g: Group) => void
}

export default function GroupPage({ group, address, onBack, onAddExpense, onSettle, onUpdateGroup }: Props) {
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [memberAddr, setMemberAddr] = useState('')

  const addMember = () => {
    if (!memberName.trim() || !memberAddr.trim()) return
    const member: Member = {
      id: memberAddr,
      name: memberName.trim(),
      address: memberAddr.trim(),
    }
    onUpdateGroup({ ...group, members: [...group.members, member] })
    setMemberName('')
    setMemberAddr('')
    setShowAddMember(false)
  }

  const getOwed = () => {
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
    return balances
  }

  const balances = getOwed()
  const myBalance = balances[address] || 0
  const totalSpent = group.expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        padding: '20px 16px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#fff" />
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{group.name}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{group.members.length} members</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>Total Spent</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>${totalSpent.toFixed(2)}</div>
          </div>
          <div style={{
            background: myBalance >= 0 ? 'rgba(255,255,255,0.15)' : 'rgba(239,68,68,0.3)',
            borderRadius: 12,
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>
              {myBalance >= 0 ? 'You are owed' : 'You owe'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              ${Math.abs(myBalance).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <button onClick={onAddExpense} style={{
            background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12,
            padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={16} /> Add Expense
          </button>
          <button onClick={() => setShowAddMember(true)} style={{
            background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0',
            borderRadius: 12, padding: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            <UserPlus size={16} /> Add Member
          </button>
        </div>

        {/* Add Member form */}
        {showAddMember && (
          <div style={{
            background: '#f0fdf4', border: '1.5px solid #bbf7d0',
            borderRadius: 14, padding: 16, marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#166534' }}>Add Member</div>
            <input
              placeholder="Name"
              value={memberName}
              onChange={e => setMemberName(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1.5px solid #bbf7d0',
                borderRadius: 10, fontSize: 14, outline: 'none', marginBottom: 8, background: '#fff',
              }}
            />
            <input
              placeholder="Wallet address (0x...)"
              value={memberAddr}
              onChange={e => setMemberAddr(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1.5px solid #bbf7d0',
                borderRadius: 10, fontSize: 14, outline: 'none', marginBottom: 10,
                background: '#fff', fontFamily: 'monospace',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={addMember} style={{
                flex: 1, background: '#16a34a', color: '#fff', border: 'none',
                borderRadius: 10, padding: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>Add</button>
              <button onClick={() => setShowAddMember(false)} style={{
                flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none',
                borderRadius: 10, padding: 10, fontSize: 14, cursor: 'pointer',
              }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Members */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Members</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.members.map(m => {
              const bal = balances[m.id] || 0
              return (
                <div key={m.id} style={{
                  background: '#fff', border: '1.5px solid #e2e8f0',
                  borderRadius: 12, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {m.name} {m.address === address ? '(you)' : ''}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                      {m.address.slice(0, 8)}...
                    </div>
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 700,
                    color: bal > 0 ? '#16a34a' : bal < 0 ? '#ef4444' : '#94a3b8',
                  }}>
                    {bal > 0 ? '+' : ''}{bal.toFixed(2)} USDm
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Expenses */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Expenses</div>
          {group.expenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: '#94a3b8' }}>
              <Receipt size={36} color="#d1fae5" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 14 }}>No expenses yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.expenses.map(exp => {
                const payer = group.members.find(m => m.id === exp.paidBy)
                return (
                  <div key={exp.id} style={{
                    background: '#fff', border: '1.5px solid #e2e8f0',
                    borderRadius: 12, padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{exp.description}</div>
                      <div style={{ fontWeight: 700, color: '#16a34a' }}>${exp.amount.toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Paid by {payer?.name || 'Unknown'} · {exp.splitBetween.length} people
                      </div>
                      {exp.settled ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#16a34a' }}>
                          <CheckCircle size={14} /> Settled
                        </span>
                      ) : (
                        <button onClick={() => onSettle(exp.id)} style={{
                          background: '#fef3c7', color: '#92400e', border: 'none',
                          borderRadius: 8, padding: '4px 10px', fontSize: 12,
                          fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <Clock size={12} /> Settle
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
