'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

interface WalletDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: any | null;
  selectedMonth: string;
  monthStartDay: number;
}

// Wallet icon mapping function
const getWalletIcon = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    folder: '📁',
    utensils: '🍽️',
    zap: '⚡',
    'graduation-cap': '🎓',
    car: '🚗',
    heart: '❤️',
    'gamepad-2': '🎮',
    'shopping-bag': '🛍️',
    home: '🏠',
    wifi: '📶',
    phone: '📱',
    gift: '🎁',
    coffee: '☕',
    book: '📚',
    plane: '✈️',
    dumbbell: '💪',
    music: '🎵',
    camera: '📷',
    briefcase: '💼',
    'more-horizontal': '📝',
  };
  return iconMap[iconName] || '📁';
};

export function WalletDetailModal({
  isOpen,
  onClose,
  wallet,
  selectedMonth,
  monthStartDay,
}: WalletDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [walletDetails, setWalletDetails] = useState({
    income: [] as any[],
    expenses: [] as any[],
    transfersIn: [] as any[],
    transfersOut: [] as any[],
  });

  useEffect(() => {
    if (isOpen && wallet) {
      loadWalletDetails();
    }
  }, [isOpen, wallet, selectedMonth]);

  const loadWalletDetails = async () => {
    if (!wallet) return;

    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, monthStartDay);
      const endDate = new Date(year, month, monthStartDay - 1);

      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];

      // Get user's groups
      const { data: userGroups } = await supabase
        .from('user_groups')
        .select('group_id')
        .eq('user_id', user.id);

      const groupIds = userGroups?.map((ug) => ug.group_id) || [];

      // Fetch income to this wallet
      const { data: income } = await supabase
        .from('budgets')
        .select(
          `
          id,
          title,
          amount,
          start_date,
          created_at,
          categories!budgets_category_id_fkey(name, color)
        `
        )
        .eq('wallet_id', wallet.id)
        .in('group_id', groupIds)
        .gte('start_date', start)
        .lte('start_date', end)
        .order('start_date', { ascending: false });

      // Fetch expenses from this wallet
      const { data: expenses } = await supabase
        .from('expenses')
        .select(
          `
          id,
          title,
          description,
          amount,
          expense_date,
          created_at,
          categories!expenses_category_id_fkey(name, color)
        `
        )
        .eq('wallet_id', wallet.id)
        .in('group_id', groupIds)
        .gte('expense_date', start)
        .lte('expense_date', end)
        .order('expense_date', { ascending: false });

      // Fetch transfers to this wallet
      const { data: transfersIn } = await supabase
        .from('wallet_transfers')
        .select(
          `
          id,
          title,
          description,
          amount,
          transfer_date,
          created_at,
          from_wallet:categories!wallet_transfers_from_wallet_id_fkey(name, color)
        `
        )
        .eq('to_wallet_id', wallet.id)
        .in('group_id', groupIds)
        .gte('transfer_date', start)
        .lte('transfer_date', end)
        .order('transfer_date', { ascending: false });

      // Fetch transfers from this wallet
      const { data: transfersOut } = await supabase
        .from('wallet_transfers')
        .select(
          `
          id,
          title,
          description,
          amount,
          transfer_date,
          created_at,
          to_wallet:categories!wallet_transfers_to_wallet_id_fkey(name, color)
        `
        )
        .eq('from_wallet_id', wallet.id)
        .in('group_id', groupIds)
        .gte('transfer_date', start)
        .lte('transfer_date', end)
        .order('transfer_date', { ascending: false });

      setWalletDetails({
        income: income || [],
        expenses: expenses || [],
        transfersIn: transfersIn || [],
        transfersOut: transfersOut || [],
      });
    } catch (error) {
      console.error('Error loading wallet details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!wallet) return null;

  const totalIncome = walletDetails.income.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
  const totalExpenses = walletDetails.expenses.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
  const totalTransfersIn = walletDetails.transfersIn.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
  const totalTransfersOut = walletDetails.transfersOut.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
  const balance =
    totalIncome + totalTransfersIn - totalExpenses - totalTransfersOut;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
              style={{ backgroundColor: wallet.color || '#6B7280' }}
            >
              {getWalletIcon(wallet.icon)}
            </div>
            <div>
              <div className="text-lg font-semibold">{wallet.name}</div>
              <div className="text-sm text-gray-500">Detail Dompet</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Rincian pemasukan, pengeluaran, dan transfer untuk periode yang
            dipilih
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">
                  Total Pemasukan
                </div>
                <div className="text-lg font-bold text-green-700">
                  {formatCurrency(totalIncome)}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">
                  Total Pengeluaran
                </div>
                <div className="text-lg font-bold text-red-700">
                  {formatCurrency(totalExpenses)}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">
                  Transfer Masuk
                </div>
                <div className="text-lg font-bold text-blue-700">
                  {formatCurrency(totalTransfersIn)}
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">
                  Transfer Keluar
                </div>
                <div className="text-lg font-bold text-orange-700">
                  {formatCurrency(totalTransfersOut)}
                </div>
              </div>
            </div>

            {/* Balance */}
            <div
              className={`p-4 rounded-lg ${
                balance >= 0 ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <div
                className={`text-sm font-medium ${
                  balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                Saldo Saat Ini
              </div>
              <div
                className={`text-2xl font-bold ${
                  balance >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {formatCurrency(balance)}
              </div>
            </div>

            {/* Income Section */}
            {walletDetails.income.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-700">
                  Pemasukan
                </h3>
                <div className="space-y-2">
                  {walletDetails.income.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-600">
                          {item.categories?.name || 'Lainnya'} •{' '}
                          {formatDate(item.start_date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-700">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses Section */}
            {walletDetails.expenses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-700">
                  Pengeluaran
                </h3>
                <div className="space-y-2">
                  {walletDetails.expenses.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-600">
                          {item.categories?.name || 'Lainnya'} •{' '}
                          {formatDate(item.expense_date)}
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-500">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-700">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transfers In Section */}
            {walletDetails.transfersIn.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-700">
                  Transfer Masuk
                </h3>
                <div className="space-y-2">
                  {walletDetails.transfersIn.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-600">
                          Dari {item.from_wallet?.name || 'Unknown'} •{' '}
                          {formatDate(item.transfer_date)}
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-500">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-700">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transfers Out Section */}
            {walletDetails.transfersOut.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-700">
                  Transfer Keluar
                </h3>
                <div className="space-y-2">
                  {walletDetails.transfersOut.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-600">
                          Ke {item.to_wallet?.name || 'Unknown'} •{' '}
                          {formatDate(item.transfer_date)}
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-500">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-700">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {walletDetails.income.length === 0 &&
              walletDetails.expenses.length === 0 &&
              walletDetails.transfersIn.length === 0 &&
              walletDetails.transfersOut.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Belum ada transaksi untuk dompet ini pada periode yang
                    dipilih
                  </p>
                </div>
              )}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
