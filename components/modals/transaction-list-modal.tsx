'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getMonthRange } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TransactionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: any;
  type: 'expense' | 'income';
  selectedMonth: string;
  monthStartDay: number;
}

export function TransactionListModal({
  isOpen,
  onClose,
  category,
  type,
  selectedMonth,
  monthStartDay,
}: TransactionListModalProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      loadTransactions();
    }
  }, [isOpen, category, selectedMonth]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user || !category) return;

      // Get user's groups
      const { data: userGroups, error: ugErr } = await supabase
        .from('user_groups')
        .select('group_id')
        .eq('user_id', user.id);
      if (ugErr) throw ugErr;

      const groupIds = userGroups?.map((ug) => ug.group_id) || [];

      // Get month range using the utility function
      const [year, month] = selectedMonth.split('-').map(Number);
      const { start, end } = getMonthRange(year, month, monthStartDay);

      // Handle different category data structures
      // Dashboard passes: { category: string, amount: number, color: string }
      // Categories page passes: { id: string, name: string, color: string, type: string }
      const categoryId = category.id;
      const categoryName = category.name || category.category;

      if (!categoryId) {
        // If no category ID, we need to find the category by name
        const { data: categoryData, error: catErr } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .in('group_id', groupIds)
          .limit(1);

        if (catErr) throw catErr;
        if (!categoryData || categoryData.length === 0) {
          setTransactions([]);
          return;
        }

        // Use the found category ID
        const foundCategoryId = categoryData[0].id;

        if (type === 'expense') {
          const { data: expenses, error } = await supabase
            .from('expenses')
            .select(
              `
              id,
              title,
              description,
              amount,
              expense_date,
              created_at,
              groups(name)
            `
            )
            .eq('category_id', foundCategoryId)
            .in('group_id', groupIds)
            .gte('expense_date', start)
            .lte('expense_date', end)
            .order('expense_date', { ascending: false });

          if (error) throw error;
          setTransactions(expenses || []);
        } else {
          const { data: income, error } = await supabase
            .from('budgets')
            .select(
              `
              id,
              title,
              amount,
              start_date,
              created_at,
              groups(name)
            `
            )
            .eq('category_id', foundCategoryId)
            .in('group_id', groupIds)
            .gte('start_date', start)
            .lte('start_date', end)
            .order('start_date', { ascending: false });

          if (error) throw error;
          setTransactions(income || []);
        }
      } else {
        // Category has ID, use it directly
        if (type === 'expense') {
          const { data: expenses, error } = await supabase
            .from('expenses')
            .select(
              `
              id,
              title,
              description,
              amount,
              expense_date,
              created_at,
              groups(name)
            `
            )
            .eq('category_id', categoryId)
            .in('group_id', groupIds)
            .gte('expense_date', start)
            .lte('expense_date', end)
            .order('expense_date', { ascending: false });

          if (error) throw error;
          setTransactions(expenses || []);
        } else {
          const { data: income, error } = await supabase
            .from('budgets')
            .select(
              `
              id,
              title,
              amount,
              start_date,
              created_at,
              groups(name)
            `
            )
            .eq('category_id', categoryId)
            .in('group_id', groupIds)
            .gte('start_date', start)
            .lte('start_date', end)
            .order('start_date', { ascending: false });

          if (error) throw error;
          setTransactions(income || []);
        }
      }
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      toast({
        title: 'Gagal memuat transaksi',
        description: error?.message || 'Terjadi kesalahan saat memuat data',
        variant: 'destructive',
      });
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
              style={{ backgroundColor: category?.color || '#6B7280' }}
            >
              {category?.icon === 'folder' ? '📁' : '📊'}
            </div>
            <div>
              <div>
                Transaksi {category?.name || category?.category || 'Kategori'}
              </div>
              <div className="text-sm font-normal text-gray-500">
                {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Daftar transaksi untuk kategori ini dalam periode yang dipilih
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Transaksi</p>
                <p className="text-lg font-semibold">
                  {transactions.length} transaksi
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Jumlah</p>
                <p
                  className={`text-lg font-semibold ${
                    type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {transaction.title}
                        </h4>
                        {transaction.groups?.name && (
                          <Badge variant="secondary" className="text-xs">
                            {transaction.groups.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {type === 'expense'
                            ? transaction.expense_date
                            : transaction.start_date}
                        </span>
                        {transaction.description && (
                          <span className="truncate max-w-48">
                            {transaction.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold ${
                          type === 'expense' ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-semibold mb-2">
                  Tidak ada transaksi
                </h3>
                <p className="text-gray-600">
                  Belum ada transaksi untuk kategori ini dalam periode yang
                  dipilih
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
