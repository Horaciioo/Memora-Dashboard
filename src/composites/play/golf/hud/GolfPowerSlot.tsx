'use client'

import { Button } from '@/components/elements/actions/Button'
import { useServerNow } from '@/core/hooks/interaction/state/useServerNow'
import { activePowers } from '@/core/lib/play/golf'
import type { GolfPlayerState } from '@/core/lib/play/golf'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { ICONS } from '@/declarations/ui/icons'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { GolfPowerName } from '@/utils/constants/play'

export interface GolfPowerSlotProps {
  me: GolfPlayerState
  // Server ms of the board
  serverTime: number
  canUse: boolean
  isSaving: boolean
  onUse: (power: GolfPowerName) => void
}

/**
 * Power in hand, green bonus or red malus, with the effects worn
 * @param {GolfPowerSlotProps} props - Player and gesture
 * @return {JSX.Element}
 */

export const GolfPowerSlot = ({ me, serverTime, canUse, isSaving, onUse }: GolfPowerSlotProps) => {
  const serverNow = useServerNow(new Date(serverTime))
  const power = me.power && GOLF_POWERS.has(me.power) ? me.power : null
  const meta = power ? GOLF_POWERS.get(power) : null
  const Icon = ICONS[meta?.icon ?? 'golfStroke']
  const worn = [...activePowers(me.effects, serverNow)]

  return (
    <div className={GOLF_BOARD.holeBlock}>
      {worn.length > 0 && (
        <div className={GOLF_BOARD.effects} aria-label={GOLF_BOARD_COPY.onYou}>
          {worn.map((entry) => {
            const WornIcon = ICONS[GOLF_POWERS.get(entry).icon]

            return (
              <span
                key={entry}
                title={GOLF_POWERS.label(entry)}
                className={cn(
                  GOLF_BOARD.effect,
                  GOLF_POWERS.get(entry).isBonus ? GOLF_BOARD.bonus : GOLF_BOARD.malus
                )}
              >
                <WornIcon className={GOLF_BOARD.effectIcon} aria-hidden="true" />
              </span>
            )
          })}
        </div>
      )}
      <div className={cn(GOLF_BOARD.slot, !meta && GOLF_BOARD.slotEmpty)}>
        <span
          className={cn(
            GOLF_BOARD.slotIcon,
            meta ? (meta.isBonus ? GOLF_BOARD.bonus : GOLF_BOARD.malus) : GOLF_BOARD.slotIconEmpty
          )}
        >
          <Icon className={GOLF_BOARD.slotGlyph} aria-hidden="true" />
        </span>
        <span className={GOLF_BOARD.slotText}>
          <span className={GOLF_BOARD.caption}>
            {meta
              ? meta.isBonus
                ? GOLF_BOARD_COPY.bonus
                : GOLF_BOARD_COPY.malus
              : GOLF_BOARD_COPY.power}
          </span>
          {meta ? (
            <span className={GOLF_BOARD.slotName}>{meta.label}</span>
          ) : (
            <span className={GOLF_BOARD.slotHint}>{GOLF_BOARD_COPY.noPower}</span>
          )}
        </span>
        {power && (
          <Button
            variant="arcadeSmall"
            className={GOLF_BOARD.slotUse}
            disabled={!canUse}
            isLoading={isSaving}
            onClick={() => onUse(power)}
          >
            {GOLF_BOARD_COPY.use}
          </Button>
        )}
      </div>
    </div>
  )
}
