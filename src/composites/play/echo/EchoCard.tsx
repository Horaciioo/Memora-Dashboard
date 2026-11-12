'use client'

import { useMemo } from 'react'
import type { CSSProperties } from 'react'

import { ECHO_ART } from '@/composites/play/echo/EchoSymbols'
import { layoutCard } from '@/core/lib/play/echo/layout'
import { ECHO_SYMBOLS } from '@/declarations/play'
import { ECHO_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface EchoCardProps {
  card: number[]
  seed: number
  // Symbol ringed once the round is over
  answer?: number | null
  // Cards without a handler are only shown
  onPick?: (symbol: number) => void
  isLocked?: boolean
  isSmall?: boolean
}

/**
 * Round card with its symbols at their own size and tilt
 * @param {EchoCardProps} props - Card and handlers
 * @return {JSX.Element}
 */

export const EchoCard = ({ card, seed, answer, onPick, isLocked, isSmall }: EchoCardProps) => {
  const placements = useMemo(() => layoutCard(card, seed), [card, seed])

  return (
    <div className={cn(ECHO_BOARD.card, isSmall && ECHO_BOARD.cardSmall)}>
      {placements.map(({ symbol, x, y, radius, angle }) => {
        const { key, label } = ECHO_SYMBOLS[symbol]
        const style = {
          left: `${50 + x * 50}%`,
          top: `${50 + y * 50}%`,
          width: `${radius * 100}%`,
          '--angle': `${angle}deg`,
        } as CSSProperties
        const face = (
          <svg viewBox="0 0 64 64" className={ECHO_BOARD.art} aria-hidden="true">
            {ECHO_ART[key]}
          </svg>
        )
        const className = cn(ECHO_BOARD.symbol, answer === symbol && ECHO_BOARD.symbolAnswer)

        return onPick ? (
          <button
            key={symbol}
            type="button"
            className={className}
            style={style}
            aria-label={label}
            disabled={isLocked}
            onClick={() => onPick(symbol)}
          >
            {face}
          </button>
        ) : (
          <span key={symbol} className={className} style={style}>
            {face}
          </span>
        )
      })}
    </div>
  )
}
