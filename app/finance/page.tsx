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
  ArrowRightLeft,
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
import { WalletTransferModal } from '@/components/modals/wallet-transfer-modal';
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
  const [walletTransfers, setWalletTransfers] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isWalletTransferModalOpen, setIsWalletTransferModalOpen] =
    useState(false);
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

  const [viewWalletTransfer, setViewWalletTransfer] = useState<any | null>(
    null
  );
  const [editWalletTransfer, setEditWalletTransfer] = useState<any | null>(
    null
  );

  const [pendingDeleteBudget, setPendingDeleteBudget] = useState<any | null>(
    null
  );
  const [pendingDeleteExpense, setPendingDeleteExpense] = useState<any | null>(
    null
  );
  const [pendingDeleteWalletTransfer, setPendingDeleteWalletTransfer] =
    useState<any | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Wallet transfer pagination state
  const [walletTransferPage, setWalletTransferPage] = useState(1);
  const [walletTransferPageSize, setWalletTransferPageSize] = useState(10);
  const [walletTransferSearchTerm, setWalletTransferSearchTerm] = useState('');

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

  // Wallet transfer pagination logic
  const totalWalletTransfers = walletTransfers.length;
  const totalWalletTransferPages = Math.ceil(
    totalWalletTransfers / walletTransferPageSize
  );
  const walletTransferStartIndex =
    (walletTransferPage - 1) * walletTransferPageSize;
  const walletTransferEndIndex =
    walletTransferStartIndex + walletTransferPageSize;
  const currentWalletTransfers = walletTransfers.slice(
    walletTransferStartIndex,
    walletTransferEndIndex
  );

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

  // Wallet transfer search and sort logic
  const filteredWalletTransfers = useMemo(() => {
    let filtered = [...walletTransfers];

    // Apply search filter
    if (walletTransferSearchTerm.trim()) {
      const searchLower = walletTransferSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (transfer) =>
          transfer.title?.toLowerCase().includes(searchLower) ||
          transfer.description?.toLowerCase().includes(searchLower) ||
          transfer.from_wallet?.name?.toLowerCase().includes(searchLower) ||
          transfer.to_wallet?.name?.toLowerCase().includes(searchLower) ||
          transfer.groups?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by transfer_date descending (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.transfer_date).getTime();
      const dateB = new Date(b.transfer_date).getTime();
      return dateB - dateA;
    });

    return filtered;
  }, [walletTransfers, walletTransferSearchTerm]);

  // Update pagination for filtered data
  const totalFilteredExpenses = filteredExpenses.length;
  const totalFilteredPages = Math.ceil(totalFilteredExpenses / pageSize);
  const filteredStartIndex = (currentPage - 1) * pageSize;
  const filteredEndIndex = filteredStartIndex + pageSize;
  const currentFilteredExpenses = filteredExpenses.slice(
    filteredStartIndex,
    filteredEndIndex
  );

  // Update pagination for filtered wallet transfers
  const totalFilteredWalletTransfers = filteredWalletTransfers.length;
  const totalFilteredWalletTransferPages = Math.ceil(
    totalFilteredWalletTransfers / walletTransferPageSize
  );
  const filteredWalletTransferStartIndex =
    (walletTransferPage - 1) * walletTransferPageSize;
  const filteredWalletTransferEndIndex =
    filteredWalletTransferStartIndex + walletTransferPageSize;
  const currentFilteredWalletTransfers = filteredWalletTransfers.slice(
    filteredWalletTransferStartIndex,
    filteredWalletTransferEndIndex
  );

  // Reset to first page when expenses change
  useEffect(() => {
    setCurrentPage(1);
  }, [expenses.length]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reset to first page when wallet transfers change
  useEffect(() => {
    setWalletTransferPage(1);
  }, [walletTransfers.length]);

  // Reset to first page when wallet transfer search term changes
  useEffect(() => {
    setWalletTransferPage(1);
  }, [walletTransferSearchTerm]);

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

      const { data: walletTransfersData } = await supabase
        .from('wallet_transfers')
        .select(
          `
          *,
          from_wallet:from_wallet_id(name, color),
          to_wallet:to_wallet_id(name, color),
          groups(name)
        `
        )
        .in('group_id', groupIds)
        .gte('transfer_date', start)
        .lte('transfer_date', end)
        .order('transfer_date', { ascending: false });

      setBudgets(budgetsData || []);
      setExpenses(expensesData || []);
      setWalletTransfers(walletTransfersData || []);
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

  const doDeleteWalletTransfer = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/wallet-transfers/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Gagal menghapus transfer dompet');
      }
      toast({
        title: 'Transfer dompet berhasil dihapus',
        description: 'Transfer dompet berhasil dihapus.',
        variant: 'default',
      });
      await loadFinanceData();
    } catch (e: any) {
      toast({
        title: 'Gagal menghapus transfer dompet!',
        description: e?.message || 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setPendingDeleteWalletTransfer(null);
    }
  };

  const handleDeleteExpense = (expense: any) => {
    setPendingDeleteExpense(expense);
  };

  const handleDeleteWalletTransfer = (transfer: any) => {
    setPendingDeleteWalletTransfer(transfer);
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
            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white border-green-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pemasukan
          </Button>
          <Button
            onClick={() => setIsExpenseModalOpen(true)}
            variant="outline"
            title="Tambah Pengeluaran"
            className="flex-1 sm:flex-none border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengeluaran
          </Button>
          <Button
            onClick={() => setIsWalletTransferModalOpen(true)}
            variant="outline"
            title="Pindah Dompet"
            className="flex-1 sm:flex-none border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600"
          >
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Pindah Dompet
          </Button>
        </div>

        {/* Expenses Section */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Pengeluaran</CardTitle>
                <CardDescription>
                  Semua pengeluaran untuk periode yang dipilih
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    expenses.reduce(
                      (sum, expense) => sum + (expense.amount || 0),
                      0
                    )
                  )}
                </div>
                <div className="text-sm text-gray-500">Total Pengeluaran</div>
              </div>
            </div>
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
                      <TableHead className="hidden md:table-cell">
                        Kategori
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Grup
                      </TableHead>
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
                            <p className="text-xs text-gray-500 md:hidden">
                              {expense.categories?.name || 'Lainnya'}
                            </p>
                            {expense.description && (
                              <p className="text-sm text-gray-600 hidden md:block">
                                {expense.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
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
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="secondary">
                            {expense.groups?.name || 'Tidak ada grup'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {/* Mobile: Action List */}
                          <div className="md:hidden">
                            <Select>
                              <SelectTrigger className="w-20 h-8">
                                <span className="text-xs">Aksi</span>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  value="view"
                                  onClick={() => setViewExpense(expense)}
                                >
                                  Lihat
                                </SelectItem>
                                <SelectItem
                                  value="edit"
                                  onClick={() => setEditExpense(expense)}
                                >
                                  Edit
                                </SelectItem>
                                <SelectItem
                                  value="delete"
                                  onClick={() => handleDeleteExpense(expense)}
                                  className="text-red-600"
                                >
                                  Hapus
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Desktop: Individual Action Buttons */}
                          <div className="hidden md:flex items-center justify-center gap-1">
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

        {/* Wallet Transfers Section */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Pindah Dompet</CardTitle>
                <CardDescription>
                  Semua transfer antar dompet untuk periode yang dipilih
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    walletTransfers.reduce(
                      (sum, transfer) => sum + (transfer.amount || 0),
                      0
                    )
                  )}
                </div>
                <div className="text-sm text-gray-500">Total Transfer</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari transfer dompet..."
                    value={walletTransferSearchTerm}
                    onChange={(e) =>
                      setWalletTransferSearchTerm(e.target.value)
                    }
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Per halaman:</span>
                  <Select
                    value={walletTransferPageSize.toString()}
                    onValueChange={(value) => {
                      setWalletTransferPageSize(Number(value));
                      setWalletTransferPage(1);
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

            {walletTransfers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Dari Dompet
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Ke Dompet
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Grup
                      </TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="w-28 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentFilteredWalletTransfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">
                          {formatDate(transfer.transfer_date)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transfer.title}</p>
                            <p className="text-xs text-gray-500 md:hidden">
                              {transfer.from_wallet?.name} →{' '}
                              {transfer.to_wallet?.name}
                            </p>
                            {transfer.description && (
                              <p className="text-sm text-gray-600 hidden md:block">
                                {transfer.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  transfer.from_wallet?.color || '#6B7280',
                              }}
                            />
                            <span>
                              {transfer.from_wallet?.name || 'Unknown'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  transfer.to_wallet?.color || '#6B7280',
                              }}
                            />
                            <span>{transfer.to_wallet?.name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="secondary">
                            {transfer.groups?.name || 'Tidak ada grup'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-blue-600">
                          {formatCurrency(transfer.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {/* Mobile: Action List */}
                          <div className="md:hidden">
                            <Select>
                              <SelectTrigger className="w-20 h-8">
                                <span className="text-xs">Aksi</span>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  value="view"
                                  onClick={() =>
                                    setViewWalletTransfer(transfer)
                                  }
                                >
                                  Lihat
                                </SelectItem>
                                <SelectItem
                                  value="edit"
                                  onClick={() =>
                                    setEditWalletTransfer(transfer)
                                  }
                                >
                                  Edit
                                </SelectItem>
                                <SelectItem
                                  value="delete"
                                  onClick={() =>
                                    handleDeleteWalletTransfer(transfer)
                                  }
                                  className="text-red-600"
                                >
                                  Hapus
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Desktop: Individual Action Buttons */}
                          <div className="hidden md:flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewWalletTransfer(transfer)}
                              aria-label="Lihat transfer dompet"
                              title="Lihat transfer dompet"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditWalletTransfer(transfer)}
                              aria-label="Edit transfer dompet"
                              title="Edit transfer dompet"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600"
                              onClick={() =>
                                handleDeleteWalletTransfer(transfer)
                              }
                              disabled={deletingId === transfer.id}
                              aria-label="Hapus transfer dompet"
                              title="Hapus transfer dompet"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      Menampilkan {filteredWalletTransferStartIndex + 1}-
                      {Math.min(
                        filteredWalletTransferEndIndex,
                        totalFilteredWalletTransfers
                      )}{' '}
                      dari {totalFilteredWalletTransfers} transfer dompet
                    </span>
                    <span className="text-xs text-gray-400">
                      (Halaman {walletTransferPage} dari{' '}
                      {totalFilteredWalletTransferPages})
                    </span>
                  </div>
                  {totalFilteredWalletTransferPages > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setWalletTransferPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={walletTransferPage === 1}
                        className="w-8 h-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          {
                            length: Math.min(
                              5,
                              totalFilteredWalletTransferPages
                            ),
                          },
                          (_, i) => {
                            let pageNum;
                            if (totalFilteredWalletTransferPages <= 5) {
                              pageNum = i + 1;
                            } else if (walletTransferPage <= 3) {
                              pageNum = i + 1;
                            } else if (
                              walletTransferPage >=
                              totalFilteredWalletTransferPages - 2
                            ) {
                              pageNum =
                                totalFilteredWalletTransferPages - 4 + i;
                            } else {
                              pageNum = walletTransferPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  walletTransferPage === pageNum
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() => setWalletTransferPage(pageNum)}
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
                          setWalletTransferPage((prev) =>
                            Math.min(totalFilteredWalletTransferPages, prev + 1)
                          )
                        }
                        disabled={
                          walletTransferPage ===
                          totalFilteredWalletTransferPages
                        }
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
                  Belum ada transfer dompet untuk bulan ini
                </p>
                <Button
                  onClick={() => setIsWalletTransferModalOpen(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Pindah Dompet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budgets Section */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pemasukan Bulan Ini</CardTitle>
                <CardDescription>
                  Daftar pemasukan yang aktif untuk periode yang dipilih
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    budgets.reduce(
                      (sum, budget) => sum + (budget.amount || 0),
                      0
                    )
                  )}
                </div>
                <div className="text-sm text-gray-500">Total Pemasukan</div>
              </div>
            </div>
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
        <WalletTransferModal
          isOpen={isWalletTransferModalOpen}
          onClose={() => setIsWalletTransferModalOpen(false)}
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

        <AlertDialog
          open={!!pendingDeleteWalletTransfer}
          onOpenChange={(open) => !open && setPendingDeleteWalletTransfer(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Transfer Dompet?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus transfer dompet "
                {pendingDeleteWalletTransfer?.title}"? Tindakan ini tidak dapat
                dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setPendingDeleteWalletTransfer(null)}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  pendingDeleteWalletTransfer &&
                  doDeleteWalletTransfer(pendingDeleteWalletTransfer.id)
                }
                disabled={deletingId === pendingDeleteWalletTransfer?.id}
              >
                {deletingId === pendingDeleteWalletTransfer?.id
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
