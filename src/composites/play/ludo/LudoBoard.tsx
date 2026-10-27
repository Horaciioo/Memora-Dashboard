'use client'

import type { CSSProperties } from 'react'

import { PlayCountdown } from '@/composites/play/baccalaureat/PlayCountdown'
import { secondsTo } from '@/composites/play/baccalaureat/types'
import { LudoDie } from '@/composites/play/ludo/LudoDie'
import { LudoGrid } from '@/composites/play/ludo/LudoGrid'
import { LudoPawns } from '@/composites/play/ludo/LudoPawns'
import { LudoPlates } from '@/composites/play/ludo/LudoPlates'
import type { LudoSeatFace } from '@/composites/play/ludo/LudoPlates'
import { LudoResult } from '@/composites/play/ludo/LudoResult'
import { useLudoCues } from '@/composites/play/ludo/useLudoCues'
import { useLudoMotion } from '@/composites/play/ludo/useLudoMotion'
import { useLudoBoard } from '@/core/hooks/data/play/useLudoBoard'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { useServerNow } from '@/core/hooks/interaction/state/useServerNow'
import { heldStars } from '@/core/lib/play/ludo'
import type { LudoBoardState, LudoBoardView } from '@/core/lib/play/ludo'
import { LUDO_CORNERS, LUDO_LAYOUT, LUDO_VIEWER_CORNER } from '@/declarations/play/ludo/board'
import { LUDO_BOARD_COPY } from '@/declarations/play/ludo/copy'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import { fillPlayMessage } from '@/declarations/play/copy'
import { LUDO_BOARD } from '@/declarations/ui/variants'
import { SECOND_MS } from '@/utils/constants/time'

const CORNER_COUNT = LUDO_CORNERS.length

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
  isSeated: boolean
}

/**
 * Sentence between the top plates and the board
 * @param {LudoBoardState} board - Board
 * @param {string} name - Player on turn
 * @return {string} - Status
 */

const statusOf = (board: LudoBoardState, name: string): string => {
  const isRoll = board.dice === null
  if (board.isMyTurn) return isRoll ? LUDO_BOARD_COPY.yourRoll : LUDO_BOARD_COPY.yourMove

  return fillPlayMessage(isRoll ? LUDO_BOARD_COPY.theirRoll : LUDO_BOARD_COPY.theirMove, { name })
}

/**
 * Colours with their faces
 * @param {LudoBoardState} board - Board
 * @param {LudoFace[]} faces - Faces
 * @return {LudoSeatFace[]} - Seats
 */

const seatsOf = (board: LudoBoardState, faces: LudoFace[]): LudoSeatFace[] =>
  board.players.map((player) => {
    const face = faces.find((entry) => entry.accountId === player.accountId)

    return {
      ...player,
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

export const LudoBoard = ({
  sessionId,
  board: initial,
  faces,
  viewerId,
  isSeated,
}: LudoBoardProps) => {
  const board = useLudoBoard(sessionId, initial)
  const now = useServerNow(initial.serverTime)
  const motion = useLudoMotion(board, viewerId)
  const { act, isSaving } = usePlayAct(sessionId)
  useLudoCues({ board, motion, now })

  const seats = seatsOf(board, faces)
  if (board.isOver && !motion.isBusy) return <LudoResult players={seats} />

  // The viewer's colour turned to the bottom right
  const me = seats.find((seat) => seat.accountId === viewerId)
  const turns = me ? (LUDO_VIEWER_CORNER - me.corner + CORNER_COUNT) % CORNER_COUNT : 0
  const countdown = secondsTo(new Date(board.startsAt), now)
  const isStill = !motion.isBusy && !isSaving && countdown === 0
  const msLeft = Math.max(0, board.turnEndsAt - now)
  const isRoll = board.dice === null
  const row = {
    seats,
    turns,
    // The die stays with its thrower while the move plays
    turnId: countdown > 0 ? null : motion.isBusy ? motion.rollerId : board.turnId,
    clock: {
      clock: Math.min(1, msLeft / (board.settings.turnSeconds * SECOND_MS)),
      isAlert: msLeft <= LUDO_SETTINGS.alertSeconds * SECOND_MS,
    },
    die: (
      <LudoDie
        face={motion.dice}
        isRolling={motion.isRolling}
        canRoll={board.isMyTurn && isRoll && isStill}
        onRoll={() => void act({ type: 'roll' })}
      />
    ),
  }
  const holder = seats.find((seat) => seat.accountId === board.turnId)
  const present = seats.filter((seat) => !seat.hasLeft)

  return (
    <div className={LUDO_BOARD.board}>
      {countdown > 0 && <PlayCountdown seconds={countdown} lead={LUDO_BOARD_COPY.starting} />}
      <LudoPlates {...row} />

      <div className={LUDO_BOARD.frame}>
        <div
          className={LUDO_BOARD.surface}
          style={{ '--cells': LUDO_LAYOUT.size } as CSSProperties}
          aria-label={LUDO_BOARD_COPY.board}
        >
          <LudoGrid turns={turns} lit={heldStars(present, motion.pawns, motion.walking)} />
          <LudoPawns
            players={present}
            pawns={motion.pawns}
            turns={turns}
            viewerId={viewerId}
            movable={isStill ? board.movable : []}
            hop={motion.hop}
            onPick={(pawn) => void act({ type: 'move', pawn })}
          />
        </div>
      </div>
      <p className={LUDO_BOARD.status} aria-live="polite">
        {statusOf(board, holder?.name ?? '')}
      </p>

      {!isSeated && <p className={LUDO_BOARD.spectating}>{LUDO_BOARD_COPY.spectating}</p>}
    </div>
  )
}
