'use client'

import { PlayCountdown } from '@/composites/play/baccalaureat/PlayCountdown'
import { secondsTo } from '@/composites/play/baccalaureat/types'
import { BombInput } from '@/composites/play/bomb/BombInput'
import { BombLetters } from '@/composites/play/bomb/BombLetters'
import { BombResult } from '@/composites/play/bomb/BombResult'
import { BombTable } from '@/composites/play/bomb/BombTable'
import type { BombBoardView, BombFace } from '@/composites/play/bomb/types'
import { useBombSounds } from '@/composites/play/bomb/useBombSounds'
import { usePlainBoard } from '@/core/hooks/data/play/usePlainBoard'
import { useServerNow } from '@/core/hooks/interaction/state/useServerNow'
import { BOMB_BOARD_COPY, BOMB_SETTINGS, fillPlayMessage } from '@/declarations/play'
import { BOMB_BOARD } from '@/declarations/ui/variants'

export interface BombBoardProps {
  sessionId: string
  board: BombBoardView
  // Every seat, with its face
  faces: { accountId: string; name: string; avatarUrl: string | null }[]
  viewerId: string
  isSeated: boolean
}

/**
 * Bomb Party screen: bonus letters on the left, the bomb and its players in the middle, live
 * @param {BombBoardProps} props - Board and table
 * @return {JSX.Element}
 */

export const BombBoard = ({
  sessionId,
  board: initial,
  faces,
  viewerId,
  isSeated,
}: BombBoardProps) => {
  const board = usePlainBoard(sessionId, initial)
  const now = useServerNow(board.serverTime)
  const seats: BombFace[] = board.players.map((player) => {
    const face = faces.find((entry) => entry.accountId === player.accountId)

    return { ...player, name: face?.name ?? '', avatarUrl: face?.avatarUrl ?? null }
  })

  const countdown = secondsTo(board.startsAt, now)
  useBombSounds(board, countdown)

  if (board.isOver) return <BombResult seats={seats} />

  const holder = seats.find((seat) => seat.accountId === board.turnId)
  // Viewer's letters, the holder's when watching
  const reader = seats.find((seat) => seat.accountId === viewerId) ?? holder
  const isBlasting =
    board.blast !== null && now - new Date(board.blast.at).getTime() < BOMB_SETTINGS.blastFlashMs
  const isMyTurn = board.isMyTurn && countdown === 0

  return (
    <div className={BOMB_BOARD.board}>
      {countdown > 0 && <PlayCountdown seconds={countdown} figureClassName={BOMB_BOARD.figure} />}

      <BombLetters alphabet={board.settings.bonusAlphabet} gathered={reader?.letters ?? []} />

      <div className={BOMB_BOARD.stage}>
        <BombTable
          seats={seats}
          prompt={board.prompt}
          turnId={board.turnId}
          draft={board.draft}
          miss={board.miss}
          blastId={isBlasting ? (board.blast?.accountId ?? null) : null}
          maxLives={board.settings.maxLives}
        />

        <p className={BOMB_BOARD.lead}>
          {isMyTurn
            ? BOMB_BOARD_COPY.yourTurn
            : fillPlayMessage(BOMB_BOARD_COPY.theirTurn, { name: holder?.name ?? '' })}{' '}
          <span className={BOMB_BOARD.leadPrompt}>{board.prompt}</span>
        </p>

        {isMyTurn && (
          <BombInput
            // Same key whether the board came as a page or a push
            key={`${board.prompt}:${board.blast ? new Date(board.blast.at).getTime() : ''}`}
            sessionId={sessionId}
            initial={board.draft}
          />
        )}
        {!isSeated && <p className={BOMB_BOARD.lead}>{BOMB_BOARD_COPY.spectating}</p>}
      </div>
    </div>
  )
}
