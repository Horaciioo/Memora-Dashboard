'use client'

import { useEffect, useRef } from 'react'

import type { EchoBoardView } from '@/composites/play/echo/types'
import { playSound, preloadSounds } from '@/core/lib/play/sounds'
import { playLevelOf } from '@/core/store/play/playSound'
import { ECHO_SOUNDS } from '@/declarations/play'
import type { EchoSoundName } from '@/declarations/play'
import { PlayGames } from '@/utils/constants/play'

/**
 * Sound of what changed between two boards
 * @param {EchoBoardView} before - Previous board
 * @param {EchoBoardView} board - Current board
 * @param {string} viewerId - Reader
 * @return {EchoSoundName | null} - Sound
 */

const soundOf = (
  before: EchoBoardView,
  board: EchoBoardView,
  viewerId: string
): EchoSoundName | null => {
  if (board.isOver && !before.isOver) return 'over'
  const mine = (view: EchoBoardView) => view.players.find((seat) => seat.accountId === viewerId)
  if (mine(board)?.rank && !mine(before)?.rank) return 'mine'
  if (mine(board)?.lockedUntil !== mine(before)?.lockedUntil) return 'missed'
  if (
    board.players.filter((seat) => seat.rank).length >
    before.players.filter((seat) => seat.rank).length
  ) {
    return 'found'
  }

  return null
}

/**
 * Play the sounds of an Echo game as the board moves
 * @param {EchoBoardView} board - Latest board
 * @param {string} viewerId - Reader
 * @return {void}
 */

export const useEchoSounds = (board: EchoBoardView, viewerId: string): void => {
  const previous = useRef(board)

  useEffect(() => preloadSounds(Object.values(ECHO_SOUNDS)), [])

  useEffect(() => {
    const sound =
      previous.current.round === board.round ? soundOf(previous.current, board, viewerId) : null
    previous.current = board
    if (sound) playSound(ECHO_SOUNDS[sound], playLevelOf(PlayGames.Echo))
  }, [board, viewerId])
}
