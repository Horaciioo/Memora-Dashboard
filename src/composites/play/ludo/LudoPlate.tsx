import type { CSSProperties, ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { LudoPawn } from '@/composites/play/ludo/LudoPawn'
import type { LudoCornerName } from '@/declarations/play/ludo/board'
import { LUDO_BOARD_COPY, ludoPlaceLabel } from '@/declarations/play/ludo/copy'
import { fillPlayMessage } from '@/declarations/play/copy'
import { ICONS } from '@/declarations/ui/icons'
import { LUDO_PLATE } from '@/declarations/ui/variants'
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
  home: { count: number; total: number }
}

export interface LudoPlateProps {
  face: LudoPlateFace
  colour: LudoCornerName
  // Plate on the right edge, mirrored
  isRight: boolean
  // Turn clock, share left, when on turn
  turn: { clock: number; isAlert: boolean } | null
  // Die beside the player on turn
  die: ReactNode
}

/**
 * Player beside a corner: avatar in the turn clock, colour pawn, name with crown and presence
 * @param {LudoPlateProps} props - Player
 * @return {JSX.Element}
 */

export const LudoPlate = ({ face, colour, isRight, turn, die }: LudoPlateProps) => {
  const { name, avatarUrl, isHost, hasLeft, place, home } = face
  const CrownIcon = ICONS.playCrown

  return (
    <div
      className={cn(LUDO_PLATE.plate, isRight && LUDO_PLATE.plateRight, hasLeft && LUDO_PLATE.off)}
      style={{ '--pawn-tone': `var(--play-ludo-${colour})` } as CSSProperties}
    >
      <div className={cn(LUDO_PLATE.row, isRight && LUDO_PLATE.rowRight)}>
        <LudoPawn colour={colour} className={LUDO_PLATE.chip} />
        <span
          className={cn(LUDO_PLATE.ring, turn?.isAlert && LUDO_PLATE.ringAlert)}
          style={{ '--left': turn?.clock ?? 0 } as CSSProperties}
        >
          <Avatar name={name} src={avatarUrl} size="lg" className={LUDO_PLATE.face} />
        </span>
        {die}
      </div>
      <div className={cn(LUDO_PLATE.nameRow, isRight && LUDO_PLATE.nameRowRight)}>
        {isHost && <CrownIcon className={LUDO_PLATE.crown} aria-label={LUDO_BOARD_COPY.host} />}
        <span
          className={cn(LUDO_PLATE.dot, hasLeft ? LUDO_PLATE.away : LUDO_PLATE.online)}
          title={hasLeft ? LUDO_BOARD_COPY.left : undefined}
        />
        <span className={LUDO_PLATE.name}>{name}</span>
      </div>
      {place ? (
        <span className={LUDO_PLATE.place}>{ludoPlaceLabel(place)}</span>
      ) : (
        <span className={LUDO_PLATE.note}>{fillPlayMessage(LUDO_BOARD_COPY.home, home)}</span>
      )}
    </div>
  )
}
