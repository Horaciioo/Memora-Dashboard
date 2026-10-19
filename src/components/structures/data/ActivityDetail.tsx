'use client'

import { Dotted } from '@/components/elements/display/Dotted'
import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { ACTIVITY_COPY } from '@/declarations/activity/copy'
import { JOURNAL_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import type { ChangeLine } from '@/core/services/system/changes'

// Lines shown before the dialog takes over
const INLINE_LINES = 3

// Message length that still fits the box
const INLINE_MESSAGE_LENGTH = 90

export interface ActivityDetailProps {
  entry: ActivityEntry
}

/**
 * One field's move
 * @param {ChangeLine} line - Field detail
 * @return {JSX.Element}
 */

const LineRow = ({ line }: { line: ChangeLine }) => (
  <p className={JOURNAL_STYLES.line}>
    <span className={JOURNAL_STYLES.lineLabel}>{line.label}</span>
    {line.before !== null && line.after !== null && (
      <>
        <span className={JOURNAL_STYLES.lineBefore}>{line.before}</span>
        <span aria-hidden="true">{ACTIVITY_COPY.arrow}</span>
        <span className={JOURNAL_STYLES.lineAfter}>{line.after}</span>
      </>
    )}
  </p>
)

/**
 * Compact box of what an entry did or hit
 * @param {ActivityEntry} entry - Journal entry
 * @return {JSX.Element | null}
 */

export const ActivityDetail = ({ entry }: ActivityDetailProps) => {
  const [isOpen, setOpen] = useState(false)
  const { error } = entry
  const lines = entry.change?.lines ?? []

  if (!error && lines.length === 0) return null

  const hiddenLines = Math.max(0, lines.length - INLINE_LINES)
  const isLong =
    hiddenLines > 0 ||
    (error !== null && (error.message.length > INLINE_MESSAGE_LENGTH || !!error.trace))

  return (
    <>
      <div className={cn(JOURNAL_STYLES.box, error && JOURNAL_STYLES.boxError)}>
        {error ? (
          <p className={JOURNAL_STYLES.errorMessage}>{error.message}</p>
        ) : (
          lines.slice(0, INLINE_LINES).map((line) => <LineRow key={line.label} line={line} />)
        )}
        {hiddenLines > 0 && (
          <span className={JOURNAL_STYLES.more}>
            {ACTIVITY_COPY.moreLines.replace('{count}', String(hiddenLines))}
          </span>
        )}
        {isLong && (
          <div>
            <Button variant="ghost" onClick={() => setOpen(true)}>
              {ACTIVITY_COPY.showDetail}
            </Button>
          </div>
        )}
      </div>
      <Dialog
        open={isOpen}
        onClose={() => setOpen(false)}
        size="md"
        title={ACTIVITY_COPY.detailTitle}
      >
        <div className={JOURNAL_STYLES.dialogBody}>
          {error ? (
            <>
              <p className={JOURNAL_STYLES.errorMessage}>{error.message}</p>
              <p className={JOURNAL_STYLES.lineLabel}>
                <Dotted items={[ACTIVITY_COPY.errorRoute, error.route]} />
              </p>
              {error.trace && <pre className={JOURNAL_STYLES.trace}>{error.trace}</pre>}
            </>
          ) : (
            lines.map((line) => <LineRow key={line.label} line={line} />)
          )}
        </div>
      </Dialog>
    </>
  )
}
