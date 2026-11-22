'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { PlayLeaderPodium } from '@/composites/play/hub/leaderboard/PlayLeaderPodium'
import { PlayLeaderRow } from '@/composites/play/hub/leaderboard/PlayLeaderRow'
import {
  PLAY_HUB_COPY,
  PLAY_LEADER_DEFAULT,
  PLAY_LEADER_KEYS,
  PLAY_LEADER_METRICS,
} from '@/declarations/play'
import { PlayEmpty } from '@/composites/play/shared/PlayEmpty'
import type { PlayLeaderMetric } from '@/declarations/play'
import { PLAY_BOARD, PLAY_LEADER_PODIUM } from '@/declarations/ui/variants'
import type { PlayLeader } from '@/types/play'

// Places on the podium
const PODIUM_SIZE = 3
// Rows slide in after the podium, then one by one
const RESTS_AT = 900
const ROW_STEP = 60

export interface PlayLeaderboardProps {
  // One list per measure
  leaders: Record<PlayLeaderMetric, PlayLeader[]>
  meId: string
  // Next to the measure switch, the game menu
  children?: ReactNode
}

/**
 * Best players: podium first, then the rest, the reader lit
 * @param {PlayLeaderboardProps} props - Leaders and reader
 * @return {JSX.Element}
 */

export const PlayLeaderboard = ({ leaders, meId, children }: PlayLeaderboardProps) => {
  const [metric, setMetric] = useState<PlayLeaderMetric>(PLAY_LEADER_DEFAULT)
  const list = leaders[metric]
  const rest = list.slice(PODIUM_SIZE)

  return (
    <div className={PLAY_BOARD.root}>
      <div className={PLAY_LEADER_PODIUM.filters}>
        <SegmentedControl
          isPlay
          isInline
          label={PLAY_HUB_COPY.leaderMetric}
          options={PLAY_LEADER_KEYS.map((key) => ({
            value: key,
            label: PLAY_LEADER_METRICS[key].label,
            icon: PLAY_LEADER_METRICS[key].icon,
          }))}
          value={metric}
          onChange={setMetric}
        />
        {children && <div className={PLAY_LEADER_PODIUM.game}>{children}</div>}
      </div>

      {list.length === 0 ? (
        <PlayEmpty icon="playCrown">{PLAY_HUB_COPY.noLeader}</PlayEmpty>
      ) : (
        // Keyed by measure so the podium rises again on each switch
        <div key={metric} className={PLAY_LEADER_PODIUM.stage}>
          <div className={PLAY_LEADER_PODIUM.scene}>
            <PlayLeaderPodium leaders={list} metric={metric} meId={meId} />
          </div>
          {rest.length > 0 && (
            <ol className={PLAY_LEADER_PODIUM.rest}>
              {rest.map((leader, index) => (
                <PlayLeaderRow
                  key={leader.accountId}
                  leader={leader}
                  metric={metric}
                  meId={meId}
                  delayMs={RESTS_AT + index * ROW_STEP}
                />
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
