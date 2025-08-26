'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BudgetModal({ isOpen, onClose, onSuccess }: BudgetModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [walletCategories, setWalletCategories] = useState<any[]>([]);
  const [defaultGroupId, setDefaultGroupId] = useState<string>('');
  const [defaultGroupName, setDefaultGroupName] = useState<string>('');

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen]);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data: userGroups } = await supabase
        .from('user_groups')
        .select('group_id, groups(*)')
        .eq('user_id', user.id);

      if (userGroups && userGroups.length > 0) {
        const userGroupsData = userGroups
          .map((ug) => ug.groups)
          .filter(Boolean);
        setGroups(userGroupsData);
        // Set the first group as default
        const firstGroup = userGroupsData[0] as any;
        if (firstGroup && firstGroup.id) {
          setDefaultGroupId(firstGroup.id);
          setDefaultGroupName(firstGroup.name || '');
        }
      }

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'Pemasukan');
      if (categoriesData) setCategories(categoriesData);

      // Get wallet categories for user's groups
      if (userGroups && userGroups.length > 0) {
        const groupIds = userGroups.map((ug) => ug.group_id);
        const { data: walletCategoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('type', 'Dompet')
          .in('group_id', groupIds);
        if (walletCategoriesData) setWalletCategories(walletCategoriesData);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const title = formData.get('title') as string;
      const amount = Number.parseFloat(formData.get('amount') as string);
      const categoryId = formData.get('categoryId') as string;
      const walletId = formData.get('walletId') as string;
      const groupId = defaultGroupId; // Use default group ID
      const date = formData.get('date') as string;

      const { error } = await supabase.from('budgets').insert({
        title,
        amount,
        category_id: categoryId,
        wallet_id: walletId || null, // Allow null if no wallet selected
        group_id: groupId,
        start_date: date,
        end_date: date,
        created_by: user.id,
      });
      if (error) throw error;

      toast({
        title: 'Budget berhasil ditambahkan',
        description: 'Budget baru telah disimpan.',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Gagal menambahkan budget',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Pemasukan</DialogTitle>
          <DialogDescription>
            Buat budget baru untuk mengontrol pengeluaran Anda.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Judul Pemasukan</Label>
              <Input
                id="title"
                name="title"
                placeholder="Contoh: Budget Makanan Januari"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <CurrencyInput
                id="amount"
                name="amount"
                placeholder="1.000.000"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="groupId">Grup</Label>
              <Select name="groupId" value={defaultGroupId} disabled>
                <SelectTrigger>
                  <SelectValue
                    placeholder={defaultGroupName || 'Memuat grup...'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoryId">Kategori</Label>
              <Select name="categoryId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="walletId">Ke Dompet (Opsional)</Label>
              <Select name="walletId">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dompet (opsional)" />
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
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
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
