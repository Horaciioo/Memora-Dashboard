import type { CSSProperties } from 'react'

import type { LudoStrike } from '@/composites/play/ludo/useLudoMotion'
import { pawnPoint, turnPoint } from '@/core/lib/play/ludo'
import type { LudoMap } from '@/core/lib/play/ludo'
import { LUDO_CORNERS } from '@/declarations/play/ludo/board'
import { LUDO_BOARD_COPY } from '@/declarations/play/ludo/copy'
import { LUDO_IMPACT } from '@/declarations/ui/variants'

// Sparks flying out of the hit
const SPARKS = Array.from({ length: 8 }, (_, index) => index)

export interface LudoImpactProps {
  map: LudoMap
  strike: LudoStrike
  players: { accountId: string; corner: number }[]
  turns: number
}

/**
 * Burst where a pawn is eaten, in the colour of the player who ate it
 * @param {LudoImpactProps} props - Strike
 * @return {JSX.Element | null}
 */

export const LudoImpact = ({ map, strike, players, turns }: LudoImpactProps) => {
  const victim = players.find((player) => player.accountId === strike.accountId)
  const captor = players.find((player) => player.accountId === strike.captorId)
  if (!victim || !captor) return null

  const [y, x] = turnPoint(map, pawnPoint(map, victim.corner, strike.from, strike.pawn), turns)
  const style = {
    '--x': x,
    '--y': y,
    '--pawn-tone': `var(--play-ludo-${LUDO_CORNERS[captor.corner]})`,
  } as CSSProperties

  return (
    <span className={LUDO_IMPACT.burst} style={style} aria-hidden="true">
      <span className={LUDO_IMPACT.ring} />
      {SPARKS.map((spark) => (
        <span
          key={spark}
          className={LUDO_IMPACT.spark}
          style={{ '--angle': `${(spark * 360) / SPARKS.length}deg` } as CSSProperties}
        />
      ))}
      <span className={LUDO_IMPACT.label}>{LUDO_BOARD_COPY.eaten}</span>
    </span>
  )
}
