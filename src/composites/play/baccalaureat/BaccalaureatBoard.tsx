'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { BacPodium } from '@/composites/play/baccalaureat/BacPodium'
import { BacScores } from '@/composites/play/baccalaureat/BacScores'
import { BacHeader } from '@/composites/play/baccalaureat/BacHeader'
import { BacReview } from '@/composites/play/baccalaureat/BacReview'
import { BacVoteStatus } from '@/composites/play/baccalaureat/BacVoteStatus'
import { BacWriting } from '@/composites/play/baccalaureat/BacWriting'
import { PlayCountdown } from '@/composites/play/baccalaureat/PlayCountdown'
import { BacSessionProgress } from '@/composites/play/session/BacSessionProgress'
import { secondsTo, spanSeconds } from '@/composites/play/baccalaureat/types'
import type { BacBoardView, BacPlayer } from '@/composites/play/baccalaureat/types'
import { usePlainBoard } from '@/core/hooks/data/play/usePlainBoard'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { useServerNow } from '@/core/hooks/interaction/state/useServerNow'
import { BaccalaureatPhases } from '@/core/lib/play/baccalaureat/phase'
import { BAC_BOARD_COPY, BAC_SESSION_COPY, BACCALAUREAT_SETTINGS } from '@/declarations/play'
import { BAC_BOARD } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

export interface BaccalaureatBoardProps {
  sessionId: string
  board: BacBoardView
  players: BacPlayer[]
  viewerId: string
  me: { isSeated: boolean; isHost: boolean }
}

/**
 * Baccalaureat screen: countdown, writing, review, scores, final ranking, moved with each pushed board
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
    const timer = window.setTimeout(() => router.refresh(), 1200)

    return () => window.clearTimeout(timer)
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
  const faces = players.map((player) => ({
    id: player.accountId,
    name: player.name,
    avatarUrl: player.avatarUrl,
  }))
  const header = (
    <BacHeader
      index={round.index}
      total={board.roundsTotal}
      letter={phase === BaccalaureatPhases.Countdown ? null : round.letter}
      clock={isClockOn ? { left: left ?? 0, total: clockTotal } : null}
      stopper={phase === BaccalaureatPhases.Writing ? stopper : null}
    />
  )

  if (board.recap) {
    return (
      <div className={BAC_BOARD.board}>
        <h2 className={BAC_BOARD.stageLead}>{BAC_BOARD_COPY.final}</h2>
        <BacPodium history={board.history} players={players} />
      </div>
    )
  }

  if (phase === BaccalaureatPhases.Countdown) {
    return (
      <div className={BAC_BOARD.board}>
        {header}
        <PlayCountdown
          game={PlayGames.Baccalaureat}
          seconds={left ?? 0}
          total={BACCALAUREAT_SETTINGS.countdownSeconds}
          lead={BAC_BOARD_COPY.getReady}
          className={BAC_BOARD.inline}
        >
          {me.isSeated && board.jokersLeft > 0 && !round.rerolledById && (
            <Button
              variant="arcadeGhost"
              isLoading={isSaving}
              onClick={() => void act({ type: 'reroll' })}
            >
              {BAC_BOARD_COPY.reroll}
            </Button>
          )}
        </PlayCountdown>
      </div>
    )
  }

  if (phase === BaccalaureatPhases.Writing) {
    return (
      <div className={BAC_BOARD.board}>
        {header}
        <BacSessionProgress
          players={faces}
          done={board.done}
          labels={{ done: BAC_SESSION_COPY.done, pending: BAC_SESSION_COPY.writing }}
        />
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
  const isLastRound = round.index + 1 >= board.roundsTotal
  const review = (
    <BacReview
      sessionId={sessionId}
      round={round}
      settings={board.settings}
      players={players}
      viewerId={viewerId}
      isScored={isScored}
      canVote={me.isSeated}
    />
  )

  return (
    <div key={phase} className={BAC_BOARD.board}>
      {header}
      {isScored ? (
        <>
          <BacScores history={board.history} players={players} roundIndex={round.index} />
          <h3 className={BAC_BOARD.categoryName}>{BAC_BOARD_COPY.words}</h3>
          {review}
        </>
      ) : (
        <>
          <BacSessionProgress
            players={faces}
            done={board.voted}
            labels={{ done: BAC_SESSION_COPY.voted, pending: BAC_SESSION_COPY.voting }}
          />
          <p className={BAC_BOARD.lead}>{BAC_BOARD_COPY.voteLead}</p>
          {review}
          <BacVoteStatus
            players={players}
            voted={board.voted}
            viewerId={viewerId}
            isSeated={me.isSeated}
          />
        </>
      )}
      <div className={BAC_BOARD.actions}>
        {me.isHost && (
          <Button
            variant="arcade"
            isLoading={isSaving}
            onClick={() => void act({ type: isScored ? 'next' : 'count' })}
          >
            {isScored
              ? isLastRound
                ? BAC_BOARD_COPY.finish
                : BAC_BOARD_COPY.next
              : BAC_BOARD_COPY.count}
          </Button>
        )}
        {!me.isHost && isScored && (
          <span className={BAC_BOARD.lead}>{BAC_BOARD_COPY.waitingHost}</span>
        )}
      </div>
    </div>
  )
}
