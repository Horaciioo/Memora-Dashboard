'use client'

import { GolfEmptyOrb, GolfPowerOrb } from '@/composites/play/golf/GolfPowerOrb'
import { useServerNow } from '@/core/hooks/interaction/state/useServerNow'
import { activePowers, canPlayPower, handSize } from '@/core/lib/play/golf'
import type { GolfGameSettings } from '@/core/lib/play/golf/settings'
import type { GolfPlayerState } from '@/core/lib/play/golf'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { GolfPowerName } from '@/utils/constants/play'

export interface GolfPowerSlotProps {
  me: GolfPlayerState
  // Format, sets the hand size
  settings: Pick<GolfGameSettings, 'mode'>
  // Server ms of the board
  serverTime: number
  // Hole in play, malus only once finished
  canUse: boolean
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
  isSaving,
  onUse,
}: Omit<GolfPowerSlotProps, 'me' | 'serverTime' | 'settings'> & {
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
      disabled={!canUse || !canPlayPower(power, isDone) || isSaving}
      aria-label={`${GOLF_BOARD_COPY.use} ${meta.label}`}
      onClick={() => onUse(power, slot)}
    >
      <GolfPowerOrb power={power} hasKind className={GOLF_BOARD.slotOrb} />
      <span className={GOLF_BOARD.slotTip} role="tooltip">
        <span
          className={cn(GOLF_BOARD.slotKind, meta.isBonus ? GOLF_BOARD.bonus : GOLF_BOARD.malus)}
        >
          {meta.isBonus ? GOLF_BOARD_COPY.bonus : GOLF_BOARD_COPY.malus}
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
  serverTime,
  canUse,
  isSaving,
  onUse,
}: GolfPowerSlotProps) => {
  const serverNow = useServerNow(new Date(serverTime))
  const cases = Array.from({ length: handSize(settings) }, (_, slot) => me.hand[slot] ?? null)
  const worn = [...activePowers(me.effects, serverNow)]

  return (
    <div className={GOLF_BOARD.handBox}>
      {worn.length > 0 && (
        <div className={GOLF_BOARD.effects} aria-label={GOLF_BOARD_COPY.onYou}>
          {worn.map((entry) => (
            <span key={entry} title={GOLF_POWERS.label(entry)}>
              <GolfPowerOrb power={entry} className={GOLF_BOARD.effect} />
            </span>
          ))}
        </div>
      )}
      <div className={GOLF_BOARD.hand}>
        {cases.map((power, slot) => (
          <GolfHandCase
            key={slot}
            power={power}
            slot={slot}
            canUse={canUse}
            isDone={me.isDone}
            isSaving={isSaving}
            onUse={onUse}
          />
        ))}
      </div>
    </div>
  )
}
