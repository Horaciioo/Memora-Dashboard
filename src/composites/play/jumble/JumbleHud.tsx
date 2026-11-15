'use client'

import { JumbleClock } from '@/composites/play/jumble/JumbleClock'
import type { JumbleBoardView, JumbleFace } from '@/composites/play/jumble/types'
import { PlayHud } from '@/composites/play/hud/PlayHud'
import { JUMBLE_HUD_COPY } from '@/declarations/play'
import { JUMBLE_BOARD } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

export interface JumbleHudProps {
  sessionId: string
  board: JumbleBoardView
  seats: JumbleFace[]
  viewerId: string
  isSeated: boolean
  now: number
  isReveal: boolean
}

/**
 * Jumble HUD: round, clock, place, players
 * @param {JumbleHudProps} props - Board and table
 * @return {JSX.Element}
 */

export const JumbleHud = ({
  sessionId,
  board,
  seats,
  viewerId,
  isSeated,
  now,
  isReveal,
}: JumbleHudProps) => {
  const ranked = seats.toSorted(
    (left, right) => right.score - left.score || right.solved - left.solved
  )
  const place = ranked.findIndex((seat) => seat.accountId === viewerId) + 1

  const blocks = [
    { key: 'round', caption: JUMBLE_HUD_COPY.round, figure: `${board.round}/${board.rounds}` },
    {
      key: 'clock',
      caption: JUMBLE_HUD_COPY.clock,
      figure: (
        <span className="block w-32 max-w-full">
          {isReveal ? (
            <span className={JUMBLE_BOARD.clockTrack} />
          ) : (
            // New round, new bar
            <JumbleClock
              key={board.round}
              startsAt={board.startsAt}
              endsAt={board.endsAt}
              now={now}
            />
          )}
        </span>
      ),
    },
    ...(isSeated && place > 0
      ? [{ key: 'place', caption: JUMBLE_HUD_COPY.place, figure: place }]
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
      game={PlayGames.Jumble}
      sessionId={sessionId}
      isSeated={isSeated}
      blocks={blocks}
      rows={rows}
    />
  )
}
