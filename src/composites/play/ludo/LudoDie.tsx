'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

import { LUDO_PIPS } from '@/declarations/play/ludo/board'
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
 * Face shown while the die tumbles, a new one each beat
 * @param {boolean} isRolling - Tumbling
 * @return {number} - Face
 */

const useShuffledFace = (isRolling: boolean): number => {
  const [face, setFace] = useState(FACES[0])

  useEffect(() => {
    if (!isRolling) return
    const timer = window.setInterval(
      () => setFace(FACES[Math.floor(Math.random() * FACES.length)]),
      LUDO_SETTINGS.shuffleMs
    )

    return () => window.clearInterval(timer)
  }, [isRolling])

  return face
}

/**
 * Flat white die with pips, jumping and spinning onto the face rolled
 * @param {LudoDieProps} props - Die
 * @return {JSX.Element}
 */

export const LudoDie = ({ face, isRolling, canRoll, onRoll }: LudoDieProps) => {
  const shuffled = useShuffledFace(isRolling)
  const shown = isRolling ? shuffled : (face ?? FACES[FACES.length - 1])

  return (
    <button
      type="button"
      disabled={!canRoll}
      onClick={onRoll}
      aria-label={canRoll ? LUDO_BOARD_COPY.roll : String(face ?? '')}
      className={cn(LUDO_PIECES.dieButton, canRoll && LUDO_PIECES.dieReady)}
    >
      <span
        className={cn(LUDO_PIECES.die, isRolling && LUDO_PIECES.dieRolling)}
        style={{ '--roll': `${LUDO_SETTINGS.rollMs}ms` } as CSSProperties}
      >
        {PIP_CELLS.map((cell) =>
          LUDO_PIPS[shown].includes(cell) ? (
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
    </button>
  )
}
