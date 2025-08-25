'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Download,
  Calendar,
  Trash2,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MainLayout } from '@/components/layout/main-layout';
import { BudgetModal } from '@/components/modals/budget-modal';
import { ExpenseModal } from '@/components/modals/expense-modal';
import { BudgetViewModal } from '@/components/modals/budget-view-modal';
import { BudgetEditModal } from '@/components/modals/budget-edit-modal';
import { ExpenseViewModal } from '@/components/modals/expense-view-modal';
import { ExpenseEditModal } from '@/components/modals/expense-edit-modal';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import {
  formatCurrency,
  formatDate,
  getMonthRange,
  getCustomMonthLabel,
  getCurrentMonthValue,
  exportToExcel,
} from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function FinancePage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Default to current month, will be updated when profile loads
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [viewBudget, setViewBudget] = useState<any | null>(null);
  const [editBudget, setEditBudget] = useState<any | null>(null);
  const [viewExpense, setViewExpense] = useState<any | null>(null);
  const [editExpense, setEditExpense] = useState<any | null>(null);

  const [pendingDeleteBudget, setPendingDeleteBudget] = useState<any | null>(
    null
  );
  const [pendingDeleteExpense, setPendingDeleteExpense] = useState<any | null>(
    null
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Pagination logic
  const totalExpenses = expenses.length;
  const totalPages = Math.ceil(totalExpenses / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentExpenses = expenses.slice(startIndex, endIndex);

  // Search and sort logic
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (expense) =>
          expense.title?.toLowerCase().includes(searchLower) ||
          expense.description?.toLowerCase().includes(searchLower) ||
          expense.categories?.name?.toLowerCase().includes(searchLower) ||
          expense.groups?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by created_at date descending (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    return filtered;
  }, [expenses, searchTerm]);

  // Update pagination for filtered data
  const totalFilteredExpenses = filteredExpenses.length;
  const totalFilteredPages = Math.ceil(totalFilteredExpenses / pageSize);
  const filteredStartIndex = (currentPage - 1) * pageSize;
  const filteredEndIndex = filteredStartIndex + pageSize;
  const currentFilteredExpenses = filteredExpenses.slice(
    filteredStartIndex,
    filteredEndIndex
  );

  // Reset to first page when expenses change
  useEffect(() => {
    setCurrentPage(1);
  }, [expenses.length]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
      loadFinanceData();
    }
  }, [profile]);

  useEffect(() => {
    if (profile && selectedMonth) {
      loadFinanceData();
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

  const loadFinanceData = async () => {
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

      console.log(
        `Fetching data for month: ${selectedMonth}, Range: ${start} to ${end}`
      ); // Debugging log

      const { data: userGroups } = await supabase
        .from('user_groups')
        .select('group_id')
        .eq('user_id', user.id);
      const groupIds = userGroups?.map((ug) => ug.group_id) || [];

      const { data: budgetsData } = await supabase
        .from('budgets')
        .select(
          `
          *,
          categories(name, color),
          groups(name)
        `
        )
        .in('group_id', groupIds)
        .gte('start_date', start)
        .lte('start_date', end)
        .order('created_at', { ascending: false });

      const { data: expensesData } = await supabase
        .from('expenses')
        .select(
          `
          *,
          categories(name, color),
          groups(name),
          profiles(full_name)
        `
        )
        .in('group_id', groupIds)
        .gte('expense_date', start)
        .lte('expense_date', end)
        .order('expense_date', { ascending: false });

      setBudgets(budgetsData || []);
      setExpenses(expensesData || []);
    } catch (error) {
      console.error('Error loading finance data:', error);
      toast({
        title: 'Gagal memuat data',
        description: 'Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExpenses = () => {
    const exportData = [...expenses, ...budgets].map((expense) => ({
      Tanggal: expense.expense_date || expense.start_date,
      Judul: expense.title,
      Deskripsi: expense.description || '',
      Kategori: expense.categories?.name || 'Lainnya',
      Grup: expense.groups?.name || '',
      Jumlah: expense.amount,
      'Dibuat Oleh': expense.profiles?.full_name || '',
      SortDate: expense.expense_date || expense.start_date,
    }));

    exportToExcel(exportData, `Pemasukan-Pengeluaran-${selectedMonth}`);
  };

  const doDeleteBudget = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Gagal menghapus pemasukan');
      }
      toast({
        title: 'Pemasukan dihapus',
        description: 'Pemasukan telah berhasil dihapus.',
        variant: 'default',
      });
      await loadFinanceData();
    } catch (e: any) {
      toast({
        title: 'Gagal menghapus pemasukan',
        description: e?.message || 'Terjadi kesalahan!',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setPendingDeleteBudget(null);
    }
  };

  const handleDeleteBudget = (budget: any) => {
    setPendingDeleteBudget(budget);
  };

  const doDeleteExpense = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Gagal menghapus pengeluaran');
      }
      toast({
        title: 'Pengeluaran berhasil dihapus',
        description: 'Pengeluaran berhasil dihapus.',
        variant: 'default',
      });
      await loadFinanceData();
    } catch (e: any) {
      toast({
        title: 'Gagal menghapus pengeluaran!',
        description: e?.message || 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setPendingDeleteExpense(null);
    }
  };

  const handleDeleteExpense = (expense: any) => {
    setPendingDeleteExpense(expense);
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
            <h1 className="text-2xl font-bold text-gray-900">Keuangan</h1>
            <p className="text-gray-600">Kelola budget dan pengeluaran Anda</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-56">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleExportExpenses}
              variant="outline"
              title="Export Pengeluaran dan Pemasukan"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => setIsBudgetModalOpen(true)}
            title="Tambah Pemasukan"
            className="flex-1 sm:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pemasukan
          </Button>
          <Button
            onClick={() => setIsExpenseModalOpen(true)}
            variant="outline"
            title="Tambah Pengeluaran"
            className="flex-1 sm:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengeluaran
          </Button>
        </div>

        {/* Budgets Section */}
        <Card>
          <CardHeader>
            <CardTitle>Pemasukan Bulan Ini</CardTitle>
            <CardDescription>
              Daftar pemasukan yang aktif untuk periode yang dipilih
            </CardDescription>
          </CardHeader>
          <CardContent>
            {budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor:
                            budget.categories?.color || '#6B7280',
                        }}
                      />
                      <div>
                        <h4 className="font-medium">{budget.title}</h4>
                        <p className="text-sm text-gray-600">
                          {budget.categories?.name} • {budget.groups?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(budget.start_date)} -{' '}
                          {formatDate(budget.end_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <p className="font-semibold text-lg hidden sm:block">
                        {formatCurrency(budget.amount)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewBudget(budget)}
                        aria-label="Lihat pemasukan"
                        title="Lihat pemasukan"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditBudget(budget)}
                        aria-label="Edit pemasukan"
                        title="Edit pemasukan"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => handleDeleteBudget(budget)}
                        disabled={deletingId === budget.id}
                        aria-label="Hapus pemasukan"
                        title="Hapus pemasukan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Belum ada pemasukan untuk bulan ini
                </p>
                <Button
                  onClick={() => setIsBudgetModalOpen(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pemasukan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses Section */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengeluaran</CardTitle>
            <CardDescription>
              Semua pengeluaran untuk periode yang dipilih
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Per halaman:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Grup</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="w-28 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentFilteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {formatDate(expense.expense_date)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{expense.title}</p>
                            {expense.description && (
                              <p className="text-sm text-gray-600">
                                {expense.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  expense.categories?.color || '#6B7280',
                              }}
                            />
                            <span>{expense.categories?.name || 'Lainnya'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {expense.groups?.name || 'Tidak ada grup'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewExpense(expense)}
                              aria-label="Lihat pengeluaran"
                              title="Lihat pengeluaran"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditExpense(expense)}
                              aria-label="Edit pengeluaran"
                              title="Edit pengeluaran"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600"
                              onClick={() => handleDeleteExpense(expense)}
                              disabled={deletingId === expense.id}
                              aria-label="Hapus pengeluaran"
                              title="Hapus pengeluaran"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Always show pagination info for debugging */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      Menampilkan {filteredStartIndex + 1}-
                      {Math.min(filteredEndIndex, totalFilteredExpenses)} dari{' '}
                      {totalFilteredExpenses} pengeluaran
                    </span>
                    {/* Debug info */}
                    <span className="text-xs text-gray-400">
                      (Halaman {currentPage} dari {totalFilteredPages})
                    </span>
                  </div>
                  {totalFilteredPages > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="w-8 h-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalFilteredPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalFilteredPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalFilteredPages - 2) {
                              pageNum = totalFilteredPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  currentPage === pageNum
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
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
                          setCurrentPage((prev) =>
                            Math.min(totalFilteredPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalFilteredPages}
                        className="w-8 h-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 flex flex-col items-center justify-center">
                <p className="text-gray-500">
                  Belum ada pengeluaran untuk bulan ini
                </p>
                <Button
                  onClick={() => setIsExpenseModalOpen(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pengeluaran
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Modals */}
        <BudgetModal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          onSuccess={loadFinanceData}
        />
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onSuccess={loadFinanceData}
        />

        {/* View/Edit Modals */}
        <BudgetViewModal
          isOpen={!!viewBudget}
          onClose={() => setViewBudget(null)}
          budget={viewBudget}
        />
        <BudgetEditModal
          isOpen={!!editBudget}
          onClose={() => setEditBudget(null)}
          onSuccess={loadFinanceData}
          budget={editBudget}
        />
        <ExpenseViewModal
          isOpen={!!viewExpense}
          onClose={() => setViewExpense(null)}
          expense={viewExpense}
        />
        <ExpenseEditModal
          isOpen={!!editExpense}
          onClose={() => setEditExpense(null)}
          onSuccess={loadFinanceData}
          expense={editExpense}
        />
        <AlertDialog
          open={!!pendingDeleteBudget}
          onOpenChange={(open) => !open && setPendingDeleteBudget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Pemasukan?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus pemasukan "
                {pendingDeleteBudget?.title}"? Tindakan ini tidak dapat
                dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingDeleteBudget(null)}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  pendingDeleteBudget && doDeleteBudget(pendingDeleteBudget.id)
                }
                disabled={deletingId === pendingDeleteBudget?.id}
              >
                {deletingId === pendingDeleteBudget?.id
                  ? 'Menghapus...'
                  : 'Hapus'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={!!pendingDeleteExpense}
          onOpenChange={(open) => !open && setPendingDeleteExpense(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Pengeluaran?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus pengeluaran "
                {pendingDeleteExpense?.title}"? Tindakan ini tidak dapat
                dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingDeleteExpense(null)}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  pendingDeleteExpense &&
                  doDeleteExpense(pendingDeleteExpense.id)
                }
                disabled={deletingId === pendingDeleteExpense?.id}
              >
                {deletingId === pendingDeleteExpense?.id
                  ? 'Menghapus...'
                  : 'Hapus'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
