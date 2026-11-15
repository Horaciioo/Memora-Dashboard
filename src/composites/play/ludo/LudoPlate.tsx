import type { CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { LudoChaosGlyph } from '@/composites/play/ludo/LudoChaosGlyph'
import { LudoHomeCount } from '@/composites/play/ludo/LudoHomeCount'
import { LudoJokerChip } from '@/composites/play/ludo/LudoJokerChip'
import type { LudoCornerName } from '@/declarations/play/ludo/board'
import type { LudoEffectName } from '@/declarations/play/ludo/chaos'
import { LUDO_CHAOS_COPY, ludoPlaceLabel } from '@/declarations/play/ludo/copy'
import { LUDO_CHAOS_PIECES, LUDO_PLATE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Player shown in the line
 * @typedef {Object} LudoPlateFace
 */

export interface LudoPlateFace {
  name: string
  avatarUrl: string | null
  hasLeft: boolean
  place: number | null
}

export interface LudoPlateProps {
  face: LudoPlateFace
  colour: LudoCornerName
  // Turn clock, share left, when on turn
  turn: { clock: number; isAlert: boolean } | null
  // Pawns home
  home: number
  // Jokers left, null outside Chaos mode
  joker: number | null
  // Chaos effects at work
  effects: LudoEffectName[]
  // Turn being lost to a stall
  isStalled: boolean
}

/**
 * Player in the line: avatar in the turn clock of their colour, pawns home, Chaos chips
 * @param {LudoPlateProps} props - Player
 * @return {JSX.Element}
 */

export const LudoPlate = ({
  face,
  colour,
  turn,
  home,
  joker,
  effects,
  isStalled,
}: LudoPlateProps) => {
  const { name, avatarUrl, hasLeft, place } = face

  return (
    <div
      className={cn(
        LUDO_PLATE.plate,
        hasLeft && LUDO_PLATE.off,
        isStalled && LUDO_CHAOS_PIECES.plateStalled
      )}
      style={{ '--pawn-tone': `var(--play-ludo-${colour})` } as CSSProperties}
      title={name}
    >
      <span
        className={cn(LUDO_PLATE.ring, turn?.isAlert && LUDO_PLATE.ringAlert)}
        style={{ '--left': turn?.clock ?? 0 } as CSSProperties}
      >
        <Avatar name={name} src={avatarUrl} size="lg" className={LUDO_PLATE.face} />
      </span>
      <span className={LUDO_PLATE.chaosRow}>
        <LudoHomeCount colour={colour} count={home} />
        {joker !== null && <LudoJokerChip count={joker} />}
        {effects.map((effect) => (
          <span
            key={effect}
            className={LUDO_CHAOS_PIECES.effectChip}
            title={LUDO_CHAOS_COPY[effect].name}
          >
            <LudoChaosGlyph name={effect} />
          </span>
        ))}
      </span>
      {place && <span className={LUDO_PLATE.place}>{ludoPlaceLabel(place)}</span>}
    </div>
  )
}
