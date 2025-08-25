'use client';

import { useState, useEffect } from 'react';
import { User, Bell, Shield, Database, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MainLayout } from '@/components/layout/main-layout';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { exportToExcel } from '@/lib/utils';
import * as XLSX from 'xlsx';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;

      setUser(currentUser);

      const userProfile = await getUserProfile(currentUser.id);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (formData: FormData) => {
    setIsSaving(true);
    try {
      const fullName = formData.get('fullName') as string;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profil berhasil diperbarui',
        description: 'Perubahan telah disimpan.',
      });

      // Reload profile data
      await loadUserData();
    } catch (error: any) {
      toast({
        title: 'Gagal memperbarui profil',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMonthSetting = async (formData: FormData) => {
    setIsSaving(true);
    try {
      const monthStartDay = Number.parseInt(
        formData.get('monthStartDay') as string
      );

      const { error } = await supabase
        .from('profiles')
        .update({
          month_start_day: monthStartDay,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Pengaturan bulan berhasil diperbarui',
        description:
          'Perubahan akan diterapkan pada filter bulan di Dashboard dan Keuangan.',
      });

      // Reload profile data
      await loadUserData();
    } catch (error: any) {
      toast({
        title: 'Gagal memperbarui pengaturan bulan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportAllData = async () => {
    setIsExporting(true);
    try {
      if (!user) return;

      // Get user's groups
      const { data: userGroups, error: ugErr } = await supabase
        .from('user_groups')
        .select('group_id')
        .eq('user_id', user.id);
      if (ugErr) throw ugErr;

      const groupIds = userGroups?.map((ug) => ug.group_id) || [];

      // Fetch expenses data
      const { data: expenses } = await supabase
        .from('expenses')
        .select(
          `
          title,
          description,
          amount,
          expense_date,
          created_at,
          categories(name),
          groups(name)
        `
        )
        .in('group_id', groupIds)
        .order('expense_date', { ascending: false });

      // Fetch income data (handle case where table might not exist)
      let income: any[] = [];
      try {
        const { data: incomeData } = await supabase
          .from('budgets')
          .select(
            `
            title,
            title,
            amount,
            start_date,
            end_date,
            created_at,
            created_by,
            categories(name),
            groups(name)
          `
          )
          .in('group_id', groupIds)
          .order('start_date', { ascending: false });
        income = incomeData || [];
      } catch (incomeError) {
        // Income table doesn't exist, use empty array
        console.log('Income table not available:', incomeError);
        income = [];
      }

      // Fetch other data
      const [{ data: categories }, { data: groups }, { data: profiles }] =
        await Promise.all([
          // Categories
          supabase
            .from('categories')
            .select(
              `
            name,
            description,
            type,
            icon,
            color,
            created_at,
            groups(name)
          `
            )
            .in('group_id', groupIds)
            .order('created_at', { ascending: false }),

          // Groups
          supabase
            .from('groups')
            .select(
              `
            name,
            description,
            created_at,
            profiles!groups_created_by_fkey(full_name)
          `
            )
            .in('id', groupIds)
            .order('created_at', { ascending: false }),

          // User profiles in groups
          supabase
            .from('user_groups')
            .select(
              `
            role,
            joined_at,
            groups(name),
            profiles(full_name, email)
          `
            )
            .in('group_id', groupIds)
            .order('joined_at', { ascending: false }),
        ]);

      // Prepare data for Excel
      const expensesData = (expenses || []).map((exp: any) => ({
        Tipe: 'Pengeluaran',
        Judul: exp.title,
        Deskripsi: exp.description || '',
        Jumlah: exp.amount,
        Tanggal: exp.expense_date,
        Kategori: exp.categories?.name || 'Lainnya',
        Grup: exp.groups?.name || '',
        Dibuat: exp.created_at,
        SortDate: exp.expense_date,
      }));

      const incomeData = (income || []).map((inc: any) => ({
        Tipe: 'Pemasukan',
        Judul: inc.title,
        Deskripsi: inc.title || '',
        Jumlah: inc.amount,
        Tanggal: inc.start_date,
        Kategori: inc.categories?.name || 'Lainnya',
        Grup: inc.groups?.name || '',
        Dibuat: inc.created_at,
        'Dibuat Oleh': inc.created_by,
        SortDate: inc.start_date,
      }));

      // Combine and sort by date (newest first)
      const transactionsData = [...expensesData, ...incomeData].sort((a, b) => {
        // Sort by date first (newest first)
        const dateComparison =
          new Date(b.SortDate).getTime() - new Date(a.SortDate).getTime();
        if (dateComparison !== 0) return dateComparison;

        // If same date, sort by creation time (newest first)
        return new Date(b.Dibuat).getTime() - new Date(a.Dibuat).getTime();
      });

      // Remove the sort field from final data
      const finalTransactionsData = transactionsData.map(
        ({ SortDate, ...rest }) => rest
      );

      const categoriesData = (categories || []).map((cat: any) => ({
        Nama: cat.name,
        Deskripsi: cat.description || '',
        Tipe: cat.type,
        Icon: cat.icon,
        Warna: cat.color,
        Grup: cat.groups?.name || '',
        Dibuat: cat.created_at,
      }));

      const groupsData = (groups || []).map((group: any) => ({
        Nama: group.name,
        Deskripsi: group.description || '',
        'Dibuat Oleh': group.profiles?.full_name || '',
        Dibuat: group.created_at,
      }));

      const profilesData = (profiles || []).map((profile: any) => ({
        Nama: profile.profiles?.full_name || '',
        Email: profile.profiles?.email || '',
        Role: profile.role,
        Grup: profile.groups?.name || '',
        Bergabung: profile.joined_at,
      }));

      // Create Excel file with multiple sheets
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Transactions (Income & Expenses)
      const transactionsSheet = XLSX.utils.json_to_sheet(finalTransactionsData);
      XLSX.utils.book_append_sheet(
        workbook,
        transactionsSheet,
        'Pemasukan & Pengeluaran'
      );

      // Sheet 2: Categories
      const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
      XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Kategori');

      // Sheet 3: Groups
      const groupsSheet = XLSX.utils.json_to_sheet(groupsData);
      XLSX.utils.book_append_sheet(workbook, groupsSheet, 'Grup');

      // Sheet 4: Profiles
      const profilesSheet = XLSX.utils.json_to_sheet(profilesData);
      XLSX.utils.book_append_sheet(workbook, profilesSheet, 'Profil');

      // Export file
      const fileName = `Data_Keuangan_${
        new Date().toISOString().split('T')[0]
      }`;
      XLSX.writeFile(workbook, `${fileName}.xlsx`);

      toast({
        title: 'Data berhasil diexport',
        description: `File ${fileName}.xlsx telah diunduh.`,
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Gagal mengexport data',
        description: error.message || 'Terjadi kesalahan saat mengexport data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
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
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-600">Kelola akun dan preferensi Anda</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profil</CardTitle>
            </div>
            <CardDescription>Informasi dasar akun Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  Email tidak dapat diubah
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  defaultValue={profile?.full_name || ''}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Month Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Pengaturan Bulan</CardTitle>
            </div>
            <CardDescription>
              Atur tanggal mulai bulan untuk filter di Dashboard dan Keuangan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleUpdateMonthSetting} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="monthStartDay">Bulan Dimulai Tanggal</Label>
                <Select
                  name="monthStartDay"
                  defaultValue={String(profile?.month_start_day || 1)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tanggal" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        Tanggal {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                  <p className="font-medium mb-1">Contoh:</p>
                  <p>
                    • Jika diset tanggal 25: "Agustus 2025" akan dimulai dari 25
                    Juli 2025 - 24 Agustus 2025
                  </p>
                  <p>
                    • Jika diset tanggal 1: "Agustus 2025" akan dimulai dari 1
                    Agustus 2025 - 31 Agustus 2025 (normal)
                  </p>
                </div>
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifikasi</CardTitle>
            </div>
            <CardDescription>Atur preferensi notifikasi Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifikasi Email</p>
                <p className="text-sm text-gray-600">
                  Terima notifikasi melalui email
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Pengingat Budget</p>
                <p className="text-sm text-gray-600">
                  Dapatkan pengingat ketika mendekati batas budget
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Laporan Bulanan</p>
                <p className="text-sm text-gray-600">
                  Terima ringkasan keuangan setiap bulan
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Keamanan</CardTitle>
            </div>
            <CardDescription>Pengaturan keamanan akun</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full bg-transparent">
              Ubah Password
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Aktifkan 2FA
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Data</CardTitle>
            </div>
            <CardDescription>Kelola data aplikasi Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleExportAllData}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Mengexport...' : 'Export Semua Data'}
            </Button>
            <Button variant="destructive" className="w-full">
              Hapus Akun
            </Button>
            <p className="text-xs text-gray-500">
              Menghapus akun akan menghapus semua data Anda secara permanen
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
