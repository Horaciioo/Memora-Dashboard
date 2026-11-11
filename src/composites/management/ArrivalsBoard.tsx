'use client'

import { useState } from 'react'
import { Status } from '@/components/elements/display/Status'
import type { FilterDefinition } from '@/components/structures/data/FilterBar'
import {
  ManagementBoard,
  type BoardGroup,
  type BoardRow,
} from '@/composites/management/ManagementBoard'
import { toOptions } from '@/core/lib/forms/options'
import { memberFacets } from '@/core/lib/management/board'
import { MEMBER_STATUS_REGISTRY, ROLE_REGISTRY } from '@/declarations/access/roles'
import { MANAGEMENT_SETTINGS } from '@/declarations/configurations/settings'
import { MANAGEMENT_BOARD_COPY } from '@/declarations/management/copy'
import { MANAGEMENT_BOARD } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import type { ManagedArrival } from '@/types/management'
import { formatDay } from '@/utils/format/time/dates'

const COPY = MANAGEMENT_BOARD_COPY.arrivals

const DAY_MS = 86_400_000

// Days in a month and in a year, for the wording only
const MONTH_DAYS = 30
const YEAR_DAYS = 365

// Boxes in reading order
const GROUPS: BoardGroup[] = [
  { key: 'newcomers', label: COPY.groupNewcomers },
  { key: 'year', label: COPY.groupYear },
  { key: 'veterans', label: COPY.groupVeterans },
]

const FILTERS: FilterDefinition[] = [
  {
    name: 'role',
    label: COPY.role,
    allLabel: COPY.allRoles,
    options: toOptions(ROLE_REGISTRY),
    mark: 'glyph',
  },
  {
    name: 'status',
    label: COPY.status,
    allLabel: COPY.allStatuses,
    options: toOptions(MEMBER_STATUS_REGISTRY),
    mark: 'dot',
  },
]

/**
 * Words telling how long a member has been here
 * @param {number} days - Days since the arrival
 * @return {string} - Tenure
 */

const tenure = (days: number): string =>
  days < 2 * MONTH_DAYS
    ? COPY.sinceDays.replace('{count}', String(days))
    : days < 2 * YEAR_DAYS
      ? COPY.sinceMonths.replace('{count}', String(Math.floor(days / MONTH_DAYS)))
      : COPY.sinceYears.replace('{count}', String(Math.floor(days / YEAR_DAYS)))

export interface ArrivalsBoardProps {
  arrivals: ManagedArrival[]
  youtubers: FieldOption[]
}

/**
 * Arrivals of the whole team, sorted by tenure
 * @param {ManagedArrival[]} arrivals - Members read server-side
 * @param {FieldOption[]} youtubers - Creator filter options
 * @return {JSX.Element}
 */

export const ArrivalsBoard = ({ arrivals, youtubers }: ArrivalsBoardProps) => {
  // Read once, the tenures stay steady between renders
  const [now] = useState(() => Date.now())

  const rows: BoardRow[] = arrivals.map((arrival) => {
    const days = Math.max(0, Math.floor((now - new Date(arrival.joinedAt).getTime()) / DAY_MS))

    return {
      id: arrival.id,
      member: arrival.member,
      group:
        days < MANAGEMENT_SETTINGS.newcomerDays
          ? 'newcomers'
          : days < MANAGEMENT_SETTINGS.veteranDays
            ? 'year'
            : 'veterans',
      haystack: [ROLE_REGISTRY.label(arrival.role), MEMBER_STATUS_REGISTRY.label(arrival.status)],
      facets: { ...memberFacets(arrival.member), role: [arrival.role], status: [arrival.status] },
      body: (
        <>
          <span className={MANAGEMENT_BOARD.title}>{formatDay(arrival.joinedAt)}</span>
          <span className={MANAGEMENT_BOARD.detail}>{tenure(days)}</span>
        </>
      ),
      aside: (
        <>
          <span className={MANAGEMENT_BOARD.detail}>{ROLE_REGISTRY.label(arrival.role)}</span>
          <Status
            label={MEMBER_STATUS_REGISTRY.label(arrival.status)}
            accent={MEMBER_STATUS_REGISTRY.get(arrival.status).accent}
          />
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
