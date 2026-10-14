'use client'

import { useRouter } from 'next/navigation'

import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { KanbanBoard, type BoardColumn } from '@/components/structures/KanbanBoard'
import { Section } from '@/components/structures/Section'
import { BOARD_STYLES } from '@/declarations/ui/variants'
import {
  ANNOUNCEMENT_COPY,
  ANNOUNCEMENT_SOURCES,
  ANNOUNCEMENT_STATES,
} from '@/declarations/work/announcements'
import type { AnnouncementRow } from '@/types/work'

export interface AnnouncementsListProps {
  rows: AnnouncementRow[]
}

// One column per state
const COLUMNS: BoardColumn[] = (Object.keys(ANNOUNCEMENT_STATES) as AnnouncementRow['state'][]).map(
  (state) => ({ id: state, ...ANNOUNCEMENT_STATES[state] })
)

/**
 * Announcements as a board, a column per state, each card leading back to where it is edited
 * @param {AnnouncementRow[]} rows - Announcements, newest first
 * @return {JSX.Element}
 */

export const AnnouncementsList = ({ rows }: AnnouncementsListProps) => {
  const router = useRouter()
  const items = rows.map((row) => ({ ...row, columnId: row.state }))

  return (
    <Section bare>
      {rows.length === 0 ? (
        <EmptyState
          figure="meetings"
          title={ANNOUNCEMENT_COPY.emptyTitle}
          description={ANNOUNCEMENT_COPY.emptyDescription}
          action={null}
        />
      ) : (
        <KanbanBoard
          columns={COLUMNS}
          items={items}
          renderCard={(row) => (
            <>
              <p className={BOARD_STYLES.cardTitle}>{row.title}</p>
              <p className={BOARD_STYLES.cardOrigin}>
                {ANNOUNCEMENT_SOURCES[row.source].singular} - {row.origin}
              </p>
            </>
          )}
          onMove={() => undefined}
          onOpen={(row) => router.push(row.href)}
          addLabel=""
          canCreate={false}
          onCreate={() => undefined}
          canMove={false}
          tintByColumn
        />
      )}
    </Section>
  )
}
