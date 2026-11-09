'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { PlayLeaderRow } from '@/composites/play/hub/leaderboard/PlayLeaderRow'
import {
  PLAY_HUB_COPY,
  PLAY_LEADER_DEFAULT,
  PLAY_LEADER_KEYS,
  PLAY_LEADER_METRICS,
} from '@/declarations/play'
import type { PlayLeaderMetric } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_BOARD, PLAY_HUB } from '@/declarations/ui/variants'
import type { PlayLeader } from '@/types/play'

export interface PlayLeaderboardProps {
  // One list per measure
  leaders: Record<PlayLeaderMetric, PlayLeader[]>
  meId: string
}

/**
 * Best players: podium first, then the rest, the reader lit
 * @param {PlayLeaderboardProps} props - Leaders and reader
 * @return {JSX.Element}
 */

export const PlayLeaderboard = ({ leaders, meId }: PlayLeaderboardProps) => {
  const [metric, setMetric] = useState<PlayLeaderMetric>(PLAY_LEADER_DEFAULT)
  const list = leaders[metric]

  return (
    <div className={PLAY_BOARD.root}>
      <div className={PLAY_BOARD.tabs} role="group" aria-label={PLAY_HUB_COPY.leaderMetric}>
        {PLAY_LEADER_KEYS.map((key) => {
          const Icon = ICONS[PLAY_LEADER_METRICS[key].icon]

          return (
            <Button
              key={key}
              variant={key === metric ? 'arcade' : 'arcadeGhost'}
              aria-pressed={key === metric}
              aria-label={PLAY_LEADER_METRICS[key].label}
              title={PLAY_LEADER_METRICS[key].label}
              className={PLAY_BOARD.tab}
              onClick={() => setMetric(key)}
            >
              <Icon className={PLAY_BOARD.tabIcon} aria-hidden="true" />
            </Button>
          )
        })}
      </div>

      {list.length === 0 ? (
        <p className={PLAY_HUB.empty}>{PLAY_HUB_COPY.noLeader}</p>
      ) : (
        <ol className={PLAY_BOARD.rows}>
          {list.map((leader) => (
            <PlayLeaderRow key={leader.accountId} leader={leader} metric={metric} meId={meId} />
          ))}
        </ol>
      )}
    </div>
  )
}
