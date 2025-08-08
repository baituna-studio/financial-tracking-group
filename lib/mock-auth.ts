// Mock authentication for development/demo purposes
export const MOCK_USER = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'ricky@gmail.com',
  user_metadata: {
    full_name: 'Ricky'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const MOCK_PROFILE = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'ricky@gmail.com',
  full_name: 'Ricky',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const MOCK_GROUP = {
  id: '22222222-2222-2222-2222-222222222222',
  name: 'Grup Ricky',
  description: 'Grup keuangan pribadi Ricky',
  created_by: '11111111-1111-1111-1111-111111111111',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Makanan & Minuman', icon: 'utensils', color: '#EF4444', group_id: MOCK_GROUP.id, created_by: MOCK_USER.id },
  { id: 'cat-2', name: 'Listrik & Utilities', icon: 'zap', color: '#F59E0B', group_id: MOCK_GROUP.id, created_by: MOCK_USER.id },
  { id: 'cat-3', name: 'Pendidikan', icon: 'graduation-cap', color: '#3B82F6', group_id: MOCK_GROUP.id, created_by: MOCK_USER.id },
  { id: 'cat-4', name: 'Transportasi', icon: 'car', color: '#10B981', group_id: MOCK_GROUP.id, created_by: MOCK_USER.id },
  { id: 'cat-5', name: 'Kesehatan', icon: 'heart', color: '#EC4899', group_id: MOCK_GROUP.id, created_by: MOCK_USER.id },
  { id: 'cat-6', name: 'Hiburan', icon: 'gamepad-2', color: '#8B5CF6', group_id: MOCK_GROUP.id, created_by: MOCK_USER.id },
  { id: 'cat-7', name: 'Belanja', icon: 'shopping-bag', color: '#F97316', group_id: MOCK_GROUP.id, created_by: MOCK_USER.id },
  { id: 'cat-8', name: 'Lainnya', icon: 'more-horizontal', color: '#6B7280', group_id: MOCK_GROUP.id, created_by: MOCK_USER.id }
]

export const MOCK_BUDGETS = [
  {
    id: 'budget-1',
    title: 'Budget Makanan Januari 2024',
    amount: 2000000,
    category_id: 'cat-1',
    group_id: MOCK_GROUP.id,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    created_by: MOCK_USER.id,
    categories: MOCK_CATEGORIES[0],
    groups: MOCK_GROUP
  },
  {
    id: 'budget-2',
    title: 'Budget Listrik Januari 2024',
    amount: 500000,
    category_id: 'cat-2',
    group_id: MOCK_GROUP.id,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    created_by: MOCK_USER.id,
    categories: MOCK_CATEGORIES[1],
    groups: MOCK_GROUP
  },
  {
    id: 'budget-3',
    title: 'Budget Transportasi Januari 2024',
    amount: 1000000,
    category_id: 'cat-4',
    group_id: MOCK_GROUP.id,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    created_by: MOCK_USER.id,
    categories: MOCK_CATEGORIES[3],
    groups: MOCK_GROUP
  }
]

export const MOCK_EXPENSES = [
  {
    id: 'expense-1',
    title: 'Makan siang di restoran',
    description: 'Makan siang bersama teman',
    amount: 75000,
    category_id: 'cat-1',
    group_id: MOCK_GROUP.id,
    expense_date: '2024-01-15',
    created_by: MOCK_USER.id,
    categories: MOCK_CATEGORIES[0],
    groups: MOCK_GROUP,
    profiles: MOCK_PROFILE
  },
  {
    id: 'expense-2',
    title: 'Tagihan listrik',
    description: 'Tagihan listrik bulan Januari',
    amount: 350000,
    category_id: 'cat-2',
    group_id: MOCK_GROUP.id,
    expense_date: '2024-01-10',
    created_by: MOCK_USER.id,
    categories: MOCK_CATEGORIES[1],
    groups: MOCK_GROUP,
    profiles: MOCK_PROFILE
  },
  {
    id: 'expense-3',
    title: 'Bensin motor',
    description: 'Isi bensin untuk perjalanan',
    amount: 50000,
    category_id: 'cat-4',
    group_id: MOCK_GROUP.id,
    expense_date: '2024-01-12',
    created_by: MOCK_USER.id,
    categories: MOCK_CATEGORIES[3],
    groups: MOCK_GROUP,
    profiles: MOCK_PROFILE
  },
  {
    id: 'expense-4',
    title: 'Beli buku',
    description: 'Buku pelajaran untuk kursus',
    amount: 200000,
    category_id: 'cat-3',
    group_id: MOCK_GROUP.id,
    expense_date: '2024-01-08',
    created_by: MOCK_USER.id,
    categories: MOCK_CATEGORIES[2],
    groups: MOCK_GROUP,
    profiles: MOCK_PROFILE
  },
  {
    id: 'expense-5',
    title: 'Nonton bioskop',
    description: 'Tiket film weekend',
    amount: 45000,
    category_id: 'cat-6',
    group_id: MOCK_GROUP.id,
    expense_date: '2024-01-14',
    created_by: MOCK_USER.id,
    categories: MOCK_CATEGORIES[5],
    groups: MOCK_GROUP,
    profiles: MOCK_PROFILE
  }
]

// Mock storage for new data
let mockBudgets = [...MOCK_BUDGETS]
let mockExpenses = [...MOCK_EXPENSES]

export function addMockBudget(budget: any) {
  const newBudget = {
    ...budget,
    id: `budget-${Date.now()}`,
    created_by: MOCK_USER.id,
    categories: MOCK_CATEGORIES.find(c => c.id === budget.category_id),
    groups: MOCK_GROUP
  }
  mockBudgets.push(newBudget)
  return newBudget
}

export function addMockExpense(expense: any) {
  const newExpense = {
    ...expense,
    id: `expense-${Date.now()}`,
    created_by: MOCK_USER.id,
    categories: MOCK_CATEGORIES.find(c => c.id === expense.category_id),
    groups: MOCK_GROUP,
    profiles: MOCK_PROFILE
  }
  mockExpenses.push(newExpense)
  return newExpense
}

export function getMockBudgets() {
  return mockBudgets
}

export function getMockExpenses() {
  return mockExpenses
}
