'use client'

import { useState } from 'react'

import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { MODERATION_KINDS } from '@/declarations/lives/moderation'
import { MODVIEW_USER_COPY } from '@/declarations/modview/copy'
import { MODVIEW_USER, MODVIEW_VERDICT } from '@/declarations/ui/variants'
import type { ViewerSanction } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { formatDuration, formatShortDay } from '@/utils/format/modview'

export interface ViewerSanctionListProps {
  // Null while loading
  history: ViewerSanction[] | null
}

/**
 * Sanctions of a viewer: date, kind, reason, the message on demand
 * @param {ViewerSanction[] | null} history - Sanctions, latest first
 * @return {JSX.Element}
 */

export const ViewerSanctionList = ({ history }: ViewerSanctionListProps) => {
  const [open, setOpen] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)

      return next
    })

  if (history === null) return <div className={MODVIEW_USER.listBody} aria-busy="true" />
  if (history.length === 0) {
    return (
      <div className={MODVIEW_USER.listBody}>
        <EmptyState compact figure="notes" title={MODVIEW_USER_COPY.sanctionsEmpty} />
      </div>
    )
  }

  return (
    <div className={MODVIEW_USER.listBody}>
      {history.map((row) => {
        const isOpen = open.has(row.id)

        return (
          <article key={row.id} className={MODVIEW_USER.sanction}>
            <div className={MODVIEW_USER.sanctionHead}>
              <span className={cn(MODVIEW_USER.sanctionTag, MODVIEW_VERDICT[row.kind]?.text)}>
                {[
                  MODERATION_KINDS[row.kind].label,
                  row.durationSeconds ? formatDuration(row.durationSeconds) : null,
                ]
                  .filter(Boolean)
                  .join(' ')}
              </span>
              <time className={MODVIEW_USER.sanctionDate} dateTime={row.occurredAt}>
                {formatShortDay(row.occurredAt)}
              </time>
            </div>
            {row.reason && <p className={MODVIEW_USER.sanctionReason}>{row.reason}</p>}
            {row.messageExcerpt && (
              <>
                <button
                  type="button"
                  className={MODVIEW_USER.sanctionLink}
                  aria-expanded={isOpen}
                  onClick={() => toggle(row.id)}
                >
                  {isOpen ? MODVIEW_USER_COPY.hideMessage : MODVIEW_USER_COPY.showMessage}
                </button>
                {isOpen && <p className={MODVIEW_USER.sanctionQuote}>{row.messageExcerpt}</p>}
              </>
            )}
          </article>
        )
      })}
    </div>
  )
}
