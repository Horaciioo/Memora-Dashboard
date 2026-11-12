'use client'

import { CroquisCanvas } from '@/composites/play/croquis/CroquisCanvas'
import { CroquisClock } from '@/composites/play/croquis/CroquisClock'
import { CroquisInput } from '@/composites/play/croquis/CroquisInput'
import { CroquisResult } from '@/composites/play/croquis/CroquisResult'
import { CroquisReveal } from '@/composites/play/croquis/CroquisReveal'
import { CroquisScores } from '@/composites/play/croquis/CroquisScores'
import { CroquisStudio } from '@/composites/play/croquis/CroquisStudio'
import { CroquisWord } from '@/composites/play/croquis/CroquisWord'
import type { CroquisBoardView, CroquisFace } from '@/composites/play/croquis/types'
import { useCroquisSounds } from '@/composites/play/croquis/useCroquisSounds'
import { PlayCountdown } from '@/composites/play/baccalaureat/PlayCountdown'
import { secondsTo } from '@/composites/play/baccalaureat/types'
import { usePlainBoard } from '@/core/hooks/data/play/usePlainBoard'
import { useServerNow } from '@/core/hooks/interaction/state/time/useServerNow'
import { CROQUIS_BOARD_COPY, CROQUIS_SETTINGS, fillPlayMessage } from '@/declarations/play'
import { CROQUIS_BOARD } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

export interface CroquisBoardProps {
  sessionId: string
  board: CroquisBoardView
  // Every seat, with its face
  faces: { accountId: string; name: string; avatarUrl: string | null }[]
  viewerId: string
  isSeated: boolean
}

/**
 * Croquis screen: the word line, the paper with its tools, the answer field and the scores, live
 * @param {CroquisBoardProps} props - Board and table
 * @return {JSX.Element}
 */

export const CroquisBoard = ({
  sessionId,
  board: initial,
  faces,
  viewerId,
  isSeated,
}: CroquisBoardProps) => {
  const board = usePlainBoard(sessionId, initial)
  const now = useServerNow(board.serverTime)
  useCroquisSounds(board, viewerId)

  const seats: CroquisFace[] = board.players.map((player) => {
    const face = faces.find((entry) => entry.accountId === player.accountId)

    return { ...player, name: face?.name ?? '', avatarUrl: face?.avatarUrl ?? null }
  })
  if (board.isOver) return <CroquisResult seats={seats} />

  const countdown = secondsTo(board.startsAt, now)
  const { reveal } = board
  const drawer = seats.find((seat) => seat.accountId === board.drawerId)
  const me = seats.find((seat) => seat.accountId === viewerId)
  const isDrawer = board.drawerId === viewerId
  const isPlaying = countdown === 0 && !reveal

  return (
    <div className={CROQUIS_BOARD.board}>
      {board.round === 1 && countdown > 0 && (
        <PlayCountdown
          game={PlayGames.Croquis}
          seconds={countdown}
          total={CROQUIS_SETTINGS.countdownSeconds}
          figureClassName={CROQUIS_BOARD.figure}
        />
      )}

      <div className={CROQUIS_BOARD.head}>
        <span className={CROQUIS_BOARD.round}>
          {fillPlayMessage(CROQUIS_BOARD_COPY.round, { round: board.round, total: board.rounds })}
        </span>
        {reveal ? (
          <div className={CROQUIS_BOARD.clockTrack} />
        ) : (
          <CroquisClock
            // New round, new bar
            key={`clock-${board.round}`}
            startsAt={board.startsAt}
            endsAt={board.endsAt}
            now={now}
          />
        )}
        <span className={CROQUIS_BOARD.lead}>
          {isDrawer
            ? CROQUIS_BOARD_COPY.youDraw
            : fillPlayMessage(CROQUIS_BOARD_COPY.drawing, { name: drawer?.name ?? '' })}
        </span>
      </div>

      <CroquisWord
        word={reveal?.word ?? board.word}
        shape={board.shape}
        hint={board.hint}
        isDrawer={isDrawer && !reveal}
      />

      {isDrawer ? (
        <CroquisStudio
          // New round, clean paper
          key={`studio-${board.round}`}
          sessionId={sessionId}
          initial={board.strokes}
          isOpen={isPlaying}
        />
      ) : (
        <div className={CROQUIS_BOARD.stage}>
          <CroquisCanvas strokes={board.strokes} pen={null} />
        </div>
      )}

      <div className={CROQUIS_BOARD.zone}>
        {reveal ? (
          <CroquisReveal reveal={reveal} drawer={drawer} />
        ) : !isSeated ? (
          <p className={CROQUIS_BOARD.lead}>{CROQUIS_BOARD_COPY.watching}</p>
        ) : isDrawer ? null : me?.rank !== null && me?.rank !== undefined ? (
          <span className={CROQUIS_BOARD.found}>
            {CROQUIS_BOARD_COPY.found}{' '}
            {fillPlayMessage(CROQUIS_BOARD_COPY.points, { points: me.gain })}
          </span>
        ) : (
          <CroquisInput key={`input-${board.round}`} sessionId={sessionId} isOpen={isPlaying} />
        )}
      </div>

      <CroquisScores seats={seats} isRunning={!reveal} />
    </div>
  )
}
