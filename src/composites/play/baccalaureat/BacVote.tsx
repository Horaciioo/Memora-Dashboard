import { AvatarStack } from '@/components/elements/display/Avatar'
import type { BacPlayer } from '@/composites/play/baccalaureat/types'
import { BAC_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface BacVoteProps {
  label: string
  voterIds: string[]
  players: BacPlayer[]
  isMine: boolean
  // Button when the viewer may vote
  onVote?: () => void
  disabled?: boolean
}

/**
 * One side of a vote with the faces of those who picked it
 * @param {BacVoteProps} props - Side and voters
 * @return {JSX.Element | null}
 */

export const BacVote = ({ label, voterIds, players, isMine, onVote, disabled }: BacVoteProps) => {
  const voters = players
    .filter((player) => voterIds.includes(player.accountId))
    .map((player) => ({ id: player.accountId, name: player.name, src: player.avatarUrl }))
  if (!onVote && voters.length === 0) return null

  return (
    <span className={BAC_BOARD.voteSide}>
      {onVote ? (
        <button
          type="button"
          disabled={disabled}
          aria-pressed={isMine}
          className={cn(BAC_BOARD.vote, isMine && BAC_BOARD.voteOn)}
          onClick={onVote}
        >
          {label}
        </button>
      ) : (
        <span className={BAC_BOARD.voteLabel}>{label}</span>
      )}
      {voters.length > 0 && <AvatarStack people={voters} size="xs" />}
    </span>
  )
}
