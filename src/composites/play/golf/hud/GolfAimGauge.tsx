'use client'

import type { CSSProperties, ReactNode } from 'react'

import { useGolfAimStore } from '@/core/store/golfAim'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_BOARD } from '@/declarations/ui/variants'

// Percent of a full pull
const PERCENT = 100

/**
 * Power of the pull being aimed, what is given otherwise
 * @param {Object} props - Fallback
 * @param {ReactNode} props.children - Shown when not aiming
 * @return {JSX.Element}
 */

export const GolfAimGauge = ({ children }: { children: ReactNode }) => {
  const power = useGolfAimStore((state) => state.power)
  if (power === null) return <>{children}</>
  const percent = Math.round(power * PERCENT)

  return (
    <div className={GOLF_BOARD.gauge} aria-live="polite">
      <div className={GOLF_BOARD.gaugeRow}>
        <span className={GOLF_BOARD.caption}>{GOLF_BOARD_COPY.power3d}</span>
        <span className={GOLF_BOARD.figureSmall}>{percent}</span>
      </div>
      <div className={GOLF_BOARD.gaugeTrack}>
        <div
          className={GOLF_BOARD.gaugeFill}
          style={
            {
              width: `${percent}%`,
              '--play-gauge-span': `${PERCENT / Math.max(power, 1 / PERCENT)}%`,
            } as CSSProperties
          }
        />
      </div>
    </div>
  )
}
