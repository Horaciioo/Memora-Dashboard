'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { cueShot } from '@/composites/play/naval/audio/cues'
import { cellsOf } from '@/core/lib/play/naval/fleet'
import { isFleetDown, marksOf } from '@/core/lib/play/naval/sea'
import { shotViewsOf, sunkToward } from '@/core/lib/play/naval/state'
import type { NavalBoardState, NavalShotView } from '@/core/lib/play/naval/state'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { NavalResults } from '@/utils/constants/play'
import type { NavalResultName } from '@/utils/constants/play'

// Shots left unplayed before the screen jumps to the newest
const MAX_BACKLOG = 4

// Callout lifetime, in milliseconds
const EVENT_MS = 1700

// Result of each shot code
const RESULTS: NavalResultName[] = [
  NavalResults.Miss,
  NavalResults.Hit,
  NavalResults.Sunk,
  NavalResults.Spotted,
  NavalResults.Clear,
]

/**
 * Shot on screen
 * @typedef {Object} NavalPlaying
 * @property {NavalShotView} shot - Shell in the air
 * @property {'flight' | 'impact'} stage - Falling or landed
 */

export interface NavalPlaying {
  shot: NavalShotView
  stage: 'flight' | 'impact'
}

/**
 * What a shot just did, for a callout
 * @typedef {Object} NavalEvent
 */

export interface NavalEvent {
  id: number
  shot: NavalShotView
  // Length of the ship sent down, zero otherwise
  shipLength: number
  isEliminated: boolean
}

/**
 * Shots played one after the other, each with its flight and its blast
 * @typedef {Object} NavalPlayback
 */

export interface NavalPlayback {
  // Shots already shown
  shown: NavalShotView[]
  playing: NavalPlaying | null
  event: NavalEvent | null
  isBusy: boolean
}

/**
 * Length of a ship just sunk and whether the whole fleet is down
 * @param {NavalBoardState} board - Board
 * @param {NavalShotView[]} shown - Shots shown
 * @param {NavalShotView} shot - Last shot
 * @return {{ shipLength: number; isEliminated: boolean }} - Outcome
 */

const sinkingOf = (board: NavalBoardState, shown: NavalShotView[], shot: NavalShotView) => {
  if (shot.code !== 2) return { shipLength: 0, isEliminated: false }
  const down = sunkToward(board, shot.match, shot.target)
  const ship = down.find((entry) =>
    cellsOf(entry).some((cell) => cell.x === shot.x && cell.y === shot.y)
  )
  const toward = shown
    .filter((entry) => entry.match === shot.match && entry.target === shot.target)
    .map((entry): [number, number, number] => [entry.x, entry.y, entry.code])

  return {
    shipLength: ship?.length ?? 0,
    isEliminated: isFleetDown(down, marksOf(board.sea.size, toward), board.sea.size),
  }
}

/**
 * Play the new shots of the board in order, sound and picture together
 * @param {NavalBoardState} board - Board
 * @param {number} viewer - Seat of the viewer, minus one when watching
 * @return {NavalPlayback} - Playback
 */

export const useNavalPlayback = (board: NavalBoardState, viewer: number): NavalPlayback => {
  const all = useMemo(() => shotViewsOf(board.shots), [board.shots])
  const [shownRev, setShownRev] = useState(() => all.at(-1)?.rev ?? 0)
  const [landedRev, setLandedRev] = useState(0)
  const [event, setEvent] = useState<NavalEvent | null>(null)
  const cued = useRef(0)
  const latest = useRef({ board, all })
  useEffect(() => {
    latest.current = { board, all }
  })

  // Queue, the backlog skipped when far behind
  const behind = all.filter((shot) => shot.rev > shownRev)
  const skipped = behind.length > MAX_BACKLOG ? behind.slice(0, -1) : []
  const pending = behind.slice(skipped.length)
  const current = pending[0]
  const playing: NavalPlaying | null = current
    ? { shot: current, stage: landedRev === current.rev ? 'impact' : 'flight' }
    : null

  // Sound starts with the flight, scheduled on the audio clock
  const rev = current?.rev ?? 0
  useEffect(() => {
    if (!current || cued.current === rev) return
    cued.current = rev
    cueShot({
      result: RESULTS[current.code],
      flightMs: NAVAL_SETTINGS.flightMs,
      isAgainstMe: current.target === viewer,
      isFromMe: current.shooter === viewer,
      pan: ((current.x + 0.5) / board.sea.size) * 2 - 1,
    })
  }, [current, rev, viewer, board.sea.size])

  // Flight, then impact, then the shot counts as shown
  useEffect(() => {
    if (!rev) return
    const shot = latest.current.all.find((entry) => entry.rev === rev)
    if (!shot) return
    const landed = setTimeout(() => setLandedRev(rev), NAVAL_SETTINGS.flightMs)
    const over = setTimeout(
      () => {
        const { board: held, all: shots } = latest.current
        const shown = shots.filter((entry) => entry.rev <= rev)
        setEvent({ id: rev, shot, ...sinkingOf(held, shown, shot) })
        setShownRev(rev)
      },
      NAVAL_SETTINGS.flightMs +
        NAVAL_SETTINGS.impactMs +
        (shot.code === 2 ? NAVAL_SETTINGS.sunkMs : 0)
    )

    return () => {
      clearTimeout(landed)
      clearTimeout(over)
    }
  }, [rev])

  // Callout fades by itself
  useEffect(() => {
    if (!event) return
    const gone = setTimeout(() => setEvent(null), EVENT_MS)

    return () => clearTimeout(gone)
  }, [event])

  return {
    shown: all.filter((shot) => shot.rev <= (skipped.at(-1)?.rev ?? shownRev)),
    playing,
    event,
    isBusy: pending.length > 0,
  }
}
