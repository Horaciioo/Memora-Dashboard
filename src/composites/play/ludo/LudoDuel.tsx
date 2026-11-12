import type { CSSProperties } from 'react'

import { LudoChaosGlyph } from '@/composites/play/ludo/LudoChaosGlyph'
import { LudoFxDie } from '@/composites/play/ludo/LudoFxDie'
import type { LudoDuelState } from '@/composites/play/ludo/chaosMotion'
import { LUDO_CORNERS } from '@/declarations/play/ludo/board'
import { LUDO_CHAOS_UI } from '@/declarations/play/ludo/copy'
import { fillPlayMessage } from '@/declarations/play/copy'
import { ICONS } from '@/declarations/ui/icons'
import { LUDO_DUEL } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface LudoDuelProps {
  duel: LudoDuelState
  players: { accountId: string; corner: number }[]
  names: Record<string, string>
  // View turn
  turns: number
}

/**
 * Duel of dice: every die slams in from its corner, the best one is crowned
 * @param {LudoDuelProps} props - Duel
 * @return {JSX.Element}
 */

export const LudoDuel = ({ duel, players, names, turns }: LudoDuelProps) => {
  const isDone = duel.winnerId !== null || duel.isDraw
  const CrownIcon = ICONS.playCrown

  return (
    <div className={LUDO_DUEL.layer} aria-live="polite">
      <span className={LUDO_DUEL.hub}>
        <LudoChaosGlyph name="duel" />
      </span>
      {duel.rolls.map((roll) => {
        const player = players.find((entry) => entry.accountId === roll.accountId)
        if (!player) return null
        const slot = (player.corner + turns) % LUDO_CORNERS.length
        const isWinner = duel.winnerId === roll.accountId

        return (
          <div
            key={roll.accountId}
            className={cn(
              LUDO_DUEL.seat,
              isDone && (isWinner ? LUDO_DUEL.win : LUDO_DUEL.lose),
              duel.isDraw && LUDO_DUEL.draw
            )}
            data-slot={slot}
            style={
              { '--pawn-tone': `var(--play-ludo-${LUDO_CORNERS[player.corner]})` } as CSSProperties
            }
          >
            <span className={LUDO_DUEL.shock} />
            <LudoFxDie value={roll.dice} className={LUDO_DUEL.die} />
            {isWinner && <CrownIcon className={LUDO_DUEL.crown} aria-hidden="true" />}
            <span className={LUDO_DUEL.name}>{names[roll.accountId]}</span>
          </div>
        )
      })}
      {isDone && (
        <span className={LUDO_DUEL.verdict}>
          {duel.isDraw
            ? LUDO_CHAOS_UI.duelDraw
            : fillPlayMessage(LUDO_CHAOS_UI.duelWin, { name: names[duel.winnerId ?? ''] ?? '' })}
        </span>
      )}
    </div>
  )
}
