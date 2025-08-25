'use client';

import { useEffect, useState } from 'react';
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

interface BudgetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budget: any | null;
}

export function BudgetEditModal({
  isOpen,
  onClose,
  onSuccess,
  budget,
}: BudgetEditModalProps) {
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
      if (userGroups) {
        setGroups(userGroups.map((ug) => ug.groups).filter(Boolean));
      }

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');
      if (categoriesData) setCategories(categoriesData);
    } catch (e) {
      console.error('Error loading data:', e);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (!budget) return;
    setIsLoading(true);
    try {
      const title = formData.get('title') as string;
      const amount = Number.parseFloat(formData.get('amount') as string);
      const groupId = formData.get('groupId') as string;
      const categoryId = formData.get('categoryId') as string;
      const date = formData.get('date') as string;

      const res = await fetch(`/api/budgets/${budget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amount,
          group_id: groupId,
          category_id: categoryId,
          start_date: date,
          end_date: date,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok)
        throw new Error(data.error || 'Gagal memperbarui budget');

      toast({
        title: 'Budget diperbarui',
        description: 'Perubahan telah disimpan.',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Gagal memperbarui pemasukan',
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
          <DialogTitle>Edit Pemasukan</DialogTitle>
          <DialogDescription>
            Perbarui informasi pemasukan Anda.
          </DialogDescription>
        </DialogHeader>
        {budget && (
          <form action={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul Pemasukan</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={budget.title}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <CurrencyInput
                  id="amount"
                  name="amount"
                  defaultValue={budget.amount}
                  placeholder="1.000.000"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="groupId">Grup</Label>
                <Select name="groupId" defaultValue={budget.group_id} required>
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
                  defaultValue={budget.category_id}
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
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={(budget.start_date || '').slice(0, 10)}
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
