'use client'

import { PlayCountdown } from '@/composites/play/baccalaureat/PlayCountdown'
import { secondsTo } from '@/composites/play/baccalaureat/types'
import { GlitchHud } from '@/composites/play/glitch/GlitchHud'
import { GlitchPicture } from '@/composites/play/glitch/GlitchPicture'
import { GlitchResult } from '@/composites/play/glitch/GlitchResult'
import { GlitchReveal } from '@/composites/play/glitch/GlitchReveal'
import type { GlitchBoardView, GlitchFace } from '@/composites/play/glitch/types'
import { useGlitchSounds } from '@/composites/play/glitch/useGlitchSounds'
import { usePlainBoard } from '@/core/hooks/data/play/usePlainBoard'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { useServerNow } from '@/core/hooks/interaction/state/time/useServerNow'
import { GLITCH_BOARD_COPY, GLITCH_SETTINGS } from '@/declarations/play'
import { GLITCH_BOARD } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

export interface GlitchBoardProps {
  sessionId: string
  board: GlitchBoardView
  // Every seat, with its face
  faces: { accountId: string; name: string; avatarUrl: string | null }[]
  viewerId: string
  isSeated: boolean
}

/**
 * Glitch screen: the two pictures, the clock, the own progress and the scores, live
 * @param {GlitchBoardProps} props - Board and table
 * @return {JSX.Element}
 */

export const GlitchBoard = ({
  sessionId,
  board: initial,
  faces,
  viewerId,
  isSeated,
}: GlitchBoardProps) => {
  const board = usePlainBoard(sessionId, initial)
  const now = useServerNow(board.serverTime)
  const { act } = usePlayAct(sessionId)
  useGlitchSounds(board, viewerId)

  const seats: GlitchFace[] = board.players.map((player) => {
    const face = faces.find((entry) => entry.accountId === player.accountId)

    return { ...player, name: face?.name ?? '', avatarUrl: face?.avatarUrl ?? null }
  })
  if (board.isOver) return <GlitchResult seats={seats} />

  const countdown = secondsTo(board.startsAt, now)
  const me = seats.find((seat) => seat.accountId === viewerId)
  const isReveal = board.revealUntil !== null
  const isLocked = new Date(board.mine.lockedUntil ?? 0).getTime() > now
  const isDone = Boolean(me?.rank)
  const canSpot = isSeated && countdown === 0 && !isReveal && !isLocked && !isDone
  // Rings left on the pictures after the round
  const missed = (board.marks ?? []).filter(
    (mark) => !board.mine.found.some((entry) => entry.x === mark.x && entry.y === mark.y)
  )
  const spot = canSpot ? (x: number, y: number) => void act({ type: 'spot', x, y }) : undefined
  const picture = {
    width: board.width,
    height: board.height,
    found: board.mine.found,
    missed,
    isLocked,
    onSpot: spot,
  }

  return (
    <div className={GLITCH_BOARD.board} data-hud="glitch">
      {board.round === 1 && countdown > 0 && (
        <PlayCountdown
          game={PlayGames.Glitch}
          seconds={countdown}
          total={GLITCH_SETTINGS.countdownSeconds}
          figureClassName={GLITCH_BOARD.figure}
        />
      )}

      <GlitchHud
        sessionId={sessionId}
        board={board}
        seats={seats}
        viewerId={viewerId}
        isSeated={isSeated}
        now={now}
        isReveal={isReveal}
      />

      {/* Pictures stay hidden behind the opening countdown */}
      {countdown === 0 && (
        <div className={GLITCH_BOARD.pictures}>
          <GlitchPicture
            key={`l${board.round}`}
            items={board.left}
            caption={GLITCH_BOARD_COPY.left}
            {...picture}
          />
          <span className={GLITCH_BOARD.divider} aria-hidden="true" />
          <GlitchPicture
            key={`r${board.round}`}
            items={board.right}
            caption={GLITCH_BOARD_COPY.right}
            {...picture}
          />
        </div>
      )}

      <div className={GLITCH_BOARD.zone}>
        {isReveal && isSeated && (
          <GlitchReveal me={me} total={board.total} hasMissed={missed.length > 0} />
        )}
        {!isSeated && <p className={GLITCH_BOARD.lead}>{GLITCH_BOARD_COPY.watching}</p>}
        {isSeated && !isReveal && isLocked && (
          <p className={GLITCH_BOARD.locked}>{GLITCH_BOARD_COPY.locked}</p>
        )}
        {isSeated && !isReveal && !isLocked && isDone && (
          <p className={GLITCH_BOARD.lead}>{GLITCH_BOARD_COPY.waiting}</p>
        )}
        {isSeated && !isReveal && !isLocked && !isDone && (
          <p className={GLITCH_BOARD.lead}>{GLITCH_BOARD_COPY.lead}</p>
        )}
      </div>
    </div>
  )
}
