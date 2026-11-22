import type { CSSProperties } from 'react'

import { PlayMedal } from '@/composites/play/shared/PlayMedal'
import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { fillPlayMessage, PLAY_LEADER_METRICS } from '@/declarations/play'
import type { PlayLeaderMetric } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_LEADER_BLOCKS, PLAY_LEADER_PODIUM } from '@/declarations/ui/variants'
import type { PlayLeader } from '@/types/play'
import { cn } from '@/utils/classnames'

// Places left to right, the winner in the middle
const PODIUM_ORDER = [2, 1, 3] as const
// Moment each step rises in ms, third first
const RISE_AT: Record<number, number> = { 3: 0, 2: 250, 1: 500 }
const WINNER = 1

export interface PlayLeaderPodiumProps {
  // Best first, at least one
  leaders: PlayLeader[]
  metric: PlayLeaderMetric
  meId: string
}

/**
 * Top three on animated steps, rising when the ranking shows
 * @param {PlayLeaderPodiumProps} props - Leaders, measure and reader
 * @return {JSX.Element}
 */

export const PlayLeaderPodium = ({ leaders, metric, meId }: PlayLeaderPodiumProps) => {
  const CrownIcon = ICONS.playCrown

  return (
    <div className={PLAY_LEADER_PODIUM.row}>
      {PODIUM_ORDER.map((place) => {
        const leader = leaders[place - 1]
        if (!leader) return null

        return (
          <div
            key={place}
            className={PLAY_LEADER_PODIUM.place}
            style={{ '--at': `${RISE_AT[place]}ms` } as CSSProperties}
          >
            <div
              className={cn(
                PLAY_LEADER_PODIUM.face,
                place === WINNER && PLAY_LEADER_PODIUM.faceWinner
              )}
            >
              {place === WINNER && (
                <CrownIcon className={PLAY_LEADER_PODIUM.crown} aria-hidden="true" />
              )}
              <PlayAvatar
                accountId={leader.accountId}
                name={leader.name}
                src={leader.avatarUrl}
                size={place === WINNER ? 'xl' : 'lg'}
              />
            </div>
            <span className={PLAY_LEADER_PODIUM.name}>{leader.name}</span>
            <span className={PLAY_LEADER_PODIUM.value}>
              {fillPlayMessage(PLAY_LEADER_METRICS[metric].note, {
                wins: leader.wins,
                level: leader.level,
                xp: leader.xp,
                played: leader.played,
              })}
            </span>
            <div
              className={cn(
                PLAY_LEADER_PODIUM.block,
                PLAY_LEADER_BLOCKS[place],
                leader.accountId === meId && PLAY_LEADER_PODIUM.me
              )}
            >
              <PlayMedal place={place} size="lg" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
