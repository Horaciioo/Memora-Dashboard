import { Avatar } from '@/components/elements/display/Avatar'
import { BacRanking } from '@/composites/play/baccalaureat/BacRanking'
import { PlayConfetti } from '@/composites/play/baccalaureat/PlayConfetti'
import { rankPlayers } from '@/composites/play/baccalaureat/types'
import type { BacBoardView, BacPlayer } from '@/composites/play/baccalaureat/types'
import { BAC_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_BOARD, BAC_PODIUM_BLOCKS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Places on the podium, the winner in the middle
const PODIUM_ORDER = [2, 1, 3]
const PODIUM_SIZE = PODIUM_ORDER.length
const WINNER = 1

/**
 * Final ranking as a podium under confetti, the other places listed below
 * @param {Object} props - Board and players
 * @param {BacBoardView['history']} props.history - Rounds
 * @param {BacPlayer[]} props.players - Table
 * @return {JSX.Element}
 */

export const BacPodium = ({
  history,
  players,
}: {
  history: BacBoardView['history']
  players: BacPlayer[]
}) => {
  const ranked = rankPlayers(history, players)
  const CrownIcon = ICONS.playCrown

  return (
    <div className={BAC_BOARD.board}>
      <PlayConfetti />
      <div className={BAC_BOARD.podium}>
        {PODIUM_ORDER.map((place) => {
          const player = ranked[place - 1]
          if (!player) return null

          return (
            <div key={place} className={BAC_BOARD.podiumPlace}>
              <div className={BAC_BOARD.podiumFace}>
                {place === WINNER && (
                  <CrownIcon className={BAC_BOARD.podiumCrown} aria-hidden="true" />
                )}
                <Avatar name={player.name} src={player.avatarUrl} size="lg" />
              </div>
              <span className={BAC_BOARD.podiumName}>{player.name}</span>
              <span className={BAC_BOARD.podiumPoints}>
                {fillPlayMessage(BAC_BOARD_COPY.points, { points: player.points })}
              </span>
              <div className={cn(BAC_BOARD.podiumBlock, BAC_PODIUM_BLOCKS[place])}>{place}</div>
            </div>
          )
        })}
      </div>
      {ranked.length > PODIUM_SIZE && (
        <BacRanking history={history} players={players} skip={PODIUM_SIZE} />
      )}
    </div>
  )
}
