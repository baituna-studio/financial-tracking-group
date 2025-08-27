'use client';

import type React from 'react';
import { AuthGuard } from '../auth/auth-guard';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Footer } from './footer';
import { Toaster } from '@/components/ui/toaster';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  actions?: React.ReactNode;
}

export function MainLayout({
  children,
  title,
  subtitle,
  showSearch,
  searchPlaceholder,
  onSearch,
  actions,
}: MainLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 lg:flex-row">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <Sidebar />

        <div className="flex-1 flex flex-col lg:ml-0 relative">
          {/* Header */}
          <Header
            title={title}
            subtitle={subtitle}
            showSearch={showSearch}
            searchPlaceholder={searchPlaceholder}
            onSearch={onSearch}
            actions={actions}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 lg:p-8">{children}</div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <Toaster />
    </AuthGuard>
  );
}
