'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

import { StopGoCard } from '@/composites/play/stopgo/cards/StopGoCard'
import { StopGoDrawn } from '@/composites/play/stopgo/cards/StopGoDrawn'
import { reasonOf } from '@/composites/play/stopgo/cards/reasons'
import type { StopGoHandCardView } from '@/composites/play/stopgo/cards/types'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'
import { cn } from '@/utils/classnames'

type Player = StopGoBoardView['players'][number]

export interface StopGoHandProps {
  cards: StopGoHandCardView[]
  playable: Record<string, string[] | null>
  me: Player
  target: number
  rivals: Player[]
  chosenId: string | null
  isTurn: boolean
  // First turn: the hand is dealt card by card from the pile
  isOpening: boolean
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
  rivals,
  chosenId,
  isTurn,
  isOpening,
  onChoose,
  onQuickPlay,
}: StopGoHandProps) => {
  const isMobile = useIsMobileShell()
  // Cards held at the last render, the others slide in from the pile
  const ids = cards.map((card) => card.id)
  const [held, setHeld] = useState<ReadonlySet<string>>(() => new Set(isOpening ? [] : ids))
  const [landed, setLanded] = useState<ReadonlySet<string>>(() => new Set(isOpening ? [] : ids))

  const land = (id: string) => {
    setLanded((old) => new Set(old).add(id))
    setHeld((old) => new Set(old).add(id))
  }

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
    <div className={STOPGO_HAND.hand} data-stopgo-hand>
      {cards.map((card, index) => {
        const aims = isTurn ? playable[card.id] : undefined

        return (
          <div
            key={card.id}
            className={cn(STOPGO_HAND.slot, !landed.has(card.id) && STOPGO_HAND.slotDrawn)}
            style={{ '--stopgo-i': index } as CSSProperties}
            data-stopgo-slot={card.id}
          >
            {!held.has(card.id) && (
              <StopGoDrawn
                cardKey={card.key}
                slotId={card.id}
                delayMs={
                  cards.filter((other, at) => at < index && !held.has(other.id)).length *
                  STOPGO_SETTINGS.dealGapMs
                }
                onDone={() => land(card.id)}
              />
            )}
            <StopGoCard
              cardKey={card.key}
              index={index}
              isPlayable={!!aims}
              isChosen={chosenId === card.id}
              reason={isTurn ? reasonOf(card.key, me, target, rivals) : undefined}
              onDragStart={isMobile ? undefined : () => onChoose(card.id)}
              onChoose={() => (chosenId === card.id ? onQuickPlay(card.id) : onChoose(card.id))}
            />
          </div>
        )
      })}
    </div>
  )
}
