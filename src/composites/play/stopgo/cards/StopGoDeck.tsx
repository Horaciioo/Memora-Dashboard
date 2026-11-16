import type { CSSProperties } from 'react'

import { StopGoCardBack } from '@/composites/play/stopgo/cards/StopGoCard'
import { STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'
import { cn } from '@/utils/classnames'

// Cards of the stack, each one a little off the one under it
const STACK = [0, 1, 2, 3]

export interface StopGoDeckProps {
  pileCount: number
  // A card dealt this turn waits on the deck
  isWaiting: boolean
  onDraw: () => void
}

/**
 * Loose deck floating top right, the top card is taken when one is waiting
 * @param {StopGoDeckProps} props - Deck
 * @return {JSX.Element | null} - Nothing once the pile is spent
 */

export const StopGoDeck = ({ pileCount, isWaiting, onDraw }: StopGoDeckProps) => (
  <div className={cn(STOPGO_HAND.deck, isWaiting && STOPGO_HAND.deckReady)}>
    <button
      type="button"
      className={STOPGO_HAND.deckStack}
      disabled={!isWaiting}
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
    <small>
      {isWaiting ? STOPGO_HAND_COPY.draw : STOPGO_HAND_COPY.pile} {pileCount}
    </small>
  </div>
)
