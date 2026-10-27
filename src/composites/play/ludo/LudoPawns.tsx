'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'

import { LudoPath } from '@/composites/play/ludo/LudoPath'
import { LudoPawn } from '@/composites/play/ludo/LudoPawn'
import { GOAL_STEP, pawnPoint, turnPoint, YARD_STEP } from '@/core/lib/play/ludo'
import {
  LUDO_CORNERS,
  LUDO_CROWD_SCALE,
  LUDO_CROWDS,
  LUDO_GOAL_SCALE,
} from '@/declarations/play/ludo/board'
import type { LudoCell } from '@/declarations/play/ludo/board'
import { fillPlayMessage } from '@/declarations/play/copy'
import { LUDO_BOARD_COPY } from '@/declarations/play/ludo/copy'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import { LUDO_PIECES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Depth steps per cell, lower pawns in front
const DEPTH = 2
// Spot key precision
const SPOT_DIGITS = 2
// Largest crowd drawn apart
const MAX_CROWD = Math.max(...Object.keys(LUDO_CROWDS).map(Number))

/**
 * Pawn as laid on the board
 * @typedef {Object} LudoSpot
 */

interface LudoSpot {
  accountId: string
  corner: number
  pawn: number
  point: LudoCell
  offset: LudoCell
  scale: number
}

/**
 * Every pawn on screen, those sharing a square drawn smaller side by side
 * @param {Object} input - Board
 * @param {{ accountId: string, corner: number }[]} input.players - Colours in play
 * @param {Record<string, number[]>} input.pawns - Steps on screen
 * @param {number} input.turns - View turn
 * @return {LudoSpot[]} - Spots
 */

const spotsOf = ({
  players,
  pawns,
  turns,
}: {
  players: { accountId: string; corner: number }[]
  pawns: Record<string, number[]>
  turns: number
}): LudoSpot[] => {
  const laid = players.flatMap(({ accountId, corner }) =>
    (pawns[accountId] ?? []).map((step, pawn) => ({
      accountId,
      corner,
      pawn,
      step,
      point: turnPoint(pawnPoint(corner, step, pawn), turns),
    }))
  )
  const keyOf = ({ point }: { point: LudoCell }) =>
    point.map((value) => value.toFixed(SPOT_DIGITS)).join(':')
  const crowds = Map.groupBy(laid, keyOf)

  return laid.map((entry) => {
    const crowd = crowds.get(keyOf(entry)) ?? [entry]
    const spots = LUDO_CROWDS[Math.min(crowd.length, MAX_CROWD)]
    const isShared = crowd.length > 1 && entry.step > YARD_STEP

    return {
      ...entry,
      offset: isShared ? spots[crowd.indexOf(entry) % spots.length] : [0, 0],
      scale: entry.step >= GOAL_STEP ? LUDO_GOAL_SCALE : isShared ? LUDO_CROWD_SCALE : 1,
    }
  })
}

export interface LudoPawnsProps {
  players: { accountId: string; corner: number }[]
  pawns: Record<string, number[]>
  turns: number
  viewerId: string
  // Pawns the viewer may move, and where they land
  movable: { pawn: number; to: number }[]
  hop: { accountId: string; pawn: number; key: number } | null
  onPick: (pawn: number) => void
}

/**
 * Pawns over the board, the movable ones bouncing, the way to walk shown on hover
 * @param {LudoPawnsProps} props - Pawns
 * @return {JSX.Element}
 */

export const LudoPawns = ({
  players,
  pawns,
  turns,
  viewerId,
  movable,
  hop,
  onPick,
}: LudoPawnsProps) => {
  const [aimed, setAimed] = useState<number | null>(null)
  const mine = players.find((player) => player.accountId === viewerId)
  const target = movable.find((entry) => entry.pawn === aimed)
  const glide = { '--glide': `${LUDO_SETTINGS.stepMs}ms` } as CSSProperties

  return (
    <>
      {mine && target && (
        <LudoPath
          corner={mine.corner}
          pawn={target.pawn}
          from={pawns[viewerId]?.[target.pawn] ?? YARD_STEP}
          to={target.to}
          turns={turns}
        />
      )}

      {spotsOf({ players, pawns, turns }).map((spot) => {
        const colour = LUDO_CORNERS[spot.corner]
        const canPick =
          spot.accountId === viewerId && movable.some((entry) => entry.pawn === spot.pawn)
        const isHopping = hop?.accountId === spot.accountId && hop.pawn === spot.pawn
        const art = (
          <LudoPawn
            key={isHopping ? hop.key : 'still'}
            colour={colour}
            className={cn(isHopping && LUDO_PIECES.pawnHop)}
          />
        )

        return (
          <span
            key={`${spot.accountId}:${spot.pawn}`}
            className={cn(LUDO_PIECES.pawn, canPick && LUDO_PIECES.pawnPick)}
            style={
              {
                ...glide,
                '--x': spot.point[1],
                '--y': spot.point[0],
                '--dx': spot.offset[1],
                '--dy': spot.offset[0],
                '--scale': spot.scale,
                '--z': Math.round(spot.point[0] * DEPTH),
                '--pawn-tone': `var(--play-ludo-${colour})`,
              } as CSSProperties
            }
          >
            {canPick ? (
              <button
                type="button"
                className={LUDO_PIECES.pawnButton}
                aria-label={fillPlayMessage(LUDO_BOARD_COPY.pawn, { number: spot.pawn + 1 })}
                onClick={() => {
                  setAimed(null)
                  onPick(spot.pawn)
                }}
                onPointerEnter={() => setAimed(spot.pawn)}
                onPointerLeave={() => setAimed(null)}
                onFocus={() => setAimed(spot.pawn)}
                onBlur={() => setAimed(null)}
              >
                {art}
              </button>
            ) : (
              art
            )}
          </span>
        )
      })}
    </>
  )
}
