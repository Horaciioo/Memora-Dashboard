import { PlayStatCard } from '@/composites/play/admin/stats/PlayStatCard'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { fillPlayMessage } from '@/declarations/play'
import { PLAY_BOARD_ADMIN_COPY as COPY } from '@/declarations/play/admin'
import { PLAY_STAT_CARDS } from '@/declarations/play/statsView'
import { PLAY_HEALTH } from '@/declarations/ui/variants'
import type { PlayAdminStats } from '@/types/play'
import { formatNumber } from '@/utils/format/numbers'

/**
 * Tables open, games running and finished today
 * @param {Object} props - Live figures
 * @param {PlayAdminStats} props.stats - Stats of Play
 * @return {JSX.Element}
 */

export const PlayStatsLive = ({ stats }: { stats: PlayAdminStats }) => (
  <PlayPageTitle
    heading="h2"
    isGrouped
    body={
      <div className={PLAY_HEALTH.grid}>
        <PlayStatCard
          label={COPY.statsLobby}
          {...PLAY_STAT_CARDS.lobby}
          value={formatNumber(stats.lobby)}
        />
        <PlayStatCard
          label={COPY.statsRunning}
          {...PLAY_STAT_CARDS.running}
          value={formatNumber(stats.running)}
        />
        <PlayStatCard
          label={COPY.statsToday}
          {...PLAY_STAT_CARDS.today}
          value={formatNumber(stats.finishedToday)}
          caption={fillPlayMessage(COPY.statsGameLine, {
            week: stats.finishedWeek,
            finished: stats.activeWeek,
          })}
        />
      </div>
    }
  >
    {COPY.statsLive}
  </PlayPageTitle>
)
