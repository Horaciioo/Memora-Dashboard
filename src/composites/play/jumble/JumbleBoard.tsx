'use client'

import { JumbleHud } from '@/composites/play/jumble/JumbleHud'
import { JumbleInput } from '@/composites/play/jumble/JumbleInput'
import { JumbleResult } from '@/composites/play/jumble/JumbleResult'
import { JumbleReveal } from '@/composites/play/jumble/JumbleReveal'
import { JumbleSlots, JumbleTiles } from '@/composites/play/jumble/JumbleTiles'
import type { JumbleBoardView, JumbleFace } from '@/composites/play/jumble/types'
import { useJumbleSounds } from '@/composites/play/jumble/useJumbleSounds'
import { PlayCountdown } from '@/composites/play/baccalaureat/PlayCountdown'
import { secondsTo } from '@/composites/play/baccalaureat/types'
import { usePlainBoard } from '@/core/hooks/data/play/usePlainBoard'
import { useServerNow } from '@/core/hooks/interaction/state/time/useServerNow'
import { JUMBLE_BOARD_COPY, JUMBLE_SETTINGS } from '@/declarations/play'
import { JUMBLE_BOARD } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

export interface JumbleBoardProps {
  sessionId: string
  board: JumbleBoardView
  // Every seat, with its face
  faces: { accountId: string; name: string; avatarUrl: string | null }[]
  viewerId: string
  isSeated: boolean
}

/**
 * Jumble screen: the mixed letters, the clock, the field and the scores, live
 * @param {JumbleBoardProps} props - Board and table
 * @return {JSX.Element}
 */

export const JumbleBoard = ({
  sessionId,
  board: initial,
  faces,
  viewerId,
  isSeated,
}: JumbleBoardProps) => {
  const board = usePlainBoard(sessionId, initial)
  const now = useServerNow(board.serverTime)
  useJumbleSounds(board, viewerId)

  const seats: JumbleFace[] = board.players.map((player) => {
    const face = faces.find((entry) => entry.accountId === player.accountId)

    return { ...player, name: face?.name ?? '', avatarUrl: face?.avatarUrl ?? null }
  })
  if (board.isOver) return <JumbleResult seats={seats} />

  const countdown = secondsTo(board.startsAt, now)
  const { reveal } = board
  const solver = seats.find((seat) => seat.accountId === reveal?.solverId)
  const isPlaying = countdown === 0 && !reveal

  return (
    <div className={JUMBLE_BOARD.board} data-hud="jumble">
      {board.round === 1 && countdown > 0 && (
        <PlayCountdown
          game={PlayGames.Jumble}
          seconds={countdown}
          total={JUMBLE_SETTINGS.countdownSeconds}
          figureClassName={JUMBLE_BOARD.figure}
        />
      )}

      <JumbleHud
        sessionId={sessionId}
        board={board}
        seats={seats}
        viewerId={viewerId}
        isSeated={isSeated}
        now={now}
        isReveal={Boolean(reveal)}
      />

      <JumbleTiles
        scrambled={board.scrambled}
        word={reveal?.word ?? null}
        isFound={Boolean(reveal?.solverId)}
        round={board.round}
      />

      <div className={JUMBLE_BOARD.zone}>
        {reveal ? (
          <JumbleReveal reveal={reveal} solver={solver} isMine={reveal.solverId === viewerId} />
        ) : (
          <>
            <JumbleSlots key={`slots-${board.round}`} length={board.length} hint={board.hint} />
            {isSeated ? (
              <JumbleInput key={`input-${board.round}`} sessionId={sessionId} isOpen={isPlaying} />
            ) : (
              <p className={JUMBLE_BOARD.lead}>{JUMBLE_BOARD_COPY.watching}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
