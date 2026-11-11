'use client'

import { useState } from 'react'
import type { FilterDefinition } from '@/components/structures/data/FilterBar'
import {
  ManagementBoard,
  type BoardGroup,
  type BoardRow,
} from '@/composites/management/ManagementBoard'
import { memberFacets } from '@/core/lib/management/board'
import { MANAGEMENT_SETTINGS } from '@/declarations/configurations/settings'
import { MANAGEMENT_BOARD_COPY } from '@/declarations/management/copy'
import { MANAGEMENT_BOARD } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import type { ManagedNote } from '@/types/management'
import { formatDay } from '@/utils/format/time/dates'

const COPY = MANAGEMENT_BOARD_COPY.notes

const DAY_MS = 86_400_000

// Notes whose writer is gone
const NO_AUTHOR = 'none'

// Boxes in reading order
const GROUPS: BoardGroup[] = [
  { key: 'pinned', label: COPY.groupPinned },
  { key: 'recent', label: COPY.groupRecent },
  { key: 'older', label: COPY.groupOlder, collapsed: true },
]

export interface NotesBoardProps {
  notes: ManagedNote[]
  youtubers: FieldOption[]
}

/**
 * Private remarks of the whole team, pinned first
 * @param {ManagedNote[]} notes - Notes read server-side
 * @param {FieldOption[]} youtubers - Creator filter options
 * @return {JSX.Element}
 */

export const NotesBoard = ({ notes, youtubers }: NotesBoardProps) => {
  // Read once, the grouping stays steady between renders
  const [since] = useState(() => Date.now() - MANAGEMENT_SETTINGS.recentNoteDays * DAY_MS)

  const authors = new Map(
    notes.map((note) => [note.authorId ?? NO_AUTHOR, note.authorName ?? COPY.unsigned])
  )

  const filters: FilterDefinition[] = [
    {
      name: 'author',
      label: COPY.author,
      allLabel: COPY.allAuthors,
      options: [...authors].map(([value, label]) => ({ value, label })),
    },
  ]

  const rows: BoardRow[] = notes.map((note) => ({
    id: note.id,
    member: note.member,
    group: note.pinned
      ? 'pinned'
      : new Date(note.createdAt).getTime() >= since
        ? 'recent'
        : 'older',
    haystack: [note.body, note.authorName ?? ''],
    facets: { ...memberFacets(note.member), author: [note.authorId ?? NO_AUTHOR] },
    body: (
      <>
        <p className={MANAGEMENT_BOARD.clamp}>{note.body}</p>
        <span
          className={MANAGEMENT_BOARD.detail}
        >{`${note.authorName ?? COPY.unsigned}, ${formatDay(note.createdAt)}`}</span>
      </>
    ),
  }))

  return (
    <ManagementBoard
      rows={rows}
      groups={GROUPS}
      youtubers={youtubers}
      filters={filters}
      searchLabel={COPY.search}
      figure="notes"
      emptyTitle={COPY.emptyTitle}
      emptyDescription={COPY.emptyDescription}
    />
  )
}
