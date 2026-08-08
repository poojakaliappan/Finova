import { Category } from '../types';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
  CAD: 'CA$',
  AUD: 'A$',
};

export function formatCurrency(amount: number, currencyCode: string = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '₹';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Clean integer/decimal formatting for Indian Rupee
  const formattedNumber = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });

  return `${isNegative ? '-' : ''}${symbol}${formattedNumber}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getCategoryColor(categoryId: string, categories: Category[]): string {
  const cat = categories.find((c) => c.id === categoryId);
  return cat ? cat.color : '#625981';
}

export function getCategoryName(categoryId: string, categories: Category[]): string {
  const cat = categories.find((c) => c.id === categoryId);
  return cat ? cat.name : 'General';
}
