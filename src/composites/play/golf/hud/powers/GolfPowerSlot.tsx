'use client'

import { GolfEmptyOrb, GolfPowerOrb } from '@/composites/play/golf/GolfPowerOrb'
import { useGolfHandStore } from '@/core/store/play/golfHand'
import { canCastPower, handSize } from '@/core/lib/play/golf'
import type { GolfGameSettings } from '@/core/lib/play/golf/settings'
import type { GolfPlayerState } from '@/core/lib/play/golf'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_POWER_KINDS, GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { GolfPowerName } from '@/utils/constants/play'

export interface GolfPowerSlotProps {
  me: GolfPlayerState
  // Format, sets the hand size
  settings: Pick<GolfGameSettings, 'mode'>
  // Hole in play
  canUse: boolean
  // No hole after, a finished player keeps the bonus
  isLastHole: boolean
  isSaving: boolean
  onUse: (power: GolfPowerName, slot: number) => void
}

/**
 * One case of the hand, empty or holding a power
 * @param {Object} props - Power, slot and gesture
 * @return {JSX.Element}
 */

const GolfHandCase = ({
  power,
  slot,
  canUse,
  isDone,
  isLastHole,
  isSaving,
  onUse,
}: Omit<GolfPowerSlotProps, 'me' | 'settings'> & {
  power: GolfPowerName | null
  slot: number
  isDone: boolean
}) => {
  const meta = power ? GOLF_POWERS.get(power) : null

  if (!power || !meta) {
    return (
      <div className={cn(GOLF_BOARD.slot, GOLF_BOARD.slotEmpty)} title={GOLF_BOARD_COPY.noPower}>
        <GolfEmptyOrb className={GOLF_BOARD.slotOrb} />
      </div>
    )
  }

  return (
    <button
      type="button"
      className={GOLF_BOARD.slot}
      disabled={!canUse || !canCastPower(power, isDone, isLastHole) || isSaving}
      aria-label={`${GOLF_BOARD_COPY.use} ${meta.label}`}
      onClick={() => onUse(power, slot)}
    >
      <GolfPowerOrb power={power} hasKind className={GOLF_BOARD.slotOrb} />
      <span className={GOLF_BOARD.slotTip} role="tooltip">
        <span
          className={cn(GOLF_BOARD.slotKind, meta.isBonus ? GOLF_BOARD.bonus : GOLF_BOARD.malus)}
        >
          {GOLF_POWER_KINDS.find((kind) => kind.isBonus === meta.isBonus)?.label}
        </span>
        <span className={GOLF_BOARD.slotName}>{meta.label}</span>
        <span className={GOLF_BOARD.slotEffect}>{meta.effect}</span>
      </span>
    </button>
  )
}

/**
 * Hand of cases, effects worn
 * @param {GolfPowerSlotProps} props - Player and gesture
 * @return {JSX.Element}
 */

export const GolfPowerSlot = ({
  me,
  settings,
  canUse,
  isLastHole,
  isSaving,
  onUse,
}: GolfPowerSlotProps) => {
  const cases = Array.from({ length: handSize(settings) }, (_, slot) => me.hand[slot] ?? null)
  // Fresh nudge restarts the shake
  const fullAt = useGolfHandStore((state) => state.fullAt)
  const isFull = fullAt !== null

  return (
    <div className={GOLF_BOARD.handBox}>
      {isFull && (
        <span className={GOLF_BOARD.handFullTip} role="status">
          {GOLF_BOARD_COPY.handFull}
        </span>
      )}
      <div key={fullAt ?? 0} className={cn(GOLF_BOARD.hand, isFull && GOLF_BOARD.handFull)}>
        {cases.map((power, slot) => (
          <GolfHandCase
            key={slot}
            power={power}
            slot={slot}
            canUse={canUse}
            isDone={me.isDone}
            isLastHole={isLastHole}
            isSaving={isSaving}
            onUse={onUse}
          />
        ))}
      </div>
    </div>
  )
}
