'use client'

import { useEffect, useRef } from 'react'

import { playBombSound, playBombTake, preloadBombSounds } from '@/composites/play/bomb/sound'
import type { BombBoardView } from '@/composites/play/bomb/types'
import { loopSound } from '@/core/lib/play/sounds'
import type { SoundLoop } from '@/core/lib/play/sounds'
import { usePlaySoundStore, volumeOf } from '@/core/store/play/playSound'
import { BOMB_MIX, BOMB_SOUNDS } from '@/declarations/play/bomb/sounds'
import { PlayGames } from '@/utils/constants/play'

/**
 * Time of the latest blast
 * @param {BombBoardView} board - Board
 * @return {number} - Milliseconds, zero without one
 */

export const blastOf = (board: BombBoardView): number =>
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
 * Fuse crackling for the holder only, faster as it heats
 * @param {boolean} isLive - Bomb lit
 * @param {boolean} isMine - Viewer holds it
 * @param {number} heat - Zero to one
 * @return {void}
 */

const useFuse = (isLive: boolean, isMine: boolean, heat: number): void => {
  const fuse = useRef<SoundLoop | null>(null)
  const isMuted = usePlaySoundStore((state) => state.isMuted)
  const volume = usePlaySoundStore((state) => volumeOf(state, PlayGames.Bomb))

  useEffect(() => {
    fuse.current = loopSound(BOMB_SOUNDS.fuse)

    return () => fuse.current?.stop()
  }, [])

  // Silent unless the bomb is in the viewer's hands
  useEffect(() => {
    const level = BOMB_MIX.fuseMine + heat * BOMB_MIX.fuseHeat
    fuse.current?.set(
      isMine && isLive && !isMuted ? volume * level : 0,
      BOMB_MIX.fuseRateMine + heat * BOMB_MIX.fuseRateHeat
    )
  }, [heat, isLive, isMine, isMuted, volume])
}

/**
 * Every Bomb Party sound, read off the live board
 * @param {BombBoardView} board - Board
 * @param {number} countdown - Seconds before the start
 * @param {number} heat - Bomb heat
 * @return {void}
 */

export const useBombSounds = (board: BombBoardView, countdown: number, heat: number): void => {
  const previous = useRef(board)
  const counted = useRef(countdown)
  const isLive = countdown === 0 && !board.isOver
  const isMine = board.isMyTurn && isLive

  useEffect(() => preloadBombSounds(), [])
  useFuse(isLive, isMine, heat)

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
