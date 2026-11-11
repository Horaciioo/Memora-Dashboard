'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import type { OceanStrike } from '@/composites/play/naval/fx/paintStrikes'
import { currentTier } from '@/composites/play/naval/ocean/tier'
import { cueStrike } from '@/composites/play/naval/sound'
import {
  entryAngle,
  eventsBetween,
  isNearStrike,
  planStrikes,
  timelineOf,
} from '@/core/lib/play/naval'
import { cellsOf } from '@/core/lib/play/naval/fleet'
import {
  isSinking,
  NavalCodes,
  shotViewsOf,
  strikesOf,
  sunkToward,
} from '@/core/lib/play/naval/state'
import type { NavalBoardState, NavalShotView, NavalStrikeView } from '@/core/lib/play/naval/state'
import { NAVAL_CHOREOGRAPHIES, NAVAL_DIRECTION } from '@/declarations/play/naval/choreographies'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { NAVAL_WEAPONS } from '@/declarations/play/naval/weapons'
import { NavalQualities, NavalWeapons } from '@/utils/constants/play'
import { prefersReducedMotion } from '@/utils/motion'

// Callout lifetime, in milliseconds
const CALLOUT_MS = 1700

/**
 * What a strike just did, for a callout
 * @typedef {Object} NavalCallout
 * @property {number} shipLength - Ship sent down, zero otherwise
 */

export interface NavalCallout {
  id: number
  strike: NavalStrikeView
  shipLength: number
  isEliminated: boolean
}

/**
 * Strikes played as their boards arrive
 * @typedef {Object} NavalPlayback
 * @property {NavalShotView[]} shown - Shots fully played
 * @property {NavalShotView[]} drawn - Shown plus those in flight
 */

export interface NavalPlayback {
  shown: NavalShotView[]
  drawn: NavalShotView[]
  playing: OceanStrike[]
  callout: NavalCallout | null
  isBusy: boolean
}

/**
 * Ship sent down by a strike and whether its whole fleet is gone
 * @param {NavalBoardState} board - Board
 * @param {NavalStrikeView} strike - Strike
 * @return {Omit<NavalCallout, 'id' | 'strike'>} - Outcome
 */

const sinkingOf = (board: NavalBoardState, strike: NavalStrikeView) => {
  const sunkCell = strike.cells.find((cell) => cell.code === NavalCodes.Sunk)
  if (!sunkCell) return { shipLength: 0, isEliminated: false }
  const ship = sunkToward(board, strike.match, strike.target).find((entry) =>
    cellsOf(entry).some((cell) => cell.x === sunkCell.x && cell.y === sunkCell.y)
  )

  return {
    shipLength: ship?.length ?? 0,
    isEliminated: board.players[strike.target]?.isOut ?? false,
  }
}

/**
 * Strike laid on the clock from now
 * @param {NavalBoardState} board - Board
 * @param {NavalStrikeView} strike - Strike
 * @param {boolean} isShort - Impact only
 * @return {OceanStrike} - Strike on screen
 */

const staged = (board: NavalBoardState, strike: NavalStrikeView, isShort: boolean) => {
  const weapon = NAVAL_WEAPONS[strike.weapon]?.name ?? NavalWeapons.Cannon
  const timeline = timelineOf(
    {
      choreography: NAVAL_CHOREOGRAPHIES[weapon],
      count: strike.cells.length,
      rev: strike.rev,
      isShort,
    },
    NAVAL_DIRECTION.variety
  )

  return {
    strike,
    timeline,
    startedAt: performance.now(),
    entry: entryAngle(strike.shooter, strike.target, board.players.length),
  }
}

/**
 * Direct the strikes of each new board: a queue, a few at once, a jump when far behind
 * @param {NavalBoardState} board - Board
 * @param {number} viewer - Seat of the viewer, minus one when watching
 * @return {NavalPlayback} - Playback
 */

export const useNavalDirector = (board: NavalBoardState, viewer: number): NavalPlayback => {
  const all = useMemo(() => shotViewsOf(board.shots), [board.shots])
  const [screen, setScreen] = useState({
    queue: [] as NavalStrikeView[],
    playing: [] as OceanStrike[],
  })
  const [callout, setCallout] = useState<NavalCallout | null>(null)
  const store = useRef({
    previous: board,
    latest: board,
    queue: [] as NavalStrikeView[],
    playing: [] as OceanStrike[],
    timers: new Set<number>(),
  })

  // Start what the lanes allow, settle each strike at its end
  const pump = () => {
    const state = store.current
    const isCalm = prefersReducedMotion() || currentTier().name === NavalQualities.Minimal
    const plan = planStrikes({
      queue: state.queue,
      playing: state.playing.map((entry) => entry.strike),
      viewer,
      lanes: NAVAL_DIRECTION.lanes,
      backlog: NAVAL_DIRECTION.backlog,
      isCalm,
    })
    state.queue = plan.wait
    for (const { strike, isShort } of plan.start) {
      const entry = staged(state.latest, strike, isShort)
      state.playing = [...state.playing, entry]
      cueStrike(strike, isNearStrike(strike, viewer), entry.timeline)
      const ends = entry.timeline.total + (isSinking(strike) ? NAVAL_SETTINGS.sunkMs : 0)
      const timer = window.setTimeout(() => {
        state.timers.delete(timer)
        state.playing = state.playing.filter((item) => item !== entry)
        setCallout({ id: strike.rev, strike, ...sinkingOf(state.latest, strike) })
        pump()
      }, ends)
      state.timers.add(timer)
    }
    setScreen({ queue: state.queue, playing: state.playing })
  }

  // New strikes of each board join the queue
  useEffect(() => {
    const state = store.current
    state.latest = board
    const fresh = new Set(
      eventsBetween(state.previous, board, viewer).flatMap((event) =>
        event.kind === 'strike' ? [event.rev] : []
      )
    )
    state.previous = board
    if (!fresh.size) return
    state.queue.push(...strikesOf(all).filter((strike) => fresh.has(strike.rev)))
    pump()
    // One pass per board
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board])

  // Timers dropped on leave
  useEffect(() => {
    const { timers } = store.current

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  // Callout fades by itself
  useEffect(() => {
    if (!callout) return
    const gone = window.setTimeout(() => setCallout(null), CALLOUT_MS)

    return () => window.clearTimeout(gone)
  }, [callout])

  const { queue, playing } = screen
  const waiting = new Set(queue.map((strike) => strike.rev))
  const flying = new Set(playing.map((entry) => entry.strike.rev))

  return {
    shown: all.filter((shot) => !waiting.has(shot.rev) && !flying.has(shot.rev)),
    drawn: all.filter((shot) => !waiting.has(shot.rev)),
    playing,
    callout,
    isBusy: queue.length + playing.length > 0,
  }
}
