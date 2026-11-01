'use client'

import { useState } from 'react'

import { EmptyState } from '@/components/elements/feedback/EmptyState'
import Link from '@/components/elements/navigation/AppLink'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { usePageActions, usePageTrash } from '@/core/hooks/data/pages'
import { ROUTES } from '@/declarations/navigation'
import { PAGES_COPY } from '@/declarations/pages/copy'
import { BUTTON_STYLES, PAGES_HOME_STYLES } from '@/declarations/ui/variants'
import type { TrashedPage } from '@/types/pages'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

export interface PageTrashProps {
  initial: TrashedPage[]
}

/**
 * Trashed pages with restore and erase
 * @param {TrashedPage[]} initial - Server rendered trash
 * @return {JSX.Element}
 */

export const PageTrash = ({ initial }: PageTrashProps) => {
  const pages = usePageTrash(initial)
  const { restore, purge } = usePageActions()
  const [purging, setPurging] = useState<string | null>(null)

  if (pages.length === 0) {
    return (
      <EmptyState
        title={PAGES_COPY.trashEmptyTitle}
        description={PAGES_COPY.trashEmptyLead}
        action={
          <Link href={ROUTES.pages} className={cn(BUTTON_STYLES.base, BUTTON_STYLES.secondary)}>
            {PAGES_COPY.backToPages}
          </Link>
        }
      />
    )
  }

  return (
    <>
      <ul className={cn(PAGES_HOME_STYLES.list, PAGES_HOME_STYLES.column)}>
        {pages.map((page) => (
          <li key={page.id} className={PAGES_HOME_STYLES.trashRow}>
            <Link href={ROUTES.page(page.id)} className={PAGES_HOME_STYLES.rowBody}>
              <span className={PAGES_HOME_STYLES.rowTitle}>
                {page.icon ? `${page.icon} ` : ''}
                {page.title || PAGES_COPY.untitled}
              </span>
              <span className={PAGES_HOME_STYLES.rowHint}>{PAGES_COPY.trashedOn.replace('{date}', formatDay(page.trashedAt))}</span>
            </Link>
            <button type="button" className={cn(BUTTON_STYLES.base, BUTTON_STYLES.ghost)} onClick={() => setPurging(page.id)}>
              {PAGES_COPY.trashPurge}
            </button>
            <button type="button" className={cn(BUTTON_STYLES.base, BUTTON_STYLES.secondary)} onClick={() => void restore(page.id)}>
              {PAGES_COPY.trashRestore}
            </button>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={purging !== null}
        title={PAGES_COPY.trashPurge}
        description={PAGES_COPY.trashPurgeConfirm}
        confirmLabel={PAGES_COPY.trashPurge}
        tone="danger"
        onCancel={() => setPurging(null)}
        onConfirm={() => {
          if (purging) void purge(purging)
          setPurging(null)
        }}
      />
    </>
  )
}
