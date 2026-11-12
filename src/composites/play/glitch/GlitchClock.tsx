'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'

import { GLITCH_BOARD } from '@/declarations/ui/variants'

/**
 * Bar draining over the round; remount per round, the clock is read once
 * @param {Object} props - Clock
 * @param {Date | string} props.startsAt - Round opening
 * @param {Date | string} props.endsAt - Round end
 * @param {number} props.now - Server now at the mount
 * @return {JSX.Element}
 */

export const GlitchClock = ({
  startsAt,
  endsAt,
  now,
}: {
  startsAt: Date | string
  endsAt: Date | string
  now: number
}) => {
  const [style] = useState(() => {
    const start = new Date(startsAt).getTime()
    const end = new Date(endsAt).getTime()
    const left = Math.max(0, end - Math.max(now, start))

    return {
      '--wait': `${Math.max(0, start - now)}ms`,
      '--left': `${left}ms`,
      '--from': left / Math.max(1, end - start),
    } as CSSProperties
  })

  return (
    <div className={GLITCH_BOARD.clockTrack} role="presentation">
      <div className={GLITCH_BOARD.clock} style={style} />
    </div>
  )
}
