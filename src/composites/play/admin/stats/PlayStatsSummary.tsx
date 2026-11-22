import { PlayStatCard } from '@/composites/play/admin/stats/PlayStatCard'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PLAY_BOARD_ADMIN_COPY as COPY } from '@/declarations/play/admin'
import { PLAY_STAT_CARDS } from '@/declarations/play/statsView'
import { PLAY_HEALTH } from '@/declarations/ui/variants'
import type { PlayAdminBoard } from '@/types/play'
import { formatNumber } from '@/utils/format/numbers'

/**
 * Players, active, banned and total XP
 * @param {Object} props - Totals of the board
 * @param {PlayAdminBoard['totals']} props.totals - Totals
 * @return {JSX.Element}
 */

export const PlayStatsSummary = ({ totals }: { totals: PlayAdminBoard['totals'] }) => {
  const cards = [
    { label: COPY.totalPlayers, ...PLAY_STAT_CARDS.players, value: totals.players },
    { label: COPY.totalActive, ...PLAY_STAT_CARDS.active, value: totals.active },
    { label: COPY.totalBanned, ...PLAY_STAT_CARDS.banned, value: totals.banned },
    { label: COPY.totalXp, ...PLAY_STAT_CARDS.xp, value: totals.xp },
  ]

  return (
    <PlayPageTitle
      heading="h2"
      isGrouped
      body={
        <div className={PLAY_HEALTH.grid}>
          {cards.map(({ value, ...card }) => (
            <PlayStatCard key={card.label} {...card} value={formatNumber(value)} />
          ))}
        </div>
      }
    >
      {COPY.statsSummary}
    </PlayPageTitle>
  )
}
