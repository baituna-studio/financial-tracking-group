'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Wallet, Github, Twitter, Mail, Heart } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-black dark:via-gray-900 dark:to-black text-white">
      {/* Bottom Footer */}
      <div className="border-t border-gray-800 dark:border-gray-700 px-4 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-300 dark:text-gray-400 text-sm">
            <span>{t('footer_text')}</span>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>
    </footer>
  );
}
