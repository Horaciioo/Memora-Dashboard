import type { CSSProperties } from 'react'

import { LudoPawn } from '@/composites/play/ludo/LudoPawn'
import { LUDO_FELT } from '@/declarations/play/ludo/copy'
import { LUDO_HUB } from '@/declarations/ui/variants'

type PeekEdge = (typeof LUDO_FELT.peekers)[number]['edge']

/**
 * Where a companion hides and which way it comes in
 * @param {PeekEdge} edge - Page edge
 * @param {number} at - Place along it, percent
 * @return {CSSProperties} - Placement
 */

const EDGES: Record<PeekEdge, (at: number) => CSSProperties> = {
  left: (at) =>
    ({
      left: 0,
      top: `${at}%`,
      '--from-x': 'calc(-100% - 4rem)',
      '--from-y': '0%',
    }) as CSSProperties,
  right: (at) =>
    ({
      right: 0,
      top: `${at}%`,
      '--from-x': 'calc(100% + 4rem)',
      '--from-y': '0%',
    }) as CSSProperties,
  bottom: (at) =>
    ({
      bottom: 0,
      left: `${at}%`,
      '--from-x': '0%',
      '--from-y': 'calc(100% + 5rem)',
    }) as CSSProperties,
}

/**
 * Hub ground: tiny pawns hopping in from the edges, startled to be seen, then hopping back out
 * @return {JSX.Element}
 */

export const LudoHopField = () => (
  <div className={LUDO_HUB.field} aria-hidden="true">
    {LUDO_FELT.peekers.map((peeker) => (
      <span
        key={`${peeker.edge}:${peeker.at}`}
        className={LUDO_HUB.walker}
        style={
          {
            ...EDGES[peeker.edge](peeker.at),
            '--hop': `${LUDO_FELT.hop}s`,
            '--cycle': `${LUDO_FELT.cycle}s`,
            '--delay': `${-peeker.delay}s`,
            '--size': `${peeker.size}rem`,
          } as CSSProperties
        }
      >
        <span className={LUDO_HUB.surprise}>{LUDO_FELT.surprise}</span>
        <span className={LUDO_HUB.shadow} />
        <span className={LUDO_HUB.hopper}>
          <LudoPawn colour={peeker.colour} className={LUDO_HUB.pawn} />
        </span>
      </span>
    ))}
  </div>
)
