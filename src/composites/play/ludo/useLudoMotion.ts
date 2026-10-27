'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { playLudoSound, playLudoTake, preloadLudoSounds } from '@/composites/play/ludo/sound'
import {
  GOAL_STEP,
  isOnTrack,
  linesSince,
  pawnsOf,
  SAFE_SQUARES,
  squareOf,
  YARD_STEP,
} from '@/core/lib/play/ludo'
import type { LudoBoardState, LudoLineView } from '@/core/lib/play/ludo'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import { LUDO_MIX } from '@/declarations/play/ludo/sounds'

// Pauses after a beat, in steps
const BEATS = { exit: 2, capture: 3, penalty: 3, finish: 4 }

/**
 * Pawn of a colour
 * @typedef {Object} LudoWalker
 */

export interface LudoWalker {
  accountId: string
  pawn: number
}

/**
 * Board as the screen plays it
 * @typedef {Object} LudoMotion
 */

export interface LudoMotion {
  pawns: Record<string, number[]>
  dice: number | null
  // Player who threw it
  rollerId: string | null
  isRolling: boolean
  // Lines still playing
  isBusy: boolean
  // Pawn landing on its square
  hop: { accountId: string; pawn: number; key: number } | null
  // Pawn still on its way, not stopped yet
  walking: LudoWalker | null
}

/**
 * Last roll on the table
 * @param {LudoLineView[]} lines - Lines, newest first
 * @return {Object} - Face and thrower
 */

const lastRoll = (lines: LudoLineView[]) => {
  const roll = lines.find((line) => line.kind === 'ROLL')

  return { dice: roll?.dice ?? null, rollerId: roll?.accountId ?? null }
}

/**
 * Wait a moment
 * @param {number} ms - Delay
 * @return {Promise<void>} - Done
 */

const wait = (ms: number): Promise<void> => new Promise((done) => window.setTimeout(done, ms))

/**
 * Board played line by line: the die tumbles, pawns hop square by square, sounds on each beat
 * @param {LudoBoardState} board - Newest board
 * @param {string} viewerId - Player watching
 * @return {LudoMotion} - Board on screen
 */

export const useLudoMotion = (board: LudoBoardState, viewerId: string): LudoMotion => {
  const [motion, setMotion] = useState<LudoMotion>(() => ({
    pawns: pawnsOf(board.players),
    ...lastRoll(board.lines),
    isRolling: false,
    isBusy: false,
    hop: null,
    walking: null,
  }))
  const latest = useRef(board)
  const shown = useRef(board.rev)
  const queue = useRef<LudoLineView[]>([])
  const isRunning = useRef(false)
  const isAlive = useRef(true)

  // Files ready before the first roll
  useEffect(() => {
    isAlive.current = true
    preloadLudoSounds()

    return () => {
      isAlive.current = false
    }
  }, [])

  // One pawn moved on screen
  const place = useCallback((accountId: string, pawn: number, step: number) => {
    setMotion((current) => {
      const pawns = [...(current.pawns[accountId] ?? [])]
      pawns[pawn] = step

      return { ...current, pawns: { ...current.pawns, [accountId]: pawns } }
    })
  }, [])

  // Every line of the queue, in order
  const run = useCallback(async () => {
    isRunning.current = true
    setMotion((current) => ({ ...current, isBusy: true }))
    while (queue.current.length && isAlive.current) {
      const line = queue.current.shift()!
      await playLine({
        line,
        next: queue.current[0],
        board: latest.current,
        viewerId,
        place,
        setMotion,
      })
    }
    isRunning.current = false
    if (!isAlive.current) return

    // Screen settles on the server board
    setMotion((current) => ({
      ...current,
      pawns: pawnsOf(latest.current.players),
      isBusy: false,
      hop: null,
      walking: null,
    }))
  }, [place, viewerId])

  // New board, its lines queued
  useEffect(() => {
    latest.current = board
    const fresh = linesSince(board.lines, shown.current)
    if (fresh === null) {
      queue.current = []
      shown.current = board.rev
      setMotion((current) => ({
        ...current,
        pawns: pawnsOf(board.players),
        ...lastRoll(board.lines),
      }))
      return
    }
    const queued = new Set(queue.current.map((line) => line.id))
    queue.current.push(...fresh.filter((line) => !queued.has(line.id)))
    shown.current = Math.max(shown.current, ...fresh.map((line) => line.rev))
    if (!isRunning.current && queue.current.length) void run()
    else if (!isRunning.current) {
      setMotion((current) => ({ ...current, pawns: pawnsOf(board.players) }))
    }
  }, [board, run])

  return motion
}

/**
 * Play one line on screen
 * @param {Object} input - Line
 * @param {LudoLineView} input.line - Line
 * @param {LudoLineView} [input.next] - Line after it
 * @param {LudoBoardState} input.board - Board
 * @param {string} input.viewerId - Player watching
 * @param {Function} input.place - Pawn mover
 * @param {Function} input.setMotion - Motion setter
 * @return {Promise<void>} - Played
 */

const playLine = async ({
  line,
  next,
  board,
  viewerId,
  place,
  setMotion,
}: {
  line: LudoLineView
  next: LudoLineView | undefined
  board: LudoBoardState
  viewerId: string
  place: (accountId: string, pawn: number, step: number) => void
  setMotion: (update: (current: LudoMotion) => LudoMotion) => void
}): Promise<void> => {
  const { stepMs, rollMs } = LUDO_SETTINGS
  const corner = board.players.find((player) => player.accountId === line.accountId)?.corner ?? 0

  // Die tumbles, lands, maybe nothing to move
  if (line.kind === 'ROLL' && line.dice) {
    setMotion((current) => ({
      ...current,
      dice: line.dice,
      rollerId: line.accountId,
      isRolling: true,
    }))
    playLudoTake('roll', LUDO_MIX.roll)
    await wait(rollMs)
    setMotion((current) => ({ ...current, isRolling: false }))
    if (line.dice === 6) playLudoSound('six')
    const isStuck = next ? !['MOVE', 'PENALTY'].includes(next.kind) : board.dice === null
    if (isStuck) playLudoSound('blocked')
    return
  }

  // Pawn out of its yard, or hopping square by square
  if (line.kind === 'MOVE' && line.pawn !== null && line.from !== null && line.to !== null) {
    const { pawn, from, to } = line
    if (from <= YARD_STEP) {
      place(line.accountId, pawn, to)
      setMotion((current) => ({
        ...current,
        hop: { accountId: line.accountId, pawn, key: line.rev },
      }))
      playLudoSound('exit')
      await wait(stepMs * BEATS.exit)
    } else {
      for (let step = from + 1; step <= to; step += 1) {
        place(line.accountId, pawn, step)
        setMotion((current) => ({
          ...current,
          hop: { accountId: line.accountId, pawn, key: step },
          walking: step < to ? { accountId: line.accountId, pawn } : null,
        }))
        playLudoTake('step', LUDO_MIX.step)
        await wait(stepMs)
      }
    }
    if (to >= GOAL_STEP) playLudoSound('home')
    else if (
      board.settings.rules.safeSquares &&
      isOnTrack(to) &&
      SAFE_SQUARES.has(squareOf(corner, to))
    )
      playLudoSound('star')
    return
  }

  // Taken pawn sent home
  if (line.kind === 'CAPTURE' && line.victimId && line.pawn !== null) {
    place(line.victimId, line.pawn, YARD_STEP)
    playLudoSound(line.victimId === viewerId ? 'eaten' : 'eat')
    await wait(stepMs * BEATS.capture)
    return
  }

  // Last pawn home, the run done
  if (line.kind === 'FINISH') {
    playLudoSound('finish')
    await wait(stepMs * BEATS.finish)
    return
  }

  if (line.kind === 'PENALTY') {
    playLudoSound('penalty')
    await wait(stepMs * BEATS.penalty)
  }
}
