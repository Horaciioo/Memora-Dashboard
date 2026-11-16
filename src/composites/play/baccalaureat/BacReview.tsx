'use client'

import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { BacBook } from '@/composites/play/baccalaureat/BacBook'
import { splitPages } from '@/composites/play/baccalaureat/types'
import { BacAnswerCard } from '@/composites/play/baccalaureat/BacAnswerCard'
import type { BacBoardView, BacPlayer, BacRoundView } from '@/composites/play/baccalaureat/types'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { fitsLetter, liveVerdict, sharedAnswerIds } from '@/core/lib/play/baccalaureat'
import { BAC_BOARD } from '@/declarations/ui/variants'
import type { CSSProperties, ReactNode } from 'react'

export interface BacReviewProps {
  sessionId: string
  round: BacRoundView
  settings: BacBoardView['settings']
  players: BacPlayer[]
  viewerId: string
  // Votes open, or the result with points
  isScored: boolean
  canVote: boolean
  // Cover lines of the book
  title: ReactNode
  foot?: ReactNode
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
  title,
  foot,
}: BacReviewProps) => {
  const { act, isSaving } = usePlayAct(sessionId)

  // Words written twice, refused ones pay nothing so they never share
  const shared = sharedAnswerIds(round.answers.filter((answer) => !isScored || answer.valid))

  /**
   * One page: players across, categories down
   * @param {BacBoardView['settings']['categories']} list - Categories of the page
   * @return {JSX.Element} - Table
   */

  const page = (list: BacBoardView['settings']['categories']) => (
    <div className={BAC_BOARD.table} style={{ '--cols': players.length } as CSSProperties}>
      <span aria-hidden="true" />
      {players.map((player) => (
        <span key={player.accountId} className={BAC_BOARD.tableHead}>
          <PlayAvatar
            accountId={player.accountId}
            name={player.name}
            src={player.avatarUrl}
            size="xs"
          />
          <span className={BAC_BOARD.tableName}>{player.name}</span>
        </span>
      ))}
      {list.map((entry) => (
        <div key={entry.id} className="contents">
          <h3 className={BAC_BOARD.categoryName}>{entry.label}</h3>
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
            const canCast = canVote && !isMine && answer

            const named = (ids: string[] | undefined) =>
              players.filter((item) => ids?.includes(item.accountId))

            return (
              <BacAnswerCard
                key={player.accountId}
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
      ))}
    </div>
  )
  const [first, second] = splitPages(settings.categories)

  return <BacBook title={title} foot={foot} left={page(first)} right={page(second)} />
}
