'use client'

import { useMemo, useState } from 'react'

import { PlayStatsActivity } from '@/composites/play/admin/stats/PlayStatsActivity'
import { PlayStatsLive } from '@/composites/play/admin/stats/PlayStatsLive'
import { PlayStatsRanking } from '@/composites/play/admin/stats/PlayStatsRanking'
import { PlayStatsShare } from '@/composites/play/admin/stats/PlayStatsShare'
import { PlayStatsSummary } from '@/composites/play/admin/stats/PlayStatsSummary'
import { shareByGame } from '@/core/lib/play/adminStats'
import { PLAY_STAT_RANGES } from '@/declarations/play/statsView'
import { PLAY_HEALTH } from '@/declarations/ui/variants'
import type { PlayAdminBoard, PlayAdminStats } from '@/types/play'

export interface PlayAdminStatsViewProps {
  stats: PlayAdminStats
  totals: PlayAdminBoard['totals']
}

/**
 * Figures of Play: live, summary, daily activity over a chosen period, share per game, best of the week
 * @param {PlayAdminStatsViewProps} props - Stats and totals
 * @return {JSX.Element}
 */

export const PlayAdminStatsView = ({ stats, totals }: PlayAdminStatsViewProps) => {
  const [range, setRange] = useState<string>(PLAY_STAT_RANGES[0].value)
  const span = PLAY_STAT_RANGES.find((entry) => entry.value === range)?.days ?? 0
  const days = useMemo(() => stats.days.slice(-span), [stats.days, span])
  const share = useMemo(() => shareByGame(days), [days])

  return (
    <div className={PLAY_HEALTH.page}>
      <PlayStatsLive stats={stats} />
      <PlayStatsSummary totals={totals} />
      <PlayStatsActivity stats={stats} days={days} range={range} onRange={setRange} />
      <PlayStatsShare rows={share.rows} />
      <PlayStatsRanking leaders={stats.leaders} />
    </div>
  )
}
