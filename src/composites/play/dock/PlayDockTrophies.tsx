import { nextTrophies } from '@/core/lib/play'
import { PlayLevelBar } from '@/composites/play/member/stats/PlayLevelBar'
import { PlayEmpty } from '@/composites/play/shared/PlayEmpty'
import { fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_DOCK } from '@/declarations/ui/variants'
import type { PlayProfileView } from '@/types/play'

// Trophies shown in the bubble
const SHOWN = 5

/**
 * Five closest trophies, nearest first
 * @param {Object} props - Stats
 * @param {PlayProfileView['games']} props.games - Stats per game
 * @return {JSX.Element}
 */

export const PlayDockTrophies = ({ games }: { games: PlayProfileView['games'] }) => {
  const trophies = nextTrophies(games, SHOWN)
  if (trophies.length === 0) return <PlayEmpty isCompact>{PLAY_HUB_COPY.allTrophiesDone}</PlayEmpty>

  return (
    <div className={PLAY_DOCK.rows}>
      {trophies.map((trophy) => (
        <div key={trophy.label} className={PLAY_DOCK.row}>
          <span className={PLAY_DOCK.rowHead}>
            <span className={PLAY_DOCK.rowName}>{trophy.label}</span>
            <span className={PLAY_DOCK.rowNote}>
              {fillPlayMessage(PLAY_HUB_COPY.trophyProgress, {
                value: trophy.value,
                target: trophy.target,
              })}
            </span>
          </span>
          <PlayLevelBar share={trophy.share * 100} isThin />
          <span className={PLAY_DOCK.rowNote}>{trophy.goal}</span>
        </div>
      ))}
    </div>
  )
}
