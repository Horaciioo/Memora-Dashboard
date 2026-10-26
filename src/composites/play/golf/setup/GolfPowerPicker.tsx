'use client'

import type { CSSProperties } from 'react'

import { GolfPowerOrb } from '@/composites/play/golf/GolfPowerOrb'
import { powerPaint } from '@/composites/play/golf/types'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_SETUP } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { GolfPowerName } from '@/utils/constants/play'

// Powers grouped by kind, bonus first
const KINDS = [
  { isBonus: true, title: GOLF_BOARD_COPY.bonus },
  { isBonus: false, title: GOLF_BOARD_COPY.malus },
]

/**
 * Powers the orbs may give, by kind, each one on or off
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
}) => {
  return (
    <div className={GOLF_SETUP.powers}>
      {KINDS.map(({ isBonus, title }) => (
        <section key={title} className={GOLF_SETUP.powerGroup}>
          <h3 className={GOLF_SETUP.powerGroupTitle}>{title}</h3>
          <div className={GOLF_SETUP.powerList}>
            {GOLF_POWERS.keys
              .filter((power) => GOLF_POWERS.get(power).isBonus === isBonus)
              .map((power) => {
                const meta = GOLF_POWERS.get(power)
                const isOn = value.includes(power)
                // Registry order kept
                const flip = () =>
                  onChange(
                    GOLF_POWERS.keys.filter((key) => (key === power ? !isOn : value.includes(key)))
                  )

                return (
                  <button
                    key={power}
                    type="button"
                    aria-pressed={isOn}
                    className={cn(GOLF_SETUP.power, !isOn && GOLF_SETUP.powerOff)}
                    style={{ '--power': powerPaint(power) } as CSSProperties}
                    onClick={flip}
                  >
                    <GolfPowerOrb power={power} className={GOLF_SETUP.powerOrb} />
                    <span className={GOLF_SETUP.powerText}>
                      <span
                        className={cn(
                          GOLF_SETUP.powerKind,
                          isBonus ? GOLF_SETUP.powerKindBonus : GOLF_SETUP.powerKindMalus
                        )}
                      >
                        {title}
                      </span>
                      <span className={GOLF_SETUP.powerName}>{meta.label}</span>
                      <span className={GOLF_SETUP.powerEffect}>{meta.effect}</span>
                    </span>
                  </button>
                )
              })}
          </div>
        </section>
      ))}
    </div>
  )
}
