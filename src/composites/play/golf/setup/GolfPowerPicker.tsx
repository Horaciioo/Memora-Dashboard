'use client'

import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { ICONS } from '@/declarations/ui/icons'
import { GOLF_BOARD, GOLF_SETUP } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { GolfPowerName } from '@/utils/constants/play'

/**
 * Powers the orbs may give, each one on or off
 * @param {Object} props - Picker
 * @param {GolfPowerName[]} props.value - Powers on
 * @param {(powers: GolfPowerName[]) => void} props.onChange - New pick
 * @return {JSX.Element}
 */

export const GolfPowerPicker = ({
  value,
  onChange,
}: {
  value: GolfPowerName[]
  onChange: (powers: GolfPowerName[]) => void
}) => (
  <div className={GOLF_SETUP.powers}>
    {GOLF_POWERS.keys.map((power) => {
      const meta = GOLF_POWERS.get(power)
      const Icon = ICONS[meta.icon]
      const isOn = value.includes(power)
      // Registry order kept
      const flip = () =>
        onChange(GOLF_POWERS.keys.filter((key) => (key === power ? !isOn : value.includes(key))))

      return (
        <button
          key={power}
          type="button"
          aria-pressed={isOn}
          className={cn(GOLF_SETUP.power, isOn ? GOLF_SETUP.powerOn : GOLF_SETUP.powerOff)}
          onClick={flip}
        >
          <span
            className={cn(GOLF_SETUP.powerIcon, meta.isBonus ? GOLF_BOARD.bonus : GOLF_BOARD.malus)}
          >
            <Icon className={GOLF_SETUP.powerGlyph} aria-hidden="true" />
          </span>
          <span className={GOLF_SETUP.powerText}>
            <span className={GOLF_SETUP.powerName}>{meta.label}</span>
            <span className={GOLF_SETUP.powerEffect}>{meta.effect}</span>
          </span>
        </button>
      )
    })}
  </div>
)
