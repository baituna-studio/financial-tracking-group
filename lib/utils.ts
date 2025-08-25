import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function getMonthRange(year: number, month: number, monthStartDay = 1) {
  let startDate: Date;
  let endDate: Date;

  if (monthStartDay === 1) {
    // Default behavior - bulan kalender normal
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0); // Last day of the month
  } else {
    // Custom month start day
    // Bulan dimulai dari monthStartDay bulan ini
    startDate = new Date(year, month - 1, monthStartDay);

    // Bulan berakhir di (monthStartDay - 1) bulan berikutnya
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    endDate = new Date(nextYear, nextMonth - 1, monthStartDay - 1);
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
}

export function getCustomMonthLabel(
  year: number,
  month: number,
  monthStartDay = 1
): string {
  if (monthStartDay === 1) {
    // Default behavior
    return new Date(year, month - 1, 1).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
    });
  }

  // Custom month label
  const startDate = new Date(year, month - 1, monthStartDay);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = new Date(nextYear, nextMonth - 1, monthStartDay - 1);

  const startLabel = startDate.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
  const endLabel = endDate.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `${startLabel} - ${endLabel}`;
}

export function getCurrentMonthValue(monthStartDay = 1): string {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (monthStartDay === 1) {
    // Default behavior - use current month
    return `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  }

  // Custom month start day logic
  // If current day is >= monthStartDay, we're in the current month period
  // If current day is < monthStartDay, we're in the previous month period
  if (currentDay >= monthStartDay) {
    // We're in the current month period
    return `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  } else {
    // We're in the previous month period
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  }
}

export function exportToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
