'use client'

import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import { PlayCountdown } from '@/composites/play/baccalaureat/PlayCountdown'
import { secondsTo } from '@/composites/play/baccalaureat/types'
import { LudoChaosLayer } from '@/composites/play/ludo/LudoChaosLayer'
import { LudoDice } from '@/composites/play/ludo/LudoDice'
import { LudoGrid } from '@/composites/play/ludo/LudoGrid'
import { LudoDuelRoll } from '@/composites/play/ludo/LudoDuelRoll'
import { LudoJokerOffer } from '@/composites/play/ludo/LudoJokerOffer'
import { LudoPawns } from '@/composites/play/ludo/LudoPawns'
import { LudoPlates } from '@/composites/play/ludo/LudoPlates'
import type { LudoSeatFace } from '@/composites/play/ludo/LudoPlates'
import { LudoResult } from '@/composites/play/ludo/LudoResult'
import { useLudoCues } from '@/composites/play/ludo/useLudoCues'
import { useLudoMotion } from '@/composites/play/ludo/useLudoMotion'
import type { LudoMotion } from '@/composites/play/ludo/useLudoMotion'
import { useLudoBoard } from '@/core/hooks/data/play/useLudoBoard'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { usePlayStageStore } from '@/core/store/play/playStage'
import { useServerNow } from '@/core/hooks/interaction/state/time/useServerNow'
import { heldStars } from '@/core/lib/play/ludo'
import type { LudoBoardState, LudoBoardView } from '@/core/lib/play/ludo'
import { LUDO_CORNERS, LUDO_LAYOUT, LUDO_VIEWER_CORNER } from '@/declarations/play/ludo/board'
import { LUDO_BOARD_COPY, LUDO_CHAOS_UI } from '@/declarations/play/ludo/copy'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import { fillPlayMessage } from '@/declarations/play/copy'
import { LUDO_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { SECOND_MS } from '@/utils/constants/time'
import { PlayGames } from '@/utils/constants/play'

const CORNER_COUNT = LUDO_CORNERS.length

// Longest wait for the board pushed after a move, in milliseconds
const PUSH_WAIT_MS = 3000

/**
 * Seat with its face
 * @typedef {Object} LudoFace
 */

export interface LudoFace {
  accountId: string
  name: string
  avatarUrl: string | null
  isHost: boolean
}

export interface LudoBoardProps {
  sessionId: string
  board: LudoBoardView
  faces: LudoFace[]
  viewerId: string
}

/**
 * Sentence between the top plates and the board
 * @param {LudoBoardState} board - Board
 * @param {string} name - Player on turn
 * @return {string} - Status
 */

const statusOf = (board: LudoBoardState, name: string, viewerId: string): string => {
  // A duel waits on the others' own dice
  if (board.pending?.type === 'duel') {
    const waiting = 'waiting' in board.pending ? board.pending.waiting : []
    if (waiting.includes(viewerId)) return LUDO_CHAOS_UI.duelRoll

    return board.isMyTurn ? LUDO_CHAOS_UI.duelOthers : LUDO_CHAOS_UI.duelTheirs
  }

  // A choice of Chaos mode comes before the throw
  if (board.pending) {
    const lead = board.pending.type === 'joker' ? LUDO_CHAOS_UI.offerLead : LUDO_CHAOS_UI.pickLead
    const theirs =
      board.pending.type === 'joker' ? LUDO_CHAOS_UI.theirOffer : LUDO_CHAOS_UI.theirPick

    return board.isMyTurn ? lead : fillPlayMessage(theirs, { name })
  }
  const isRoll = board.dice === null
  if (board.isMyTurn) return isRoll ? LUDO_BOARD_COPY.yourRoll : LUDO_BOARD_COPY.yourMove

  return fillPlayMessage(isRoll ? LUDO_BOARD_COPY.theirRoll : LUDO_BOARD_COPY.theirMove, { name })
}

/**
 * Sentence told while a pawn is eaten, who ate whom
 * @param {LudoMotion['strike']} strike - Pawn being eaten
 * @param {LudoSeatFace[]} seats - Colours with their names
 * @return {string | null} - Status, null when nothing is eaten
 */

const strikeOf = (strike: LudoMotion['strike'], seats: LudoSeatFace[]): string | null => {
  if (!strike) return null
  const name = (accountId: string) => seats.find((seat) => seat.accountId === accountId)?.name ?? ''

  return fillPlayMessage(LUDO_BOARD_COPY.eating, {
    name: name(strike.captorId),
    victim: name(strike.accountId),
  })
}

/**
 * Colours with their faces
 * @param {LudoBoardState} board - Board
 * @param {LudoFace[]} faces - Faces
 * @param {Record<string, number[]>} pawns - Steps on screen
 * @return {LudoSeatFace[]} - Seats
 */

const seatsOf = (
  board: LudoBoardState,
  faces: LudoFace[],
  pawns: Record<string, number[]>
): LudoSeatFace[] =>
  board.players.map((player) => {
    const face = faces.find((entry) => entry.accountId === player.accountId)

    return {
      ...player,
      // Pawns as the screen shows them, so the home count follows the walk
      pawns: (pawns[player.accountId] ?? player.pawns).slice(0, board.settings.pawns),
      name: face?.name ?? '',
      avatarUrl: face?.avatarUrl ?? null,
      isHost: face?.isHost ?? false,
    }
  })

/**
 * Ludo screen: the classic cross board, a plate at each corner, the die beside the player on turn
 * @param {LudoBoardProps} props - Board and table
 * @return {JSX.Element}
 */

export const LudoBoard = ({ sessionId, board: initial, faces, viewerId }: LudoBoardProps) => {
  const board = useLudoBoard(sessionId, initial)
  const now = useServerNow(initial.serverTime)
  const motion = useLudoMotion(board, viewerId, sessionId)
  const isFullscreen = usePlayStageStore((state) => state.isFullscreen)
  const isChatOpen = usePlayStageStore((state) => state.isChatOpen)
  const { act, isSaving } = usePlayAct(sessionId)
  // Revision a move was sent on: the board stays shut until a newer one is pushed
  const [sentRev, setSentRev] = useState<number | null>(null)
  const [call, setCall] = useState({ was: false, count: 0 })
  const send = async (body: Record<string, unknown>) => {
    setSentRev(board.rev)
    if (await act(body)) window.setTimeout(() => setSentRev(null), PUSH_WAIT_MS)
    else setSentRev(null)
  }
  useLudoCues({ board, motion, now })

  const seats = useMemo(() => seatsOf(board, faces, motion.pawns), [board, faces, motion.pawns])
  const present = useMemo(() => seats.filter((seat) => !seat.hasLeft), [seats])
  if (board.isOver && !motion.isBusy) return <LudoResult players={seats} />

  // The viewer's colour turned to the bottom right
  const me = seats.find((seat) => seat.accountId === viewerId)
  const turns = me ? (LUDO_VIEWER_CORNER - me.corner + CORNER_COUNT) % CORNER_COUNT : 0
  const countdown = secondsTo(new Date(board.startsAt), now)
  const isStill = !motion.isBusy && !isSaving && sentRev !== board.rev && countdown === 0
  const msLeft = Math.max(0, board.turnEndsAt - now)
  const isRoll = board.dice === null && !board.pending
  const isMyRoll = isStill && board.isMyTurn && isRoll
  const isChaos = board.settings.rules.chaos
  const names = Object.fromEntries(seats.map((seat) => [seat.accountId, seat.name]))
  const pending = board.pending
  // The call over the board comes each time the roll turns to the viewer
  if (call.was !== isMyRoll) setCall({ was: isMyRoll, count: call.count + Number(isMyRoll) })
  // Colour drawn at each corner, a chameleon takes another's
  const palette = LUDO_CORNERS.map(
    (_, corner) =>
      motion.looks[seats.find((seat) => seat.corner === corner)?.accountId ?? ''] ?? corner
  ).join()
  const tone = { '--pawn-tone': `var(--play-ludo-${LUDO_CORNERS[me?.corner ?? 0]})` }
  const row = {
    seats,
    turns,
    viewerId,
    // The die stays with its thrower while the move plays
    turnId: countdown > 0 ? null : motion.isBusy ? motion.rollerId : board.turnId,
    // The thrower's clock rests full while the move plays, the next clock starts after it
    clock: motion.isBusy
      ? { clock: 1, isAlert: false }
      : {
          clock: Math.min(1, msLeft / (board.settings.turnSeconds * SECOND_MS)),
          isAlert: msLeft <= LUDO_SETTINGS.alertSeconds * SECOND_MS,
        },
    looks: motion.looks,
    isChaos,
    stalledId: motion.stalled,
    die: (
      <LudoDice
        face={motion.dice}
        face2={isRoll && isStill ? null : motion.dice2}
        isRolling={motion.isRolling}
        isRolling2={motion.isRolling2}
        kept={motion.kept}
        canRoll={board.isMyTurn && isRoll && isStill}
        canPick={board.isMyTurn && pending?.type === 'pick' && isStill}
        onRoll={() => void send({ type: 'roll' })}
        onPick={(die) => void send({ type: 'pick', die })}
      />
    ),
  }
  const holder = seats.find((seat) => seat.accountId === board.turnId)

  return (
    <div className={LUDO_BOARD.board}>
      {countdown > 0 && (
        <PlayCountdown
          game={PlayGames.Ludo}
          seconds={countdown}
          total={LUDO_SETTINGS.countdownSeconds}
          lead={LUDO_BOARD_COPY.starting}
        />
      )}
      <LudoPlates {...row} />

      <div
        className={cn(
          LUDO_BOARD.frame,
          board.isMyTurn && countdown === 0 && LUDO_BOARD.frameMine,
          isFullscreen && (isChatOpen ? LUDO_BOARD.frameFullChat : LUDO_BOARD.frameFull)
        )}
        style={tone as CSSProperties}
      >
        <div
          className={LUDO_BOARD.surface}
          style={{ '--cells': LUDO_LAYOUT.size } as CSSProperties}
          aria-label={LUDO_BOARD_COPY.board}
        >
          <LudoGrid
            turns={turns}
            lit={heldStars(present, motion.pawns, motion.walking)}
            palette={palette}
            isChaos={isChaos}
          />
          <LudoPawns
            players={present}
            pawns={motion.pawns}
            turns={turns}
            viewerId={viewerId}
            movable={isStill ? board.movable : []}
            hop={motion.hop}
            strike={motion.strike}
            onPick={(pawn) => void send({ type: 'move', pawn })}
            looks={motion.looks}
            ghosts={motion.ghosts}
            fading={motion.fading}
            rewind={motion.rewind}
            isBlind={(me?.effects.blind ?? 0) > 0}
            isDisguised={me !== undefined && (motion.looks[viewerId] ?? me.corner) !== me.corner}
          />
          <LudoChaosLayer motion={motion} players={present} names={names} turns={turns} />
          {isMyRoll && call.count > 0 && (
            <div key={call.count} className={LUDO_BOARD.banner} aria-hidden="true">
              <span className={LUDO_BOARD.bannerText}>{LUDO_BOARD_COPY.yourTurn}</span>
            </div>
          )}
        </div>
      </div>
      {pending?.type === 'duel' &&
        'waiting' in pending &&
        pending.waiting.includes(viewerId) &&
        isStill && <LudoDuelRoll onRoll={() => void send({ type: 'duelRoll' })} />}
      {pending?.type === 'joker' && pending.malus && board.isMyTurn && isStill && (
        <LudoJokerOffer
          malus={pending.malus}
          clock={Math.min(1, msLeft / (board.settings.turnSeconds * SECOND_MS))}
          isSaving={isSaving}
          onAnswer={(use) => void send({ type: 'joker', use })}
        />
      )}
      <p
        className={cn(LUDO_BOARD.status, board.isMyTurn && LUDO_BOARD.statusCall)}
        aria-live="polite"
      >
        {strikeOf(motion.strike, seats) ?? statusOf(board, holder?.name ?? '', viewerId)}
      </p>
    </div>
  )
}
