import type { BacPlayer } from '@/composites/play/baccalaureat/types'
import { BAC_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { BAC_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Bottom line of the vote: who is still judging
 * @param {Object} props - Status
 * @param {BacPlayer[]} props.players - Seated players
 * @param {string[]} props.voted - Players done voting
 * @param {string} props.viewerId - Reader
 * @param {boolean} props.isSeated - Reader plays
 * @return {JSX.Element}
 */

export const BacVoteStatus = ({
  players,
  voted,
  viewerId,
  isSeated,
}: {
  players: BacPlayer[]
  voted: string[]
  viewerId: string
  isSeated: boolean
}) => {
  const pending = players.filter((player) => !voted.includes(player.accountId))
  const isMyTurn = isSeated && pending.some((player) => player.accountId === viewerId)
  const waiting = pending.filter((player) => player.accountId !== viewerId)

  const text =
    pending.length === 0
      ? BAC_BOARD_COPY.voteCounting
      : isMyTurn
        ? BAC_BOARD_COPY.voteTurn
        : !isSeated
          ? BAC_BOARD_COPY.voteSpectating
          : fillPlayMessage(BAC_BOARD_COPY.voteWaiting, {
              names: waiting.map((player) => player.name).join(', '),
            })

  return (
    <p className={cn(BAC_BOARD.lead, isMyTurn && BAC_BOARD.leadStrong)} role="status">
      {text}
    </p>
  )
}
