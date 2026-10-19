'use client'

import { Dotted, DotMark } from '@/components/elements/display/Dotted'
import { useState } from 'react'

import { ChartLegend } from '@/components/structures/charts/ChartLegend'
import { niceCeiling } from '@/core/lib/ui/chartScale'
import { CHART } from '@/declarations/ui/variants'

export interface StackedColumn {
  id: string
  label: string
  segments: { value: number; colour: string; label: string }[]
}

export interface StackedBarsProps {
  columns: StackedColumn[]
  // Spoken name
  title: string
  // Words after a count
  unit: string
  // Left and right end of the axis
  axis: [string, string]
}

/**
 * Bars stacked by family, one per slice of the live
 * @param {StackedColumn[]} columns - Slices
 * @param {string} title - Spoken name
 * @param {string} unit - Count word
 * @param {[string, string]} axis - Axis ends
 * @return {JSX.Element}
 */

export const StackedBars = ({ columns, title, unit, axis }: StackedBarsProps) => {
  const [active, setActive] = useState<string | null>(null)
  const totals = columns.map((column) => column.segments.reduce((sum, s) => sum + s.value, 0))
  const ceiling = niceCeiling(Math.max(1, ...totals))
  const legend = new Map<string, string>()
  columns.forEach((column) =>
    column.segments.forEach((segment) => legend.set(segment.label, segment.colour))
  )
  const focus = columns.find((column) => column.id === active)

  return (
    <div className={CHART.root}>
      <p className={CHART.readout} aria-live="polite">
        {focus ? (
          <>
            {focus.label}
            <span className={CHART.readoutMuted}>
              <DotMark />
              <Dotted
                items={focus.segments
                  .filter((segment) => segment.value > 0)
                  .map((segment) => `${segment.value} ${segment.label.toLowerCase()}`)}
              />
            </span>
          </>
        ) : (
          <span
            className={CHART.readoutMuted}
          >{`${totals.reduce((a, b) => a + b, 0)} ${unit}`}</span>
        )}
      </p>
      <div className={CHART.plot} role="img" aria-label={title}>
        {[ceiling, ceiling / 2].map((tick) => (
          <div
            key={tick}
            className={CHART.grid}
            style={{ top: `${(1 - tick / ceiling) * 100}%` }}
            aria-hidden="true"
          >
            <span className={CHART.gridLabel}>{Math.round(tick * 10) / 10}</span>
          </div>
        ))}
        <div className={CHART.bars} onPointerLeave={() => setActive(null)}>
          {columns.map((column, index) => (
            <div
              key={column.id}
              className={CHART.barColumn}
              style={{ height: `${(totals[index]! / ceiling) * 100}%`, alignSelf: 'flex-end' }}
              onPointerEnter={() => setActive(column.id)}
            >
              {column.segments
                .filter((segment) => segment.value > 0)
                .map((segment) => (
                  <span
                    key={segment.label}
                    className={CHART.barSegment}
                    style={{
                      backgroundColor: segment.colour,
                      height: `${(segment.value / totals[index]!) * 100}%`,
                    }}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
      <div className={CHART.axis}>
        <span>{axis[0]}</span>
        <span>{axis[1]}</span>
      </div>
      <ChartLegend items={[...legend.entries()].map(([label, colour]) => ({ label, colour }))} />
    </div>
  )
}
