import type { CSSProperties } from 'react'

import { StopGoCard } from '@/composites/play/stopgo/cards/StopGoCard'
import type { StopGoHandCardView } from '@/composites/play/stopgo/cards/types'
import { STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'

export interface StopGoPickProps {
  cards: StopGoHandCardView[]
  // Share of the choice clock left
  clock: number
  isSaving: boolean
  onPick: (id: string) => void
}

/**
 * Good draw: both cards side by side, a click keeps one and the other goes to the discard
 * @param {StopGoPickProps} props - Choice
 * @return {JSX.Element}
 */

export const StopGoPick = ({ cards, clock, isSaving, onPick }: StopGoPickProps) => (
  <div className={STOPGO_HAND.offer} role="dialog" aria-label={STOPGO_HAND_COPY.pickLead}>
    <span className={STOPGO_HAND.offerLead}>{STOPGO_HAND_COPY.pickLead}</span>
    <p>{STOPGO_HAND_COPY.pickHint}</p>
    <div className={STOPGO_HAND.offerRow}>
      {cards.map((card) => (
        <StopGoCard
          key={card.id}
          cardKey={card.key}
          isPlayable={!isSaving}
          onChoose={() => onPick(card.id)}
        >
          <span className={STOPGO_HAND.action}>{STOPGO_HAND_COPY.keep}</span>
        </StopGoCard>
      ))}
    </div>
    <span className={STOPGO_HAND.offerClock} style={{ '--left': clock } as CSSProperties} />
  </div>
)
