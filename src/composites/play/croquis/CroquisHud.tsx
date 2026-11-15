'use client'

import { CroquisClock } from '@/composites/play/croquis/CroquisClock'
import type { CroquisBoardView, CroquisFace } from '@/composites/play/croquis/types'
import { PlayHud } from '@/composites/play/hud/PlayHud'
import { CROQUIS_HUD_COPY } from '@/declarations/play'
import { CROQUIS_BOARD } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

export interface CroquisHudProps {
  sessionId: string
  board: CroquisBoardView
  seats: CroquisFace[]
  viewerId: string
  isSeated: boolean
  now: number
  isReveal: boolean
}

/**
 * Croquis HUD: round, clock, drawer, place, players
 * @param {CroquisHudProps} props - Board and table
 * @return {JSX.Element}
 */

export const CroquisHud = ({
  sessionId,
  board,
  seats,
  viewerId,
  isSeated,
  now,
  isReveal,
}: CroquisHudProps) => {
  const ranked = seats.toSorted(
    (left, right) => right.score - left.score || right.found - left.found
  )
  const place = ranked.findIndex((seat) => seat.accountId === viewerId) + 1
  const drawer = seats.find((seat) => seat.accountId === board.drawerId)

  const blocks = [
    { key: 'round', caption: CROQUIS_HUD_COPY.round, figure: `${board.round}/${board.rounds}` },
    {
      key: 'clock',
      caption: CROQUIS_HUD_COPY.clock,
      figure: (
        <span className="block w-32">
          {isReveal ? (
            <span className={CROQUIS_BOARD.clockTrack} />
          ) : (
            // New round, new bar
            <CroquisClock
              key={board.round}
              startsAt={board.startsAt}
              endsAt={board.endsAt}
              now={now}
            />
          )}
        </span>
      ),
    },
    {
      key: 'drawer',
      caption: CROQUIS_HUD_COPY.drawer,
      figure: (
        <span className="block max-w-28 truncate">
          {board.drawerId === viewerId ? CROQUIS_HUD_COPY.you : (drawer?.name ?? '')}
        </span>
      ),
    },
    ...(isSeated && place > 0
      ? [{ key: 'place', caption: CROQUIS_HUD_COPY.place, figure: place }]
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
      game={PlayGames.Croquis}
      sessionId={sessionId}
      isSeated={isSeated}
      blocks={blocks}
      rows={rows}
    />
  )
}
