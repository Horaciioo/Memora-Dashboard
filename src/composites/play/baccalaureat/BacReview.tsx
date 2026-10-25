'use client'

import type { BacBoardView, BacPlayer, BacRoundView } from '@/composites/play/baccalaureat/types'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { BAC_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { BAC_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface BacReviewProps {
  sessionId: string
  round: BacRoundView
  settings: BacBoardView['settings']
  players: BacPlayer[]
  viewerId: string
  // Votes and points, or just the result
  isScored: boolean
  canVote: boolean
}

/**
 * Words laid out by category, voted during the review, with points once scored
 * @param {BacReviewProps} props - Round and players
 * @return {JSX.Element}
 */

export const BacReview = ({
  sessionId,
  round,
  settings,
  players,
  viewerId,
  isScored,
  canVote,
}: BacReviewProps) => {
  const { act, isSaving } = usePlayAct(sessionId)
  const vote = (answerId: string, accepted: boolean) =>
    void act({ type: 'vote', answerId, accepted })

  return (
    <div className={BAC_BOARD.categories}>
      {settings.categories.map((entry) => (
        <section key={entry.id} className={BAC_BOARD.category}>
          <h3 className={BAC_BOARD.categoryName}>{entry.label}</h3>
          <div className={BAC_BOARD.answers}>
            {players.map((player) => {
              const answer = round.answers.find(
                (item) => item.category === entry.id && item.accountId === player.accountId
              )
              const isMine = player.accountId === viewerId

              return (
                <div key={player.accountId} className={BAC_BOARD.answer}>
                  <span className={BAC_BOARD.answerName}>{player.name}</span>
                  {answer ? (
                    <span
                      className={cn(
                        BAC_BOARD.answerWord,
                        answer.valid === false && BAC_BOARD.answerOff
                      )}
                    >
                      {answer.word}
                    </span>
                  ) : (
                    <span className={BAC_BOARD.answerEmpty}>{BAC_BOARD_COPY.empty}</span>
                  )}
                  {answer && isScored && (
                    <span className={BAC_BOARD.answerNote}>
                      {fillPlayMessage(BAC_BOARD_COPY.points, { points: answer.points })}
                    </span>
                  )}
                  {answer && !isScored && answer.rejects > 0 && (
                    <span className={BAC_BOARD.answerNote}>
                      {fillPlayMessage(BAC_BOARD_COPY.rejects, { count: answer.rejects })}
                    </span>
                  )}
                  {answer && !isScored && canVote && !isMine && (
                    <>
                      <button
                        type="button"
                        disabled={isSaving}
                        aria-pressed={answer.myVote === true}
                        className={cn(BAC_BOARD.vote, answer.myVote === true && BAC_BOARD.voteOn)}
                        onClick={() => vote(answer.id, true)}
                      >
                        {BAC_BOARD_COPY.accept}
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        aria-pressed={answer.myVote === false}
                        className={cn(BAC_BOARD.vote, answer.myVote === false && BAC_BOARD.voteOn)}
                        onClick={() => vote(answer.id, false)}
                      >
                        {BAC_BOARD_COPY.reject}
                      </button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
