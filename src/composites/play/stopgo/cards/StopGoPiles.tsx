import { StopGoCard, StopGoCardBack } from '@/composites/play/stopgo/cards/StopGoCard'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'
import { cn } from '@/utils/classnames'

export interface StopGoPilesProps {
  pileCount: number
  discardTop: StopGoCardKey | null
  isDropTarget: boolean
  onDiscardDrop: () => void
}

/**
 * Draw pile with its count, discard pile with its top card, a card dropped on it is thrown away
 * @param {StopGoPilesProps} props - Piles
 * @return {JSX.Element}
 */

export const StopGoPiles = ({
  pileCount,
  discardTop,
  isDropTarget,
  onDiscardDrop,
}: StopGoPilesProps) => (
  <div className={STOPGO_HAND.piles}>
    <div className={STOPGO_HAND.pile}>
      <StopGoCardBack />
      <small>
        {STOPGO_HAND_COPY.pile} {pileCount}
      </small>
    </div>
    <div
      className={cn(STOPGO_HAND.pile, isDropTarget && STOPGO_HAND.pileOver)}
      onDragOver={(event) => isDropTarget && event.preventDefault()}
      onDrop={onDiscardDrop}
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
