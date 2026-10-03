'use client'

import { useEffect, useState } from 'react'

import { CountUp } from '@/components/elements/display/CountUp'
import { LEGACY_COPY } from '@/declarations/academy/legacy/copy'
import { LEGACY_TRACK } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Geometry of the dial on its own canvas
const CENTER = 210
const RADIUS = 170
const WIDTH = 26

export interface LegacyGaugeProps {
  points: number
  max: number
  threshold: number
}

/**
 * Point on the half circle for a share of the dial, 0 at the left end and 1 at the right
 * @param {number} share - Share of the dial
 * @param {number} [radius] - Distance from the centre
 * @return {{ x: number, y: number }} - Position
 */

const pointAt = (share: number, radius = RADIUS) => {
  const angle = Math.PI - share * Math.PI

  return { x: CENTER + radius * Math.cos(angle), y: CENTER - radius * Math.sin(angle) }
}

/**
 * Half circle dial of the points earned, a tick on the points needed. The arc draws itself once
 * on arrival, the figure counts up with it
 * @param {number} points - Points earned
 * @param {number} max - Points available
 * @param {number} threshold - Points needed
 * @return {JSX.Element}
 */

export const LegacyGauge = ({ points, max, threshold }: LegacyGaugeProps) => {
  const [isDrawn, setDrawn] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  const start = pointAt(0)
  const end = pointAt(1)
  const share = max > 0 ? Math.min(points / max, 1) : 0
  const arc = `M${start.x} ${start.y} A${RADIUS} ${RADIUS} 0 0 1 ${end.x} ${end.y}`
  const tickShare = max > 0 ? threshold / max : 0
  const tickIn = pointAt(tickShare, RADIUS - 26)
  const tickOut = pointAt(tickShare, RADIUS + 22)
  const tickLabel = pointAt(tickShare, RADIUS + 46)
  const isReached = points >= threshold

  return (
    <svg
      viewBox="0 0 420 250"
      className={LEGACY_TRACK.gauge}
      role="img"
      aria-label={`${points} / ${max}`}
    >
      <path
        d={arc}
        fill="none"
        strokeWidth={WIDTH}
        strokeLinecap="round"
        className={LEGACY_TRACK.gaugeTrack}
      />
      <path
        d={arc}
        fill="none"
        pathLength={1}
        strokeWidth={WIDTH}
        strokeLinecap="round"
        strokeDasharray={`${isDrawn ? share : 0} 1`}
        className={cn(LEGACY_TRACK.gaugeFill, isReached && LEGACY_TRACK.gaugeFillDone)}
      />
      <line
        x1={tickIn.x}
        y1={tickIn.y}
        x2={tickOut.x}
        y2={tickOut.y}
        strokeWidth={3}
        strokeLinecap="round"
        className={LEGACY_TRACK.gaugeMark}
      />
      <text
        x={tickLabel.x - 6}
        y={tickLabel.y + 4}
        textAnchor="middle"
        className={LEGACY_TRACK.gaugeThreshold}
      >
        {threshold}
      </text>
      <text x={start.x} y={start.y + 34} textAnchor="middle" className={LEGACY_TRACK.gaugeNumber}>
        0
      </text>
      <text x={end.x} y={end.y + 34} textAnchor="middle" className={LEGACY_TRACK.gaugeNumber}>
        {max}
      </text>
      <text x={CENTER} y={190} textAnchor="middle" className={LEGACY_TRACK.gaugeFigure}>
        <CountUp value={points} />
      </text>
      <text x={CENTER} y={222} textAnchor="middle" className={LEGACY_TRACK.gaugeUnit}>
        {LEGACY_COPY.pointsUnit}
      </text>
    </svg>
  )
}
