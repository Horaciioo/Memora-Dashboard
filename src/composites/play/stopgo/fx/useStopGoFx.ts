'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { playStopGoSound, preloadStopGoSounds } from '@/composites/play/stopgo/sound'
import { fxBetween, snapshotOf } from '@/core/lib/play/stopgo'
import type { StopGoBoardView, StopGoFx } from '@/core/lib/play/stopgo'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { STOPGO_FX } from '@/declarations/play/stopgo/fx'
import type { StopGoFlightKind, StopGoMarkKind } from '@/declarations/play/stopgo/fx'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'

/**
 * Card in the air
 * @typedef {Object} StopGoFlight
 */

export interface StopGoFlight {
  id: string
  kind: StopGoFlightKind
  fromId: string
  toId: string
  // Null for a card face down
  card: StopGoCardKey | null
}

/**
 * Mark a car wears for a moment
 * @typedef {Object} StopGoMark
 */

export interface StopGoMark {
  kind: StopGoMarkKind
  // New for each moment so the animation restarts
  key: number
  hazard: string | null
  // Wait for the card to land
  delayMs: number
}

interface FxState {
  snapshot: ReturnType<typeof snapshotOf>
  batch: StopGoFx[]
  batchNo: number
  flights: StopGoFlight[]
}

/**
 * Cards flying for a batch of moments
 * @param {StopGoFx[]} batch - Moments
 * @param {number} batchNo - Batch number
 * @return {StopGoFlight[]} - Flights
 */

const flightsOf = (batch: StopGoFx[], batchNo: number): StopGoFlight[] =>
  batch.flatMap((fx, index) => {
    const spec = STOPGO_FX[fx.type]
    if (!spec.flight) return []
    const aims = spec.flight === 'toTargets' ? fx.targetIds : [fx.accountId]

    return aims.map((toId) => ({
      id: `${batchNo}:${index}:${toId}`,
      kind: spec.flight!,
      fromId: fx.accountId,
      toId,
      card: spec.isBack ? null : fx.card,
    }))
  })

/**
 * Animations and sounds of a race, drawn from the difference between two boards so a board seen twice plays nothing
 * @param {StopGoBoardView} board - Newest board
 * @param {boolean} [isFlying] - Flights are shown, none is kept otherwise so none piles up
 * @return {Object} - Flights, marks per car and the landing of a flight
 */

export const useStopGoFx = (board: StopGoBoardView, isFlying = true) => {
  const [state, setState] = useState<FxState>(() => ({
    snapshot: snapshotOf(board),
    batch: [],
    batchNo: 0,
    flights: [],
  }))
  const [marks, setMarks] = useState<Record<string, StopGoMark>>({})
  const timers = useRef<number[]>([])
  const counter = useRef(0)

  // A newer board turns into moments, the first one into none
  const next = snapshotOf(board)
  if (next.rev > state.snapshot.rev) {
    const batch = fxBetween(state.snapshot, board)
    const batchNo = state.batchNo + 1
    setState({
      snapshot: next,
      batch,
      batchNo,
      flights: isFlying ? [...state.flights, ...flightsOf(batch, batchNo)] : [],
    })
  }

  useEffect(() => preloadStopGoSounds(), [])

  useEffect(() => {
    for (const fx of state.batch) {
      const spec = STOPGO_FX[fx.type]
      if (spec.sound) playStopGoSound(spec.sound)
      if (!spec.mark) continue
      const key = ++counter.current
      const delayMs = fx.isThrown ? STOPGO_SETTINGS.flightMs : 0
      const mark: StopGoMark = { kind: spec.mark, key, hazard: fx.hazard, delayMs }
      const later = (work: () => void, wait: number) => {
        const timer = window.setTimeout(() => {
          timers.current = timers.current.filter((entry) => entry !== timer)
          work()
        }, wait)
        timers.current.push(timer)
      }
      later(() => setMarks((held) => ({ ...held, [fx.accountId]: mark })), 0)
      later(
        () =>
          setMarks((held) => {
            if (held[fx.accountId]?.key !== key) return held

            return Object.fromEntries(Object.entries(held).filter(([id]) => id !== fx.accountId))
          }),
        delayMs + STOPGO_SETTINGS.markMs
      )
    }
  }, [state.batch])

  useEffect(
    () => () => {
      for (const timer of timers.current) window.clearTimeout(timer)
    },
    []
  )

  const land = useCallback(
    (id: string) =>
      setState((held) => ({ ...held, flights: held.flights.filter((flight) => flight.id !== id) })),
    []
  )

  return { flights: state.flights, marks, land }
}
