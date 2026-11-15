'use client'

import { useState } from 'react'

import { StopGoCarState } from '@/composites/play/stopgo/cards/StopGoCarState'
import { StopGoHand } from '@/composites/play/stopgo/cards/StopGoHand'
import { StopGoCounter } from '@/composites/play/stopgo/cards/StopGoCounter'
import { StopGoPick } from '@/composites/play/stopgo/cards/StopGoPick'
import { StopGoRivalRow } from '@/composites/play/stopgo/cards/StopGoRivalRow'
import { StopGoPiles } from '@/composites/play/stopgo/cards/StopGoPiles'
import { StopGoTray } from '@/composites/play/stopgo/cards/StopGoTray'
import { reasonOf } from '@/composites/play/stopgo/cards/reasons'
import type { StopGoOpponent } from '@/composites/play/stopgo/cards/types'
import { useStopGoPlay } from '@/composites/play/stopgo/cards/useStopGoPlay'
import { useServerNow } from '@/core/hooks/interaction/state/time/useServerNow'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'
import { fillPlayMessage } from '@/declarations/play/copy'
import { STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'
import { StopGoPhases } from '@/utils/constants/play'
import { SECOND_MS } from '@/utils/constants/time'

export interface StopGoDockProps {
  sessionId: string
  board: StopGoBoardView
  viewerId: string
  names: Record<string, string>
  avatars: Record<string, string | null>
  colors: StopGoOpponent['color'][]
}

// Share of a clock left, between 0 and 1
const shareLeft = (endsAt: Date | string | null, now: number, seconds: number): number =>
  endsAt ? Math.max(0, Math.min(1, (new Date(endsAt).getTime() - now) / (seconds * SECOND_MS))) : 0

/**
 * Bottom of the screen: my car, my hand, the piles, and the choices that cover the board
 * @param {StopGoDockProps} props - Dock
 * @return {JSX.Element | null} - Nothing for a spectator
 */

export const StopGoDock = ({
  sessionId,
  board,
  viewerId,
  names,
  avatars,
  colors,
}: StopGoDockProps) => {
  const moves = useStopGoPlay(sessionId, board)
  const now = useServerNow(board.serverTime)
  const [chosenId, setChosenId] = useState<string | null>(null)
  const { you, players } = board
  const me = players.find(({ accountId }) => accountId === viewerId)

  const isLive = board.phase === StopGoPhases.Playing
  const isTurn = isLive && board.turnId === viewerId && !board.window && !board.pickerId
  const cards = (you?.hand ?? []).filter((card) => !card.isPicking)
  const chosen = cards.find((card) => card.id === chosenId)
  const rivals: StopGoOpponent[] = players
    .map((player, lane) => ({
      id: player.accountId,
      name: names[player.accountId] ?? '',
      color: colors[lane],
    }))
    .filter(({ id }) => id !== viewerId)

  const play = async (id: string, targets: string[] = []) => {
    setChosenId(null)
    await moves.play(id, targets)
  }
  const discard = async (id: string) => {
    setChosenId(null)
    await moves.discard(id)
  }

  // A card with no target goes on a second click, the others wait for their targets
  const quickPlay = (id: string) => {
    const aims = you?.playable[id]
    if (isTurn && aims && aims.length === 0) void play(id)
  }

  if (!you || !me) return null
  const aims = chosen ? you.playable[chosen.id] : undefined
  const window = board.window
  const picking = (you.hand ?? []).filter((card) => card.isPicking)

  return (
    <>
      <div className={STOPGO_HAND.rivals}>
        {players
          .filter(({ accountId }) => accountId !== viewerId)
          .map((player) => (
            <StopGoCarState
              key={player.accountId}
              player={player}
              name={names[player.accountId] ?? ''}
            />
          ))}
      </div>
      <div className={STOPGO_HAND.dock}>
        <StopGoRivalRow players={players} rivals={rivals} avatars={avatars} />
        <StopGoCarState player={me} name={names[viewerId] ?? ''} isMe />
        <div className={STOPGO_HAND.mid}>
          {chosen && (
            <StopGoTray
              key={chosen.id}
              card={chosen}
              aims={isTurn ? (aims ?? undefined) : undefined}
              reason={
                isTurn
                  ? reasonOf(chosen.key, me, board.target)
                  : fillPlayMessage(STOPGO_HAND_COPY.waitTurn, {
                      name: names[board.turnId ?? ''] ?? '',
                    })
              }
              opponents={rivals}
              isTurn={isTurn}
              isSaving={moves.isSaving}
              onPlay={(targets) => void play(chosen.id, targets)}
              onDiscard={() => void discard(chosen.id)}
              onCancel={() => setChosenId(null)}
            />
          )}
          {you.canReveal && isTurn && (
            <button
              type="button"
              className={STOPGO_HAND.sealed}
              disabled={moves.isSaving}
              onClick={moves.reveal}
            >
              {fillPlayMessage(STOPGO_HAND_COPY.reveal, { cost: STOPGO_SETTINGS.mysteryCost })}
              <small>
                {fillPlayMessage(STOPGO_HAND_COPY.revealAfter, {
                  km: Math.max(0, me.km - STOPGO_SETTINGS.mysteryCost),
                })}
              </small>
            </button>
          )}
          <StopGoHand
            cards={cards}
            playable={you.playable}
            me={me}
            target={board.target}
            chosenId={chosenId}
            isTurn={isTurn}
            onChoose={setChosenId}
            onQuickPlay={quickPlay}
          />
        </div>
        <StopGoPiles
          pileCount={board.pileCount}
          discardTop={board.discardTop}
          isDropTarget={isTurn && !!chosen}
          onDiscardDrop={() => chosen && void discard(chosen.id)}
        />
      </div>
      {you.isAimed && window && (
        <StopGoCounter
          card={window.card}
          fromName={names[window.fromId] ?? ''}
          counterKey={cards.find((card) => card.id === you.counterId)?.key ?? null}
          clock={shareLeft(window.endsAt, now, STOPGO_SETTINGS.counterSeconds)}
          isSaving={moves.isSaving}
          onCounter={moves.counter}
          onPass={moves.decline}
        />
      )}
      {board.pickerId === viewerId && picking.length > 0 && (
        <StopGoPick
          cards={picking}
          clock={shareLeft(board.pickEndsAt, now, STOPGO_SETTINGS.goodDrawSeconds)}
          isSaving={moves.isSaving}
          onPick={(id) => void moves.pick(id)}
        />
      )}
    </>
  )
}
