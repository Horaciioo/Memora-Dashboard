'use client'

import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { LudoImpact } from '@/composites/play/ludo/LudoImpact'
import { LudoPath } from '@/composites/play/ludo/LudoPath'
import { LudoPawn } from '@/composites/play/ludo/LudoPawn'
import type { LudoMotion } from '@/composites/play/ludo/useLudoMotion'
import { GOAL_STEP, HIDDEN_STEP, pawnPoint, turnPoint, YARD_STEP } from '@/core/lib/play/ludo'
import type { LudoGhostView } from '@/core/lib/play/ludo'
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
import { LUDO_BOARD_COPY, LUDO_CHAOS_UI } from '@/declarations/play/ludo/copy'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import { LUDO_CHAOS_PIECES, LUDO_PIECES } from '@/declarations/ui/variants'
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
  step: number
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
    (pawns[accountId] ?? []).flatMap((step, pawn) =>
      // A slot blanked for this screen has no pawn
      step === HIDDEN_STEP || step === undefined
        ? []
        : [
            {
              accountId,
              corner,
              pawn,
              step,
              point: turnPoint(pawnPoint(corner, step, pawn), turns),
            },
          ]
    )
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

/**
 * Place of the mark standing for a landing the player cannot see
 * @param {number} corner - Pawn colour
 * @param {number} step - Pawn step
 * @param {number} pawn - Pawn index
 * @param {number} turns - View turn
 * @return {CSSProperties} - Style
 */

const blindSpot = (corner: number, step: number, pawn: number, turns: number): CSSProperties => {
  const [y, x] = turnPoint(pawnPoint(corner, step, pawn), turns)

  return { '--x': x, '--y': y } as CSSProperties
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
  // Chaos: colour drawn per player, phantom pairs, pawns vanishing or pushed back
  looks: Record<string, number>
  ghosts: Record<string, LudoGhostView>
  fading: LudoMotion['fading']
  rewind: LudoMotion['rewind']
  // The viewer cannot see where a pawn lands
  isBlind: boolean
  // The viewer wears another colour
  isDisguised: boolean
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
  looks,
  ghosts,
  fading,
  rewind,
  isBlind,
  isDisguised,
}: LudoPawnsProps) => {
  // Aim is dropped once the turn or choices change
  const [aim, setAim] = useState<{ pawn: number; scope: string } | null>(null)
  const isTouch = useRef(false)
  const scope = `${turns}:${movable.map((entry) => entry.pawn).join()}`
  const aimed = aim?.scope === scope ? aim.pawn : null
  const setAimed = (pawn: number | null) => setAim(pawn === null ? null : { pawn, scope })
  const mine = players.find((player) => player.accountId === viewerId)
  const target = movable.find((entry) => entry.pawn === aimed)
  const glide = { '--glide': `${LUDO_SETTINGS.stepMs}ms` } as CSSProperties

  return (
    <>
      {mine && target && !isBlind && (
        <LudoPath
          corner={mine.corner}
          pawn={target.pawn}
          from={pawns[viewerId]?.[target.pawn] ?? YARD_STEP}
          to={target.to}
          turns={turns}
        />
      )}

      {isBlind && mine && target && (
        <span
          className={LUDO_CHAOS_PIECES.blindMark}
          style={blindSpot(
            mine.corner,
            pawns[viewerId]?.[target.pawn] ?? YARD_STEP,
            target.pawn,
            turns
          )}
        >
          {LUDO_CHAOS_UI.blind}
        </span>
      )}

      {strike && <LudoImpact key={strike.key} strike={strike} players={players} turns={turns} />}

      {spotsOf({ players, pawns, turns }).map((spot) => {
        const colour = LUDO_CORNERS[looks[spot.accountId] ?? spot.corner]
        const ghost = ghosts[spot.accountId]
        const isGhost = Boolean(ghost?.pair.includes(spot.pawn))
        const isReal = isGhost && ghost.real === spot.pawn && spot.accountId === viewerId
        const isFading = fading?.accountId === spot.accountId && fading.pawn === spot.pawn
        const isRewind = rewind?.accountId === spot.accountId && rewind.pawn === spot.pawn
        const isOwnTag =
          isDisguised &&
          spot.accountId === viewerId &&
          spot.step > YARD_STEP &&
          spot.step < GOAL_STEP
        const canPick =
          spot.accountId === viewerId && movable.some((entry) => entry.pawn === spot.pawn)
        const isHopping = hop?.accountId === spot.accountId && hop.pawn === spot.pawn
        const isStruck = strike?.accountId === spot.accountId && strike.pawn === spot.pawn
        const art = (
          <LudoPawn
            key={isHopping ? hop.key : 'still'}
            colour={colour}
            className={cn(
              isHopping && LUDO_PIECES.pawnHop,
              isGhost && LUDO_CHAOS_PIECES.pawnGhost,
              isReal && LUDO_CHAOS_PIECES.pawnReal,
              isFading && LUDO_CHAOS_PIECES.pawnFade,
              isRewind && LUDO_CHAOS_PIECES.pawnRewind
            )}
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
                onPointerDown={(event) => {
                  isTouch.current = event.pointerType !== 'mouse'
                }}
                onClick={() => {
                  if (isTouch.current && movable.length > 1 && aimed !== spot.pawn) {
                    setAimed(spot.pawn)
                    return
                  }
                  setAimed(null)
                  onPick(spot.pawn)
                }}
                onPointerEnter={(event) => event.pointerType === 'mouse' && setAimed(spot.pawn)}
                onPointerLeave={(event) => event.pointerType === 'mouse' && setAimed(null)}
                onFocus={() => setAimed(spot.pawn)}
                onBlur={() => !isTouch.current && setAimed(null)}
              >
                {art}
              </button>
            ) : (
              art
            )}
            {isOwnTag && <span className={LUDO_CHAOS_PIECES.ownTag}>{LUDO_CHAOS_UI.yourDie}</span>}
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
