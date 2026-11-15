'use client'

import { PlayHud } from '@/composites/play/hud/PlayHud'
import { rankPlayers } from '@/composites/play/baccalaureat/types'
import type { BacBoardView, BacPlayer, BacRoundView } from '@/composites/play/baccalaureat/types'
import { BAC_BOARD_COPY, BAC_HUD_COPY } from '@/declarations/play'
import { BAC_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { PlayGames } from '@/utils/constants/play'

// Clock turns red under this
const LOW_SECONDS = 10

export interface BacHudProps {
  sessionId: string
  board: BacBoardView
  round: BacRoundView
  players: BacPlayer[]
  viewerId: string
  isSeated: boolean
  // Letter shown once the countdown is over
  isLetterOut: boolean
  // Null when no clock runs
  clock: { left: number; total: number } | null
  // Players done writing or voting, null before
  progress: string[] | null
  isVoting: boolean
}

/**
 * Baccalaureat HUD: round, letter, clock, who is ready, and the running totals
 * @param {BacHudProps} props - Round and table
 * @return {JSX.Element}
 */

export const BacHud = ({
  sessionId,
  board,
  round,
  players,
  viewerId,
  isSeated,
  isLetterOut,
  clock,
  progress,
  isVoting,
}: BacHudProps) => {
  const isLow = clock !== null && clock.left <= LOW_SECONDS
  const share = clock && clock.total > 0 ? Math.min(1, clock.left / clock.total) : 0

  const blocks = [
    {
      key: 'round',
      caption: BAC_HUD_COPY.round,
      figure: `${round.index + 1}/${board.roundsTotal}`,
    },
    {
      key: 'letter',
      caption: BAC_HUD_COPY.letter,
      figure: (
        <span className={BAC_BOARD.hudLetter}>
          {isLetterOut ? round.letter : BAC_BOARD_COPY.letterHidden}
        </span>
      ),
    },
    ...(clock
      ? [
          {
            key: 'clock',
            caption: BAC_HUD_COPY.clock,
            figure: (
              <span className="flex items-center gap-2" role="timer" aria-live="off">
                <span className={cn(isLow && BAC_BOARD.hudLow)}>{clock.left}</span>
                <span className={BAC_BOARD.hudClockTrack}>
                  <span
                    className={cn(BAC_BOARD.hudClockBar, isLow && BAC_BOARD.hudClockLow)}
                    style={{ width: `${share * 100}%` }}
                  />
                </span>
              </span>
            ),
          },
        ]
      : []),
    ...(progress
      ? [
          {
            key: 'ready',
            caption: isVoting ? BAC_HUD_COPY.voted : BAC_HUD_COPY.written,
            figure: `${progress.length}/${players.length}`,
          },
        ]
      : []),
  ]

  const rows = rankPlayers(board.history, players).map((player) => ({
    accountId: player.accountId,
    name: player.name,
    avatarUrl: player.avatarUrl,
    value: player.points,
    isMine: player.accountId === viewerId,
    isGone: false,
  }))

  return (
    <PlayHud
      game={PlayGames.Baccalaureat}
      sessionId={sessionId}
      isSeated={isSeated}
      blocks={blocks}
      rows={rows}
    />
  )
}
