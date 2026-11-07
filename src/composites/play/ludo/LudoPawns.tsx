'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'

import { LudoImpact } from '@/composites/play/ludo/LudoImpact'
import { LudoPath } from '@/composites/play/ludo/LudoPath'
import { LudoPawn } from '@/composites/play/ludo/LudoPawn'
import type { LudoMotion } from '@/composites/play/ludo/useLudoMotion'
import { GOAL_STEP, pawnPoint, turnPoint, YARD_STEP } from '@/core/lib/play/ludo'
import {
  LUDO_CORNERS,
  LUDO_CROWD_SCALE,
  LUDO_CROWDS,
  LUDO_GOAL_SCALE,
  LUDO_LAYOUT,
  LUDO_PILE_RISE,
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
// Pile on this side of the middle puts its numbers outward
const PILE_SIDE_EDGE = LUDO_LAYOUT.size / 2 - 0.25
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
  // Place in the pile at home, from one
  rank: number | null
  // Number kept on the left of its pile
  isLeft: boolean
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
  const crowds = Map.groupBy(
    laid.filter((entry) => entry.step < GOAL_STEP),
    keyOf
  )
  // Pawns at home pile up in order of arrival
  const piles = Map.groupBy(
    laid.filter((entry) => entry.step >= GOAL_STEP),
    (entry) => entry.accountId
  )

  return laid.map((entry) => {
    if (entry.step >= GOAL_STEP) {
      const pile = (piles.get(entry.accountId) ?? [entry]).toSorted(
        (left, right) => left.step - right.step || left.pawn - right.pawn
      )
      const rank = pile.indexOf(entry)

      return {
        ...entry,
        offset: [-rank * LUDO_PILE_RISE, 0] as LudoCell,
        scale: LUDO_GOAL_SCALE,
        rank: rank + 1,
        isLeft: entry.point[1] < PILE_SIDE_EDGE,
      }
    }
    const crowd = crowds.get(keyOf(entry)) ?? [entry]
    const spots = LUDO_CROWDS[Math.min(crowd.length, MAX_CROWD)]
    const isShared = crowd.length > 1 && entry.step > YARD_STEP

    return {
      ...entry,
      offset: isShared ? spots[crowd.indexOf(entry) % spots.length] : [0, 0],
      scale: isShared ? LUDO_CROWD_SCALE : 1,
      rank: null,
      isLeft: false,
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
  strike: LudoMotion['strike']
  onPick: (pawn: number) => void
}

/**
 * Pawns over the board, the movable ones bouncing, the way to walk shown on hover, a burst where one is eaten
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
  strike,
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

      {strike && <LudoImpact key={strike.key} strike={strike} players={players} turns={turns} />}

      {spotsOf({ players, pawns, turns }).map((spot) => {
        const colour = LUDO_CORNERS[spot.corner]
        const canPick =
          spot.accountId === viewerId && movable.some((entry) => entry.pawn === spot.pawn)
        const isHopping = hop?.accountId === spot.accountId && hop.pawn === spot.pawn
        const isStruck = strike?.accountId === spot.accountId && strike.pawn === spot.pawn
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
            className={cn(
              LUDO_PIECES.pawn,
              canPick && LUDO_PIECES.pawnPick,
              isStruck && (strike.phase === 'hit' ? LUDO_PIECES.pawnHit : LUDO_PIECES.pawnFly)
            )}
            style={
              {
                ...glide,
                '--x': spot.point[1],
                '--y': spot.point[0],
                '--dx': spot.offset[1],
                '--dy': spot.offset[0],
                '--scale': spot.scale,
                '--z': Math.round(spot.point[0] * DEPTH) + (spot.rank ?? 0),
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
            {spot.rank !== null && (
              <span className={cn(LUDO_PIECES.rank, spot.isLeft && LUDO_PIECES.rankLeft)}>
                {spot.rank}
              </span>
            )}
          </span>
        )
      })}
    </>
  )
}
