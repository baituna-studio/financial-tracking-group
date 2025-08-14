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
    // Bulan dimulai dari monthStartDay bulan sebelumnya
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    startDate = new Date(prevYear, prevMonth - 1, monthStartDay);

    // Bulan berakhir di (monthStartDay - 1) bulan ini
    endDate = new Date(year, month - 1, monthStartDay - 1);
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
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const startDate = new Date(prevYear, prevMonth - 1, monthStartDay);
  const endDate = new Date(year, month - 1, monthStartDay - 1);

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

export function exportToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
