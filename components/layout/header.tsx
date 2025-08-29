'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { signOut, getCurrentUser } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import { useDarkMode } from '@/lib/dark-mode';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  actions?: React.ReactNode;
}

export function Header({
  title = 'Dashboard',
  subtitle = 'Ringkasan keuangan Anda',
  showSearch = false,
  searchPlaceholder = 'Cari...',
  onSearch,
  actions,
}: HeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [searchValue, setSearchValue] = useState('');
  const { isDarkMode, toggleDarkMode } = useDarkMode();

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
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error: any) {
      toast({
        title: 'Gagal keluar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Title and Search */}
          <div className="flex items-center gap-6 flex-1">
            {/* Page Title */}
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Search Bar */}
            {showSearch && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-10 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl transition-all duration-200"
                />
              </div>
            )}
          </div>

          {/* Right Section - Actions and User Menu */}
          <div className="flex items-center gap-3">
            {/* Custom Actions */}
            {actions && (
              <div className="hidden sm:flex items-center gap-2">{actions}</div>
            )}

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className="h-10 w-10 rounded-xl border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              title={
                isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 relative"
            >
              <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-3 rounded-xl border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                        {(user?.user_metadata?.full_name || user?.email || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.user_metadata?.full_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <DropdownMenuLabel className="text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                        {(user?.user_metadata?.full_name || user?.email || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.user_metadata?.full_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
