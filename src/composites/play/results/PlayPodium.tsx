import { Avatar } from '@/components/elements/display/Avatar'
import { PlayConfetti } from '@/composites/play/baccalaureat/PlayConfetti'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_BOARD, BAC_PODIUM_BLOCKS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Places on the podium, the winner in the middle
const PODIUM_ORDER = [2, 1, 3]
const PODIUM_SIZE = PODIUM_ORDER.length
const WINNER = 1

/**
 * Player on a final ranking
 * @typedef {Object} PlayPodiumEntry
 */

export interface PlayPodiumEntry {
  accountId: string
  name: string
  avatarUrl: string | null
  // Score in words
  note: string
}

/**
 * Final ranking: the first three on a podium under confetti, the others listed below
 * @param {Object} props - Ranking
 * @param {PlayPodiumEntry[]} props.ranked - Players, best first
 * @param {boolean} props.hasWinner - Crown and confetti
 * @return {JSX.Element}
 */

export const PlayPodium = ({
  ranked,
  hasWinner,
}: {
  ranked: PlayPodiumEntry[]
  hasWinner: boolean
}) => {
  const CrownIcon = ICONS.playCrown

  return (
    <>
      {hasWinner && <PlayConfetti />}
      <div className={BAC_BOARD.podium}>
        {PODIUM_ORDER.map((place) => {
          const entry = ranked[place - 1]
          if (!entry) return null

          return (
            <div key={place} className={BAC_BOARD.podiumPlace}>
              <div className={BAC_BOARD.podiumFace}>
                {place === WINNER && hasWinner && (
                  <CrownIcon className={BAC_BOARD.podiumCrown} aria-hidden="true" />
                )}
                <Avatar name={entry.name} src={entry.avatarUrl} size="lg" />
              </div>
              <span className={BAC_BOARD.podiumName}>{entry.name}</span>
              <span className={BAC_BOARD.podiumPoints}>{entry.note}</span>
              <div className={cn(BAC_BOARD.podiumBlock, BAC_PODIUM_BLOCKS[place])}>{place}</div>
            </div>
          )
        })}
      </div>
      {ranked.length > PODIUM_SIZE && (
        <ol className={BAC_BOARD.ranks}>
          {ranked.slice(PODIUM_SIZE).map((entry, index) => (
            <li key={entry.accountId} className={BAC_BOARD.rank}>
              <span className={BAC_BOARD.rankIndex}>{index + PODIUM_SIZE + 1}</span>
              <Avatar name={entry.name} src={entry.avatarUrl} size="sm" />
              <span className={BAC_BOARD.rankName}>{entry.name}</span>
              <span className={BAC_BOARD.rankPoints}>{entry.note}</span>
            </li>
          ))}
        </ol>
      )}
    </>
  )
}
