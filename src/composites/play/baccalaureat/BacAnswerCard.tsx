import { Avatar } from '@/components/elements/display/Avatar'
import type { BacVerdictKind } from '@/composites/play/baccalaureat/BacVerdict'
import type { BacPlayer, BacRoundView } from '@/composites/play/baccalaureat/types'
import { BAC_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface BacAnswerCardProps {
  player: BacPlayer
  answer: BacRoundView['answers'][number] | undefined
  verdict: BacVerdictKind
  isScored: boolean
  isShared: boolean
  isWrongLetter: boolean
  // Who judged the word
  voters: { accepted: BacPlayer[]; rejected: BacPlayer[] }
  // Ballot buttons, only before the viewer's vote
  onVote?: (accepted: boolean) => void
  isSaving: boolean
}

/**
 * One word: face, verdict under it, the word, then ballots or points
 * @param {BacAnswerCardProps} props - Word and state
 * @return {JSX.Element}
 */

export const BacAnswerCard = ({
  player,
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

  return (
    <div className={BAC_BOARD.card}>
      <div className={BAC_BOARD.cardFace}>
        <Avatar name={player.name} src={player.avatarUrl} size="xs" />
      </div>
      <div className={BAC_BOARD.cardBody}>
        <span className={BAC_BOARD.cardName}>{player.name}</span>
        {answer ? (
          <span className={cn(BAC_BOARD.cardWord, verdict === 'no' && BAC_BOARD.cardWordOff)}>
            {answer.word}
          </span>
        ) : (
          <span className={BAC_BOARD.cardEmpty}>{BAC_BOARD_COPY.empty}</span>
        )}
        {answer && tag && <span className={BAC_BOARD.cardTag}>{tag}</span>}
        {answer && (voters.accepted.length > 0 || voters.rejected.length > 0) && (
          <div className={BAC_BOARD.voters}>
            {[
              { list: voters.accepted, tone: BAC_BOARD.verdictYes, Icon: YesIcon },
              { list: voters.rejected, tone: BAC_BOARD.verdictNo, Icon: NoIcon },
            ]
              .filter(({ list }) => list.length > 0)
              .map(({ list, tone, Icon }) => (
                <span key={tone} className={BAC_BOARD.voterGroup}>
                  <span className={cn(BAC_BOARD.voterMark, tone)}>
                    <Icon className={BAC_BOARD.voterIcon} aria-hidden="true" />
                  </span>
                  {list.map((voter) => (
                    <Avatar
                      key={voter.accountId}
                      name={voter.name}
                      src={voter.avatarUrl}
                      size="xs"
                    />
                  ))}
                </span>
              ))}
          </div>
        )}
      </div>
      {answer && isScored && (
        <span className={cn(BAC_BOARD.points, !answer.points && BAC_BOARD.pointsNone)}>
          {fillPlayMessage(BAC_BOARD_COPY.points, { points: answer.points })}
        </span>
      )}
      {answer && !isScored && !onVote && answer.myVote !== null && (
        <span
          className={cn(
            BAC_BOARD.ballotLocked,
            answer.myVote ? BAC_BOARD.verdictYes : BAC_BOARD.verdictNo
          )}
          role="img"
          aria-label={BAC_BOARD_COPY.yourVote}
        >
          {answer.myVote ? (
            <YesIcon className={BAC_BOARD.ballotIcon} aria-hidden="true" />
          ) : (
            <NoIcon className={BAC_BOARD.ballotIcon} aria-hidden="true" />
          )}
        </span>
      )}
      {answer && !isScored && onVote && (
        <div className={BAC_BOARD.ballots}>
          <button
            type="button"
            disabled={isSaving}
            aria-label={BAC_BOARD_COPY.accept}
            className={cn(BAC_BOARD.ballot, BAC_BOARD.ballotYes)}
            onClick={() => onVote(true)}
          >
            <YesIcon className={BAC_BOARD.ballotIcon} aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={isSaving}
            aria-label={BAC_BOARD_COPY.reject}
            className={cn(BAC_BOARD.ballot, BAC_BOARD.ballotNo)}
            onClick={() => onVote(false)}
          >
            <NoIcon className={BAC_BOARD.ballotIcon} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
