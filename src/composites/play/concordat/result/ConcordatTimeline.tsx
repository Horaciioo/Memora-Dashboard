'use client'

import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { featuredPlayers, playerRgb, rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_RESULT } from '@/declarations/ui/variants'

// Drawing space of the curves
const WIDTH = 1000
const HEIGHT = 200

// Journal kinds marked on the curves
// Curves drawn, tribes stay out
const FEATURED = 14
const MARKS = ['treaty', 'betrayal'] as const

/**
 * Land held by each nation over the game, with treaties and betrayals marked
 * @param {Object} props - Game
 * @param {ConcordatClientState} props.client - Finished game
 * @return {JSX.Element}
 */

export const ConcordatTimeline = ({ client }: { client: ConcordatClientState }) => {
  const { history, log, players } = client
  const lastTick = Math.max(1, history.at(-1)?.tick ?? client.tick)
  const peak = Math.max(1, ...history.flatMap((sample) => sample.tiles))
  const x = (tick: number) => (tick / lastTick) * WIDTH

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={CONCORDAT_RESULT.svg}
      aria-hidden="true"
    >
      {log
        .filter((event) => (MARKS as readonly string[]).includes(event.kind))
        .map((event, index) => (
          <line
            key={`${event.tick}-${index}`}
            x1={x(event.tick)}
            x2={x(event.tick)}
            y1={0}
            y2={HEIGHT}
            stroke="currentColor"
            strokeOpacity={event.kind === 'betrayal' ? 0.5 : 0.18}
            strokeDasharray={event.kind === 'betrayal' ? '' : '4 5'}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      {featuredPlayers(players, FEATURED).map((player) => (
        <polyline
          key={player.id}
          fill="none"
          stroke={rgbText(playerRgb(player, CONCORDAT_ART.nation))}
          strokeWidth={player.id === client.me ? 3.5 : 2}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          points={history
            .map(
              (sample) =>
                `${x(sample.tick)},${HEIGHT - ((sample.tiles[player.id - 1] ?? 0) / peak) * HEIGHT}`
            )
            .join(' ')}
        />
      ))}
    </svg>
  )
}
