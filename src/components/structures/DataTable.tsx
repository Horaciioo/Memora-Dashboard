'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/classnames'
import { TABLE_STYLES } from '@/declarations/ui/variants'
import { ICONS } from '@/declarations/ui/icons'
import { SkeletonList } from '@/components/elements/feedback/Skeleton'
import { EmptyState, type EmptyStateProps } from '@/components/elements/feedback/EmptyState'
import { useMenu, type MenuItem } from '@/managers/front-end'

/**
 * Column of a data table
 * @typedef {Object} DataTableColumn
 * @property {string} key - Column identifier
 * @property {string} header - Column header
 * @property {(row: T) => ReactNode} render - Cell renderer
 * @property {(row: T) => string | number} [sortValue] - Sort key, makes the column sortable
 * @property {string} [className] - Extra classes merged onto every cell
 */

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  className?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  isLoading?: boolean
  // Shown in place of the body once rows is empty and isLoading is false
  emptyState?: EmptyStateProps
  onRowOpen?: (row: T) => void
  // Entries of the right click menu of a row
  rowMenu?: (row: T) => MenuItem[]
  activeRowId?: string
  className?: string
}

/**
 * Table that substitutes its body with row skeletons while isLoading is true, with
 * emptyState once rows is empty, and answers sorting, opening and right click on a row
 * @param {DataTableColumn<T>[]} columns - Column definitions rendered in order
 * @param {T[]} rows - Data rows, ignored while isLoading is true
 * @param {(row: T) => string} getRowId - Stable key extractor for each row
 * @param {boolean} [isLoading] - Swaps the body for row skeletons when true
 * @param {EmptyStateProps} [emptyState] - Swaps the body for this once rows is empty
 * @param {(row: T) => void} [onRowOpen] - Called on click and on Enter
 * @param {(row: T) => MenuItem[]} [rowMenu] - Entries of the right click menu
 * @param {string} [activeRowId] - Row painted as selected
 * @param {string} [className] - Extra classes merged onto the wrapper
 * @return {JSX.Element}
 */

export const DataTable = <T,>({
  columns,
  rows,
  getRowId,
  isLoading,
  emptyState,
  onRowOpen,
  rowMenu,
  activeRowId,
  className,
}: DataTableProps<T>) => {
  const [sort, setSort] = useState<{ key: string; ascending: boolean } | null>(null)
  const { contextMenu } = useMenu()
  const SortIcon = ICONS.sort

  const sortedRows = useMemo(() => {
    if (!sort) return rows

    const column = columns.find((entry) => entry.key === sort.key)
    if (!column?.sortValue) return rows

    // Copy first, the caller keeps its own ordering
    const read = column.sortValue

    return [...rows].sort((left, right) => {
      const a = read(left)
      const b = read(right)
      const order = a === b ? 0 : a < b ? -1 : 1

      return sort.ascending ? order : -order
    })
  }, [rows, sort, columns])

  const toggleSort = (key: string) =>
    setSort((current) =>
      current?.key === key ? { key, ascending: !current.ascending } : { key, ascending: true }
    )

  // Every column past the first rides in a wrapped meta row on the mobile card
  const metaOf = (row: T) =>
    columns.slice(1).flatMap((column) => {
      const node = column.render(row)

      return node === null || node === undefined || node === false || node === ''
        ? []
        : [{ key: column.key, node }]
    })

  return (
    <div className={cn(TABLE_STYLES.wrapper, className)}>
      <div className={TABLE_STYLES.cards}>
        {isLoading ? (
          <SkeletonList rows={4} shape="row" />
        ) : sortedRows.length === 0 && emptyState ? (
          <EmptyState {...emptyState} />
        ) : (
          sortedRows.map((row) => {
            const id = getRowId(row)
            const head = columns[0]?.render(row)
            const meta = metaOf(row)

            const inner = (
              <>
                <div className={TABLE_STYLES.cardHead}>{head}</div>
                {meta.length > 0 && (
                  <div className={TABLE_STYLES.cardMeta}>
                    {meta.map((entry) => (
                      <span key={entry.key}>{entry.node}</span>
                    ))}
                  </div>
                )}
              </>
            )

            const cardClass = cn(
              TABLE_STYLES.card,
              onRowOpen && TABLE_STYLES.cardOpen,
              id === activeRowId && TABLE_STYLES.cardActive
            )

            return onRowOpen ? (
              <button
                key={id}
                type="button"
                onClick={() => onRowOpen(row)}
                onContextMenu={rowMenu ? contextMenu(rowMenu(row)) : undefined}
                className={cardClass}
              >
                {inner}
              </button>
            ) : (
              <div
                key={id}
                onContextMenu={rowMenu ? contextMenu(rowMenu(row)) : undefined}
                className={cardClass}
              >
                {inner}
              </div>
            )
          })
        )}
      </div>
      <table className={TABLE_STYLES.table}>
        <thead>
          <tr className={TABLE_STYLES.headRow}>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(TABLE_STYLES.headCell, column.className)}
                aria-sort={
                  sort?.key === column.key
                    ? sort.ascending
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
              >
                {column.sortValue ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className={TABLE_STYLES.sortable}
                  >
                    {column.header}
                    <SortIcon className="h-3 w-3 opacity-60" aria-hidden="true" />
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className={TABLE_STYLES.cell}>
                <SkeletonList rows={4} shape="row" />
              </td>
            </tr>
          ) : sortedRows.length === 0 && emptyState ? (
            <tr>
              <td colSpan={columns.length} className={TABLE_STYLES.cell}>
                <EmptyState {...emptyState} />
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => {
              const id = getRowId(row)

              return (
                <tr
                  key={id}
                  tabIndex={onRowOpen ? 0 : undefined}
                  onClick={onRowOpen ? () => onRowOpen(row) : undefined}
                  onKeyDown={
                    onRowOpen
                      ? (event) => {
                          if (event.key === 'Enter') onRowOpen(row)
                        }
                      : undefined
                  }
                  onContextMenu={rowMenu ? contextMenu(rowMenu(row)) : undefined}
                  className={cn(
                    TABLE_STYLES.row,
                    onRowOpen && 'cursor-pointer',
                    id === activeRowId && TABLE_STYLES.rowActive
                  )}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={cn(TABLE_STYLES.cell, column.className)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
