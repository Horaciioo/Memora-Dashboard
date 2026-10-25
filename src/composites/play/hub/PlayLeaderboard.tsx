'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import {
  fillPlayMessage,
  PLAY_HUB_COPY,
  PLAY_LEADER_DEFAULT,
  PLAY_LEADER_KEYS,
  PLAY_LEADER_METRICS,
} from '@/declarations/play'
import type { PlayLeaderMetric } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import type { PlayLeader } from '@/types/play'
import { cn } from '@/utils/classnames'

// Podium places
const PODIUM = 3

export interface PlayLeaderboardProps {
  // One list per measure
  leaders: Record<PlayLeaderMetric, PlayLeader[]>
  meId: string
}

/**
 * Best players of a game by wins, levels or games played, the reader lit
 * @param {PlayLeaderboardProps} props - Leaders and reader
 * @return {JSX.Element}
 */

export const PlayLeaderboard = ({ leaders, meId }: PlayLeaderboardProps) => {
  const [metric, setMetric] = useState<PlayLeaderMetric>(PLAY_LEADER_DEFAULT)
  const list = leaders[metric]

  return (
    <div className={PLAY_HUB.section}>
      <div className={PLAY_HUB.leaderTabs} role="group" aria-label={PLAY_HUB_COPY.leaderMetric}>
        {PLAY_LEADER_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={key === metric}
            className={cn(PLAY_HUB.leaderTab, key === metric && PLAY_HUB.leaderTabOn)}
            onClick={() => setMetric(key)}
          >
            {PLAY_LEADER_METRICS[key].label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className={PLAY_HUB.empty}>{PLAY_HUB_COPY.noLeader}</p>
      ) : (
        <ol className={PLAY_HUB.leaders}>
          {list.map((leader) => (
            <li
              key={leader.accountId}
              className={cn(PLAY_HUB.leader, leader.accountId === meId && PLAY_HUB.leaderMe)}
            >
              <span
                className={cn(PLAY_HUB.leaderRank, leader.rank <= PODIUM && PLAY_HUB.leaderRankTop)}
              >
                {leader.rank}
              </span>
              <Avatar name={leader.name} src={leader.avatarUrl} />
              <span className={PLAY_HUB.leaderText}>
                <span className={PLAY_HUB.leaderName}>{leader.name}</span>
                <span className={PLAY_HUB.leaderNote}>
                  {fillPlayMessage(PLAY_LEADER_METRICS[metric].note, {
                    wins: leader.wins,
                    level: leader.level,
                    xp: leader.xp,
                    played: leader.played,
                  })}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
