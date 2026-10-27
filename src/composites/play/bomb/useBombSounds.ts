'use client'

import { useEffect, useRef } from 'react'

import { playBombSound, playBombTake, preloadBombSounds } from '@/composites/play/bomb/sound'
import type { BombBoardView } from '@/composites/play/bomb/types'
import { loopSound } from '@/core/lib/play/sounds'
import type { SoundLoop } from '@/core/lib/play/sounds'
import { usePlaySoundStore } from '@/core/store/playSound'
import { BOMB_MIX, BOMB_SOUNDS } from '@/declarations/play/bomb/sounds'

/**
 * Time of the latest blast
 * @param {BombBoardView} board - Board
 * @return {number} - Milliseconds, zero without one
 */

const blastOf = (board: BombBoardView): number =>
  board.blast ? new Date(board.blast.at).getTime() : 0

/**
 * Sounds of what changed between two boards
 * @param {BombBoardView} before - Previous board
 * @param {BombBoardView} board - Current board
 * @return {void}
 */

const playChanges = (before: BombBoardView, board: BombBoardView): void => {
  if (blastOf(board) > blastOf(before)) playBombSound('explosion')
  else if (before.turnId && board.turnId !== before.turnId) playBombSound('word', BOMB_MIX.word)
  if (board.miss && board.miss.word !== before.miss?.word) playBombSound('miss', BOMB_MIX.miss)
  if (!board.isMyTurn && board.draft.length > before.draft.length)
    playBombTake('typing', BOMB_MIX.typing)

  const seatOf = (accountId: string) => before.players.find((seat) => seat.accountId === accountId)
  if (board.players.some((seat) => seat.lives > (seatOf(seat.accountId)?.lives ?? seat.lives)))
    playBombSound('life', BOMB_MIX.life)
  if (board.players.some((seat) => seat.isOut && seatOf(seat.accountId)?.isOut === false))
    playBombSound('out', BOMB_MIX.out)
  if (board.isOver && !before.isOver) playBombSound('victory')
}

/**
 * Fuse crackling all game long, fast and loud on the viewer's turn
 * @param {boolean} isLive - Bomb lit
 * @param {boolean} isMine - Viewer holds it
 * @return {void}
 */

const useFuse = (isLive: boolean, isMine: boolean): void => {
  const fuse = useRef<SoundLoop | null>(null)
  const { isMuted, volume } = usePlaySoundStore()

  useEffect(() => {
    fuse.current = loopSound(BOMB_SOUNDS.fuse)

    return () => fuse.current?.stop()
  }, [])

  useEffect(() => {
    const level = isMine ? BOMB_MIX.fuseMine : BOMB_MIX.fuse
    fuse.current?.set(
      isLive && !isMuted ? volume * level : 0,
      isMine ? BOMB_MIX.fuseRateMine : BOMB_MIX.fuseRate
    )
  }, [isLive, isMine, isMuted, volume])
}

/**
 * Every Bomb Party sound, read off the live board
 * @param {BombBoardView} board - Board
 * @param {number} countdown - Seconds before the start
 * @return {void}
 */

export const useBombSounds = (board: BombBoardView, countdown: number): void => {
  const previous = useRef(board)
  const counted = useRef(countdown)
  const isLive = countdown === 0 && !board.isOver
  const isMine = board.isMyTurn && isLive

  useEffect(() => preloadBombSounds(), [])
  useFuse(isLive, isMine)

  // Ticks, then the start
  useEffect(() => {
    if (countdown > 0) playBombSound('clock', BOMB_MIX.clock)
    else if (counted.current > 0) playBombSound('go')
    counted.current = countdown
  }, [countdown])

  useEffect(() => {
    if (previous.current !== board) playChanges(previous.current, board)
    previous.current = board
  }, [board])

  // The bomb lands on the viewer
  useEffect(() => {
    if (isMine) playBombSound('turn', BOMB_MIX.turn)
  }, [isMine])
}
