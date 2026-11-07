'use client'

import { BacAnswerCard } from '@/composites/play/baccalaureat/BacAnswerCard'
import type { BacBoardView, BacPlayer, BacRoundView } from '@/composites/play/baccalaureat/types'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { fitsLetter, liveVerdict, sharedAnswerIds } from '@/core/lib/play/baccalaureat'
import { BAC_BOARD } from '@/declarations/ui/variants'

export interface BacReviewProps {
  sessionId: string
  round: BacRoundView
  settings: BacBoardView['settings']
  players: BacPlayer[]
  viewerId: string
  // Votes open, or the result with points
  isScored: boolean
  canVote: boolean
}

/**
 * Words by category as cards, voted with a check or a cross, locked once cast
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

  // Words written twice, refused ones pay nothing so they never share
  const shared = sharedAnswerIds(round.answers.filter((answer) => !isScored || answer.valid))

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
              const fits = answer ? fitsLetter(answer.word, round.letter) : true
              const verdict = isScored
                ? answer?.valid
                  ? 'yes'
                  : 'no'
                : liveVerdict({
                    fits,
                    accepts: answer?.acceptedBy.length ?? 0,
                    rejects: answer?.rejectedBy.length ?? 0,
                  })
              const canCast = canVote && !isMine && answer && answer.myVote === null

              const named = (ids: string[] | undefined) =>
                players.filter((item) => ids?.includes(item.accountId))

              return (
                <BacAnswerCard
                  key={player.accountId}
                  player={player}
                  answer={answer}
                  verdict={verdict}
                  isScored={isScored}
                  isShared={Boolean(answer && shared.has(answer.id))}
                  isWrongLetter={!fits}
                  voters={{
                    accepted: named(answer?.acceptedBy),
                    rejected: named(answer?.rejectedBy),
                  }}
                  isSaving={isSaving}
                  onVote={
                    canCast
                      ? (accepted) => void act({ type: 'vote', answerId: answer.id, accepted })
                      : undefined
                  }
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
