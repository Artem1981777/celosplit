import { useState } from 'react'
import { Users, Plus, Wallet, ChevronRight } from 'lucide-react'
import type { Group } from '../types'

interface Props {
  groups: Group[]
  address?: string
  isMiniPay: boolean
  onCreateGroup: (name: string) => void
  onOpenGroup: (id: string) => void
}

export default function HomePage({ groups, address, isMiniPay, onCreateGroup, onOpenGroup }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [groupName, setGroupName] = useState('')

  const handleCreate = () => {
    if (!groupName.trim()) return
    onCreateGroup(groupName.trim())
    setGroupName('')
    setShowCreate(false)
  }

  const shortAddr = address ? address.slice(0, 6) + '...' + address.slice(-4) : ''

  return (
    <div style={{ padding: 0 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        padding: '32px 20px 24px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 12,
            padding: 8,
          }}>
            <Users size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>CeloSplit</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Split expenses on Celo</div>
          </div>
        </div>
        {address && (
          <div style={{
            marginTop: 16,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Wallet size={16} color="#fff" />
            <span style={{ fontSize: 13, fontFamily: 'monospace' }}>{shortAddr}</span>
            {isMiniPay && (
              <span style={{
                marginLeft: 'auto',
                background: '#bbf7d0',
                color: '#166534',
                borderRadius: 20,
                padding: '2px 10px',
                fontSize: 11,
                fontWeight: 600,
              }}>MiniPay ✓</span>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>Your Groups</div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> New Group
          </button>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#166534' }}>
              Create New Group
            </div>
            <input
              placeholder="e.g. Trip to Lagos, Office lunch..."
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #bbf7d0',
                borderRadius: 10,
                fontSize: 14,
                outline: 'none',
                marginBottom: 10,
                background: '#fff',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCreate}
                style={{
                  flex: 1,
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >Create</button>
              <button
                onClick={() => setShowCreate(false)}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >Cancel</button>
            </div>
          </div>
        )}

        {/* Groups list */}
        {groups.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            color: '#94a3b8',
          }}>
            <Users size={48} color="#d1fae5" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No groups yet</div>
            <div style={{ fontSize: 13 }}>Create a group to start splitting expenses</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {groups.map(group => {
              const total = group.expenses.reduce((s, e) => s + e.amount, 0)
              const unsettled = group.expenses.filter(e => !e.settled).length
              return (
                <div
                  key={group.id}
                  onClick={() => onOpenGroup(group.id)}
                  style={{
                    background: '#fff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    background: '#dcfce7',
                    borderRadius: 10,
                    padding: 10,
                    marginRight: 12,
                  }}>
                    <Users size={18} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{group.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {group.members.length} members · ${total.toFixed(2)} total
                    </div>
                  </div>
                  {unsettled > 0 && (
                    <span style={{
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: 20,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                      marginRight: 8,
                    }}>{unsettled} pending</span>
                  )}
                  <ChevronRight size={18} color="#94a3b8" />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '20px 16px',
        borderTop: '1px solid #e2e8f0',
        marginTop: 20,
      }}>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
          CeloSplit · Built on Celo
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <a href="/terms.html" style={{ fontSize: 11, color: '#64748b', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/privacy.html" style={{ fontSize: 11, color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="https://t.me/Artem00777" style={{ fontSize: 11, color: '#16a34a', textDecoration: 'none' }}>Support</a>
        </div>
      </div>
    </div>
  )
}
