import { Avatar } from '@/components/elements/display/Avatar'
import { fillPlayMessage, PLAY_LEADER_METRICS } from '@/declarations/play'
import type { PlayLeaderMetric } from '@/declarations/play'
import { PLAY_BOARD } from '@/declarations/ui/variants'
import type { PlayLeader } from '@/types/play'
import { cn } from '@/utils/classnames'

// Places with a medal box
const MEDALS = { 1: PLAY_BOARD.place1, 2: PLAY_BOARD.place2, 3: PLAY_BOARD.place3 } as const

export interface PlayLeaderRowProps {
  leader: PlayLeader
  metric: PlayLeaderMetric
  meId: string
}

/**
 * One place: gold, silver, bronze, then plain
 * @param {PlayLeaderRowProps} props - Leader and measure
 * @return {JSX.Element}
 */

export const PlayLeaderRow = ({ leader, metric, meId }: PlayLeaderRowProps) => (
  <li
    className={cn(
      PLAY_BOARD.row,
      MEDALS[leader.rank as keyof typeof MEDALS],
      leader.accountId === meId && PLAY_BOARD.rowMe
    )}
  >
    <span className={PLAY_BOARD.rank}>{leader.rank}</span>
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
