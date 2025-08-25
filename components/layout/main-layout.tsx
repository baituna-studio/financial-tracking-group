'use client';

import type React from 'react';
import { AuthGuard } from '../auth/auth-guard';
import { Sidebar } from './sidebar';
import { Toaster } from '@/components/ui/toaster';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex flex-col h-screen bg-gray-50 lg:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-auto lg:ml-2">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8 pb-20 lg:pb-8">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </AuthGuard>
  );
}
