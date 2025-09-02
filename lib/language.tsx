'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Translation dictionary
const translations = {
  id: {
    // Header
    dashboard: 'Dashboard',
    financial_summary: 'Ringkasan keuangan Anda',
    search: 'Cari...',
    profile: 'Profil',
    settings: 'Pengaturan',
    logout: 'Keluar',
    logout_success: 'Berhasil keluar',
    logout_goodbye: 'Sampai jumpa lagi!',
    logout_error: 'Gagal keluar',

    // Sidebar
    categories: 'Kategori',
    manage_categories: 'Kelola kategori transaksi',
    finance: 'Keuangan',
    transactions_reports: 'Transaksi dan laporan',
    groups: 'Grup',
    manage_groups: 'Kelola grup keuangan',
    app_config: 'Konfigurasi aplikasi',

    // Profile Modal
    user_profile: 'Profil Pengguna',
    profile_description: 'Kelola informasi profil dan pengaturan akun Anda',
    full_name: 'Nama Lengkap',
    phone: 'Nomor Telepon',
    address: 'Alamat',
    bio: 'Bio',
    enter_full_name: 'Masukkan nama lengkap',
    enter_phone: 'Masukkan nomor telepon',
    enter_address: 'Masukkan alamat lengkap',
    enter_bio: 'Ceritakan sedikit tentang diri Anda',
    not_filled: 'Belum diisi',
    edit: 'Edit',
    cancel: 'Batal',
    save_changes: 'Simpan Perubahan',
    saving: 'Menyimpan...',
    profile_updated: 'Profil berhasil diperbarui',
    changes_saved: 'Perubahan telah disimpan.',
    profile_update_error: 'Gagal memperbarui profil',
    joined_since: 'Bergabung sejak',
    account_info: 'Informasi Akun',
    user_id: 'ID Pengguna',
    verification_status: 'Status Verifikasi',
    verified: 'Terverifikasi',
    not_verified: 'Belum Verifikasi',
    last_login: 'Terakhir Login',
    never_logged_in: 'Belum pernah login',

    // Footer
    footer_text:
      '© 2024 Financial App. Dibuat dengan ❤️ untuk mengelola keuangan Anda.',

    // Common
    close: 'Tutup',
    loading: 'Memuat...',
    error: 'Error',
    success: 'Berhasil',
    warning: 'Peringatan',
    info: 'Informasi',
  },
  en: {
    // Header
    dashboard: 'Dashboard',
    financial_summary: 'Your Financial Summary',
    search: 'Search...',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    logout_success: 'Successfully logged out',
    logout_goodbye: 'See you again!',
    logout_error: 'Failed to logout',

    // Sidebar
    categories: 'Categories',
    manage_categories: 'Manage transaction categories',
    finance: 'Finance',
    transactions_reports: 'Transactions and reports',
    groups: 'Groups',
    manage_groups: 'Manage financial groups',
    app_config: 'Application configuration',

    // Profile Modal
    user_profile: 'User Profile',
    profile_description: 'Manage your profile information and account settings',
    full_name: 'Full Name',
    phone: 'Phone Number',
    address: 'Address',
    bio: 'Bio',
    enter_full_name: 'Enter full name',
    enter_phone: 'Enter phone number',
    enter_address: 'Enter complete address',
    enter_bio: 'Tell us a bit about yourself',
    not_filled: 'Not filled',
    edit: 'Edit',
    cancel: 'Cancel',
    save_changes: 'Save Changes',
    saving: 'Saving...',
    profile_updated: 'Profile updated successfully',
    changes_saved: 'Changes have been saved.',
    profile_update_error: 'Failed to update profile',
    joined_since: 'Joined since',
    account_info: 'Account Information',
    user_id: 'User ID',
    verification_status: 'Verification Status',
    verified: 'Verified',
    not_verified: 'Not Verified',
    last_login: 'Last Login',
    never_logged_in: 'Never logged in',

    // Footer
    footer_text: '© 2024 Financial App. Made with ❤️ to manage your finances.',

    // Common
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('id');

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'id' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleLanguageChange,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
