'use client'

import { useMemo, useState } from 'react'

import { Cell } from '@/composites/nexus/NexusOutput/Cell'
import { asRows } from '@/composites/nexus/NexusOutput/format'
import { columnsOfRows, sortRows } from '@/core/lib/nexus/terminal/sort'
import { NEXUS_TERMINAL_COPY } from '@/declarations/nexus/terminal'
import { NEXUS_STYLES } from '@/declarations/ui/variants'

/**
 * Rows with local sorting
 * @param {Object} props - Props
 * @param {unknown} props.value - Rows
 * @return {JSX.Element}
 */

export const TableOutput = ({ value }: { value: unknown }) => {
  const rows = useMemo(() => asRows(value), [value])
  const [column, setColumn] = useState<string | null>(null)
  const [isDescending, setDescending] = useState(false)
  const columns = useMemo(() => columnsOfRows(rows), [rows])
  const sorted = useMemo(() => sortRows(rows, column, isDescending), [rows, column, isDescending])

  if (rows.length === 0) return <p className={NEXUS_STYLES.empty}>{NEXUS_TERMINAL_COPY.empty}</p>

  const sortBy = (name: string) => {
    setDescending(column === name && !isDescending)
    setColumn(name)
  }

  return (
    <div className={NEXUS_STYLES.tableWrap}>
      <table className={NEXUS_STYLES.table}>
        <thead>
          <tr>
            {columns.map((name) => (
              <th
                key={name}
                scope="col"
                className={`${NEXUS_STYLES.th} ${NEXUS_STYLES.thSort}`}
                aria-sort={column === name ? (isDescending ? 'descending' : 'ascending') : undefined}
                onClick={() => sortBy(name)}
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, index) => (
            <tr key={index}>
              {columns.map((name) => (
                <td key={name} className={NEXUS_STYLES.td}>
                  <Cell value={row[name]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
