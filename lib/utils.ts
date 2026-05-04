import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function formatFecha(dateStr: string, locale = 'es-CO'): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function colorTokenToHex(token: string): string {
  const map: Record<string, string> = {
    blue: '#3B82F6',
    purple: '#8B5CF6',
    cyan: '#06B6D4',
    violet: '#A855F7',
    slate: '#94A3B8',
    rose: '#F43F5E',
  }
  return map[token] ?? '#3B82F6'
}
