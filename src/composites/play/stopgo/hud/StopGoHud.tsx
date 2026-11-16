'use client'

import { PlayHud } from '@/composites/play/hud/PlayHud'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { useServerNow } from '@/core/hooks/interaction/state/time/useServerNow'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'
import { fillPlayMessage } from '@/declarations/play/copy'
import { STOPGO_HUD_COPY } from '@/declarations/play/stopgo/copy'
import { PlayGames, StopGoPhases } from '@/utils/constants/play'
import { SECOND_MS } from '@/utils/constants/time'

export interface StopGoHudProps {
  sessionId: string
  board: StopGoBoardView
  faces: PlayFace[]
  viewerId: string
  isSeated: boolean
}

/**
 * Race HUD: whose turn, the distance, the turn clock, and the ranking by kilometres behind a trophy key
 * @param {StopGoHudProps} props - Race
 * @return {JSX.Element}
 */

export const StopGoHud = ({ sessionId, board, faces, viewerId, isSeated }: StopGoHudProps) => {
  const now = useServerNow(board.serverTime)
  const holder = faces.find((face) => face.id === board.turnId)
  const isLive = board.phase === StopGoPhases.Playing && !!board.turnEndsAt
  const seconds = isLive
    ? Math.max(0, Math.ceil((new Date(board.turnEndsAt!).getTime() - now) / SECOND_MS))
    : ''

  const blocks = [
    {
      key: 'target',
      caption: STOPGO_HUD_COPY.target,
      figure: fillPlayMessage(STOPGO_HUD_COPY.km, { km: board.target }),
    },
    { key: 'turn', caption: STOPGO_HUD_COPY.turn, figure: holder?.name ?? '' },
    { key: 'time', caption: STOPGO_HUD_COPY.time, figure: seconds },
  ]

  const rows = board.players
    .toSorted(
      (left, right) =>
        Number(left.hasLeft) - Number(right.hasLeft) ||
        (left.place ?? Infinity) - (right.place ?? Infinity) ||
        right.km - left.km
    )
    .map((player) => {
      const face = faces.find((entry) => entry.id === player.accountId)

      return {
        accountId: player.accountId,
        name: face?.name ?? '',
        avatarUrl: face?.avatarUrl ?? null,
        value: fillPlayMessage(STOPGO_HUD_COPY.km, { km: player.km }),
        isMine: player.accountId === viewerId,
        isGone: player.hasLeft,
      }
    })

  return (
    <PlayHud
      game={PlayGames.StopGo}
      sessionId={sessionId}
      isSeated={isSeated}
      blocks={blocks}
      rows={rows}
      hasStrip={false}
      isWide
    />
  )
}
