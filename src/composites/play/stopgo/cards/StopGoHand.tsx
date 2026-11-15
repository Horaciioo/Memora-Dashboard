'use client'

import { useEffect } from 'react'

import { StopGoCard } from '@/composites/play/stopgo/cards/StopGoCard'
import { reasonOf } from '@/composites/play/stopgo/cards/reasons'
import type { StopGoHandCardView } from '@/composites/play/stopgo/cards/types'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'

type Player = StopGoBoardView['players'][number]

export interface StopGoHandProps {
  cards: StopGoHandCardView[]
  playable: Record<string, string[] | null>
  me: Player
  target: number
  chosenId: string | null
  isTurn: boolean
  onChoose: (id: string | null) => void
  onQuickPlay: (id: string) => void
}

// True when the key goes to a text field
const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)

/**
 * Cards in hand, one click chooses, a second plays, keys 1 to 7 then Enter, Escape lets go
 * @param {StopGoHandProps} props - Hand
 * @return {JSX.Element}
 */

export const StopGoHand = ({
  cards,
  playable,
  me,
  target,
  chosenId,
  isTurn,
  onChoose,
  onQuickPlay,
}: StopGoHandProps) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey) return
      if (event.key === 'Escape') return onChoose(null)
      if (event.key === 'Enter' && chosenId) return onQuickPlay(chosenId)
      const card = cards[Number(event.key) - 1]
      if (card) onChoose(card.id)
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [cards, chosenId, onChoose, onQuickPlay])

  return (
    <div className={STOPGO_HAND.hand}>
      {cards.map((card, index) => {
        const aims = isTurn ? playable[card.id] : undefined

        return (
          <div key={card.id} className={STOPGO_HAND.slot}>
            <StopGoCard
              cardKey={card.key}
              index={index}
              isPlayable={!!aims}
              isChosen={chosenId === card.id}
              reason={isTurn ? reasonOf(card.key, me, target) : undefined}
              onDragStart={() => onChoose(card.id)}
              onChoose={() => (chosenId === card.id ? onQuickPlay(card.id) : onChoose(card.id))}
            />
          </div>
        )
      })}
    </div>
  )
}
