import type { CSSProperties } from 'react'

import { StopGoCard } from '@/composites/play/stopgo/cards/StopGoCard'
import { fillPlayMessage } from '@/declarations/play/copy'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { STOPGO_CARD_COPY, STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'

export interface StopGoCounterProps {
  card: StopGoCardKey
  fromName: string
  // Safety of the hand that parries this attack
  counterKey: StopGoCardKey | null
  // Share of the answer clock left
  clock: number
  isSaving: boolean
  onCounter: () => void
  onPass: () => void
}

/**
 * Invite of the target: the attack received, the safety of the hand that parries it if there is one
 * @param {StopGoCounterProps} props - Invite
 * @return {JSX.Element}
 */

export const StopGoCounter = ({
  card,
  fromName,
  counterKey,
  clock,
  isSaving,
  onCounter,
  onPass,
}: StopGoCounterProps) => (
  <div className={STOPGO_HAND.offer} role="alertdialog" aria-label={STOPGO_HAND_COPY.counterLead}>
    <span className={STOPGO_HAND.offerLead}>{STOPGO_HAND_COPY.counterLead}</span>
    <p>
      {fillPlayMessage(STOPGO_HAND_COPY.counterText, {
        name: fromName,
        card: STOPGO_CARD_COPY[card].name,
      })}
    </p>
    <div className={STOPGO_HAND.offerRow}>
      <StopGoCard cardKey={card} isPlayable={false} />
      {counterKey && <StopGoCard cardKey={counterKey} isPlayable={false} />}
    </div>
    {counterKey ? (
      <div className={STOPGO_HAND.offerRow}>
        <button
          type="button"
          className={STOPGO_HAND.action}
          disabled={isSaving}
          onClick={onCounter}
        >
          {STOPGO_HAND_COPY.counter}
        </button>
        <button
          type="button"
          className={STOPGO_HAND.actionGhost}
          disabled={isSaving}
          onClick={onPass}
        >
          {STOPGO_HAND_COPY.letPass}
        </button>
      </div>
    ) : (
      <p>{STOPGO_HAND_COPY.noCounter}</p>
    )}
    <span className={STOPGO_HAND.offerClock} style={{ '--left': clock } as CSSProperties} />
  </div>
)
