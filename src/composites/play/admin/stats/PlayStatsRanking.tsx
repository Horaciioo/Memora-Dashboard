import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlayEmpty } from '@/composites/play/shared/PlayEmpty'
import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { PLAY_BOARD_ADMIN_COPY as COPY } from '@/declarations/play/admin'
import { PLAY_HEALTH } from '@/declarations/ui/variants'
import type { PlayAdminLeader } from '@/types/play'
import { formatNumber } from '@/utils/format/numbers'

/**
 * Players of the week by XP earned
 * @param {Object} props - Leaders
 * @param {PlayAdminLeader[]} props.leaders - Best first
 * @return {JSX.Element}
 */

export const PlayStatsRanking = ({ leaders }: { leaders: PlayAdminLeader[] }) => (
  <PlayPageTitle
    heading="h2"
    body={
      leaders.length === 0 ? (
        <PlayEmpty icon="playCrown" isCompact>
          {COPY.statsNoRanking}
        </PlayEmpty>
      ) : (
        <ol className={PLAY_HEALTH.rank}>
          {leaders.map((leader, index) => (
            <li key={leader.accountId} className={PLAY_HEALTH.rankRow}>
              <span className={PLAY_HEALTH.rankNumber}>{index + 1}</span>
              <PlayAvatar accountId={leader.accountId} name={leader.name} src={leader.avatarUrl} />
              <span className={PLAY_HEALTH.rankName}>{leader.name}</span>
              <span className={PLAY_HEALTH.rankXp}>
                {formatNumber(leader.xp)} {COPY.statsUnitXp}
              </span>
            </li>
          ))}
        </ol>
      )
    }
  >
    {COPY.statsRanking}
  </PlayPageTitle>
)
