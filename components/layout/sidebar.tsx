'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Tags,
  Wallet,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signOut, getCurrentUser } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import { useDarkMode } from '@/lib/dark-mode';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Ringkasan keuangan Anda',
  },
  {
    name: 'Kategori',
    href: '/categories',
    icon: Tags,
    description: 'Kelola kategori transaksi',
  },
  {
    name: 'Keuangan',
    href: '/finance',
    icon: Wallet,
    description: 'Transaksi dan laporan',
  },
  {
    name: 'Grup',
    href: '/groups',
    icon: Users,
    description: 'Kelola grup keuangan',
  },
  {
    name: 'Pengaturan',
    href: '/settings',
    icon: Settings,
    description: 'Konfigurasi aplikasi',
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Berhasil keluar',
        description: 'Sampai jumpa lagi!',
      });

      // Reload page after successful logout
      setTimeout(() => {
        window.location.href = '/';
      }, 1000); // Give time for toast to show
    } catch (error: any) {
      toast({
        title: 'Gagal keluar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:bg-white/90 dark:bg-gray-900/90 lg:backdrop-blur-md lg:border-r lg:border-gray-200/50 dark:border-gray-700/50 lg:min-h-screen lg:shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center">
                  <Image
                    src="/favicon.svg"
                    alt="Financial App Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Financial App
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Kelola keuangan cerdas
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-8 space-y-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-700 dark:hover:text-blue-400 hover:shadow-md hover:transform hover:scale-102'
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <ChevronRight className="h-4 w-4 text-white/80" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'flex items-center gap-3 flex-1',
                      isActive
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-400'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div
                        className={cn(
                          'text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                          isActive
                            ? 'text-white/80'
                            : 'text-gray-500 dark:text-gray-400'
                        )}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-800 dark:to-gray-700/50">
            {user && (
              <div className="mb-4 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {(user.user_metadata?.full_name || user.email)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white/80 dark:bg-gray-800/80 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:border-red-300 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-300 rounded-xl transition-all duration-200"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
        <div className="flex justify-around items-center h-20 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 transform scale-110'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105'
                )}
              >
                <div
                  className={cn(
                    'p-2 rounded-xl mb-1 transition-all duration-200',
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Full Screen Menu */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transform transition-all duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
                <Image
                  src="/favicon.svg"
                  alt="Financial App Logo"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Financial App
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Menu Navigasi
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-8 space-y-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-4 py-4 text-base font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:text-blue-700 dark:hover:text-blue-400 hover:shadow-md'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className={cn(
                      'flex items-center gap-4 flex-1',
                      isActive
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-400'
                    )}
                  >
                    <div
                      className={cn(
                        'p-3 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      )}
                    >
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div
                        className={cn(
                          'text-sm opacity-80',
                          isActive
                            ? 'text-white/80'
                            : 'text-gray-500 dark:text-gray-400'
                        )}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80">
            {user && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {(user.user_metadata?.full_name || user.email)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:border-red-300 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-300 rounded-xl transition-all duration-200"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
