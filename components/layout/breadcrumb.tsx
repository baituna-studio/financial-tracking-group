'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
  showHome?: boolean;
}

export function Breadcrumb({
  items,
  className,
  separator = <ChevronRight className="h-4 w-4 text-gray-400" />,
  showHome = true,
}: BreadcrumbProps) {
  const allItems = showHome
    ? [
        {
          label: 'Home',
          href: '/dashboard',
          icon: <Home className="h-4 w-4" />,
        },
        ...items,
      ]
    : items;

  return (
    <nav
      className={cn('flex items-center space-x-2 text-sm', className)}
      aria-label="Breadcrumb"
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        const isFirst = index === 0;

        return (
          <div key={index} className="flex items-center space-x-2">
            {/* Separator */}
            {!isFirst && <div className="flex items-center">{separator}</div>}

            {/* Breadcrumb Item */}
            <div className="flex items-center space-x-1">
              {item.icon && <span className="text-gray-500">{item.icon}</span>}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    'text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium',
                    'hover:underline decoration-blue-600 decoration-2 underline-offset-4'
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'font-semibold',
                    isLast ? 'text-gray-900' : 'text-gray-500'
                  )}
                >
                  {item.label}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// Compact breadcrumb for mobile
export function CompactBreadcrumb({
  items,
  className,
  maxItems = 3,
}: {
  items: BreadcrumbItem[];
  className?: string;
  maxItems?: number;
}) {
  const visibleItems = items.slice(-maxItems);
  const hasMore = items.length > maxItems;

  return (
    <nav
      className={cn('flex items-center space-x-1 text-xs', className)}
      aria-label="Breadcrumb"
    >
      {hasMore && (
        <>
          <span className="text-gray-400">...</span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
        </>
      )}

      {visibleItems.map((item, index) => {
        const isLast = index === visibleItems.length - 1;

        return (
          <div key={index} className="flex items-center space-x-1">
            {index > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200 truncate max-w-20"
                title={item.label}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'font-medium truncate max-w-24',
                  isLast ? 'text-gray-900' : 'text-gray-500'
                )}
                title={item.label}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Breadcrumb with actions
export function BreadcrumbWithActions({
  items,
  actions,
  className,
}: {
  items: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <Breadcrumb items={items} />
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
