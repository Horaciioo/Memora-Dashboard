'use client'

import { PlayHud } from '@/composites/play/hud/PlayHud'
import { SuspensClock } from '@/composites/play/suspens/SuspensClock'
import type { SuspensFace } from '@/composites/play/suspens/types'
import { SUSPENS_HUD_COPY } from '@/declarations/play'
import { SUSPENS_BOARD } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

export interface SuspensHudProps {
  sessionId: string
  round: number
  rounds: number
  seats: SuspensFace[]
  setterId: string | null
  viewerId: string
  isSeated: boolean
  isReveal: boolean
  // Turn window, the bar drains from start to end
  clock: { key: string; startsAt: Date | string; endsAt: Date | string | null; now: number }
}

/**
 * Suspens HUD: round, clock, setter, place, players
 * @param {SuspensHudProps} props - Board and table
 * @return {JSX.Element}
 */

export const SuspensHud = ({
  sessionId,
  round,
  rounds,
  seats,
  setterId,
  viewerId,
  isSeated,
  isReveal,
  clock,
}: SuspensHudProps) => {
  const ranked = seats.toSorted(
    (left, right) => right.score - left.score || right.found - left.found
  )
  const place = ranked.findIndex((seat) => seat.accountId === viewerId) + 1
  const setter = seats.find((seat) => seat.accountId === setterId)

  const blocks = [
    { key: 'round', caption: SUSPENS_HUD_COPY.round, figure: `${round}/${rounds}` },
    {
      key: 'clock',
      caption: SUSPENS_HUD_COPY.clock,
      figure: (
        <span className="block w-32 max-w-full">
          {isReveal || !clock.endsAt ? (
            <span className={SUSPENS_BOARD.clockTrack} />
          ) : (
            // New turn, new bar
            <SuspensClock
              key={clock.key}
              startsAt={clock.startsAt}
              endsAt={clock.endsAt}
              now={clock.now}
            />
          )}
        </span>
      ),
    },
    ...(setter
      ? [
          {
            key: 'setter',
            caption: SUSPENS_HUD_COPY.setter,
            figure: <span className="block max-w-28 truncate">{setter.name}</span>,
          },
        ]
      : []),
    ...(isSeated && place > 0
      ? [{ key: 'place', caption: SUSPENS_HUD_COPY.place, figure: place }]
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
      game={PlayGames.Suspens}
      sessionId={sessionId}
      isSeated={isSeated}
      blocks={blocks}
      rows={rows}
    />
  )
}
