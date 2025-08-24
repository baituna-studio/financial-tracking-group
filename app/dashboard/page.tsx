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
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import {
  formatCurrency,
  getMonthRange,
  getCustomMonthLabel,
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

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
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

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      loadDashboardData();
    }
  }, [selectedMonth, profile]);

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
        .select('amount, title, expense_date, categories(name, color)')
        .in('group_id', groupIds)
        .gte('expense_date', start)
        .lte('expense_date', end)
        .order('expense_date', { ascending: false });
      if (eErr) throw eErr;

      const totalExpenses =
        expenses?.reduce((sum, e: any) => sum + (e.amount || 0), 0) || 0;

      // Budgets for the month
      const { data: income, error: iErr } = await supabase
        .from('budgets')
        .select('amount, title, start_date, categories(name, color)')
        .in('group_id', groupIds)
        .gte('start_date', start)
        .lte('start_date', end)
        .order('start_date', { ascending: false });
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

      incomeByCategory.sort((a, b) => b.amount - a.amount);

      setDashboardData({
        totalBudget,
        totalExpenses,
        totalIncome,
        remainingBudget: totalBudget - totalExpenses,
        expensesByCategory,
        incomeByCategory,
        recentExpenses: expenses?.slice(0, 5) || [],
        recentIncome: income?.slice(0, 5) || [],
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
                Total Budget
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
              <CardTitle className="text-sm font-medium">Sisa Budget</CardTitle>
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
              <div className="space-y-4">
                {dashboardData.expensesByCategory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">
                        {item.category}
                      </span>
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
                {dashboardData.expensesByCategory.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada pengeluaran bulan ini
                  </p>
                )}
              </div>
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
                      <span className="text-sm font-medium">
                        {item.category}
                      </span>
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
                5 pengeluaran terakhir bulan ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentExpenses.map((expense: any, i: number) => (
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
                {dashboardData.recentExpenses.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada pengeluaran bulan ini
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pemasukan Terbaru</CardTitle>
              <CardDescription>5 pemasukan terakhir bulan ini</CardDescription>
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
    </MainLayout>
  );
}
