import type { CSSProperties } from 'react'

import { BOMB_BOARD } from '@/declarations/ui/variants'

// Sparks thrown around the bomb
const DEBRIS = Array.from({ length: 12 }, (_, index) => index)
const TURN = 360

/**
 * Shockwave and sparks of a blast
 * @return {JSX.Element}
 */

export const BombBlast = () => (
  <span aria-hidden="true">
    <span className={BOMB_BOARD.shockwave} />
    {DEBRIS.map((index) => (
      <span
        key={index}
        className={BOMB_BOARD.debris}
        style={{ '--angle': `${(index * TURN) / DEBRIS.length}deg` } as CSSProperties}
      />
    ))}
  </span>
)
