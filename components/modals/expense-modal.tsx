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

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSuccess,
}: ExpenseModalProps) {
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
        .eq('type', 'Pengeluaran');
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
      const description = formData.get('description') as string;
      const amount = Number.parseFloat(formData.get('amount') as string);
      const categoryId = formData.get('categoryId') as string;
      const walletId = formData.get('walletId') as string;
      const groupId = defaultGroupId; // Use default group ID
      const expenseDate = formData.get('expenseDate') as string;

      const { error } = await supabase.from('expenses').insert({
        title,
        description,
        amount,
        category_id: categoryId,
        wallet_id: walletId || null, // Allow null if no wallet selected
        group_id: groupId,
        expense_date: expenseDate,
        created_by: user.id,
      });
      if (error) throw error;

      toast({
        title: 'Pengeluaran berhasil ditambahkan',
        description: 'Pengeluaran baru telah disimpan.',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Gagal menambahkan pengeluaran',
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
          <DialogTitle>Tambah Pengeluaran</DialogTitle>
          <DialogDescription>Catat pengeluaran baru Anda.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Judul Pengeluaran</Label>
              <Input
                id="title"
                name="title"
                placeholder="Contoh: Makan siang"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detail pengeluaran..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <CurrencyInput
                id="amount"
                name="amount"
                placeholder="50.000"
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
              <Label htmlFor="walletId">Dari Dompet (Opsional)</Label>
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
              <Label htmlFor="expenseDate">Tanggal</Label>
              <Input
                id="expenseDate"
                name="expenseDate"
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
