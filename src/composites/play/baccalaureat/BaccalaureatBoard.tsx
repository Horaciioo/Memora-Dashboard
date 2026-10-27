'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { BacPodium } from '@/composites/play/baccalaureat/BacPodium'
import { BacRanking } from '@/composites/play/baccalaureat/BacRanking'
import { BacReview } from '@/composites/play/baccalaureat/BacReview'
import { BacStopBanner } from '@/composites/play/baccalaureat/BacStopBanner'
import { BacWriting } from '@/composites/play/baccalaureat/BacWriting'
import { PlayCountdown } from '@/composites/play/baccalaureat/PlayCountdown'
import { secondsTo } from '@/composites/play/baccalaureat/types'
import type { BacBoardView, BacPlayer } from '@/composites/play/baccalaureat/types'
import { usePlainBoard } from '@/core/hooks/data/play/usePlainBoard'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { useServerNow } from '@/core/hooks/interaction/state/useServerNow'
import { BaccalaureatPhases } from '@/core/lib/play/baccalaureat/phase'
import { BAC_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { BAC_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Clock turns red under this
const LOW_SECONDS = 10

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

  const stopper = players.find((player) => player.accountId === round.stoppedById)
  const header = (
    <div className={BAC_BOARD.bar}>
      <div className={BAC_BOARD.letterRow}>
        {round.phase !== BaccalaureatPhases.Countdown && (
          <span className={BAC_BOARD.letter}>{round.letter}</span>
        )}
        <span className={BAC_BOARD.round}>
          {fillPlayMessage(BAC_BOARD_COPY.round, {
            index: round.index + 1,
            total: board.roundsTotal,
          })}
        </span>
      </div>
      {stopper && round.phase === BaccalaureatPhases.Writing ? (
        <BacStopBanner stopper={stopper} />
      ) : (
        left !== null &&
        round.phase !== BaccalaureatPhases.Countdown && (
          <span className={cn(BAC_BOARD.clock, left <= LOW_SECONDS && BAC_BOARD.clockLow)}>
            {left}
          </span>
        )
      )}
    </div>
  )

  if (board.recap) {
    return (
      <div className={BAC_BOARD.board}>
        <h2 className={BAC_BOARD.stageLead}>{BAC_BOARD_COPY.final}</h2>
        <BacPodium history={board.history} players={players} />
      </div>
    )
  }

  if (round.phase === BaccalaureatPhases.Countdown) {
    return (
      <div className={BAC_BOARD.board}>
        {header}
        <PlayCountdown
          seconds={left ?? 0}
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

  if (round.phase === BaccalaureatPhases.Writing) {
    return (
      <div className={BAC_BOARD.board}>
        {header}
        <BacWriting
          key={round.index}
          sessionId={sessionId}
          round={round}
          settings={board.settings}
          isSeated={me.isSeated}
        />
      </div>
    )
  }

  const isScored = round.phase === BaccalaureatPhases.Scored

  return (
    <div className={BAC_BOARD.board}>
      {header}
      <p className={BAC_BOARD.lead}>
        {isScored ? BAC_BOARD_COPY.scores : BAC_BOARD_COPY.reviewLead}
      </p>
      <BacReview
        sessionId={sessionId}
        round={round}
        settings={board.settings}
        players={players}
        viewerId={viewerId}
        isScored={isScored}
        canVote={me.isSeated}
      />
      {isScored && <BacRanking history={board.history} players={players} />}
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
