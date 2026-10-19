'use client'

import { DotMark } from '@/components/elements/display/Dotted'
import { useId, useState } from 'react'

import { linePath, niceCeiling } from '@/core/lib/ui/chartScale'
import { CHART } from '@/declarations/ui/variants'

export interface AreaPoint {
  label: string
  value: number
}

export interface AreaChartProps {
  points: AreaPoint[]
  title: string
  // Word after the value
  unit: string
  colour: string
  axis: [string, string]
}

// Drawing box
const WIDTH = 100
const HEIGHT = 40

/**
 * One line over time, filled underneath
 * @param {AreaPoint[]} points - Values left to right
 * @param {string} title - Spoken name
 * @param {string} unit - Value word
 * @param {string} colour - Line colour
 * @param {[string, string]} axis - Axis ends
 * @return {JSX.Element}
 */

export const AreaChart = ({ points, title, unit, colour, axis }: AreaChartProps) => {
  const [active, setActive] = useState<number | null>(null)
  const gradient = useId()
  const values = points.map((point) => point.value)
  const ceiling = niceCeiling(Math.max(1, ...values))
  const line = linePath(values, ceiling, WIDTH, HEIGHT)
  const focus = active === null ? null : points[active]
  const share = (index: number) => (points.length > 1 ? index / (points.length - 1) : 0.5)

  return (
    <div className={CHART.root}>
      <p className={CHART.readout} aria-live="polite">
        {focus ? (
          <>
            {focus.label}
            <span className={CHART.readoutMuted}>
              <DotMark />
              {`${focus.value} ${unit}`}
            </span>
          </>
        ) : (
          <span className={CHART.readoutMuted}>{`${Math.max(0, ...values)} ${unit}`}</span>
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
            <span className={CHART.gridLabel}>{Math.round(tick)}</span>
          </div>
        ))}
        <svg
          className={CHART.svg}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* The fill fades out as it falls */}
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colour} stopOpacity="0.38" />
              <stop offset="100%" stopColor={colour} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`} fill={`url(#${gradient})`} />
          <path
            d={line}
            fill="none"
            stroke={colour}
            strokeWidth="2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {focus && active !== null && (
          <>
            <span className={CHART.cursor} style={{ left: `${share(active) * 100}%` }} />
            <span
              className={CHART.cursorDot}
              style={{
                left: `${share(active) * 100}%`,
                bottom: `${(focus.value / ceiling) * 100}%`,
                backgroundColor: colour,
              }}
            />
          </>
        )}
        <div className={CHART.hits} onPointerLeave={() => setActive(null)}>
          {points.map((_, index) => (
            <span key={index} className={CHART.hit} onPointerEnter={() => setActive(index)} />
          ))}
        </div>
      </div>
      <div className={CHART.axis}>
        <span>{axis[0]}</span>
        <span>{axis[1]}</span>
      </div>
    </div>
  )
}
