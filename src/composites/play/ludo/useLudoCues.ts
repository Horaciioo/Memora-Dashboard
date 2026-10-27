'use client'

import { useEffect, useRef } from 'react'

import { playLudoSound } from '@/composites/play/ludo/sound'
import type { LudoMotion } from '@/composites/play/ludo/useLudoMotion'
import type { LudoBoardState } from '@/core/lib/play/ludo'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import { LUDO_MIX } from '@/declarations/play/ludo/sounds'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Turn chime once the board is still, clock ticks in the last seconds
 * @param {Object} input - Table
 * @param {LudoBoardState} input.board - Board
 * @param {LudoMotion} input.motion - Board on screen
 * @param {number} input.now - Server now
 * @return {void}
 */

export const useLudoCues = ({
  board,
  motion,
  now,
}: {
  board: LudoBoardState
  motion: LudoMotion
  now: number
}): void => {
  const called = useRef<string | null>(null)
  const ticked = useRef<number | null>(null)
  const isStill = !motion.isBusy && !board.isOver && now >= board.startsAt
  const isMyRoll = isStill && board.isMyTurn && board.dice === null
  const secondsLeft = Math.ceil((board.turnEndsAt - now) / SECOND_MS)

  // Chime when the die comes to the viewer
  useEffect(() => {
    const key = `${board.rev}:${board.turnId}`
    if (!isMyRoll || called.current === key) return
    called.current = key
    playLudoSound('turn')
  }, [isMyRoll, board.rev, board.turnId])

  // Tick of the last seconds
  useEffect(() => {
    if (!isStill || !board.isMyTurn) return
    if (secondsLeft > LUDO_SETTINGS.alertSeconds || secondsLeft <= 0) return
    if (ticked.current === secondsLeft) return
    ticked.current = secondsLeft
    playLudoSound('clock', LUDO_MIX.clock)
  }, [isStill, board.isMyTurn, secondsLeft])
}
