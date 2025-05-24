import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: string | number): string {
  const num = typeof value === 'string' ? value : value.toString();
  // Add spaces every 3 digits from right to left
  return num.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
}
