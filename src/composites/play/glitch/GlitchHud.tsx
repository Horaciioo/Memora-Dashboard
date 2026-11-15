'use client'

import { GlitchClock } from '@/composites/play/glitch/GlitchClock'
import type { GlitchBoardView, GlitchFace } from '@/composites/play/glitch/types'
import { PlayHud } from '@/composites/play/hud/PlayHud'
import { GLITCH_HUD_COPY } from '@/declarations/play'
import { GLITCH_BOARD } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

export interface GlitchHudProps {
  sessionId: string
  board: GlitchBoardView
  seats: GlitchFace[]
  viewerId: string
  isSeated: boolean
  now: number
  isReveal: boolean
}

/**
 * Glitch HUD: round, clock, own progress, players
 * @param {GlitchHudProps} props - Board and table
 * @return {JSX.Element}
 */

export const GlitchHud = ({
  sessionId,
  board,
  seats,
  viewerId,
  isSeated,
  now,
  isReveal,
}: GlitchHudProps) => {
  const ranked = seats.toSorted((left, right) => right.score - left.score)

  const blocks = [
    { key: 'round', caption: GLITCH_HUD_COPY.round, figure: `${board.round}/${board.rounds}` },
    {
      key: 'clock',
      caption: GLITCH_HUD_COPY.clock,
      figure: (
        <span className="block w-32 max-w-full">
          {isReveal ? (
            <span className={GLITCH_BOARD.clockTrack} />
          ) : (
            // New round, new bar
            <GlitchClock
              key={board.round}
              startsAt={board.startsAt}
              endsAt={board.endsAt}
              now={now}
            />
          )}
        </span>
      ),
    },
    ...(isSeated
      ? [
          {
            key: 'found',
            caption: GLITCH_HUD_COPY.found,
            figure: `${board.mine.found.length}/${board.total}`,
          },
        ]
      : []),
  ]

  const rows = ranked.map((seat) => ({
    accountId: seat.accountId,
    name: seat.name,
    avatarUrl: seat.avatarUrl,
    value: seat.score,
    isMine: seat.accountId === viewerId,
    isGone: seat.hasLeft,
  }))

  return (
    <PlayHud
      game={PlayGames.Glitch}
      sessionId={sessionId}
      isSeated={isSeated}
      blocks={blocks}
      rows={rows}
    />
  )
}
