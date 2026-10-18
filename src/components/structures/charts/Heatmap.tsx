'use client'

import { useState } from 'react'

import { CHART } from '@/declarations/ui/variants'

export interface HeatRow {
  key: string
  name: string
  counts: number[]
}

export interface HeatmapProps {
  rows: HeatRow[]
  // Label of each column
  columns: string[]
  title: string
  unit: string
  // Said before any hover
  hint: string
}

/**
 * Who acted when: one row per moderator, one cell per slice
 * @param {HeatRow[]} rows - Moderators
 * @param {string[]} columns - Slice labels
 * @param {string} title - Spoken name
 * @param {string} unit - Count word
 * @param {string} hint - Line before any hover
 * @return {JSX.Element}
 */

export const Heatmap = ({ rows, columns, title, unit, hint }: HeatmapProps) => {
  const [active, setActive] = useState<string | null>(null)
  const peak = Math.max(1, ...rows.flatMap((row) => row.counts))

  return (
    <div className={CHART.root}>
      <p className={CHART.readout} aria-live="polite">
        <span className={CHART.readoutMuted}>
          {active ?? hint.replace('{count}', String(peak))}
        </span>
      </p>
      <div className={CHART.heat} role="img" aria-label={title}>
        {rows.map((row) => (
          <div key={row.key} className={CHART.heatRow}>
            <span className={CHART.heatName}>{row.name}</span>
            <div className={CHART.heatCells} onPointerLeave={() => setActive(null)}>
              {row.counts.map((count, index) => (
                <span
                  key={index}
                  className={CHART.heatCell}
                  style={{
                    backgroundColor:
                      count === 0
                        ? 'var(--color-border)'
                        : `color-mix(in oklab, var(--color-brand-600) ${20 + (count / peak) * 80}%, transparent)`,
                  }}
                  onPointerEnter={() =>
                    setActive(`${row.name} · ${columns[index]} · ${count} ${unit}`)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={CHART.axis}>
        <span>{columns[0]}</span>
        <span>{columns.at(-1)}</span>
      </div>
    </div>
  )
}
