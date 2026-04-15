export interface Member {
  id: string
  name: string
  address: string
  phone?: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string
  splitBetween: string[]
  createdAt: number
  settled: boolean
}

export interface Group {
  id: string
  name: string
  members: Member[]
  expenses: Expense[]
  createdAt: number
}

export type Page = 'home' | 'group' | 'add-expense' | 'settle'
