import type { CSSProperties } from 'react'

import { LudoChaosGlyph } from '@/composites/play/ludo/LudoChaosGlyph'
import { LudoFxDie } from '@/composites/play/ludo/LudoFxDie'
import type { LudoDuelState } from '@/composites/play/ludo/chaosMotion'
import type { LudoMap } from '@/core/lib/play/ludo'
import { LUDO_CORNERS } from '@/declarations/play/ludo/board'
import { LUDO_CHAOS_UI } from '@/declarations/play/ludo/copy'
import { fillPlayMessage } from '@/declarations/play/copy'
import { ICONS } from '@/declarations/ui/icons'
import { LUDO_DUEL } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Reach of the dice from the middle on the star, and how far they fly in, in percent of the width
const STAR_REACH = 33
const STAR_FLIGHT = 70

export interface LudoDuelProps {
  map: LudoMap
  duel: LudoDuelState
  players: { accountId: string; corner: number }[]
  names: Record<string, string>
  // View turn
  turns: number
}

/**
 * Place of a die on the star, around the middle at the angle of its arm
 * @param {number} slot - Arm on screen
 * @param {number} corners - Arms
 * @return {CSSProperties} - Style
 */

const starSeat = (slot: number, corners: number): CSSProperties => {
  const angle = (slot * 2 * Math.PI) / corners - Math.PI / corners
  const [sin, cos] = [Math.sin(angle), Math.cos(angle)]

  return {
    left: `calc(${50 + STAR_REACH * sin}% - 13%)`,
    top: `${50 - STAR_REACH * cos}%`,
    transform: 'translateY(-50%)',
    '--sx': `${(STAR_FLIGHT * sin).toFixed(1)}cqi`,
    '--sy': `${(-STAR_FLIGHT * cos).toFixed(1)}cqi`,
  } as CSSProperties
}

/**
 * Duel of dice: every die slams in from its corner, the best one is crowned, a storm crowns nobody
 * @param {LudoDuelProps} props - Duel
 * @return {JSX.Element}
 */

export const LudoDuel = ({ map, duel, players, names, turns }: LudoDuelProps) => {
  const isDone = duel.winnerId !== null || duel.isDraw
  const CrownIcon = ICONS.playCrown
  const isStar = map.name === 'star'

  return (
    <div className={LUDO_DUEL.layer} aria-live="polite">
      <span className={LUDO_DUEL.hub}>
        <LudoChaosGlyph name="duel" />
      </span>
      {duel.rolls.map((roll) => {
        const player = players.find((entry) => entry.accountId === roll.accountId)
        if (!player) return null
        const slot = (player.corner + turns) % map.corners
        const isWinner = duel.winnerId === roll.accountId

        return (
          <div
            key={roll.accountId}
            className={cn(
              LUDO_DUEL.seat,
              isDone && (isWinner ? LUDO_DUEL.win : LUDO_DUEL.lose),
              duel.isDraw && LUDO_DUEL.draw
            )}
            data-slot={isStar ? undefined : slot}
            style={
              {
                ...(isStar ? starSeat(slot, map.corners) : {}),
                '--pawn-tone': `var(--play-ludo-${LUDO_CORNERS[player.corner]})`,
              } as CSSProperties
            }
          >
            <span className={LUDO_DUEL.shock} />
            <LudoFxDie value={roll.dice} className={LUDO_DUEL.die} />
            {isWinner && <CrownIcon className={LUDO_DUEL.crown} aria-hidden="true" />}
            <span className={LUDO_DUEL.name}>{names[roll.accountId]}</span>
          </div>
        )
      })}
      {(isDone || duel.isStorm) && (
        <span className={LUDO_DUEL.verdict}>
          {duel.isStorm
            ? LUDO_CHAOS_UI.stormTitle
            : duel.isDraw
              ? LUDO_CHAOS_UI.duelDraw
              : fillPlayMessage(LUDO_CHAOS_UI.duelWin, { name: names[duel.winnerId ?? ''] ?? '' })}
        </span>
      )}
    </div>
  )
}
