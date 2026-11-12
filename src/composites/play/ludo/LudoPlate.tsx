import type { CSSProperties, ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { LudoChaosGlyph } from '@/composites/play/ludo/LudoChaosGlyph'
import { LudoHomeCount } from '@/composites/play/ludo/LudoHomeCount'
import { LudoJokerChip } from '@/composites/play/ludo/LudoJokerChip'
import { LudoPawn } from '@/composites/play/ludo/LudoPawn'
import type { LudoCornerName } from '@/declarations/play/ludo/board'
import type { LudoEffectName } from '@/declarations/play/ludo/chaos'
import { LUDO_BOARD_COPY, LUDO_CHAOS_COPY, ludoPlaceLabel } from '@/declarations/play/ludo/copy'
import { ICONS } from '@/declarations/ui/icons'
import { LUDO_CHAOS_PIECES, LUDO_PLATE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Player shown on a plate
 * @typedef {Object} LudoPlateFace
 */

export interface LudoPlateFace {
  name: string
  avatarUrl: string | null
  isHost: boolean
  hasLeft: boolean
  place: number | null
}

export interface LudoPlateProps {
  face: LudoPlateFace
  colour: LudoCornerName
  // Plate on the right edge, mirrored
  isRight: boolean
  // Turn clock, share left, when on turn
  turn: { clock: number; isAlert: boolean } | null
  // The viewer's own plate
  isMine: boolean
  // Die beside the player on turn
  die: ReactNode
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
 * Player beside a corner: avatar in the turn clock, colour pawn, name with crown and presence
 * @param {LudoPlateProps} props - Player
 * @return {JSX.Element}
 */

export const LudoPlate = ({
  face,
  colour,
  isRight,
  turn,
  isMine,
  die,
  home,
  joker,
  effects,
  isStalled,
}: LudoPlateProps) => {
  const { name, avatarUrl, isHost, hasLeft, place } = face
  const CrownIcon = ICONS.playCrown

  return (
    <div
      className={cn(
        LUDO_PLATE.plate,
        isRight && LUDO_PLATE.plateRight,
        hasLeft && LUDO_PLATE.off,
        turn && LUDO_PLATE.plateTurn,
        isStalled && LUDO_CHAOS_PIECES.plateStalled
      )}
      style={{ '--pawn-tone': `var(--play-ludo-${colour})` } as CSSProperties}
    >
      {/* The slot stays, so the table never moves */}
      <span className={LUDO_PLATE.tagSlot}>
        {turn && (
          <span className={LUDO_PLATE.tag}>
            {isMine ? LUDO_BOARD_COPY.turnMine : LUDO_BOARD_COPY.turnTheirs}
          </span>
        )}
      </span>
      <div className={cn(LUDO_PLATE.row, isRight && LUDO_PLATE.rowRight)}>
        <LudoPawn colour={colour} className={LUDO_PLATE.chip} />
        <div className={LUDO_PLATE.core}>
          <span
            className={cn(LUDO_PLATE.ring, turn?.isAlert && LUDO_PLATE.ringAlert)}
            style={{ '--left': turn?.clock ?? 0 } as CSSProperties}
          >
            <Avatar name={name} src={avatarUrl} size="lg" className={LUDO_PLATE.face} />
          </span>
          <div className={LUDO_PLATE.nameRow}>
            {isHost && <CrownIcon className={LUDO_PLATE.crown} aria-label={LUDO_BOARD_COPY.host} />}
            <span
              className={cn(LUDO_PLATE.dot, hasLeft ? LUDO_PLATE.away : LUDO_PLATE.online)}
              title={hasLeft ? LUDO_BOARD_COPY.left : undefined}
            />
            <span className={LUDO_PLATE.name}>{name}</span>
          </div>
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
          {die && (
            <span className={isRight ? LUDO_PLATE.dieSlotRight : LUDO_PLATE.dieSlot}>{die}</span>
          )}
          {place && <span className={LUDO_PLATE.place}>{ludoPlaceLabel(place)}</span>}
        </div>
      </div>
    </div>
  )
}
