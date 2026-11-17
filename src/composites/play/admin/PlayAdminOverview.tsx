'use client'

import { useState } from 'react'

import { Tabs } from '@/components/elements/navigation/Tabs'
import { playPresenceLabel } from '@/core/lib/play/presence'
import { PLAY_GAMES } from '@/declarations/play'
import { PLAY_BOARD_ADMIN_COPY as COPY, PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import type { PlayAdminState } from '@/types/play'

// Whole figures drawn "Aucune" when nil
const SCOPE_GLOBAL = 'global'
const SECONDS_IN_MINUTE = 60
const MINUTES_IN_HOUR = 60

/**
 * Time played as the file reads it
 * @param {number} seconds - Seconds played
 * @return {string} - Minutes or hours and minutes
 */

const formatPlayed = (seconds: number): string => {
  const minutes = Math.round(seconds / SECONDS_IN_MINUTE)

  return minutes < MINUTES_IN_HOUR
    ? `${minutes} min`
    : `${Math.floor(minutes / MINUTES_IN_HOUR)} h ${String(minutes % MINUTES_IN_HOUR).padStart(2, '0')}`
}

export interface PlayAdminOverviewProps {
  state: PlayAdminState
}

/**
 * Overview of a player, the moderator overview in Play colours: game now, then the figures with a tab per game
 * @param {PlayAdminOverviewProps} props - Play state
 * @return {JSX.Element}
 */

export const PlayAdminOverview = ({ state }: PlayAdminOverviewProps) => {
  const [scope, setScope] = useState<string>(SCOPE_GLOBAL)
  const PlayIcon = ICONS.history
  const { global, games, presence } = state

  const totals =
    scope === SCOPE_GLOBAL ? global : (games.find((entry) => entry.game === scope) ?? global)
  const none = COPY.railNone
  const count = (value: number) => (value > 0 ? value.toLocaleString('fr-FR') : none)
  const facts = [
    [COPY.railLevel, String(totals.level.level)],
    [COPY.railXp, totals.xp.toLocaleString('fr-FR')],
    ...(scope === SCOPE_GLOBAL ? [[COPY.railBonus, count(global.bonusXp)]] : []),
    [COPY.railPlayed, count(totals.played)],
    [COPY.railWins, count(totals.wins)],
    [COPY.railDraws, count(totals.draws)],
    [COPY.railLosses, count(totals.losses)],
    [COPY.railStreak, count(totals.bestStreak)],
    [COPY.railTime, totals.playSeconds > 0 ? formatPlayed(totals.playSeconds) : none],
  ]

  return (
    <div className={PLAY_ADMIN.overview}>
      <section className={PLAY_ADMIN.overviewSection}>
        <h2 className={PLAY_ADMIN.overviewTitle}>{COPY.overviewNow}</h2>
        <div className={PLAY_ADMIN.overviewBox}>
          <div className={PLAY_ADMIN.overviewLine}>
            <PlayIcon className={PLAY_ADMIN.overviewGlyph} aria-hidden="true" />
            <span className={PLAY_ADMIN.overviewLineText}>
              {presence ? playPresenceLabel(presence) : PLAY_MEMBER_COPY.noGame}
            </span>
          </div>
        </div>
      </section>

      <section className={PLAY_ADMIN.overviewSection}>
        <h2 className={PLAY_ADMIN.overviewTitle}>{COPY.overviewFigures}</h2>
        <div className={PLAY_ADMIN.overviewBox}>
          <Tabs
            isPlay
            label={COPY.overviewFigures}
            value={scope}
            onChange={setScope}
            items={[
              { value: SCOPE_GLOBAL, label: PLAY_MEMBER_COPY.global },
              ...games.map((entry) => ({ value: entry.game, label: PLAY_GAMES.label(entry.game) })),
            ]}
          />
          <dl className={PLAY_ADMIN.facts}>
            {facts.map(([label, value]) => (
              <div key={label} className={PLAY_ADMIN.fact}>
                <dt className={PLAY_ADMIN.railItemLabel}>{label}</dt>
                <dd className={value === none ? PLAY_ADMIN.railEmpty : PLAY_ADMIN.railValue}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  )
}
