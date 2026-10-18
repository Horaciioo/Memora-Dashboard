import type { ReactNode } from 'react'
import { DETAIL_BLOCK } from '@/declarations/ui/blocks'
import { DATE_COPY } from '@/declarations/ui/dates'

/**
 * One labelled value of a detail sheet
 * @typedef {Object} DetailEntry
 * @property {string} label - Field label
 * @property {ReactNode} [value] - Field value
 * @property {boolean} [wide] - Runs edge to edge
 */

export interface DetailEntry {
  label: string
  value?: ReactNode
  wide?: boolean
}

export interface DetailGridProps {
  entries: DetailEntry[]
}

/**
 * Two column read-only sheet
 * @param {DetailEntry[]} entries - Labelled values in display order
 * @return {JSX.Element}
 */

export const DetailGrid = ({ entries }: DetailGridProps) => (
  <dl className={DETAIL_BLOCK.grid}>
    {entries.map((entry) => (
      <div key={entry.label} className={entry.wide ? DETAIL_BLOCK.entryWide : DETAIL_BLOCK.entry}>
        <dt className={DETAIL_BLOCK.label}>{entry.label}</dt>
        <dd className={entry.value ? DETAIL_BLOCK.value : DETAIL_BLOCK.empty}>
          {entry.value ?? DATE_COPY.none}
        </dd>
      </div>
    ))}
  </dl>
)
