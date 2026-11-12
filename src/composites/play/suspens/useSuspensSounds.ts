'use client'

import { useEffect, useRef } from 'react'

import type { SuspensBoardView } from '@/composites/play/suspens/types'
import { playSound, preloadSounds } from '@/core/lib/play/sounds'
import { playLevelOf } from '@/core/store/play/playSound'
import { SUSPENS_SOUNDS } from '@/declarations/play'
import type { SuspensSoundName } from '@/declarations/play'
import { PlayGames } from '@/utils/constants/play'

/**
 * Sound of what changed between two boards of the same round
 * @param {SuspensBoardView} before - Previous board
 * @param {SuspensBoardView} board - Current board
 * @return {SuspensSoundName | null} - Sound
 */

const soundOf = (before: SuspensBoardView, board: SuspensBoardView): SuspensSoundName | null => {
  if (board.isOver && !before.isOver) return 'over'
  if (board.reveal && !before.reveal) return board.reveal.isSolved ? 'solved' : 'hanged'
  if (board.errors > before.errors) return 'miss'
  if (board.tried.length > before.tried.length) return 'hit'

  return board.isMyTurn && !before.isMyTurn ? 'turn' : null
}

/**
 * Play the sounds of a Suspens game as the board moves
 * @param {SuspensBoardView} board - Latest board
 * @return {void}
 */

export const useSuspensSounds = (board: SuspensBoardView): void => {
  const previous = useRef(board)

  useEffect(() => preloadSounds(Object.values(SUSPENS_SOUNDS)), [])

  useEffect(() => {
    const sound = previous.current.round === board.round ? soundOf(previous.current, board) : null
    previous.current = board
    if (sound) playSound(SUSPENS_SOUNDS[sound], playLevelOf(PlayGames.Suspens))
  }, [board])
}
