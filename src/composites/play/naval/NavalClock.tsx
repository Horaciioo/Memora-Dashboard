'use client'

import type { CSSProperties } from 'react'

import { useServerNow } from '@/core/hooks/interaction/state/time/useServerNow'
import { NAVAL_HUD } from '@/declarations/ui/variants/games/naval'
import { cn } from '@/utils/classnames'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Bar and seconds of a clock running down to a deadline
 * @param {Object} props - Clock
 * @param {number} props.serverTime - Server time of the board
 * @param {number} props.endsAt - Deadline, server milliseconds
 * @param {number} props.totalSeconds - Length of the full clock
 * @param {number} props.alertSeconds - Red under this
 * @return {JSX.Element}
 */

export const NavalClock = ({
  serverTime,
  endsAt,
  totalSeconds,
  alertSeconds,
}: {
  serverTime: number
  endsAt: number
  totalSeconds: number
  alertSeconds: number
}) => {
  const now = useServerNow(new Date(serverTime))
  const left = Math.max(0, endsAt - now)
  const seconds = Math.ceil(left / SECOND_MS)
  const ratio = Math.min(1, left / (totalSeconds * SECOND_MS))

  return (
    <span className={NAVAL_HUD.clockRow}>
      <span className={NAVAL_HUD.clock} role="timer" aria-label={`${seconds}`}>
        <span
          className={cn(NAVAL_HUD.clockFill, seconds <= alertSeconds && NAVAL_HUD.clockAlert)}
          style={{ '--left': ratio } as CSSProperties}
        />
      </span>
      <span className={NAVAL_HUD.seconds} aria-hidden="true">
        {seconds}
      </span>
    </span>
  )
}
