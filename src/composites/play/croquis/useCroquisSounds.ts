'use client'

import { useEffect, useRef } from 'react'

import type { CroquisBoardView } from '@/composites/play/croquis/types'
import { playSound, preloadSounds } from '@/core/lib/play/sounds'
import { playLevelOf } from '@/core/store/play/playSound'
import { CROQUIS_SOUNDS } from '@/declarations/play'
import type { CroquisSoundName } from '@/declarations/play'
import { PlayGames } from '@/utils/constants/play'

/**
 * Sound of what changed between two boards
 * @param {CroquisBoardView} before - Previous board
 * @param {CroquisBoardView} board - Current board
 * @param {string} viewerId - Reader
 * @return {CroquisSoundName | null} - Sound
 */

const soundOf = (
  before: CroquisBoardView,
  board: CroquisBoardView,
  viewerId: string
): CroquisSoundName | null => {
  if (board.isOver && !before.isOver) return 'over'

  // A player just found the word
  const found = board.players.find(
    (player) =>
      player.rank !== null &&
      before.players.find((entry) => entry.accountId === player.accountId)?.rank === null
  )
  if (found) return found.accountId === viewerId ? 'mine' : 'found'

  if (board.reveal && !before.reveal) return board.reveal.solvers === 0 ? 'missed' : null

  return board.hint && !before.hint ? 'hint' : null
}

/**
 * Play the sounds of a Croquis game as the board moves
 * @param {CroquisBoardView} board - Latest board
 * @param {string} viewerId - Reader
 * @return {void}
 */

export const useCroquisSounds = (board: CroquisBoardView, viewerId: string): void => {
  const previous = useRef(board)

  useEffect(() => preloadSounds(Object.values(CROQUIS_SOUNDS)), [])

  useEffect(() => {
    const sound =
      previous.current.round === board.round ? soundOf(previous.current, board, viewerId) : null
    previous.current = board
    if (sound) playSound(CROQUIS_SOUNDS[sound], playLevelOf(PlayGames.Croquis))
  }, [board, viewerId])
}
