'use client';

import { useEffect, useState } from 'react';
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

interface ExpenseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense: any | null;
}

export function ExpenseEditModal({
  isOpen,
  onClose,
  onSuccess,
  expense,
}: ExpenseEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data: userGroups } = await supabase
        .from('user_groups')
        .select('group_id, groups(*)')
        .eq('user_id', user.id);
      if (userGroups)
        setGroups(userGroups.map((ug) => ug.groups).filter(Boolean));

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'Pengeluaran'); // Only expense categories
      if (categoriesData) setCategories(categoriesData);
    } catch (e) {
      console.error('Error loading data:', e);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (!expense) return;
    setIsLoading(true);
    try {
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const amount = Number.parseFloat(formData.get('amount') as string);
      const categoryId = formData.get('categoryId') as string;
      const groupId = formData.get('groupId') as string;
      const expenseDate = formData.get('expenseDate') as string;

      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          amount,
          category_id: categoryId,
          group_id: groupId,
          expense_date: expenseDate,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok)
        throw new Error(data.error || 'Gagal memperbarui pengeluaran');

      toast({
        title: 'Pengeluaran diperbarui',
        description: 'Perubahan telah disimpan.',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Gagal memperbarui pengeluaran',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Edit Pengeluaran</DialogTitle>
          <DialogDescription>
            Perbarui informasi pengeluaran Anda.
          </DialogDescription>
        </DialogHeader>
        {expense && (
          <form action={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul Pengeluaran</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={expense.title}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={expense.description || ''}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <CurrencyInput
                  id="amount"
                  name="amount"
                  defaultValue={expense.amount}
                  placeholder="50.000"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="groupId">Grup</Label>
                <Select name="groupId" defaultValue={expense.group_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih grup" />
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
                <Select
                  name="categoryId"
                  defaultValue={expense.category_id}
                  required
                >
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
                <Label htmlFor="expenseDate">Tanggal</Label>
                <Input
                  id="expenseDate"
                  name="expenseDate"
                  type="date"
                  defaultValue={(expense.expense_date || '').slice(0, 10)}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
