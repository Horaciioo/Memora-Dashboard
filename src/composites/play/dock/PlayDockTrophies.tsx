import { PlayLevelBar } from '@/composites/play/member/stats/PlayLevelBar'
import { fillPlayMessage, nextTrophies, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_DOCK } from '@/declarations/ui/variants'
import type { PlayProfileView } from '@/types/play'

// Trophies shown in the bubble
const SHOWN = 5

/**
 * Five closest trophies, nearest first
 * @param {Object} props - Totals
 * @param {PlayProfileView['global']} props.global - Global totals
 * @return {JSX.Element}
 */

export const PlayDockTrophies = ({ global }: { global: PlayProfileView['global'] }) => {
  const trophies = nextTrophies(global, SHOWN)
  if (trophies.length === 0)
    return <p className={PLAY_DOCK.empty}>{PLAY_HUB_COPY.allTrophiesDone}</p>

  return (
    <div className={PLAY_DOCK.rows}>
      {trophies.map((trophy) => (
        <div key={trophy.label} className={PLAY_DOCK.row}>
          <span className={PLAY_DOCK.rowHead}>
            <span className={PLAY_DOCK.rowName}>{trophy.label}</span>
            <span className={PLAY_DOCK.rowNote}>
              {fillPlayMessage(PLAY_HUB_COPY.trophyProgress, {
                value: Math.min(global[trophy.stat], trophy.target),
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
