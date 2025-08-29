'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MainLayout } from '@/components/layout/main-layout';
import {
  formatCurrency,
  getMonthRange,
  getCustomMonthLabel,
  getCurrentMonthValue,
} from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import { CategoryAddModal } from '@/components/modals/category-add-modal';
import { CategoryEditModal } from '@/components/modals/category-edit-modal';
import { CategoryViewModal } from '@/components/modals/category-view-modal';
import { TransactionListModal } from '@/components/modals/transaction-list-modal';
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

export default function CategoriesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<
    Record<string, { total: number; count: number }>
  >({});
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<any | null>(null);
  const [viewCategory, setViewCategory] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'Pengeluaran' | 'Pemasukan' | 'Dompet'
  >('Pengeluaran');
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<
    any | null
  >(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Default to current month, will be updated when profile loads
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
  });
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>(
    'expense'
  );

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
      // Update selected month based on user's month start day setting
      const currentMonthValue = getCurrentMonthValue(
        profile.month_start_day || 1
      );
      setSelectedMonth(currentMonthValue);
      loadData();
    }
  }, [profile]);

  useEffect(() => {
    if (profile && selectedMonth) {
      loadData();
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user || !profile) return;

      // get user's groups
      const { data: userGroups, error: ugErr } = await supabase
        .from('user_groups')
        .select('group_id')
        .eq('user_id', user.id);
      if (ugErr) throw ugErr;
      const groupIds = userGroups?.map((ug) => ug.group_id) || [];

      // fetch categories for those groups
      const { data: categoriesData, error: cErr } = await supabase
        .from('categories')
        .select('*')
        .in('group_id', groupIds)
        .order('created_at', { ascending: false });
      if (cErr) throw cErr;
      setCategories(categoriesData || []);

      // Get month range for filtering expenses
      const [year, month] = selectedMonth.split('-').map(Number);
      const { start, end } = getMonthRange(
        year,
        month,
        profile.month_start_day || 1
      );

      // fetch expenses for the selected month to compute totals by category
      const { data: expensesData, error: eErr } = await supabase
        .from('expenses')
        .select('id, amount, category_id')
        .in('group_id', groupIds)
        .gte('expense_date', start)
        .lte('expense_date', end);
      if (eErr) throw eErr;

      // fetch incomes for the selected month to compute totals by category
      const { data: incomesData, error: iErr } = await supabase
        .from('budgets')
        .select('id, amount, category_id')
        .in('group_id', groupIds)
        .gte('start_date', start)
        .lte('start_date', end);
      if (iErr) throw iErr;

      const map: Record<string, { total: number; count: number }> = {};
      for (const ex of (expensesData || []).concat(incomesData || [])) {
        const key = ex.category_id;
        if (!map[key]) map[key] = { total: 0, count: 0 };
        map[key].total += Number(ex.amount || 0);
        map[key].count += 1;
      }
      setExpensesByCategory(map);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Gagal memuat kategori',
        description: 'Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (category: any) => {
    setPendingDeleteCategory(category);
  };

  const handleViewTransactions = (category: any) => {
    setSelectedCategory(category);
    if (category.type === 'Pengeluaran') {
      setTransactionType('expense');
    } else if (category.type === 'Pemasukan') {
      setTransactionType('income');
    } else if (category.type === 'Dompet') {
      setTransactionType('expense'); // Wallet transactions are typically expenses
    }
    setTransactionModalOpen(true);
  };

  const doDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok)
        throw new Error(data.error || 'Gagal menghapus kategori');
      toast({
        title: 'Kategori dihapus',
        description: 'Kategori telah dihapus.',
      });
      await loadData();
    } catch (e: any) {
      toast({
        title: 'Gagal menghapus kategori',
        description: e?.message || 'Error',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setPendingDeleteCategory(null);
    }
  };

  const iconMap: Record<string, string> = {
    utensils: '🍽️',
    zap: '⚡',
    'graduation-cap': '🎓',
    car: '🚗',
    heart: '❤️',
    'gamepad-2': '🎮',
    'shopping-bag': '🛍️',
    'more-horizontal': '📝',
    folder: '📁',
  };

  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'Pemasukan'),
    [categories]
  );
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'Pengeluaran'),
    [categories]
  );
  const walletCategories = useMemo(
    () => categories.filter((c) => c.type === 'Dompet'),
    [categories]
  );

  const renderGrid = (items: any[]) => {
    if (items.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Belum ada kategori pada bagian ini</p>
            <Button
              onClick={() => setIsAddOpen(true)}
              variant="outline"
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kategori
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((category) => {
          const stats = expensesByCategory[category.id] || {
            total: 0,
            count: 0,
          };
          return (
            <Card
              key={category.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                category.type === 'Pengeluaran'
                  ? 'border-l-4 border-l-red-500'
                  : category.type === 'Pemasukan'
                  ? 'border-l-4 border-l-green-500'
                  : 'border-l-4 border-l-blue-500'
              }`}
              onClick={() => handleViewTransactions(category)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: category.color }}
                      aria-hidden
                    >
                      {iconMap[category.icon as keyof typeof iconMap] || '📁'}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {category.type} • {stats.count} transaksi
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewCategory(category);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditCategory(category);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(category);
                      }}
                      disabled={deletingId === category.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category.type === 'Pengeluaran'
                        ? 'Total Pengeluaran'
                        : category.type === 'Pemasukan'
                        ? 'Total Pemasukan'
                        : 'Total Transaksi'}
                      :
                    </span>
                    <Badge
                      variant="secondary"
                      className={`font-semibold ${
                        category.type === 'Pengeluaran'
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : category.type === 'Pemasukan'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                    >
                      {formatCurrency(stats.total)}
                    </Badge>
                  </div>
                  {category.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Kategori</h1>
            <p className="text-gray-600">
              Kelola kategori pemasukan dan pengeluaran Anda
            </p>
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
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kategori
            </Button>
          </div>
        </div>

        {/* Tabs for Pemasukan/Pengeluaran */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger
              value="Pengeluaran"
              className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700 data-[state=active]:border-red-200 hover:bg-red-50"
            >
              Pengeluaran
            </TabsTrigger>
            <TabsTrigger
              value="Pemasukan"
              className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:border-green-200 hover:bg-green-50"
            >
              Pemasukan
            </TabsTrigger>
            <TabsTrigger
              value="Dompet"
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 hover:bg-blue-50"
            >
              Dompet
            </TabsTrigger>
          </TabsList>
          <TabsContent value="Pengeluaran" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderGrid(expenseCategories)
            )}
          </TabsContent>
          <TabsContent value="Pemasukan" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderGrid(incomeCategories)
            )}
          </TabsContent>
          <TabsContent value="Dompet" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderGrid(walletCategories)
            )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CategoryAddModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={loadData}
        />
        <CategoryEditModal
          isOpen={!!editCategory}
          onClose={() => setEditCategory(null)}
          onSuccess={loadData}
          category={editCategory}
        />
        <CategoryViewModal
          isOpen={!!viewCategory}
          onClose={() => setViewCategory(null)}
          category={viewCategory}
        />
        <TransactionListModal
          isOpen={transactionModalOpen}
          onClose={() => setTransactionModalOpen(false)}
          category={selectedCategory}
          type={transactionType}
          selectedMonth={selectedMonth}
          monthStartDay={profile?.month_start_day || 1}
        />
      </div>
      <AlertDialog
        open={!!pendingDeleteCategory}
        onOpenChange={(open) => !open && setPendingDeleteCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kategori "
              {pendingDeleteCategory?.name}"? Menghapus kategori dapat
              mempengaruhi data terkait. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteCategory(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pendingDeleteCategory && doDelete(pendingDeleteCategory.id)
              }
              disabled={deletingId === pendingDeleteCategory?.id}
            >
              {deletingId === pendingDeleteCategory?.id
                ? 'Menghapus...'
                : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
