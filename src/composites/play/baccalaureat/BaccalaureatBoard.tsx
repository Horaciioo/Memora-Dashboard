'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { BacPodium } from '@/composites/play/baccalaureat/BacPodium'
import { BacHud } from '@/composites/play/baccalaureat/BacHud'
import { BacRoundLine } from '@/composites/play/baccalaureat/BacRoundLine'
import { BacStopBanner } from '@/composites/play/baccalaureat/BacStopBanner'
import { BacReview } from '@/composites/play/baccalaureat/BacReview'
import { BacVoteStatus } from '@/composites/play/baccalaureat/BacVoteStatus'
import { BacWriting } from '@/composites/play/baccalaureat/BacWriting'
import { PlayCountdown } from '@/composites/play/baccalaureat/PlayCountdown'
import { secondsTo, spanSeconds } from '@/composites/play/baccalaureat/types'
import type { BacBoardView, BacPlayer } from '@/composites/play/baccalaureat/types'
import { usePlainBoard } from '@/core/hooks/data/play/usePlainBoard'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { useServerNow } from '@/core/hooks/interaction/state/time/useServerNow'
import { BaccalaureatPhases } from '@/core/lib/play/baccalaureat/phase'
import { BAC_BOARD_COPY, BACCALAUREAT_SETTINGS } from '@/declarations/play'
import { BAC_BOARD } from '@/declarations/ui/variants'
import { RESULT } from '@/declarations/ui/variants/games/play/shared'
import { PlayGames } from '@/utils/constants/play'

// Read again until the server has moved on, grace included
const DEADLINE_REFRESH_MS = 2500

export interface BaccalaureatBoardProps {
  sessionId: string
  board: BacBoardView
  players: BacPlayer[]
  viewerId: string
  me: { isSeated: boolean; isHost: boolean }
}

/**
 * Baccalaureat screen on the notebook sheet: countdown, writing, review table, final ranking
 * @param {BaccalaureatBoardProps} props - Board and table
 * @return {JSX.Element | null}
 */

export const BaccalaureatBoard = ({
  sessionId,
  board: initial,
  players,
  viewerId,
  me,
}: BaccalaureatBoardProps) => {
  const board = usePlainBoard(sessionId, initial)
  const router = useRouter()
  const now = useServerNow(board.serverTime)
  const { act, isSaving } = usePlayAct(sessionId)
  const { round } = board

  // Next deadline of the phase on screen
  const deadline =
    round?.phase === BaccalaureatPhases.Countdown
      ? round.startsAt
      : round?.phase === BaccalaureatPhases.Writing
        ? round.endsAt
        : round?.phase === BaccalaureatPhases.Review
          ? round.reviewEndsAt
          : null
  const left = deadline ? secondsTo(deadline, now) : null

  // The server moves on at the deadline, read it again then
  useEffect(() => {
    if (left !== 0) return
    const timer = window.setInterval(() => router.refresh(), DEADLINE_REFRESH_MS)

    return () => window.clearInterval(timer)
  }, [left, router])

  if (!round) return null

  const phase = round.phase
  const stopper = players.find((player) => player.accountId === round.stoppedById) ?? null
  const clockTotal =
    phase === BaccalaureatPhases.Writing
      ? spanSeconds(round.startsAt, round.endsAt)
      : BACCALAUREAT_SETTINGS.reviewSeconds
  const isClockOn =
    left !== null && (phase === BaccalaureatPhases.Writing || phase === BaccalaureatPhases.Review)
  const isCounting = phase === BaccalaureatPhases.Countdown
  const isVoting = phase === BaccalaureatPhases.Review
  const hud = (
    <BacHud
      sessionId={sessionId}
      board={board}
      round={round}
      players={players}
      viewerId={viewerId}
      isSeated={me.isSeated}
      isLetterOut={!isCounting}
      clock={isClockOn ? { left: left ?? 0, total: clockTotal } : null}
      progress={phase === BaccalaureatPhases.Writing ? board.done : isVoting ? board.voted : null}
      isVoting={isVoting}
    />
  )

  if (board.isOver) {
    return (
      <div className={RESULT}>
        <h2 className={BAC_BOARD.stageLead}>{BAC_BOARD_COPY.final}</h2>
        <BacPodium history={board.history} players={players} />
      </div>
    )
  }

  if (isCounting) {
    return (
      <div className={BAC_BOARD.board} data-hud="baccalaureat">
        {hud}
        <PlayCountdown
          game={PlayGames.Baccalaureat}
          seconds={left ?? 0}
          total={BACCALAUREAT_SETTINGS.countdownSeconds}
          lead={BAC_BOARD_COPY.getReady}
          className={BAC_BOARD.inline}
        ></PlayCountdown>
      </div>
    )
  }

  if (phase === BaccalaureatPhases.Writing) {
    return (
      <div className={BAC_BOARD.board} data-hud="baccalaureat">
        {hud}
        {stopper && <BacStopBanner stopper={stopper} />}
        {!me.isSeated ? (
          <div className={BAC_BOARD.wait}>
            <p className={BAC_BOARD.waitLead}>{BAC_BOARD_COPY.watchWriting}</p>
            <p className={BAC_BOARD.waitNote}>{BAC_BOARD_COPY.watchPatience}</p>
          </div>
        ) : (
          <BacWriting
            key={round.index}
            sessionId={sessionId}
            round={round}
            settings={board.settings}
            isSeated
          />
        )}
      </div>
    )
  }

  const isScored = phase === BaccalaureatPhases.Scored
  const review = (
    <BacReview
      sessionId={sessionId}
      round={round}
      settings={board.settings}
      players={players}
      viewerId={viewerId}
      isScored={isScored}
      canVote={me.isSeated}
      title={
        isScored ? (
          <BacRoundLine history={board.history} players={players} roundIndex={round.index} />
        ) : (
          BAC_BOARD_COPY.voteLead
        )
      }
      foot={
        !isScored && (
          <BacVoteStatus
            players={players}
            voted={board.voted}
            viewerId={viewerId}
            isSeated={me.isSeated}
          />
        )
      }
    />
  )

  return (
    <div key={phase} className={BAC_BOARD.board} data-hud="baccalaureat">
      {hud}
      {review}
      <div className={BAC_BOARD.actions}>
        {me.isHost && (
          <Button
            variant="arcade"
            isLoading={isSaving}
            onClick={() => void act({ type: isScored ? 'next' : 'count' })}
          >
            {isScored ? BAC_BOARD_COPY.next : BAC_BOARD_COPY.count}
          </Button>
        )}
        {!me.isHost && isScored && (
          <span className={BAC_BOARD.lead}>{BAC_BOARD_COPY.waitingHost}</span>
        )}
      </div>
    </div>
  )
}
