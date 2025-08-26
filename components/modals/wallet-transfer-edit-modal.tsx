'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyInput } from '@/components/form/currency-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

interface WalletTransferEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transfer: any | null;
}

export function WalletTransferEditModal({
  isOpen,
  onClose,
  onSuccess,
  transfer,
}: WalletTransferEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [walletCategories, setWalletCategories] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen]);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      // Get user's groups
      const { data: userGroups } = await supabase
        .from('user_groups')
        .select('group_id, groups(*)')
        .eq('user_id', user.id);

      if (userGroups && userGroups.length > 0) {
        const userGroupsData = userGroups
          .map((ug) => ug.groups)
          .filter(Boolean);

        // Get wallet categories for user's groups
        const groupIds = userGroupsData.map((group: any) => group.id);
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('type', 'Dompet')
          .in('group_id', groupIds);

        if (categoriesData) setWalletCategories(categoriesData);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (!transfer) return;
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const amount = Number.parseFloat(formData.get('amount') as string);
      const fromWalletId = formData.get('fromWalletId') as string;
      const toWalletId = formData.get('toWalletId') as string;
      const transferDate = formData.get('transferDate') as string;

      // Validate that from and to wallets are different
      if (fromWalletId === toWalletId) {
        throw new Error('Dompet asal dan tujuan tidak boleh sama');
      }

      const res = await fetch(`/api/wallet-transfers/${transfer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          amount,
          from_wallet_id: fromWalletId,
          to_wallet_id: toWalletId,
          transfer_date: transferDate,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok)
        throw new Error(data.error || 'Gagal memperbarui transfer dompet');

      toast({
        title: 'Transfer dompet diperbarui',
        description: 'Perubahan telah disimpan.',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Gagal memperbarui transfer dompet',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!transfer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transfer Dompet</DialogTitle>
          <DialogDescription>
            Perbarui informasi transfer antar dompet.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Judul Transfer</Label>
              <Input
                id="title"
                name="title"
                defaultValue={transfer.title}
                placeholder="Contoh: Transfer ke Bank BCA"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={transfer.description || ''}
                placeholder="Alasan transfer..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <CurrencyInput
                id="amount"
                name="amount"
                defaultValue={transfer.amount}
                placeholder="1.000.000"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fromWalletId">Dari Dompet</Label>
              <Select
                name="fromWalletId"
                defaultValue={transfer.from_wallet_id}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dompet asal" />
                </SelectTrigger>
                <SelectContent>
                  {walletCategories.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="toWalletId">Ke Dompet</Label>
              <Select
                name="toWalletId"
                defaultValue={transfer.to_wallet_id}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dompet tujuan" />
                </SelectTrigger>
                <SelectContent>
                  {walletCategories.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transferDate">Tanggal Transfer</Label>
              <Input
                id="transferDate"
                name="transferDate"
                type="date"
                defaultValue={(transfer.transfer_date || '').slice(0, 10)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
