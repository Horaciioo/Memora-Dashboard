'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import type { OceanStrike } from '@/composites/play/naval/ocean/paint/strike'
import { landingOf } from '@/composites/play/naval/ocean/paint/strike'
import { cueStrike } from '@/composites/play/naval/sound'
import { cellsOf } from '@/core/lib/play/naval/fleet'
import {
  isSinking,
  NavalCodes,
  shotViewsOf,
  strikesOf,
  sunkToward,
} from '@/core/lib/play/naval/state'
import type { NavalBoardState, NavalShotView, NavalStrikeView } from '@/core/lib/play/naval/state'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'

// Strikes left unplayed before the screen jumps to the newest
const MAX_BACKLOG = 3

// Callout lifetime, in milliseconds
const EVENT_MS = 1700

/**
 * What a strike just did, for a callout
 * @typedef {Object} NavalEvent
 */

export interface NavalEvent {
  id: number
  strike: NavalStrikeView
  // Length of the ship sent down, zero otherwise
  shipLength: number
  isEliminated: boolean
}

/**
 * Strikes played one after the other
 * @typedef {Object} NavalPlayback
 */

export interface NavalPlayback {
  // Shots already shown
  shown: NavalShotView[]
  playing: OceanStrike | null
  event: NavalEvent | null
  isBusy: boolean
}

/**
 * Milliseconds a strike takes on screen
 * @param {NavalStrikeView} strike - Strike
 * @return {number} - Duration
 */

const lengthOf = (strike: NavalStrikeView): number =>
  landingOf(strike, strike.cells.length - 1) +
  NAVAL_SETTINGS.impactMs +
  (isSinking(strike) ? NAVAL_SETTINGS.sunkMs : 0)

/**
 * Ship sent down by a strike and whether its whole fleet is gone
 * @param {NavalBoardState} board - Board
 * @param {NavalStrikeView} strike - Strike
 * @return {{ shipLength: number; isEliminated: boolean }} - Outcome
 */

const sinkingOf = (board: NavalBoardState, strike: NavalStrikeView) => {
  const sunkCell = strike.cells.find((cell) => cell.code === NavalCodes.Sunk)
  if (!sunkCell) return { shipLength: 0, isEliminated: false }
  const down = sunkToward(board, strike.match, strike.target)
  const ship = down.find((entry) =>
    cellsOf(entry).some((cell) => cell.x === sunkCell.x && cell.y === sunkCell.y)
  )

  return {
    shipLength: ship?.length ?? 0,
    isEliminated: board.players[strike.target]?.isOut ?? false,
  }
}

/**
 * Play the new strikes of the board in order, sound and picture together
 * @param {NavalBoardState} board - Board
 * @param {number} viewer - Seat of the viewer, minus one when watching
 * @return {NavalPlayback} - Playback
 */

export const useNavalPlayback = (board: NavalBoardState, viewer: number): NavalPlayback => {
  const all = useMemo(() => shotViewsOf(board.shots), [board.shots])
  const strikes = useMemo(() => strikesOf(all), [all])
  const [shownRev, setShownRev] = useState(() => all.at(-1)?.rev ?? 0)
  const [event, setEvent] = useState<NavalEvent | null>(null)
  const [started, setStarted] = useState({ rev: 0, at: 0 })
  const latest = useRef(board)
  useEffect(() => {
    latest.current = board
  })

  // Queue, the backlog skipped when far behind
  const behind = strikes.filter((strike) => strike.rev > shownRev)
  const skipped = behind.length > MAX_BACKLOG ? behind.slice(0, -1) : []
  const current = behind[skipped.length]
  const rev = current?.rev ?? 0

  // Sound and clock start together, the strike counts as shown at its end
  useEffect(() => {
    if (!current) return
    const begin = requestAnimationFrame((at) => {
      setStarted({ rev: current.rev, at })
      cueStrike(current, current.target === viewer || current.shooter === viewer)
    })
    const over = setTimeout(() => {
      setEvent({ id: current.rev, strike: current, ...sinkingOf(latest.current, current) })
      setShownRev(current.rev)
    }, lengthOf(current))

    return () => {
      cancelAnimationFrame(begin)
      clearTimeout(over)
    }
    // One run per strike
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rev])

  // Callout fades by itself
  useEffect(() => {
    if (!event) return
    const gone = setTimeout(() => setEvent(null), EVENT_MS)

    return () => clearTimeout(gone)
  }, [event])

  const lastShown = skipped.at(-1)?.rev ?? shownRev

  return {
    shown: all.filter((shot) => shot.rev <= lastShown),
    playing:
      current && started.rev === current.rev ? { strike: current, startedAt: started.at } : null,
    event,
    isBusy: Boolean(current),
  }
}
