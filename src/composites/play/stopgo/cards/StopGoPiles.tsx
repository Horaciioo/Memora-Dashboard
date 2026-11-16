import { StopGoCard } from '@/composites/play/stopgo/cards/StopGoCard'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'
import { cn } from '@/utils/classnames'

export interface StopGoPilesProps {
  discardTop: StopGoCardKey | null
  isDropTarget: boolean
  onDiscardDrop: () => void
}

/**
 * Discard pile with its top card
 * @param {StopGoPilesProps} props - Piles
 * @return {JSX.Element}
 */

export const StopGoPiles = ({ discardTop, isDropTarget, onDiscardDrop }: StopGoPilesProps) => (
  <div className={STOPGO_HAND.piles}>
    <div
      className={cn(STOPGO_HAND.pile, isDropTarget && STOPGO_HAND.pileOver)}
      onDragOver={(event) => isDropTarget && event.preventDefault()}
      onDrop={onDiscardDrop}
      data-stopgo-discard
    >
      {discardTop ? (
        <StopGoCard cardKey={discardTop} isPlayable={false} />
      ) : (
        <span className="stopgo-card stopgo-card-empty">{STOPGO_HAND_COPY.empty}</span>
      )}
      <small>{STOPGO_HAND_COPY.discardPile}</small>
    </div>
  </div>
)
