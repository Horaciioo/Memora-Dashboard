import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { StopGoCard } from '@/composites/play/stopgo/cards/StopGoCard'
import { useStopGoAimStore } from '@/core/store/play/stopgoAim'
import { STOPGO_CARDS, StopGoTargets } from '@/declarations/play/stopgo/cards'
import { STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { fillPlayMessage } from '@/declarations/play/copy'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'
import type { StopGoHandCardView, StopGoOpponent } from '@/composites/play/stopgo/cards/types'
import { cn } from '@/utils/classnames'

export interface StopGoTrayProps {
  card: StopGoHandCardView
  // Opponents the card may aim at, undefined when it cannot be played
  aims: string[] | undefined
  reason: string
  opponents: StopGoOpponent[]
  isTurn: boolean
  isSaving: boolean
  onPlay: (targets: string[]) => void
  onDiscard: () => void
  onCancel: () => void
}

/**
 * Actions of the chosen card: who to aim at, play, throw away
 * @param {StopGoTrayProps} props - Tray
 * @return {JSX.Element}
 */

export const StopGoTray = ({
  card,
  aims,
  reason,
  opponents,
  isTurn,
  isSaving,
  onPlay,
  onDiscard,
  onCancel,
}: StopGoTrayProps) => {
  const [chosen, setChosen] = useState<string[]>([])
  const kind = STOPGO_CARDS[card.key].target
  const minimum = Math.min(STOPGO_SETTINGS.accidentMinTargets, aims?.length ?? 0)
  const isMany = kind === StopGoTargets.Many
  const isReady = isTurn && !!aims && !isSaving

  const toggle = (id: string) =>
    setChosen((list) => (list.includes(id) ? list.filter((entry) => entry !== id) : [...list, id]))
  const aimKey = isReady && kind !== StopGoTargets.None ? (aims ?? []).join() : ''
  const aimed = (id: string) => (isMany ? toggle(id) : onPlay([id]))
  const latest = useRef(aimed)
  useEffect(() => {
    latest.current = aimed
  })
  const pickedKey = chosen.join()

  // Rivals on the track answer the same touch
  useEffect(() => {
    const { open, close } = useStopGoAimStore.getState()
    if (aimKey)
      open(aimKey.split(','), pickedKey ? pickedKey.split(',') : [], (id) => latest.current(id))

    return close
  }, [aimKey, pickedKey])

  const lead = !aims
    ? reason
    : isMany
      ? fillPlayMessage(STOPGO_HAND_COPY.pickTargets, { count: minimum })
      : kind === StopGoTargets.One
        ? STOPGO_HAND_COPY.pickTarget
        : ''

  return (
    <div className={STOPGO_HAND.tray} role="group" aria-label={STOPGO_HAND_COPY.hand}>
      <div className={STOPGO_HAND.trayCard} inert>
        <StopGoCard cardKey={card.key} />
      </div>
      {lead && <span className={STOPGO_HAND.trayText}>{lead}</span>}
      {isReady && aims.length > 0 && (
        <div className={STOPGO_HAND.targets}>
          {opponents
            .filter(({ id }) => aims.includes(id))
            .map((rival) => (
              <button
                key={rival.id}
                type="button"
                className={cn(
                  STOPGO_HAND.target,
                  chosen.includes(rival.id) && STOPGO_HAND.targetOn
                )}
                style={{ '--car': `var(--stopgo-car-${rival.color})` } as CSSProperties}
                onClick={() => aimed(rival.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => aimed(rival.id)}
              >
                {rival.name}
              </button>
            ))}
        </div>
      )}
      {isReady && (isMany || aims.length === 0) && (
        <button
          type="button"
          className={STOPGO_HAND.action}
          disabled={isMany && chosen.length < minimum}
          onClick={() => onPlay(chosen)}
        >
          {isMany ? STOPGO_HAND_COPY.launch : STOPGO_HAND_COPY.play}
        </button>
      )}
      {isTurn && (
        <button
          type="button"
          className={STOPGO_HAND.actionGhost}
          disabled={isSaving}
          onClick={onDiscard}
        >
          {STOPGO_HAND_COPY.discard}
        </button>
      )}
      <button type="button" className={STOPGO_HAND.actionGhost} onClick={onCancel}>
        {STOPGO_HAND_COPY.cancel}
      </button>
    </div>
  )
}
