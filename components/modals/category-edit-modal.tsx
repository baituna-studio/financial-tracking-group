'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: any | null;
}

export function CategoryEditModal({
  isOpen,
  onClose,
  onSuccess,
  category,
}: CategoryEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadGroups = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;
      const { data } = await supabase
        .from('user_groups')
        .select('group_id, groups(*)')
        .eq('user_id', user.id);
      if (data) setGroups(data.map((ug) => ug.groups).filter(Boolean));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (!category) return;
    setIsLoading(true);
    try {
      const name = formData.get('name') as string;
      const description = (formData.get('description') as string) || null;
      const icon = (formData.get('icon') as string) || 'folder';
      const color = (formData.get('color') as string) || '#6B7280';
      const type = (formData.get('type') as string) || 'Pengeluaran';
      const groupId = formData.get('groupId') as string;

      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          icon,
          color,
          type,
          group_id: groupId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok)
        throw new Error(data.error || 'Gagal memperbarui kategori');

      toast({
        title: 'Kategori diperbarui',
        description: 'Perubahan telah disimpan.',
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      toast({
        title: 'Gagal memperbarui kategori',
        description: e?.message || 'Error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Kategori</DialogTitle>
          <DialogDescription>Perbarui informasi kategori.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                name="name"
                defaultValue={category.name}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={category.description || ''}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipe</Label>
              <Select
                name="type"
                defaultValue={category.type || 'Pengeluaran'}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pemasukan">Pemasukan</SelectItem>
                  <SelectItem value="Pengeluaran">Pengeluaran</SelectItem>
                  <SelectItem value="Dompet">Dompet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="groupId">Grup</Label>
              <Select name="groupId" defaultValue={category.group_id} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih grup" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="icon">Ikon</Label>
                <Select name="icon" defaultValue={category.icon || 'folder'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih ikon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="folder">📁 Folder</SelectItem>
                    <SelectItem value="utensils">🍽️ Makanan</SelectItem>
                    <SelectItem value="zap">⚡ Listrik</SelectItem>
                    <SelectItem value="graduation-cap">
                      🎓 Pendidikan
                    </SelectItem>
                    <SelectItem value="car">🚗 Transport</SelectItem>
                    <SelectItem value="heart">❤️ Kesehatan</SelectItem>
                    <SelectItem value="gamepad-2">🎮 Hiburan</SelectItem>
                    <SelectItem value="shopping-bag">🛍️ Belanja</SelectItem>
                    <SelectItem value="home">🏠 Rumah</SelectItem>
                    <SelectItem value="wifi">📶 Internet</SelectItem>
                    <SelectItem value="phone">📱 Telepon</SelectItem>
                    <SelectItem value="gift">🎁 Hadiah</SelectItem>
                    <SelectItem value="coffee">☕ Minuman</SelectItem>
                    <SelectItem value="book">📚 Buku</SelectItem>
                    <SelectItem value="plane">✈️ Travel</SelectItem>
                    <SelectItem value="dumbbell">💪 Olahraga</SelectItem>
                    <SelectItem value="music">🎵 Musik</SelectItem>
                    <SelectItem value="camera">📷 Foto</SelectItem>
                    <SelectItem value="briefcase">💼 Kerja</SelectItem>
                    <SelectItem value="more-horizontal">📝 Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Warna</Label>
                <Input
                  id="color"
                  name="color"
                  type="color"
                  defaultValue={category.color || '#6B7280'}
                />
              </div>
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
