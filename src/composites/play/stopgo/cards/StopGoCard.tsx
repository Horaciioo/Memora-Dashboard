import type { DragEventHandler, ReactNode } from 'react'

import { StopGoCardGlyph } from '@/composites/play/stopgo/art/StopGoCardGlyph'
import { STOPGO_CARDS } from '@/declarations/play/stopgo/cards'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { STOPGO_CARD_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_CARD } from '@/declarations/ui/variants/games/play/stopgo'
import { cn } from '@/utils/classnames'

export interface StopGoCardProps {
  cardKey: StopGoCardKey
  isPlayable?: boolean
  isChosen?: boolean
  // Why the card cannot be played, read on hover and long touch
  reason?: string
  index?: number
  onChoose?: () => void
  onDragStart?: DragEventHandler<HTMLButtonElement>
  children?: ReactNode
}

/**
 * Card face: family head, picture, name and one short phrase
 * @param {StopGoCardProps} props - Card
 * @return {JSX.Element}
 */

export const StopGoCard = ({
  cardKey,
  isPlayable = true,
  isChosen = false,
  reason,
  index,
  onChoose,
  onDragStart,
  children,
}: StopGoCardProps) => {
  const spec = STOPGO_CARDS[cardKey]
  const copy = STOPGO_CARD_COPY[cardKey]
  const isDistance = 'km' in spec

  return (
    <button
      type="button"
      draggable={isPlayable && !!onDragStart}
      onDragStart={onDragStart}
      onClick={onChoose}
      title={isPlayable ? copy.hint : reason}
      aria-pressed={isChosen}
      aria-label={`${copy.name}. ${copy.hint}`}
      className={cn(
        STOPGO_CARD.card,
        STOPGO_CARD.family[spec.family],
        isPlayable ? STOPGO_CARD.playable : STOPGO_CARD.locked,
        isChosen && STOPGO_CARD.chosen
      )}
    >
      <span className={STOPGO_CARD.head}>{index === undefined ? '' : index + 1}</span>
      {isDistance ? (
        <span className={STOPGO_CARD.km}>{spec.km}</span>
      ) : (
        <span className={STOPGO_CARD.glyph}>
          <StopGoCardGlyph name={cardKey} />
        </span>
      )}
      <span className={STOPGO_CARD.name}>{copy.name}</span>
      <span className={STOPGO_CARD.hint}>{copy.hint}</span>
      {children}
    </button>
  )
}

/**
 * Back of a card, nothing of its content
 * @return {JSX.Element}
 */

export const StopGoCardBack = () => <span className={cn(STOPGO_CARD.card, STOPGO_CARD.back)} />
