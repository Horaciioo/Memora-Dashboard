'use client'

import type { FilterDefinition } from '@/components/structures/data/FilterBar'
import {
  ManagementBoard,
  type BoardGroup,
  type BoardRow,
} from '@/composites/management/ManagementBoard'
import { toOptions } from '@/core/lib/forms/options'
import { memberFacets } from '@/core/lib/management/board'
import { MANAGEMENT_BOARD_COPY } from '@/declarations/management/copy'
import { FUNCTION_KIND_REGISTRY } from '@/declarations/reference/registries'
import { MANAGEMENT_BOARD } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import type { ManagedFunctions } from '@/types/management'

const COPY = MANAGEMENT_BOARD_COPY.functions

// Members holding no function
const NONE = 'none'

const FILTERS: FilterDefinition[] = [
  {
    name: 'kind',
    label: COPY.kind,
    allLabel: COPY.allKinds,
    options: toOptions(FUNCTION_KIND_REGISTRY),
  },
]

export interface FunctionsBoardProps {
  data: ManagedFunctions
  youtubers: FieldOption[]
}

/**
 * Functions of the whole team, one box per function
 * @param {ManagedFunctions} data - Rows and functions read server-side
 * @param {FieldOption[]} youtubers - Creator filter options
 * @return {JSX.Element}
 */

export const FunctionsBoard = ({ data, youtubers }: FunctionsBoardProps) => {
  const groups: BoardGroup[] = [
    ...data.functions.map((entry) => ({ key: entry.id, label: entry.label })),
    { key: NONE, label: COPY.groupNone },
  ]

  const rows: BoardRow[] = data.rows.map((row) => ({
    id: row.id,
    member: row.member,
    group: row.functionId ?? NONE,
    haystack: [data.functions.find((entry) => entry.id === row.functionId)?.label ?? ''],
    facets: { ...memberFacets(row.member), kind: row.kind ? [row.kind] : [] },
    body: row.kind ? (
      <span className={MANAGEMENT_BOARD.detail}>{FUNCTION_KIND_REGISTRY.label(row.kind)}</span>
    ) : null,
  }))

  return (
    <ManagementBoard
      rows={rows}
      groups={groups}
      youtubers={youtubers}
      filters={FILTERS}
      searchLabel={COPY.search}
      figure="members"
      emptyTitle={COPY.emptyTitle}
      emptyDescription={COPY.emptyDescription}
    />
  )
}
