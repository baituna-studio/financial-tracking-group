'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import {
  formatCurrency,
  getMonthRange,
  getCustomMonthLabel,
  getCurrentMonthValue,
  exportToExcel,
} from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { TransactionListModal } from '@/components/modals/transaction-list-modal';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Default to current month, will be updated when profile loads
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
  });
  const [dashboardData, setDashboardData] = useState({
    totalBudget: 0,
    totalExpenses: 0,
    totalIncome: 0,
    remainingBudget: 0,
    expensesByCategory: [] as any[],
    incomeByCategory: [] as any[],
    recentExpenses: [] as any[],
    recentIncome: [] as any[],
  });
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>(
    'expense'
  );

  // Search and pagination state for expenses by category
  const [expenseCategorySearch, setExpenseCategorySearch] = useState('');
  const [expenseCategoryPage, setExpenseCategoryPage] = useState(1);
  const [expenseCategoryPageSize, setExpenseCategoryPageSize] = useState(5);

  // Search and pagination state for recent expenses
  const [recentExpenseSearch, setRecentExpenseSearch] = useState('');
  const [recentExpensePage, setRecentExpensePage] = useState(1);
  const [recentExpensePageSize, setRecentExpensePageSize] = useState(5);

  // Generate months with custom labels
  const months = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const monthsArray = [];
    const monthStartDay = profile?.month_start_day || 1;

    // Generate untuk 3 tahun: tahun lalu, tahun ini, tahun depan
    const startYear = currentYear - 1;
    const endYear = currentYear + 1;

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthValue = `${year}-${String(month).padStart(2, '0')}`;
        const monthLabel = getCustomMonthLabel(year, month, monthStartDay);
        monthsArray.push({
          value: monthValue,
          label: monthLabel,
          year: year,
          month: month,
        });
      }
    }

    // Sort dari yang terbaru ke terlama
    monthsArray.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });

    return monthsArray;
  }, [profile?.month_start_day]);

  // Filtered and paginated expenses by category
  const filteredExpensesByCategory = useMemo(() => {
    let filtered = [...dashboardData.expensesByCategory];

    if (expenseCategorySearch.trim()) {
      const searchLower = expenseCategorySearch.toLowerCase();
      filtered = filtered.filter((item) =>
        item.category?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [dashboardData.expensesByCategory, expenseCategorySearch]);

  const totalExpenseCategories = filteredExpensesByCategory.length;
  const totalExpenseCategoryPages = Math.ceil(
    totalExpenseCategories / expenseCategoryPageSize
  );
  const expenseCategoryStartIndex =
    (expenseCategoryPage - 1) * expenseCategoryPageSize;
  const expenseCategoryEndIndex =
    expenseCategoryStartIndex + expenseCategoryPageSize;
  const currentExpenseCategories = filteredExpensesByCategory.slice(
    expenseCategoryStartIndex,
    expenseCategoryEndIndex
  );

  // Filtered and paginated recent expenses
  const filteredRecentExpenses = useMemo(() => {
    let filtered = [...dashboardData.recentExpenses];

    if (recentExpenseSearch.trim()) {
      const searchLower = recentExpenseSearch.toLowerCase();
      filtered = filtered.filter(
        (expense) =>
          expense.title?.toLowerCase().includes(searchLower) ||
          expense.categories?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by created_at date descending (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    return filtered;
  }, [dashboardData.recentExpenses, recentExpenseSearch]);

  const totalRecentExpenses = filteredRecentExpenses.length;
  const totalRecentExpensePages = Math.ceil(
    totalRecentExpenses / recentExpensePageSize
  );
  const recentExpenseStartIndex =
    (recentExpensePage - 1) * recentExpensePageSize;
  const recentExpenseEndIndex = recentExpenseStartIndex + recentExpensePageSize;
  const currentRecentExpenses = filteredRecentExpenses.slice(
    recentExpenseStartIndex,
    recentExpenseEndIndex
  );

  // Reset pagination when data changes
  useEffect(() => {
    setExpenseCategoryPage(1);
  }, [dashboardData.expensesByCategory.length]);

  useEffect(() => {
    setExpenseCategoryPage(1);
  }, [expenseCategorySearch]);

  useEffect(() => {
    setRecentExpensePage(1);
  }, [dashboardData.recentExpenses.length]);

  useEffect(() => {
    setRecentExpensePage(1);
  }, [recentExpenseSearch]);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      // Update selected month based on user's month start day setting
      const currentMonthValue = getCurrentMonthValue(
        profile.month_start_day || 1
      );
      setSelectedMonth(currentMonthValue);
      loadDashboardData();
    }
  }, [profile]);

  useEffect(() => {
    if (profile && selectedMonth) {
      loadDashboardData();
    }
  }, [selectedMonth]);

  const loadUserProfile = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const userProfile = await getUserProfile(user.id);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user || !profile) return;

      const [year, month] = selectedMonth.split('-').map(Number);
      const { start, end } = getMonthRange(
        year,
        month,
        profile.month_start_day || 1
      );

      // User's groups
      const { data: userGroups, error: ugErr } = await supabase
        .from('user_groups')
        .select('group_id')
        .eq('user_id', user.id);
      if (ugErr) throw ugErr;

      const groupIds = userGroups?.map((ug) => ug.group_id) || [];

      // Budgets: treat as single-date entries (start_date inside month)
      const { data: budgets, error: bErr } = await supabase
        .from('budgets')
        .select('amount, start_date, categories(name, color)')
        .in('group_id', groupIds)
        .gte('start_date', start)
        .lte('start_date', end);
      if (bErr) throw bErr;

      const totalBudget =
        budgets?.reduce((sum, b: any) => sum + (b.amount || 0), 0) || 0;

      // Expenses for the month
      const { data: expenses, error: eErr } = await supabase
        .from('expenses')
        .select(
          'amount, title, expense_date, created_at, categories(name, color)'
        )
        .in('group_id', groupIds)
        .gte('expense_date', start)
        .lte('expense_date', end)
        .order('created_at', { ascending: false });
      if (eErr) throw eErr;

      const totalExpenses =
        expenses?.reduce((sum, e: any) => sum + (e.amount || 0), 0) || 0;

      // Budgets for the month
      const { data: income, error: iErr } = await supabase
        .from('budgets')
        .select(
          'amount, title, start_date, created_at, categories(name, color)'
        )
        .in('group_id', groupIds)
        .gte('start_date', start)
        .lte('start_date', end)
        .order('created_at', { ascending: false });
      if (iErr) throw iErr;

      const totalIncome =
        income?.reduce((sum, i: any) => sum + (i.amount || 0), 0) || 0;

      // Group expenses by category
      const expensesByCategory =
        expenses?.reduce((acc: any[], expense: any) => {
          const categoryName = expense.categories?.name || 'Lainnya';
          const categoryColor = expense.categories?.color || '#6B7280';
          const existing = acc.find((i) => i.category === categoryName);
          if (existing) existing.amount += expense.amount;
          else
            acc.push({
              category: categoryName,
              amount: expense.amount,
              color: categoryColor,
            });
          return acc;
        }, []) || [];

      // Sort expenses by category by amount descending (terbesar ke terkecil)
      expensesByCategory.sort((a, b) => b.amount - a.amount);

      // Group income by category
      const incomeByCategory =
        income?.reduce((acc: any[], inc: any) => {
          const categoryName = inc.categories?.name || 'Lainnya';
          const categoryColor = inc.categories?.color || '#6B7280';
          const existing = acc.find((i) => i.category === categoryName);
          if (existing) existing.amount += inc.amount;
          else
            acc.push({
              category: categoryName,
              amount: inc.amount,
              color: categoryColor,
            });
          return acc;
        }, []) || [];

      // Sort income by category by amount descending (terbesar ke terkecil)
      incomeByCategory.sort((a, b) => b.amount - a.amount);

      setDashboardData({
        totalBudget,
        totalExpenses,
        totalIncome,
        remainingBudget: totalBudget - totalExpenses,
        expensesByCategory,
        incomeByCategory,
        recentExpenses: expenses || [], // Show all expenses instead of limiting to 5
        recentIncome: income || [], // Show all income instead of limiting to 5
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    const exportData = dashboardData.recentExpenses.map((expense: any) => ({
      Judul: expense.title,
      Kategori: expense.categories?.name || 'Lainnya',
      Jumlah: expense.amount,
      Tanggal: expense.expense_date,
    }));
    exportToExcel(exportData, `Laporan-Keuangan-${selectedMonth}`);
  };

  const handleViewTransactions = (
    category: any,
    type: 'expense' | 'income'
  ) => {
    setSelectedCategory(category);
    setTransactionType(type);
    setTransactionModalOpen(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Ringkasan keuangan Anda</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-56">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExportData} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pemasukan
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardData.totalBudget)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pengeluaran
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(dashboardData.totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sisa Pemasukan
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  dashboardData.remainingBudget >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatCurrency(dashboardData.remainingBudget)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Persentase Terpakai
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.totalBudget > 0
                  ? `${Math.round(
                      (dashboardData.totalExpenses /
                        dashboardData.totalBudget) *
                        100
                    )}%`
                  : '0%'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown and recent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengeluaran per Kategori</CardTitle>
              <CardDescription>
                Breakdown pengeluaran berdasarkan kategori
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari kategori..."
                      value={expenseCategorySearch}
                      onChange={(e) => setExpenseCategorySearch(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Per halaman:</span>
                    <Select
                      value={expenseCategoryPageSize.toString()}
                      onValueChange={(value) => {
                        setExpenseCategoryPageSize(Number(value));
                        setExpenseCategoryPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {currentExpenseCategories.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <button
                        onClick={() => handleViewTransactions(item, 'expense')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {item.category}
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {formatCurrency(item.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dashboardData.totalExpenses > 0
                          ? `${Math.round(
                              (item.amount / dashboardData.totalExpenses) * 100
                            )}%`
                          : '0%'}
                      </div>
                    </div>
                  </div>
                ))}
                {currentExpenseCategories.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada pengeluaran bulan ini
                  </p>
                )}
              </div>
              {totalExpenseCategoryPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      Menampilkan {expenseCategoryStartIndex + 1}-
                      {Math.min(
                        expenseCategoryEndIndex,
                        totalExpenseCategories
                      )}{' '}
                      dari {totalExpenseCategories} kategori
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExpenseCategoryPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={expenseCategoryPage === 1}
                      className="w-8 h-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalExpenseCategoryPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalExpenseCategoryPages <= 5) {
                            pageNum = i + 1;
                          } else if (expenseCategoryPage <= 3) {
                            pageNum = i + 1;
                          } else if (
                            expenseCategoryPage >=
                            totalExpenseCategoryPages - 2
                          ) {
                            pageNum = totalExpenseCategoryPages - 4 + i;
                          } else {
                            pageNum = expenseCategoryPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                expenseCategoryPage === pageNum
                                  ? 'default'
                                  : 'outline'
                              }
                              size="sm"
                              onClick={() => setExpenseCategoryPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExpenseCategoryPage((prev) =>
                          Math.min(totalExpenseCategoryPages, prev + 1)
                        )
                      }
                      disabled={
                        expenseCategoryPage === totalExpenseCategoryPages
                      }
                      className="w-8 h-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pemasukan per Kategori</CardTitle>
              <CardDescription>
                Breakdown pemasukan berdasarkan kategori
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.incomeByCategory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <button
                        onClick={() => handleViewTransactions(item, 'income')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {item.category}
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">
                        {formatCurrency(item.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dashboardData.totalIncome > 0
                          ? `${Math.round(
                              (item.amount / dashboardData.totalIncome) * 100
                            )}%`
                          : '0%'}
                      </div>
                    </div>
                  </div>
                ))}
                {dashboardData.incomeByCategory.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada pemasukan bulan ini
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pie Chart Pengeluaran</CardTitle>
              <CardDescription>
                Visualisasi pengeluaran per kategori
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.expensesByCategory.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percent }) =>
                          `${category} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {dashboardData.expensesByCategory.map(
                          (entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [
                          formatCurrency(value),
                          'Jumlah',
                        ]}
                        labelFormatter={(label) => `Kategori: ${label}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">Belum ada data pengeluaran</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pie Chart Pemasukan</CardTitle>
              <CardDescription>
                Visualisasi pemasukan per kategori
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.incomeByCategory.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.incomeByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percent }) =>
                          `${category} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {dashboardData.incomeByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [
                          formatCurrency(value),
                          'Jumlah',
                        ]}
                        labelFormatter={(label) => `Kategori: ${label}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">Belum ada data pemasukan</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengeluaran Terbaru</CardTitle>
              <CardDescription>
                Semua pengeluaran untuk periode yang dipilih (urut berdasarkan
                tanggal dibuat)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari pengeluaran..."
                      value={recentExpenseSearch}
                      onChange={(e) => setRecentExpenseSearch(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Per halaman:</span>
                    <Select
                      value={recentExpensePageSize.toString()}
                      onValueChange={(value) => {
                        setRecentExpensePageSize(Number(value));
                        setRecentExpensePage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {currentRecentExpenses.map((expense: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{expense.title}</p>
                      <p className="text-xs text-gray-500">
                        {expense.categories?.name || 'Lainnya'} •{' '}
                        {expense.expense_date}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
                {currentRecentExpenses.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada pengeluaran bulan ini
                  </p>
                )}
              </div>
              {totalRecentExpensePages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      Menampilkan {recentExpenseStartIndex + 1}-
                      {Math.min(recentExpenseEndIndex, totalRecentExpenses)}{' '}
                      dari {totalRecentExpenses} pengeluaran
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRecentExpensePage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={recentExpensePage === 1}
                      className="w-8 h-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalRecentExpensePages) },
                        (_, i) => {
                          let pageNum;
                          if (totalRecentExpensePages <= 5) {
                            pageNum = i + 1;
                          } else if (recentExpensePage <= 3) {
                            pageNum = i + 1;
                          } else if (
                            recentExpensePage >=
                            totalRecentExpensePages - 2
                          ) {
                            pageNum = totalRecentExpensePages - 4 + i;
                          } else {
                            pageNum = recentExpensePage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                recentExpensePage === pageNum
                                  ? 'default'
                                  : 'outline'
                              }
                              size="sm"
                              onClick={() => setRecentExpensePage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRecentExpensePage((prev) =>
                          Math.min(totalRecentExpensePages, prev + 1)
                        )
                      }
                      disabled={recentExpensePage === totalRecentExpensePages}
                      className="w-8 h-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pemasukan Terbaru</CardTitle>
              <CardDescription>
                Semua pemasukan untuk periode yang dipilih (urut berdasarkan
                tanggal dibuat)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentIncome.map((inc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{inc.title}</p>
                      <p className="text-xs text-gray-500">
                        {inc.categories?.name || 'Lainnya'} • {inc.income_date}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(inc.amount)}
                    </span>
                  </div>
                ))}
                {dashboardData.recentIncome.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada pemasukan bulan ini
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <TransactionListModal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        category={selectedCategory}
        type={transactionType}
        selectedMonth={selectedMonth}
        monthStartDay={profile?.month_start_day || 1}
      />
    </MainLayout>
  );
}
