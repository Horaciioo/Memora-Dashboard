'use client'

import { Button } from '@/components/elements/actions/Button'
import { PAGINATION_COPY } from '@/declarations/ui/copy/navigation'
import { PAGINATION_STYLES } from '@/declarations/ui/variants'

export interface PaginationProps {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

/**
 * Page switcher
 * @param {number} page - Current page
 * @param {number} totalPages - Page count
 * @param {number} total - Result count
 * @param {(page: number) => void} onPageChange - Page handler
 * @return {JSX.Element | null}
 */

export const Pagination = ({ page, totalPages, total, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null

  return (
    <nav className={PAGINATION_STYLES.bar} aria-label={PAGINATION_COPY.label}>
      <p className={PAGINATION_STYLES.meta}>{PAGINATION_COPY.summary(page, totalPages, total)}</p>
      <div className={PAGINATION_STYLES.actions}>
        <Button icon="back" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          {PAGINATION_COPY.previous}
        </Button>
        <Button
          iconAfter="forward"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {PAGINATION_COPY.next}
        </Button>
      </div>
    </nav>
  )
}
