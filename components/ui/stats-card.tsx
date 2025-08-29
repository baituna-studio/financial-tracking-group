'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: ReactNode;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  description,
  variant = 'default',
  size = 'md',
  className,
  onClick,
  loading = false,
}: StatsCardProps) {
  const variantClasses = {
    default:
      'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white',
    success:
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-900 dark:text-green-100',
    warning:
      'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100',
    danger:
      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-900 dark:text-red-100',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100',
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const getChangeIcon = () => {
    if (changeType === 'increase') {
      return (
        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
      );
    } else if (changeType === 'decrease') {
      return (
        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
      );
    }
    return <Minus className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
  };

  const getChangeColor = () => {
    if (changeType === 'increase') {
      return 'text-green-600 dark:text-green-400';
    } else if (changeType === 'decrease') {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  const getChangePrefix = () => {
    if (changeType === 'increase') {
      return '+';
    }
    return '';
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        'cursor-pointer',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-current to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3
            className={cn(
              'font-medium text-gray-600 dark:text-gray-400',
              size === 'sm'
                ? 'text-sm'
                : size === 'lg'
                ? 'text-lg'
                : 'text-base'
            )}
          >
            {title}
          </h3>
          {icon && (
            <div
              className={cn(
                'p-2 rounded-xl',
                size === 'sm' ? 'p-1.5' : size === 'lg' ? 'p-3' : 'p-2'
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
            </div>
          ) : (
            <div
              className={cn(
                'font-bold',
                size === 'sm'
                  ? 'text-2xl'
                  : size === 'lg'
                  ? 'text-4xl'
                  : 'text-3xl'
              )}
            >
              {value}
            </div>
          )}
        </div>

        {/* Change and Description */}
        <div className="flex items-center justify-between">
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                getChangeColor()
              )}
            >
              {getChangeIcon()}
              <span>
                {getChangePrefix()}
                {change}%
              </span>
            </div>
          )}

          {description && (
            <p
              className={cn(
                'text-gray-500 dark:text-gray-400',
                size === 'sm' ? 'text-xs' : 'text-sm'
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-gray-700/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
    </div>
  );
}

// Compact stats card for mobile
export function CompactStatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  className,
}: Omit<StatsCardProps, 'size' | 'description'>) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        'cursor-pointer',
        changeType === 'increase'
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
          : changeType === 'decrease'
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h4>
        {icon && (
          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
            {icon}
          </div>
        )}
      </div>

      <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>

      {change !== undefined && (
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-medium',
            changeType === 'increase'
              ? 'text-green-600 dark:text-green-400'
              : changeType === 'decrease'
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {changeType === 'increase' && <TrendingUp className="h-3 w-3" />}
          {changeType === 'decrease' && <TrendingDown className="h-3 w-3" />}
          {changeType === 'neutral' && <Minus className="h-3 w-3" />}
          <span>
            {changeType === 'increase' ? '+' : ''}
            {change}%
          </span>
        </div>
      )}
    </div>
  );
}

// Stats grid for responsive layouts
export function StatsGrid({
  children,
  cols = 4,
  gap = 'md',
  className,
}: {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div className={cn('grid', colsClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
}
