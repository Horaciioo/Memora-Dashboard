import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { fillPlayMessage, PLAY_LEADER_METRICS } from '@/declarations/play'
import type { PlayLeaderMetric } from '@/declarations/play'
import { PLAY_BOARD, PLAY_LEADER_PODIUM } from '@/declarations/ui/variants'
import type { PlayLeader } from '@/types/play'
import { cn } from '@/utils/classnames'

export interface PlayLeaderRowProps {
  leader: PlayLeader
  metric: PlayLeaderMetric
  meId: string
  // Slide-in delay
  delayMs: number
}

/**
 * One place under the podium, slides in
 * @param {PlayLeaderRowProps} props - Leader and measure
 * @return {JSX.Element}
 */

export const PlayLeaderRow = ({ leader, metric, meId, delayMs }: PlayLeaderRowProps) => (
  <li
    className={cn(
      PLAY_LEADER_PODIUM.restRow,
      leader.accountId === meId && PLAY_LEADER_PODIUM.restRowMe
    )}
    style={{ animationDelay: `${delayMs}ms` }}
  >
    <span className={PLAY_BOARD.rank}>{leader.rank}</span>
    <PlayAvatar accountId={leader.accountId} name={leader.name} src={leader.avatarUrl} />
    <span className={PLAY_BOARD.name}>{leader.name}</span>
    <span className={PLAY_BOARD.value}>
      {fillPlayMessage(PLAY_LEADER_METRICS[metric].note, {
        wins: leader.wins,
        level: leader.level,
        xp: leader.xp,
        played: leader.played,
      })}
    </span>
  </li>
)
