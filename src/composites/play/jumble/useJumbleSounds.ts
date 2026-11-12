'use client'

import { useEffect, useRef } from 'react'

import type { JumbleBoardView } from '@/composites/play/jumble/types'
import { playSound, preloadSounds } from '@/core/lib/play/sounds'
import { playLevelOf } from '@/core/store/play/playSound'
import { JUMBLE_SOUNDS } from '@/declarations/play'
import type { JumbleSoundName } from '@/declarations/play'
import { PlayGames } from '@/utils/constants/play'

/**
 * Sound of what changed between two boards
 * @param {JumbleBoardView} before - Previous board
 * @param {JumbleBoardView} board - Current board
 * @param {string} viewerId - Reader
 * @return {JumbleSoundName | null} - Sound
 */

const soundOf = (
  before: JumbleBoardView,
  board: JumbleBoardView,
  viewerId: string
): JumbleSoundName | null => {
  if (board.isOver && !before.isOver) return 'over'
  if (board.reveal && !before.reveal) {
    if (!board.reveal.solverId) return 'missed'

    return board.reveal.solverId === viewerId ? 'mine' : 'solved'
  }

  return board.hint && !before.hint ? 'hint' : null
}

/**
 * Play the sounds of a Jumble game as the board moves
 * @param {JumbleBoardView} board - Latest board
 * @param {string} viewerId - Reader
 * @return {void}
 */

export const useJumbleSounds = (board: JumbleBoardView, viewerId: string): void => {
  const previous = useRef(board)

  useEffect(() => preloadSounds(Object.values(JUMBLE_SOUNDS)), [])

  useEffect(() => {
    const sound =
      previous.current.round === board.round ? soundOf(previous.current, board, viewerId) : null
    previous.current = board
    if (sound) playSound(JUMBLE_SOUNDS[sound], playLevelOf(PlayGames.Jumble))
  }, [board, viewerId])
}
