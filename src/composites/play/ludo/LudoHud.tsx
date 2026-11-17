'use client'

import type { LudoSeatFace } from '@/composites/play/ludo/LudoPlates'
import { PlayHud } from '@/composites/play/hud/PlayHud'
import { isHomeStep } from '@/core/lib/play/ludo/track'
import type { LudoMap } from '@/core/lib/play/ludo/maps'
import { LUDO_HUD_COPY } from '@/declarations/play'
import { PlayGames } from '@/utils/constants/play'

export interface LudoHudProps {
  sessionId: string
  map: LudoMap
  seats: LudoSeatFace[]
  viewerId: string
  isSeated: boolean
  // Player holding the die
  turnId: string | null
  // Seconds left on the turn clock
  seconds: number
}

/**
 * Ludo HUD: whose turn, the viewer's pawns home, clock, and the ranking by pawns home
 * @param {LudoHudProps} props - Table
 * @return {JSX.Element}
 */

export const LudoHud = ({
  sessionId,
  map,
  seats,
  viewerId,
  isSeated,
  turnId,
  seconds,
}: LudoHudProps) => {
  const homeOf = (seat: LudoSeatFace) => seat.pawns.filter((step) => isHomeStep(map, step)).length
  const holder = seats.find((seat) => seat.accountId === turnId)
  // The viewer's pawns, the holder's when watching
  const reader = seats.find((seat) => seat.accountId === viewerId) ?? holder
  const ranked = seats.toSorted(
    (left, right) =>
      Number(left.hasLeft) - Number(right.hasLeft) ||
      (left.place ?? Infinity) - (right.place ?? Infinity) ||
      homeOf(right) - homeOf(left) ||
      right.progress - left.progress
  )

  const blocks = [
    { key: 'turn', caption: LUDO_HUD_COPY.turn, figure: holder?.name ?? '' },
    {
      key: 'home',
      caption: LUDO_HUD_COPY.home,
      figure: reader ? `${homeOf(reader)}/${reader.pawns.length}` : '',
    },
    { key: 'time', caption: LUDO_HUD_COPY.time, figure: turnId ? seconds : '' },
  ]

  const rows = ranked.map((seat) => ({
    accountId: seat.accountId,
    name: seat.name,
    avatarUrl: seat.avatarUrl,
    value: `${homeOf(seat)}/${seat.pawns.length}`,
    isMine: seat.accountId === viewerId,
    isGone: seat.hasLeft,
  }))

  return (
    <PlayHud
      game={PlayGames.Ludo}
      sessionId={sessionId}
      isSeated={isSeated}
      blocks={blocks}
      rows={rows}
      hasStrip={false}
      isStart={map.corners > 4}
    />
  )
}
