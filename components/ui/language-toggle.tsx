'use client';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LanguageToggle({
  className,
  size = 'md',
}: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  const handleToggle = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      className={cn(
        'font-mono font-bold transition-all duration-200 hover:scale-105',
        'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
        'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
        sizeClasses[size],
        className
      )}
      title={
        language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'
      }
    >
      <div className="flex items-center gap-1 text-xs md:text-sm">
        <span
          className={cn(
            'transition-all duration-200',
            language === 'id'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-gray-400 dark:text-gray-500'
          )}
        >
          IN
        </span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span
          className={cn(
            'transition-all duration-200',
            language === 'en'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-gray-400 dark:text-gray-500'
          )}
        >
          EN
        </span>
      </div>
    </Button>
  );
}
