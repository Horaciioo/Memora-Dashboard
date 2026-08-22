import type { ReactNode } from 'react'
import { cn } from '@/utils/classnames'
import { TABLE_STYLES } from '@/declarations/ui/variants'
import { SkeletonList } from '@/components/elements/feedback/Skeleton'
import { EmptyState, type EmptyStateProps } from '@/components/elements/feedback/EmptyState'

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  isLoading?: boolean
  // Shown in place of the body once rows is empty and isLoading is false
  emptyState?: EmptyStateProps
  className?: string
}

/**
 * Table that substitutes its body with row skeletons while isLoading is true, and with
 * emptyState once rows is empty
 * @param {DataTableColumn<T>[]} columns - Column definitions rendered in order
 * @param {T[]} rows - Data rows, ignored while isLoading is true
 * @param {(row: T) => string} getRowId - Stable key extractor for each row
 * @param {boolean} [isLoading] - Swaps the body for row skeletons when true
 * @param {EmptyStateProps} [emptyState] - Swaps the body for this once rows is empty
 * @param {string} [className] - Extra classes merged onto the wrapper
 * @return {JSX.Element}
 */

export const DataTable = <T,>({
  columns,
  rows,
  getRowId,
  isLoading,
  emptyState,
  className,
}: DataTableProps<T>) => (
  <div className={cn(TABLE_STYLES.wrapper, className)}>
    <table className={TABLE_STYLES.table}>
      <thead>
        <tr className={TABLE_STYLES.headRow}>
          {columns.map((column) => (
            <th key={column.key} className={TABLE_STYLES.headCell}>
              {column.header}
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
        ) : rows.length === 0 && emptyState ? (
          <tr>
            <td colSpan={columns.length} className={TABLE_STYLES.cell}>
              <EmptyState {...emptyState} />
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={getRowId(row)} className={TABLE_STYLES.row}>
              {columns.map((column) => (
                <td key={column.key} className={TABLE_STYLES.cell}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)
