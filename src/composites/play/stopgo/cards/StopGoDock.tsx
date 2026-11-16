'use client'

import { useState } from 'react'

import { StopGoDeck } from '@/composites/play/stopgo/cards/StopGoDeck'
import { StopGoHand } from '@/composites/play/stopgo/cards/StopGoHand'
import { StopGoCounter } from '@/composites/play/stopgo/cards/StopGoCounter'
import { useFoldSlide } from '@/composites/play/stopgo/cards/useFoldSlide'
import { StopGoPick } from '@/composites/play/stopgo/cards/StopGoPick'
import { lightOf } from '@/composites/play/stopgo/cards/lights'
import { StopGoRoster } from '@/composites/play/stopgo/cards/StopGoRoster'
import { StopGoRivalRow } from '@/composites/play/stopgo/cards/StopGoRivalRow'
import { StopGoPiles } from '@/composites/play/stopgo/cards/StopGoPiles'
import { StopGoHitCue } from '@/composites/play/stopgo/cards/StopGoHitCue'
import { StopGoTurnCue } from '@/composites/play/stopgo/cards/StopGoTurnCue'
import { StopGoTray } from '@/composites/play/stopgo/cards/StopGoTray'
import { reasonOf } from '@/composites/play/stopgo/cards/reasons'
import { useDockHeight } from '@/composites/play/stopgo/cards/useDockHeight'
import type { StopGoOpponent } from '@/composites/play/stopgo/cards/types'
import { playStopGoSound } from '@/composites/play/stopgo/sound'
import { useStopGoPlay } from '@/composites/play/stopgo/cards/useStopGoPlay'
import { useServerNow } from '@/core/hooks/interaction/state/time/useServerNow'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'
import { fillPlayMessage } from '@/declarations/play/copy'
import { STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { ICONS } from '@/declarations/ui/icons'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'
import { StopGoPhases } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'
import { SECOND_MS } from '@/utils/constants/time'

export interface StopGoDockProps {
  sessionId: string
  board: StopGoBoardView
  viewerId: string
  names: Record<string, string>
  avatars: Record<string, string | null>
  colors: StopGoOpponent['color'][]
}

// Gap between two card sounds while the hand folds or unfolds
const FLIP_STEP_MS = 70

// Keys do nothing while the hand is folded
const noop = () => undefined

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
  const dockRef = useDockHeight()
  const now = useServerNow(board.serverTime)
  const [chosenId, setChosenId] = useState<string | null>(null)
  const [isFolded, setIsFolded] = useState(false)
  const { you, players } = board
  const me = players.find(({ accountId }) => accountId === viewerId)

  const isLive = board.phase === StopGoPhases.Playing
  const isTurn = isLive && board.turnId === viewerId && !board.window && !board.pickerId
  const held = (you?.hand ?? []).filter((card) => !card.isPicking)
  // The card of the turn stays on the pile until the player takes it
  const isWaiting = isTurn && !!you?.canDraw
  const isPlaying = isTurn && !isWaiting
  const cards = held
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
    if (isPlaying && aims && aims.length === 0) void play(id)
  }

  // One card sound per card, in the order the hand moves
  const toggleFold = () => {
    setChosenId(null)
    const next = !isFolded
    setIsFolded(next)
    cards.forEach((_, index) => {
      globalThis.setTimeout(
        () => playStopGoSound(next ? 'card' : 'draw', 0.55),
        index * FLIP_STEP_MS
      )
    })
  }

  // A drag down folds, a drag up unfolds, a plain tap flips it
  const slide = useFoldSlide(isFolded, toggleFold)

  if (!you || !me) return null
  const FoldIcon = ICONS.expand
  const aims = chosen ? you.playable[chosen.id] : undefined
  const window = board.window
  const picking = (you.hand ?? []).filter((card) => card.isPicking)

  return (
    <>
      <StopGoDeck
        pileCount={board.pileCount}
        isWaiting={isWaiting}
        isSaving={moves.isSaving}
        isTurn={board.turnId === viewerId}
        light={lightOf(me)}
        onDraw={() => void moves.draw()}
      />
      <StopGoRoster
        viewerId={viewerId}
        turnId={board.turnId ?? null}
        entries={players.map((player, lane) => ({
          id: player.accountId,
          name: names[player.accountId] ?? '',
          avatar: avatars[player.accountId] ?? null,
          color: colors[lane],
          light: lightOf(player),
          hazards: player.hazards,
        }))}
      />
      <StopGoHitCue hazards={me.hazards} />
      <StopGoTurnCue
        isTurn={isTurn}
        isWaiting={isWaiting}
        turnNo={board.turnNo}
        holderName={names[board.turnId ?? ''] ?? ''}
        isLive={isLive && !window && !board.pickerId}
      />
      <div ref={dockRef} className={cn(STOPGO_HAND.dock, isFolded && STOPGO_HAND.dockFolded)}>
        <StopGoRivalRow rivals={rivals} avatars={avatars} />
        <div className={cn(STOPGO_HAND.handBox, isWaiting && STOPGO_HAND.handAwait)}>
          <button
            type="button"
            className={cn(STOPGO_HAND.fold, isFolded && STOPGO_HAND.foldShut)}
            aria-expanded={!isFolded}
            onPointerDown={slide.down}
            onPointerUp={slide.up}
            onPointerCancel={slide.cancel}
            onClick={slide.click}
          >
            <FoldIcon className="size-4" aria-hidden="true" />
            {isFolded ? STOPGO_HAND_COPY.unfold : STOPGO_HAND_COPY.fold}
          </button>
          <div className={STOPGO_HAND.mid} data-folded={isFolded || undefined} inert={isFolded}>
            <div className={STOPGO_HAND.midInner}>
              {chosen && (
                <StopGoTray
                  key={chosen.id}
                  card={chosen}
                  aims={isPlaying ? (aims ?? undefined) : undefined}
                  reason={
                    isWaiting
                      ? STOPGO_HAND_COPY.drawFirst
                      : isTurn
                        ? reasonOf(
                            chosen.key,
                            me,
                            board.target,
                            players.filter((player) => player.accountId !== viewerId)
                          )
                        : fillPlayMessage(STOPGO_HAND_COPY.waitTurn, {
                            name: names[board.turnId ?? ''] ?? '',
                          })
                  }
                  opponents={rivals}
                  isTurn={isPlaying}
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
                rivals={players.filter((player) => player.accountId !== viewerId)}
                chosenId={chosenId}
                isTurn={isPlaying}
                isOpening={board.turnNo === 1}
                sealedCount={you.sealedCount}
                canReveal={you.canReveal && isTurn}
                onReveal={moves.reveal}
                onChoose={isFolded ? noop : setChosenId}
                onQuickPlay={isFolded ? noop : quickPlay}
              />
            </div>
          </div>
        </div>
        <StopGoPiles
          discardTop={board.discardTop}
          isDropTarget={isPlaying && !!chosen}
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
