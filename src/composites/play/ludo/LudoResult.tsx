'use client'

import { useEffect } from 'react'

import { PlayPodium } from '@/composites/play/results/PlayPodium'
import { playLudoSound } from '@/composites/play/ludo/sound'
import { GOAL_STEP } from '@/core/lib/play/ludo'
import type { LudoPlayerView } from '@/core/lib/play/ludo'
import { fillPlayMessage } from '@/declarations/play/copy'
import { LUDO_BOARD_COPY, ludoPlaceLabel } from '@/declarations/play/ludo/copy'
import { BOMB_BOARD } from '@/declarations/ui/variants'

/**
 * Colour with its face
 * @typedef {Object} LudoRanked
 */

export interface LudoRanked extends LudoPlayerView {
  name: string
  avatarUrl: string | null
}

/**
 * Places first, then the farthest along, leavers last
 * @param {LudoRanked[]} players - Colours
 * @return {LudoRanked[]} - Ranking
 */

const rankPlayers = (players: LudoRanked[]): LudoRanked[] =>
  players.toSorted(
    (left, right) =>
      Number(left.hasLeft) - Number(right.hasLeft) ||
      (left.place ?? Infinity) - (right.place ?? Infinity) ||
      right.progress - left.progress
  )

/**
 * Podium of the race under confetti, a fanfare as it opens
 * @param {Object} props - Result
 * @param {LudoRanked[]} props.players - Colours
 * @return {JSX.Element}
 */

export const LudoResult = ({ players }: { players: LudoRanked[] }) => {
  const ranked = rankPlayers(players)

  // Fanfare once
  useEffect(() => playLudoSound('victory'), [])

  return (
    <div className={BOMB_BOARD.result}>
      <PlayPodium
        hasWinner={ranked.some((player) => player.place === 1 && !player.hasLeft)}
        ranked={ranked.map((player) => ({
          ...player,
          note: player.place
            ? ludoPlaceLabel(player.place)
            : fillPlayMessage(LUDO_BOARD_COPY.home, {
                count: player.pawns.filter((step) => step >= GOAL_STEP).length,
                total: player.pawns.length,
              }),
        }))}
      />
    </div>
  )
}
