import { Avatar } from '@/components/elements/display/Avatar'
import { PlayMedal } from '@/composites/play/shared/PlayMedal'
import { fillPlayMessage, PLAY_LEADER_METRICS } from '@/declarations/play'
import type { PlayLeaderMetric } from '@/declarations/play'
import { PLAY_BOARD } from '@/declarations/ui/variants'
import type { PlayLeader } from '@/types/play'
import { cn } from '@/utils/classnames'

export interface PlayLeaderRowProps {
  leader: PlayLeader
  metric: PlayLeaderMetric
  meId: string
}

/**
 * One place: a medal for the first three, then a number
 * @param {PlayLeaderRowProps} props - Leader and measure
 * @return {JSX.Element}
 */

export const PlayLeaderRow = ({ leader, metric, meId }: PlayLeaderRowProps) => (
  <li className={cn(PLAY_BOARD.row, leader.accountId === meId && PLAY_BOARD.rowMe)}>
    {leader.rank <= 3 ? (
      <PlayMedal place={leader.rank as 1 | 2 | 3} size="md" />
    ) : (
      <span className={PLAY_BOARD.rank}>{leader.rank}</span>
    )}
    <Avatar name={leader.name} src={leader.avatarUrl} />
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
