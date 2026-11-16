'use client'

import { useEffect } from 'react'
import type { CSSProperties } from 'react'

import { StopGoCardBack } from '@/composites/play/stopgo/cards/StopGoCard'
import { STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'
import { cn } from '@/utils/classnames'

// Cards of the stack, each one a little off the one under it
const STACK = [0, 1, 2, 3]

export interface StopGoDeckProps {
  pileCount: number
  // The player owes a card, the deck waits for the click
  isWaiting: boolean
  isSaving: boolean
  // Own car may roll
  isGreen: boolean
  onDraw: () => void
}

/**
 * Loose deck floating top right with the light of the own car under it, a click takes the card
 * @param {StopGoDeckProps} props - Deck
 * @return {JSX.Element}
 */

export const StopGoDeck = ({
  pileCount,
  isWaiting,
  isSaving,
  isGreen,
  onDraw,
}: StopGoDeckProps) => {
  // Space takes the card of the turn
  useEffect(() => {
    if (!isWaiting || isSaving) return
    const onKey = (event: KeyboardEvent) => {
      const field = event.target instanceof HTMLElement ? event.target.tagName : ''
      if (event.code !== 'Space' || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(field)) return
      event.preventDefault()
      onDraw()
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [isWaiting, isSaving, onDraw])

  return (
    <div className={cn(STOPGO_HAND.deck, isWaiting && STOPGO_HAND.deckReady)}>
      <button
        type="button"
        className={STOPGO_HAND.deckStack}
        disabled={!isWaiting || isSaving}
        aria-label={isWaiting ? STOPGO_HAND_COPY.draw : STOPGO_HAND_COPY.pile}
        title={isWaiting ? STOPGO_HAND_COPY.drawHint : undefined}
        onClick={onDraw}
      >
        {STACK.map((layer) => (
          <span
            key={layer}
            className={STOPGO_HAND.deckCard}
            style={{ '--layer': layer } as CSSProperties}
          >
            <StopGoCardBack />
          </span>
        ))}
      </button>
      <div className={STOPGO_HAND.deckInfo}>
        <small>
          {isWaiting ? STOPGO_HAND_COPY.draw : STOPGO_HAND_COPY.pile} {pileCount}
        </small>
        <span className={STOPGO_HAND.light} data-light={isGreen ? 'green' : 'red'}>
          <i aria-hidden />
          {isGreen ? STOPGO_HAND_COPY.lightGreen : STOPGO_HAND_COPY.lightRed}
        </span>
      </div>
    </div>
  )
}
