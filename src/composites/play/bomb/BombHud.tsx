'use client'

import { BombLetters } from '@/composites/play/bomb/BombLetters'
import type { BombBoardView, BombFace } from '@/composites/play/bomb/types'
import { PlayHud } from '@/composites/play/hud/PlayHud'
import { BOMB_HUD_COPY } from '@/declarations/play'
import { BOMB_BOARD } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

export interface BombHudProps {
  sessionId: string
  board: BombBoardView
  seats: BombFace[]
  viewerId: string
  isSeated: boolean
  // Fuse burnt, zero to one
  heat: number
}

/**
 * Bomb HUD: turn, syllable, fuse, players and bonus letters
 * @param {BombHudProps} props - Board and table
 * @return {JSX.Element}
 */

export const BombHud = ({ sessionId, board, seats, viewerId, isSeated, heat }: BombHudProps) => {
  const holder = seats.find((seat) => seat.accountId === board.turnId)
  // Viewer's letters, the holder's when watching
  const reader = seats.find((seat) => seat.accountId === viewerId) ?? holder
  const ranked = seats.toSorted(
    (left, right) => right.lives - left.lives || right.words - left.words
  )

  const blocks = [
    { key: 'turn', caption: BOMB_HUD_COPY.turn, figure: holder?.name ?? '' },
    { key: 'prompt', caption: BOMB_HUD_COPY.prompt, figure: board.prompt },
    {
      key: 'fuse',
      caption: BOMB_HUD_COPY.fuse,
      figure: (
        <span className={BOMB_BOARD.fuseTrack}>
          <span className={BOMB_BOARD.fuseBar} style={{ width: `${(1 - heat) * 100}%` }} />
        </span>
      ),
    },
  ]

  const rows = ranked.map((seat) => ({
    accountId: seat.accountId,
    name: seat.name,
    avatarUrl: seat.avatarUrl,
    value: seat.isOut ? '0' : seat.lives,
    isMine: seat.accountId === viewerId,
    isGone: seat.hasLeft || seat.isOut,
  }))

  return (
    <PlayHud
      game={PlayGames.Bomb}
      sessionId={sessionId}
      isSeated={isSeated}
      blocks={blocks}
      rows={rows}
    >
      <BombLetters alphabet={board.settings.bonusAlphabet} gathered={reader?.letters ?? []} />
    </PlayHud>
  )
}
