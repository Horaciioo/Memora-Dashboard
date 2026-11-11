'use client'

import { useState } from 'react'
import type { FilterDefinition } from '@/components/structures/data/FilterBar'
import {
  ManagementBoard,
  type BoardGroup,
  type BoardRow,
} from '@/composites/management/ManagementBoard'
import { memberFacets } from '@/core/lib/management/board'
import { MANAGEMENT_BOARD_COPY } from '@/declarations/management/copy'
import { MANAGEMENT_BOARD } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import type { ManagedBirthday } from '@/types/management'
import {
  birthdayMonth,
  daysUntilBirthday,
  formatBirthday,
  monthOptions,
} from '@/utils/format/birthdays'

const COPY = MANAGEMENT_BOARD_COPY.birthdays

// Boxes in reading order
const GROUPS: BoardGroup[] = [
  { key: 'thisMonth', label: COPY.groupThisMonth },
  { key: 'nextMonth', label: COPY.groupNextMonth },
  { key: 'later', label: COPY.groupLater },
]

const FILTERS: FilterDefinition[] = [
  { name: 'month', label: COPY.month, allLabel: COPY.allMonths, options: monthOptions() },
]

/**
 * Words telling how far a birthday is
 * @param {number} days - Days left
 * @return {string} - Countdown
 */

const countdown = (days: number): string =>
  days === 0 ? COPY.today : days === 1 ? COPY.tomorrow : COPY.inDays.replace('{days}', String(days))

export interface BirthdaysBoardProps {
  birthdays: ManagedBirthday[]
  youtubers: FieldOption[]
}

/**
 * Birthdays of the whole team, the next one first
 * @param {ManagedBirthday[]} birthdays - Dates read server-side
 * @param {FieldOption[]} youtubers - Creator filter options
 * @return {JSX.Element}
 */

export const BirthdaysBoard = ({ birthdays, youtubers }: BirthdaysBoardProps) => {
  // Read once, the countdowns stay steady between renders
  const [today] = useState(() => new Date())

  const rows: BoardRow[] = birthdays
    .map((entry) => ({ entry, days: daysUntilBirthday(entry.birthday, today) }))
    .sort((left, right) => left.days - right.days)
    .map(({ entry, days }) => {
      const gap = (birthdayMonth(entry.birthday) - today.getMonth() + 12) % 12

      return {
        id: entry.id,
        member: entry.member,
        group: gap === 0 ? 'thisMonth' : gap === 1 ? 'nextMonth' : 'later',
        haystack: [formatBirthday(entry.birthday)],
        facets: {
          ...memberFacets(entry.member),
          month: [String(birthdayMonth(entry.birthday))],
        },
        body: (
          <>
            <span className={MANAGEMENT_BOARD.title}>{formatBirthday(entry.birthday)}</span>
            <span className={MANAGEMENT_BOARD.detail}>{countdown(days)}</span>
          </>
        ),
      }
    })

  return (
    <ManagementBoard
      rows={rows}
      groups={GROUPS}
      youtubers={youtubers}
      filters={FILTERS}
      searchLabel={COPY.search}
      figure="members"
      emptyTitle={COPY.emptyTitle}
      emptyDescription={COPY.emptyDescription}
    />
  )
}
