import type { CSSProperties } from 'react'

import { LUDO_DIE_FACES, LUDO_PIPS } from '@/declarations/play/ludo/board'
import { LUDO_BOARD_COPY } from '@/declarations/play/ludo/copy'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import { LUDO_PIECES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Side and cells of the pip grid
const PIP_SIDE = 3
const PIP_CELLS = Array.from({ length: PIP_SIDE * PIP_SIDE }, (_, index) => index + 1)
const FACES = Object.keys(LUDO_PIPS).map(Number)

export interface LudoDieProps {
  face: number | null
  isRolling: boolean
  // The viewer may throw it
  canRoll: boolean
  onRoll: () => void
}

/**
 * White cube thrown in high, tumbling on every axis before it settles on the face rolled
 * @param {LudoDieProps} props - Die
 * @return {JSX.Element}
 */

export const LudoDie = ({ face, isRolling, canRoll, onRoll }: LudoDieProps) => {
  const shown = face ?? FACES[FACES.length - 1]
  const [turnX, turnY] = LUDO_DIE_FACES[shown].turn

  return (
    <button
      type="button"
      disabled={!canRoll}
      onClick={onRoll}
      aria-label={canRoll ? LUDO_BOARD_COPY.roll : String(face ?? '')}
      className={cn(LUDO_PIECES.dieButton, canRoll && LUDO_PIECES.dieReady)}
    >
      <span
        className={cn(LUDO_PIECES.dieStage, isRolling && LUDO_PIECES.dieRolling)}
        style={{ '--roll': `${LUDO_SETTINGS.rollMs}ms` } as CSSProperties}
      >
        <span className={LUDO_PIECES.dieShadow} />
        <span
          className={LUDO_PIECES.die}
          style={{ '--turn-x': `${turnX}deg`, '--turn-y': `${turnY}deg` } as CSSProperties}
        >
          {FACES.map((side) => (
            <span
              key={side}
              className={LUDO_PIECES.dieFace}
              style={
                {
                  transform: LUDO_DIE_FACES[side].place,
                  '--shade': LUDO_DIE_FACES[side].shade,
                } as CSSProperties
              }
            >
              {PIP_CELLS.map((cell) =>
                LUDO_PIPS[side].includes(cell) ? (
                  <span
                    key={cell}
                    className={LUDO_PIECES.pip}
                    style={{
                      gridArea: `${Math.ceil(cell / PIP_SIDE)} / ${((cell - 1) % PIP_SIDE) + 1}`,
                    }}
                  />
                ) : null
              )}
            </span>
          ))}
        </span>
      </span>
    </button>
  )
}
