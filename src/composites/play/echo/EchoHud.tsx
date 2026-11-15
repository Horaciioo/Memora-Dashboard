'use client'

import { EchoClock } from '@/composites/play/echo/EchoClock'
import type { EchoBoardView, EchoFace } from '@/composites/play/echo/types'
import { PlayHud } from '@/composites/play/hud/PlayHud'
import { ECHO_HUD_COPY } from '@/declarations/play'
import { ECHO_BOARD } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

export interface EchoHudProps {
  sessionId: string
  board: EchoBoardView
  seats: EchoFace[]
  viewerId: string
  isSeated: boolean
  now: number
  isReveal: boolean
}

/**
 * Echo HUD: round, clock, place, players
 * @param {EchoHudProps} props - Board and table
 * @return {JSX.Element}
 */

export const EchoHud = ({
  sessionId,
  board,
  seats,
  viewerId,
  isSeated,
  now,
  isReveal,
}: EchoHudProps) => {
  const ranked = seats.toSorted(
    (left, right) => right.score - left.score || right.found - left.found
  )
  const place = ranked.findIndex((seat) => seat.accountId === viewerId) + 1

  const blocks = [
    { key: 'round', caption: ECHO_HUD_COPY.card, figure: `${board.round}/${board.rounds}` },
    {
      key: 'clock',
      caption: ECHO_HUD_COPY.clock,
      figure: (
        <span className="block w-32">
          {isReveal ? (
            <span className={ECHO_BOARD.clockTrack} />
          ) : (
            // New round, new bar
            <EchoClock
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
      ? [{ key: 'place', caption: ECHO_HUD_COPY.place, figure: place }]
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
      game={PlayGames.Echo}
      sessionId={sessionId}
      isSeated={isSeated}
      blocks={blocks}
      rows={rows}
    />
  )
}
