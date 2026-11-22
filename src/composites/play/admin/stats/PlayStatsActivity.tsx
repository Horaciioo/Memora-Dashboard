'use client'

import { useMemo, useState } from 'react'

import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { PlayBars } from '@/composites/play/admin/stats/PlayCharts'
import { PlayMetricCard } from '@/composites/play/admin/stats/PlayMetricCard'
import { PlayStatCard } from '@/composites/play/admin/stats/PlayStatCard'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { peakHour } from '@/core/lib/play/adminStats'
import { fillPlayMessage } from '@/declarations/play'
import { PLAY_BOARD_ADMIN_COPY as COPY } from '@/declarations/play/admin'
import {
  PLAY_STAT_CARDS,
  PLAY_STAT_HOUR_AXIS,
  PLAY_STAT_RANGES,
} from '@/declarations/play/statsView'
import { PLAY_HEALTH } from '@/declarations/ui/variants'
import type { PlayAdminDay, PlayAdminStats } from '@/types/play'
import { formatNumber } from '@/utils/format/numbers'

const hourText = (hour: number): string => fillPlayMessage(COPY.statsHour, { hour })

export interface PlayStatsActivityProps {
  stats: PlayAdminStats
  // Days of the chosen period
  days: PlayAdminDay[]
  range: string
  onRange: (range: string) => void
}

/**
 * Daily series over the period, then the busy hours
 * @param {PlayStatsActivityProps} props - Stats, days and period switch
 * @return {JSX.Element}
 */

export const PlayStatsActivity = ({ stats, days, range, onRange }: PlayStatsActivityProps) => {
  const [hour, setHour] = useState<number | null>(null)
  const dates = days.map((day) => day.date)
  const peak = useMemo(() => peakHour(stats.hours), [stats.hours])
  const shownHour = hour ?? peak
  const caption = PLAY_STAT_RANGES.find((entry) => entry.value === range)?.label ?? ''
  const series = [
    {
      label: COPY.statsFinished,
      ...PLAY_STAT_CARDS.finished,
      unit: COPY.statsUnitGames,
      values: days.map((day) => day.finished),
      kind: 'bars',
      rest: 'total',
    },
    {
      label: COPY.statsPlayers,
      ...PLAY_STAT_CARDS.active,
      unit: COPY.statsUnitPlayers,
      values: days.map((day) => day.players),
      kind: 'line',
      rest: 'average',
    },
    {
      label: COPY.statsXp,
      ...PLAY_STAT_CARDS.xp,
      unit: COPY.statsUnitXp,
      values: days.map((day) => day.xp),
      kind: 'bars',
      rest: 'total',
    },
    {
      label: COPY.statsMinutes,
      ...PLAY_STAT_CARDS.minutes,
      unit: COPY.statsUnitMinutes,
      values: days.map((day) => day.minutes),
      kind: 'line',
      rest: 'average',
    },
  ] as const

  return (
    <PlayPageTitle
      heading="h2"
      isGrouped
      body={
        <>
          <SegmentedControl
            isPlay
            label={COPY.statsRangeLabel}
            options={PLAY_STAT_RANGES.map(({ value, label }) => ({ value, label }))}
            value={range}
            onChange={onRange}
          />
          <div className={PLAY_HEALTH.grid}>
            {series.map((entry) => (
              <PlayMetricCard
                key={entry.label}
                {...entry}
                values={[...entry.values]}
                dates={dates}
                restCaption={
                  entry.rest === 'total' ? `${COPY.statsTotal}, ${caption}` : COPY.statsAverage
                }
              />
            ))}
            <PlayStatCard
              label={COPY.statsHours}
              {...PLAY_STAT_CARDS.hours}
              value={shownHour === null ? COPY.statsNone : hourText(shownHour)}
              unit={shownHour === null ? undefined : formatNumber(stats.hours[shownHour])}
              caption={
                peak === null ? COPY.statsNoPeak : fillPlayMessage(COPY.statsPeak, { hour: peak })
              }
              className={PLAY_HEALTH.cardWide}
            >
              <PlayBars
                values={stats.hours}
                active={hour}
                onActive={setHour}
                labels={stats.hours.map((value, index) =>
                  fillPlayMessage(COPY.statsHourBar, { hour: index, value })
                )}
              />
              <div className={PLAY_HEALTH.axis}>
                {PLAY_STAT_HOUR_AXIS.map((tick) => (
                  <span key={tick}>{hourText(tick)}</span>
                ))}
              </div>
            </PlayStatCard>
          </div>
        </>
      }
    >
      {COPY.statsActivity}
    </PlayPageTitle>
  )
}
