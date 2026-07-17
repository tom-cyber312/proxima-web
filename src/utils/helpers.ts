import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  options: {
    currency?: string;
    symbol?: string;
    position?: 'before' | 'after';
    decimals?: number;
    thousandSep?: string;
    decimalSep?: string;
  } = {}
): string {
  const {
    symbol = '$',
    position = 'before',
    decimals = 2,
    thousandSep = '.',
    decimalSep = ',',
  } = options;

  const absAmount = Math.abs(amount);
  const formatted = absAmount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
  const [intPart, decPart] = formatted.split('.');
  const finalFormatted = decPart ? `${intPart}${decimalSep}${decPart}` : intPart;

  const sign = amount < 0 ? '-' : '';
  const symbolStr = position === 'before' ? `${symbol} ` : ` ${symbol}`;

  return `${sign}${position === 'before' ? symbolStr : ''}${finalFormatted}${position === 'after' ? symbolStr : ''}`;
}

export function formatNumber(
  num: number,
  options: { decimals?: number; thousandSep?: string; decimalSep?: string } = {}
): string {
  const { decimals = 0, thousandSep = '.', decimalSep = ',' } = options;
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep).replace('.', decimalSep);
}

export function formatDate(date: string | Date, format: string = 'DD/MM/YYYY'): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const shortMonth = d.toLocaleDateString('es-ES', { month: 'short' });
  const longMonth = d.toLocaleDateString('es-ES', { month: 'long' });

  return format
    .replace('YYYY', String(year))
    .replace('YY', String(year).slice(-2))
    .replace('MM', month)
    .replace('M', String(d.getMonth() + 1))
    .replace('DD', day)
    .replace('D', String(d.getDate()))
    .replace('MMM', shortMonth)
    .replace('MMMM', longMonth);
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  if (diff < 30) return `Hace ${Math.floor(diff / 7)} semana${Math.floor(diff / 7) > 1 ? 's' : ''}`;
  if (diff < 365) return `Hace ${Math.floor(diff / 30)} mes${Math.floor(diff / 30) > 1 ? 'es' : ''}`;
  return `Hace ${Math.floor(diff / 365)} año${Math.floor(diff / 365) > 1 ? 's' : ''}`;
}

export function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export function getDateRange(period: 'week' | 'month' | 'quarter' | 'year' | 'custom', customStart?: string, customEnd?: string): { start: string; end: string } {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (period) {
    case 'week':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      return {
        start: customStart || now.toISOString().split('T')[0],
        end: customEnd || now.toISOString().split('T')[0],
      };
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function getMonthName(month: number, short = false): string {
  const date = new Date(2000, month, 1);
  return date.toLocaleDateString('es-ES', { month: short ? 'short' : 'long' });
}

export function getWeekDays(startOfWeek: 0 | 1 = 0): string[] {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return startOfWeek === 1 ? days.slice(1).concat(days[0]) : days;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

export function throttle<T extends (...args: any[]) => any>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  };
}

export function downloadFile(data: string, filename: string, type = 'application/json') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseCSV(csv: string): string[][] {
  const lines = csv.trim().split('\n');
  return lines.map((line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  });
}

export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(',')
    ),
  ].join('\n');
  downloadFile(csv, filename, 'text/csv');
}

export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1f2937' : '#f9fafb';
}

export function getIconComponent(name: string) {
  const icons: Record<string, string> = {
    'briefcase': '💼',
    'trending-up': '📈',
    'plus-circle': '➕',
    'home': '🏠',
    'utensils': '🍽️',
    'car': '🚗',
    'heart-pulse': '💊',
    'film': '🎬',
    'shopping-bag': '🛍️',
    'graduation-cap': '🎓',
    'more-horizontal': '⋯',
    'salary': '💰',
    'investments': '📊',
    'food': '🍔',
    'transport': '🚌',
    'health': '🏥',
    'entertainment': '🎮',
    'shopping': '🛒',
    'education': '📚',
    'other': '📦',
  };
  return icons[name] || '📦';
}

export function getIconEmoji(name: string): string {
  const icons: Record<string, string> = {
    'briefcase': '💼',
    'trending-up': '📈',
    'plus-circle': '➕',
    'home': '🏠',
    'utensils': '🍽️',
    'car': '🚗',
    'heart-pulse': '💊',
    'film': '🎬',
    'shopping-bag': '🛍️',
    'graduation-cap': '🎓',
    'more-horizontal': '⋯',
    'salary': '💰',
    'investments': '📊',
    'food': '🍔',
    'transport': '🚌',
    'health': '🏥',
    'entertainment': '🎮',
    'shopping': '🛒',
    'education': '📚',
    'other': '📦',
  };
  return icons[name] || '📦';
}

export const ICONS = [
  'briefcase', 'trending-up', 'plus-circle', 'home', 'utensils', 'car',
  'heart-pulse', 'film', 'shopping-bag', 'graduation-cap', 'more-horizontal',
  'salary', 'investments', 'food', 'transport', 'health', 'entertainment',
  'shopping', 'education', 'other', 'gift', 'credit-card', 'wallet',
  'banknote', 'coins', 'piggy-bank', 'receipt', 'file-text', 'calendar',
  'clock', 'map-pin', 'phone', 'mail', 'globe', 'wifi', 'battery',
  'sun', 'moon', 'cloud', 'droplet', 'flame', 'leaf', 'flower', 'tree',
];

export const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#6b7280',
];

export function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function getRandomIcon(): string {
  return ICONS[Math.floor(Math.random() * ICONS.length)];
}