import { useState, useEffect } from 'react'
import { useConnect, useAccount } from 'wagmi'
import { injected } from 'wagmi/connectors'
import HomePage from './components/HomePage'
import GroupPage from './components/GroupPage'
import AddExpensePage from './components/AddExpensePage'
import SettlePage from './components/SettlePage'
import type { Group, Page } from './types'

export default function App() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const [isMiniPay, setIsMiniPay] = useState(false)
  const [page, setPage] = useState<Page>('home')
  const [groups, setGroups] = useState<Group[]>([])
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)

  useEffect(() => {
    const w = window as any
    if (w.ethereum && w.ethereum.isMiniPay) {
      setIsMiniPay(true)
      connect({ connector: injected({ target: 'metaMask' }) })
    }
  }, [])

  const activeGroup = groups.find(g => g.id === activeGroupId) || null

  const createGroup = (name: string) => {
    const group: Group = {
      id: Date.now().toString(),
      name,
      members: address ? [{
        id: address,
        name: 'You',
        address,
      }] : [],
      expenses: [],
      createdAt: Date.now(),
    }
    setGroups(prev => [...prev, group])
    setActiveGroupId(group.id)
    setPage('group')
  }

  const updateGroup = (updated: Group) => {
    setGroups(prev => prev.map(g => g.id === updated.id ? updated : g))
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fff' }}>
      {!isMiniPay && !isConnected && (
        <div style={{
          background: '#fef3c7',
          padding: '10px 16px',
          fontSize: 13,
          textAlign: 'center',
          color: '#92400e'
        }}>
          ⚠️ Open in MiniPay for best experience
        </div>
      )}

      {page === 'home' && (
        <HomePage
          groups={groups}
          address={address}
          isMiniPay={isMiniPay}
          onCreateGroup={createGroup}
          onOpenGroup={(id) => { setActiveGroupId(id); setPage('group') }}
        />
      )}
      {page === 'group' && activeGroup && (
        <GroupPage
          group={activeGroup}
          address={address || ''}
          onBack={() => setPage('home')}
          onAddExpense={() => setPage('add-expense')}
          onSettle={(_expenseId) => { setPage('settle') }}
          onUpdateGroup={updateGroup}
        />
      )}
      {page === 'add-expense' && activeGroup && (
        <AddExpensePage
          group={activeGroup}
          address={address || ''}
          onBack={() => setPage('group')}
          onUpdateGroup={(updated) => { updateGroup(updated); setPage('group') }}
        />
      )}
      {page === 'settle' && activeGroup && (
        <SettlePage
          group={activeGroup}
          address={address || ''}
          isMiniPay={isMiniPay}
          onBack={() => setPage('group')}
          onUpdateGroup={(updated) => { updateGroup(updated); setPage('group') }}
        />
      )}
    </div>
  )
}
