'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FilterBar, type FilterDefinition } from '@/components/structures/data/FilterBar'
import { ManagementMember } from '@/composites/management/ManagementMember'
import { matchesBoard, YOUTUBER_FILTER, type BoardMatchable } from '@/core/lib/management/board'
import { MANAGEMENT_COPY } from '@/declarations/management/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import type { IllustrationName } from '@/declarations/ui/illustrations'
import { GROUP_STYLES, MANAGEMENT_BOARD } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import { cn } from '@/utils/classnames'
import { withToggled } from '@/utils/format/arrays'

/**
 * Box of the board
 * @typedef {Object} BoardGroup
 * @property {string} key - Group key rows point to
 * @property {string} label - Heading
 * @property {boolean} [collapsed] - Starts folded
 */

export interface BoardGroup {
  key: string
  label: string
  collapsed?: boolean
}

/**
 * Row of the board
 * @typedef {Object} BoardRow
 * @property {string} id - Row identifier
 * @property {string} group - Key of the box holding it
 * @property {ReactNode} body - Centre of the row
 * @property {ReactNode} [aside] - Status or actions on the right
 */

export interface BoardRow extends BoardMatchable {
  id: string
  group: string
  body: ReactNode
  aside?: ReactNode
}

export interface ManagementBoardProps {
  rows: BoardRow[]
  // Boxes in reading order, empty ones are left out
  groups: BoardGroup[]
  youtubers: FieldOption[]
  searchLabel: string
  // Dropdowns of the page, the creator one comes with the board
  filters?: FilterDefinition[]
  figure: IllustrationName
  emptyTitle: string
  emptyDescription: string
}

/**
 * Searchable, filterable rows sorted into boxes
 * @param {BoardRow[]} rows - Every row
 * @param {BoardGroup[]} groups - Boxes in reading order
 * @param {FieldOption[]} youtubers - Creator filter options
 * @param {string} searchLabel - Accessible label of the search field
 * @param {FilterDefinition[]} [filters] - Dropdowns of the page
 * @param {IllustrationName} figure - Figure of the empty board
 * @param {string} emptyTitle - Title of the empty board
 * @param {string} emptyDescription - Line of the empty board
 * @return {JSX.Element}
 */

export const ManagementBoard = ({
  rows,
  groups,
  youtubers,
  searchLabel,
  filters = [],
  figure,
  emptyTitle,
  emptyDescription,
}: ManagementBoardProps) => {
  const [search, setSearch] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  // Boxes flipped from their default
  const [flipped, setFlipped] = useState<Set<string>>(new Set())
  const ChevronIcon = ICONS.expand

  const isFiltered = search.trim().length > 0 || Object.values(values).some(Boolean)

  const definitions: FilterDefinition[] = [
    ...filters,
    ...(youtubers.length > 1
      ? [
          {
            name: YOUTUBER_FILTER,
            label: MANAGEMENT_COPY.youtuber,
            allLabel: MANAGEMENT_COPY.allYoutubers,
            options: youtubers,
            mark: 'avatar' as const,
          },
        ]
      : []),
  ]

  const visible = useMemo(
    () => rows.filter((row) => matchesBoard(row, search, values)),
    [rows, search, values]
  )

  const boxes = groups
    .map((group) => ({ ...group, rows: visible.filter((row) => row.group === group.key) }))
    .filter((box) => box.rows.length > 0)

  const reset = () => {
    setSearch('')
    setValues({})
  }

  return (
    <div className={MANAGEMENT_BOARD.page}>
      <FilterBar
        searchLabel={searchLabel}
        search={search}
        onSearch={setSearch}
        filters={definitions}
        values={values}
        onFilter={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
        onReset={reset}
        isFiltered={isFiltered}
      />

      {boxes.length === 0 ? (
        isFiltered ? (
          <EmptyState
            variant="filter"
            title={MANAGEMENT_COPY.filterTitle}
            description={MANAGEMENT_COPY.filterDescription}
            action={<Button onClick={reset}>{ACTION_COPY.clearFilter}</Button>}
          />
        ) : (
          <EmptyState figure={figure} title={emptyTitle} description={emptyDescription} />
        )
      ) : (
        <div className={MANAGEMENT_BOARD.groups}>
          {boxes.map((box) => {
            const isOpen = flipped.has(box.key) === Boolean(box.collapsed)

            return (
              <section key={box.key} className={GROUP_STYLES.section}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setFlipped((current) => withToggled(current, box.key))}
                  className={MANAGEMENT_BOARD.heading}
                >
                  {box.label}
                  <ChevronIcon
                    className={cn(GROUP_STYLES.chevron, isOpen && GROUP_STYLES.chevronOpen)}
                    aria-hidden="true"
                  />
                </button>
                <div className="fold" data-open={isOpen} inert={!isOpen}>
                  <div className={MANAGEMENT_BOARD.rows}>
                    {box.rows.map((row) => (
                      <article key={row.id} className={MANAGEMENT_BOARD.row}>
                        <ManagementMember member={row.member} />
                        <div className={MANAGEMENT_BOARD.body}>{row.body}</div>
                        {row.aside && <div className={MANAGEMENT_BOARD.aside}>{row.aside}</div>}
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
