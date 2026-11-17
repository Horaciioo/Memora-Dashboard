'use client'

import { useMemo, useState } from 'react'

import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayMetricCard } from '@/composites/play/admin/stats/PlayMetricCard'
import { PlayBars } from '@/composites/play/admin/stats/PlayCharts'
import { PlayStatCard } from '@/composites/play/admin/stats/PlayStatCard'
import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { fillPlayMessage, PLAY_GAMES } from '@/declarations/play'
import { PLAY_BOARD_ADMIN_COPY as COPY } from '@/declarations/play/admin'
import { PLAY_HEALTH } from '@/declarations/ui/variants'
import type { PlayAdminBoard, PlayAdminStats } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'

// Ranges offered by the switch, in days
const RANGES = [
  { value: '7', label: COPY.statsRange7 },
  { value: '30', label: COPY.statsRange30 },
]

export interface PlayAdminStatsViewProps {
  stats: PlayAdminStats
  totals: PlayAdminBoard['totals']
}

/**
 * Figures of Play laid out like the Health summary: big tinted cards, a chart each, a switch of period
 * @param {PlayAdminStatsViewProps} props - Stats and totals
 * @return {JSX.Element}
 */

export const PlayAdminStatsView = ({ stats, totals }: PlayAdminStatsViewProps) => {
  const [range, setRange] = useState('7')
  const [hour, setHour] = useState<number | null>(null)
  const days = useMemo(() => stats.days.slice(-Number(range)), [stats.days, range])
  const dates = days.map((day) => day.date)
  const caption = range === '7' ? COPY.statsRange7 : COPY.statsRange30

  // Share of each game over the period
  const share = useMemo(() => {
    const counts = new Map<PlayGameName, number>()

    for (const day of days) {
      for (const [game, count] of Object.entries(day.byGame) as [PlayGameName, number][]) {
        counts.set(game, (counts.get(game) ?? 0) + count)
      }
    }

    const sum = [...counts.values()].reduce((total, count) => total + count, 0)

    return {
      sum,
      rows: [...counts.entries()]
        .map(([game, count]) => ({ game, count, part: sum > 0 ? count / sum : 0 }))
        .toSorted((a, b) => b.count - a.count),
    }
  }, [days])

  const peak = stats.hours.reduce(
    (best, value, index) => (value > stats.hours[best] ? index : best),
    0
  )
  const hasPeak = stats.hours[peak] > 0
  const shownHour = hour ?? (hasPeak ? peak : null)

  const summary = [
    [COPY.totalPlayers, totals.players],
    [COPY.totalActive, totals.active],
    [COPY.totalBanned, totals.banned],
    [COPY.totalXp, totals.xp],
  ] as const

  return (
    <div className={PLAY_HEALTH.page}>
      <section className={PLAY_HEALTH.section}>
        <h2 className={PLAY_HEALTH.title}>{COPY.statsLive}</h2>
        <div className={PLAY_HEALTH.grid}>
          <PlayStatCard
            label={COPY.statsLobby}
            icon="members"
            tone="--play-echo"
            value={stats.lobby.toLocaleString('fr-FR')}
          />
          <PlayStatCard
            label={COPY.statsRunning}
            icon="dashboard"
            tone="--play-golf"
            value={stats.running.toLocaleString('fr-FR')}
          />
          <PlayStatCard
            label={COPY.statsToday}
            icon="history"
            tone="--play-key"
            value={stats.finishedToday.toLocaleString('fr-FR')}
            caption={fillPlayMessage(COPY.statsGameLine, {
              week: stats.finishedWeek,
              finished: stats.activeWeek,
            })}
          />
        </div>
      </section>

      <section className={PLAY_HEALTH.section}>
        <h2 className={PLAY_HEALTH.title}>{COPY.statsSummary}</h2>
        <div className={PLAY_HEALTH.grid}>
          {summary.map(([label, value], index) => (
            <PlayStatCard
              key={label}
              label={label}
              icon="members"
              tone={['--play-key', '--play-golf', '--play-alert', '--play-gold'][index]}
              value={value.toLocaleString('fr-FR')}
            />
          ))}
        </div>
      </section>

      <section className={PLAY_HEALTH.section}>
        <div className={PLAY_HEALTH.head}>
          <h2 className={PLAY_HEALTH.title}>{COPY.statsActivity}</h2>
          <SegmentedControl
            label={COPY.statsRangeLabel}
            options={RANGES}
            value={range}
            onChange={setRange}
            isPlay
          />
        </div>
        <div className={PLAY_HEALTH.grid}>
          <PlayMetricCard
            label={COPY.statsFinished}
            icon="dashboard"
            tone="--play-key"
            unit={COPY.statsUnitGames}
            values={days.map((day) => day.finished)}
            dates={dates}
            kind="bars"
            rest="total"
            restCaption={`${COPY.statsTotal}, ${caption}`}
          />
          <PlayMetricCard
            label={COPY.statsPlayers}
            icon="members"
            tone="--play-golf"
            unit={COPY.statsUnitPlayers}
            values={days.map((day) => day.players)}
            dates={dates}
            kind="line"
            rest="average"
            restCaption={COPY.statsAverage}
          />
          <PlayMetricCard
            label={COPY.statsXp}
            icon="path"
            tone="--play-gold"
            unit={COPY.statsUnitXp}
            values={days.map((day) => day.xp)}
            dates={dates}
            kind="bars"
            rest="total"
            restCaption={`${COPY.statsTotal}, ${caption}`}
          />
          <PlayMetricCard
            label={COPY.statsMinutes}
            icon="history"
            tone="--play-echo"
            unit={COPY.statsUnitMinutes}
            values={days.map((day) => day.minutes)}
            dates={dates}
            kind="line"
            rest="average"
            restCaption={COPY.statsAverage}
          />
          <PlayStatCard
            label={COPY.statsHours}
            icon="history"
            tone="--play-bomb"
            value={shownHour === null ? '–' : `${shownHour} h`}
            unit={shownHour === null ? undefined : stats.hours[shownHour].toLocaleString('fr-FR')}
            caption={hasPeak ? fillPlayMessage(COPY.statsPeak, { hour: peak }) : COPY.statsNoPeak}
            className="md:col-span-2 xl:col-span-2"
          >
            <PlayBars
              values={stats.hours}
              active={hour}
              onActive={setHour}
              labels={stats.hours.map((value, index) => `${index} h : ${value}`)}
            />
            <div className={PLAY_HEALTH.axis}>
              <span>0 h</span>
              <span>12 h</span>
              <span>23 h</span>
            </div>
          </PlayStatCard>
        </div>
      </section>

      <section className={PLAY_HEALTH.section}>
        <h2 className={PLAY_HEALTH.title}>{COPY.statsShare}</h2>
        <div className={PLAY_HEALTH.card}>
          {share.sum === 0 ? (
            <p className={PLAY_HEALTH.empty}>{COPY.statsEmpty}</p>
          ) : (
            <>
              <div className={PLAY_HEALTH.share} role="img" aria-label={COPY.statsShare}>
                {share.rows.map((row) => (
                  <span
                    key={row.game}
                    className={PLAY_HEALTH.shareCut}
                    style={{
                      width: `${row.part * 100}%`,
                      background: `var(${PLAY_GAMES.get(row.game).tone})`,
                    }}
                  />
                ))}
              </div>
              <ul className={PLAY_HEALTH.legend}>
                {share.rows.map((row) => (
                  <li key={row.game} className={PLAY_HEALTH.legendRow}>
                    <PlayGameLogo game={row.game} className={PLAY_HEALTH.legendLogo} />
                    <span className={PLAY_HEALTH.legendText}>
                      <span className={PLAY_HEALTH.legendName}>{PLAY_GAMES.label(row.game)}</span>
                      <span className={PLAY_HEALTH.legendNote}>
                        {fillPlayMessage(COPY.statsSharePlayed, { count: row.count })}
                      </span>
                    </span>
                    <span className={PLAY_HEALTH.legendShare}>{Math.round(row.part * 100)} %</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <section className={PLAY_HEALTH.section}>
        <h2 className={PLAY_HEALTH.title}>{COPY.statsRanking}</h2>
        <div className={PLAY_HEALTH.card}>
          {stats.leaders.length === 0 ? (
            <p className={PLAY_HEALTH.empty}>{COPY.statsNoRanking}</p>
          ) : (
            <ol className={PLAY_HEALTH.rank}>
              {stats.leaders.map((leader, index) => (
                <li key={leader.accountId} className={PLAY_HEALTH.rankRow}>
                  <span className={PLAY_HEALTH.rankNumber}>{index + 1}</span>
                  <PlayAvatar
                    accountId={leader.accountId}
                    name={leader.name}
                    src={leader.avatarUrl}
                  />
                  <span className={PLAY_HEALTH.rankName}>{leader.name}</span>
                  <span className={PLAY_HEALTH.rankXp}>
                    {leader.xp.toLocaleString('fr-FR')} {COPY.statsUnitXp}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  )
}
