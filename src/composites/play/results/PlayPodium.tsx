import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { PlayConfetti } from '@/composites/play/baccalaureat/PlayConfetti'
import { PlayMedal } from '@/composites/play/shared/PlayMedal'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_BOARD, PLAY_PODIUM, PLAY_PODIUM_BLOCKS } from '@/declarations/ui/variants'
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
    <div className={PLAY_PODIUM.stage}>
      {hasWinner && <PlayConfetti />}
      <div className={PLAY_PODIUM.row}>
        {PODIUM_ORDER.map((place) => {
          const entry = ranked[place - 1]
          if (!entry) return null

          return (
            <div key={place} className={PLAY_PODIUM.place}>
              <div className={PLAY_PODIUM.face}>
                {place === WINNER && hasWinner && (
                  <CrownIcon className={PLAY_PODIUM.crown} aria-hidden="true" />
                )}
                <PlayAvatar
                  accountId={entry.accountId}
                  name={entry.name}
                  src={entry.avatarUrl}
                  size={place === WINNER ? 'xl' : 'lg'}
                />
              </div>
              <span className={PLAY_PODIUM.name}>{entry.name}</span>
              <span className={PLAY_PODIUM.points}>{entry.note}</span>
              <div className={cn(PLAY_PODIUM.block, PLAY_PODIUM_BLOCKS[place])}>
                <PlayMedal place={place as 1 | 2 | 3} size="lg" />
              </div>
            </div>
          )
        })}
      </div>
      {ranked.length > PODIUM_SIZE && (
        <ol className={BAC_BOARD.ranks}>
          {ranked.slice(PODIUM_SIZE).map((entry, index) => (
            <li key={entry.accountId} className={BAC_BOARD.rank}>
              <span className={BAC_BOARD.rankIndex}>{index + PODIUM_SIZE + 1}</span>
              <PlayAvatar
                accountId={entry.accountId}
                name={entry.name}
                src={entry.avatarUrl}
                size="sm"
              />
              <span className={BAC_BOARD.rankName}>{entry.name}</span>
              <span className={BAC_BOARD.rankPoints}>{entry.note}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
