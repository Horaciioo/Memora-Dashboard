'use client'

import { useEffect, useRef } from 'react'

import type { GlitchBoardView } from '@/composites/play/glitch/types'
import { playSound, preloadSounds } from '@/core/lib/play/sounds'
import { playLevelOf } from '@/core/store/play/playSound'
import { GLITCH_SOUNDS } from '@/declarations/play'
import type { GlitchSoundName } from '@/declarations/play'
import { PlayGames } from '@/utils/constants/play'

/**
 * Sound of what changed between two boards
 * @param {GlitchBoardView} before - Previous board
 * @param {GlitchBoardView} board - Current board
 * @param {string} viewerId - Reader
 * @return {GlitchSoundName | null} - Sound
 */

const soundOf = (
  before: GlitchBoardView,
  board: GlitchBoardView,
  viewerId: string
): GlitchSoundName | null => {
  if (board.isOver && !before.isOver) return 'over'
  const seat = (view: GlitchBoardView) => view.players.find((entry) => entry.accountId === viewerId)
  if (seat(board)?.rank && !seat(before)?.rank) return 'mine'
  if (board.mine.lockedUntil !== before.mine.lockedUntil) return 'missed'

  return board.mine.found.length > before.mine.found.length ? 'found' : null
}

/**
 * Play the sounds of a Glitch game as the board moves
 * @param {GlitchBoardView} board - Latest board
 * @param {string} viewerId - Reader
 * @return {void}
 */

export const useGlitchSounds = (board: GlitchBoardView, viewerId: string): void => {
  const previous = useRef(board)

  useEffect(() => preloadSounds(Object.values(GLITCH_SOUNDS)), [])

  useEffect(() => {
    const sound =
      previous.current.round === board.round ? soundOf(previous.current, board, viewerId) : null
    previous.current = board
    if (sound) playSound(GLITCH_SOUNDS[sound], playLevelOf(PlayGames.Glitch))
  }, [board, viewerId])
}
