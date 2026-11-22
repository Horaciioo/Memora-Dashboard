import type { BacVerdictKind } from '@/composites/play/baccalaureat/BacVerdict'
import type { BacPlayer, BacRoundView } from '@/composites/play/baccalaureat/types'
import { BAC_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface BacAnswerCardProps {
  answer: BacRoundView['answers'][number] | undefined
  verdict: BacVerdictKind
  isScored: boolean
  isShared: boolean
  isWrongLetter: boolean
  // Who judged the word, read on hover
  voters: { accepted: BacPlayer[]; rejected: BacPlayer[] }
  // Ballot buttons, the chosen one lit
  onVote?: (accepted: boolean) => void
  isSaving: boolean
}

/**
 * One cell of the table: the word tinted by its verdict, then ballots or points
 * @param {BacAnswerCardProps} props - Word and state
 * @return {JSX.Element}
 */

export const BacAnswerCard = ({
  answer,
  verdict,
  isScored,
  isShared,
  isWrongLetter,
  voters,
  onVote,
  isSaving,
}: BacAnswerCardProps) => {
  const YesIcon = ICONS.playTick
  const NoIcon = ICONS.playClose
  const tag = isWrongLetter
    ? BAC_BOARD_COPY.wrongLetter
    : isShared
      ? BAC_BOARD_COPY.duplicate
      : null

  const judges = [...voters.accepted, ...voters.rejected].map((voter) => voter.name).join(', ')

  return (
    <div
      className={cn(
        BAC_BOARD.card,
        verdict === 'yes' && BAC_BOARD.cardYes,
        verdict === 'no' && BAC_BOARD.cardNo
      )}
      title={judges || undefined}
    >
      <div className={BAC_BOARD.cardBody}>
        {answer ? (
          <span className={cn(BAC_BOARD.cardWord, verdict === 'no' && BAC_BOARD.cardWordOff)}>
            {answer.word}
          </span>
        ) : (
          <span className={BAC_BOARD.cardEmpty}>{BAC_BOARD_COPY.empty}</span>
        )}
        {answer && tag && <span className={BAC_BOARD.cardTag}>{tag}</span>}
      </div>
      {answer && isScored && (
        <span className={cn(BAC_BOARD.points, !answer.points && BAC_BOARD.pointsNone)}>
          {fillPlayMessage(BAC_BOARD_COPY.points, { points: answer.points })}
        </span>
      )}
      {answer && !isScored && onVote && (
        <div className={BAC_BOARD.ballots}>
          <button
            type="button"
            disabled={isSaving || answer.myVote !== null}
            aria-label={BAC_BOARD_COPY.accept}
            aria-pressed={answer.myVote === true}
            className={cn(
              BAC_BOARD.ballot,
              BAC_BOARD.ballotYes,
              answer.myVote === true && BAC_BOARD.ballotOnYes,
              answer.myVote === false && BAC_BOARD.ballotOff
            )}
            onClick={() => onVote(true)}
          >
            <YesIcon className={BAC_BOARD.ballotIcon} aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={isSaving || answer.myVote !== null}
            aria-label={BAC_BOARD_COPY.reject}
            aria-pressed={answer.myVote === false}
            className={cn(
              BAC_BOARD.ballot,
              BAC_BOARD.ballotNo,
              answer.myVote === false && BAC_BOARD.ballotOnNo,
              answer.myVote === true && BAC_BOARD.ballotOff
            )}
            onClick={() => onVote(false)}
          >
            <NoIcon className={BAC_BOARD.ballotIcon} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
