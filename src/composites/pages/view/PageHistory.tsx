'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Drawer } from '@/components/structures/overlays/Drawer'
import { PageDocumentView } from '@/composites/pages/offline/PageDocumentView'
import { usePageHistory } from '@/core/hooks/data/pages/usePageHistory'
import { compareBlocks } from '@/core/lib/pages/compare'
import { PAGE_HISTORY_COPY } from '@/declarations/pages/copy'
import { PAGE_VIEW_STYLES } from '@/declarations/ui/variants'
import type { PageDocument, PageRevisionSummary } from '@/types/pages'
import { cn } from '@/utils/classnames'
import { formatDayTime } from '@/utils/format/dates'

export interface PageHistoryProps {
  pageId: string
  canRestore: boolean
  // Document on screen right now
  current: () => PageDocument | null
  onClose: () => void
}

/**
 * Date and author of a version
 * @param {PageRevisionSummary} version - Version
 * @return {string} - Line
 */

const bylineOf = (version: PageRevisionSummary): string =>
  (version.authorName ? PAGE_HISTORY_COPY.byline : PAGE_HISTORY_COPY.bylineAnonymous)
    .replace('{date}', formatDayTime(version.createdAt))
    .replace('{name}', version.authorName ?? '')

/**
 * Kept versions: read one, compare it with today, bring it back
 * @param {PageHistoryProps} props - Page, rights, current document
 * @return {JSX.Element}
 */

export const PageHistory = ({ pageId, canRestore, current, onClose }: PageHistoryProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { versions, selected, restore } = usePageHistory(pageId, selectedId)
  const now = current()
  const comparison = selected && now ? compareBlocks(selected.content, now) : null
  const isSame = comparison && !comparison.changed && !comparison.removed && !comparison.added

  return (
    <Drawer
      open
      isWide
      icon="history"
      title={PAGE_HISTORY_COPY.title}
      onClose={onClose}
      footer={
        canRestore &&
        selected && (
          <Button
            variant="primary"
            onClick={() => void restore(selected.id).then((isDone) => isDone && onClose())}
          >
            {PAGE_HISTORY_COPY.restore}
          </Button>
        )
      }
    >
      <div className={PAGE_VIEW_STYLES.history}>
        {versions === null && (
          <p className={PAGE_VIEW_STYLES.historyNote}>{PAGE_HISTORY_COPY.loading}</p>
        )}
        {versions?.length === 0 && (
          <p className={PAGE_VIEW_STYLES.historyNote}>{PAGE_HISTORY_COPY.empty}</p>
        )}

        <ul className={PAGE_VIEW_STYLES.historyList}>
          {versions?.map((version) => (
            <li key={version.id}>
              <button
                type="button"
                aria-pressed={version.id === selectedId}
                className={cn(
                  PAGE_VIEW_STYLES.historyItem,
                  version.id === selectedId && PAGE_VIEW_STYLES.historyItemActive
                )}
                onClick={() => setSelectedId(version.id)}
              >
                <span>{version.title}</span>
                <span className={PAGE_VIEW_STYLES.historyMeta}>{bylineOf(version)}</span>
              </button>
            </li>
          ))}
        </ul>

        {selected ? (
          <>
            {comparison && (
              <p className={PAGE_VIEW_STYLES.historyNote}>
                {isSame
                  ? PAGE_HISTORY_COPY.same
                  : PAGE_HISTORY_COPY.compare
                      .replace('{changed}', String(comparison.changed))
                      .replace('{removed}', String(comparison.removed))
                      .replace('{added}', String(comparison.added))}
              </p>
            )}
            <div className={PAGE_VIEW_STYLES.historyPreview}>
              <PageDocumentView content={selected.content} />
            </div>
          </>
        ) : (
          versions?.length !== 0 && (
            <p className={PAGE_VIEW_STYLES.historyNote}>{PAGE_HISTORY_COPY.pick}</p>
          )
        )}
      </div>
    </Drawer>
  )
}
