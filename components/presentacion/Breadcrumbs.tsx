import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mb-4 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[var(--color-text-secondary)] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--color-text-secondary)]">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
