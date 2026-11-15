import type { CSSProperties } from 'react'

import { StopGoCard } from '@/composites/play/stopgo/cards/StopGoCard'
import { fillPlayMessage } from '@/declarations/play/copy'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { STOPGO_CARD_COPY, STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'

export interface StopGoImmunityProps {
  card: StopGoCardKey
  fromName: string
  hasImmunity: boolean
  // Share of the answer clock left
  clock: number
  isSaving: boolean
  onImmunity: () => void
  onPass: () => void
}

/**
 * Invite of the target: the attack received, the Immunity to cancel it, or let it pass
 * @param {StopGoImmunityProps} props - Invite
 * @return {JSX.Element}
 */

export const StopGoImmunity = ({
  card,
  fromName,
  hasImmunity,
  clock,
  isSaving,
  onImmunity,
  onPass,
}: StopGoImmunityProps) => (
  <div className={STOPGO_HAND.offer} role="alertdialog" aria-label={STOPGO_HAND_COPY.immunityLead}>
    <span className={STOPGO_HAND.offerLead}>{STOPGO_HAND_COPY.immunityLead}</span>
    <p>
      {fillPlayMessage(STOPGO_HAND_COPY.immunityText, {
        name: fromName,
        card: STOPGO_CARD_COPY[card].name,
      })}
    </p>
    <div className={STOPGO_HAND.offerRow}>
      <StopGoCard cardKey={card} isPlayable={false} />
    </div>
    <div className={STOPGO_HAND.offerRow}>
      {hasImmunity && (
        <button
          type="button"
          className={STOPGO_HAND.action}
          disabled={isSaving}
          onClick={onImmunity}
        >
          {STOPGO_HAND_COPY.immunity}
        </button>
      )}
      <button
        type="button"
        className={STOPGO_HAND.actionGhost}
        disabled={isSaving}
        onClick={onPass}
      >
        {STOPGO_HAND_COPY.letPass}
      </button>
    </div>
    <span className={STOPGO_HAND.offerClock} style={{ '--left': clock } as CSSProperties} />
  </div>
)
