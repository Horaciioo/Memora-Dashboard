import type { CSSProperties } from 'react'

import { LudoPawn } from '@/composites/play/ludo/LudoPawn'
import type { PlayVoteFace } from '@/composites/play/vote/PlayStartVote'
import { LUDO_CORNERS } from '@/declarations/play/ludo/board'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import type { LudoExitRule } from '@/declarations/play/ludo/settings'
import { LUDO_VOTE } from '@/declarations/ui/variants'

// Squares crossed by the pawn leaving its base
const CROSSING = 3

/**
 * Pawns on a row of squares, each square holding its pawn or one pawn crossing them all
 * @param {Object} props - Row
 * @param {number} props.squares - Squares on the row
 * @param {boolean} props.isCrossing - One pawn hops over every square
 * @return {JSX.Element}
 */

const Track = ({ squares, isCrossing }: { squares: number; isCrossing: boolean }) => (
  <div className={LUDO_VOTE.track} style={{ gridTemplateColumns: `repeat(${squares}, 1fr)` }}>
    {Array.from({ length: squares }, (_, index) => (
      <span key={index} className={LUDO_VOTE.cell}>
        {!isCrossing && (
          <span className={LUDO_VOTE.jumper} style={{ '--i': index } as CSSProperties}>
            <LudoPawn
              colour={LUDO_CORNERS[index % LUDO_CORNERS.length]}
              className={LUDO_VOTE.pawn}
            />
          </span>
        )}
      </span>
    ))}
    {isCrossing && (
      <span className={LUDO_VOTE.traveller} style={{ width: `${100 / squares}%` }}>
        <LudoPawn colour={LUDO_CORNERS[0]} className={LUDO_VOTE.pawn} />
      </span>
    )}
  </div>
)

/**
 * Pictures of the Ludo cards: dice that free a pawn with a pawn hopping out, and as many pawns as asked
 * @type {PlayVoteFace}
 */

export const ludoVoteFace: PlayVoteFace = (step, key) => {
  if (step === 'exit') {
    return (
      <div className={LUDO_VOTE.face}>
        <div className={LUDO_VOTE.dice}>
          {LUDO_SETTINGS.exits[key as LudoExitRule].map((face) => (
            <span key={face} className={LUDO_VOTE.die}>
              {face}
            </span>
          ))}
        </div>
        <Track squares={CROSSING} isCrossing />
      </div>
    )
  }

  return step === 'pawns' ? (
    <div className={LUDO_VOTE.face}>
      <Track squares={Number(key)} isCrossing={false} />
    </div>
  ) : null
}
