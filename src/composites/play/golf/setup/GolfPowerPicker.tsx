'use client'

import type { CSSProperties } from 'react'

import { GolfPowerOrb } from '@/composites/play/golf/GolfPowerOrb'
import { powerPaint } from '@/composites/play/golf/types'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_SETUP_COPY } from '@/declarations/play/golf/copy'
import { GOLF_POWER_KINDS, GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_SETUP } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { GolfPowerName } from '@/utils/constants/play'

/**
 * Powers of one kind
 * @param {boolean} isBonus - Bonus or malus
 * @return {GolfPowerName[]}
 */

const powersOf = (isBonus: boolean) =>
  GOLF_POWERS.keys.filter((power) => GOLF_POWERS.get(power).isBonus === isBonus)

/**
 * Small text buttons over a list
 * @param {Object} props - Actions
 * @param {{ label: string, onClick: () => void }[]} props.actions - Buttons
 * @return {JSX.Element}
 */

const QuickActions = ({ actions }: { actions: { label: string; onClick: () => void }[] }) => (
  <div className={GOLF_SETUP.quick}>
    {actions.map(({ label, onClick }) => (
      <button key={label} type="button" className={GOLF_SETUP.quickButton} onClick={onClick}>
        {label}
      </button>
    ))}
  </div>
)

/**
 * Powers the orbs may give, by kind, each one on or off
 * @param {Object} props - Picker
 * @param {GolfPowerName[]} props.value - Powers on
 * @param {boolean} props.collisions - Balls meet, else collision powers are greyed
 * @param {(powers: GolfPowerName[]) => void} props.onChange - New pick
 * @return {JSX.Element}
 */

export const GolfPowerPicker = ({
  value,
  collisions,
  onChange,
}: {
  value: GolfPowerName[]
  collisions: boolean
  onChange: (powers: GolfPowerName[]) => void
}) => {
  // Registry order kept
  const pick = (isOn: (power: GolfPowerName) => boolean) => onChange(GOLF_POWERS.keys.filter(isOn))
  const setKind = (isBonus: boolean, on: boolean) =>
    pick((power) => (GOLF_POWERS.get(power).isBonus === isBonus ? on : value.includes(power)))

  return (
    <div className={GOLF_SETUP.powers}>
      <QuickActions
        actions={[
          { label: GOLF_SETUP_COPY.all, onClick: () => pick(() => true) },
          { label: GOLF_SETUP_COPY.none, onClick: () => pick(() => false) },
        ]}
      />
      {GOLF_POWER_KINDS.map(({ isBonus, label: title, hint }) => {
        const kind = title.toLowerCase()

        return (
          <section key={title} className={GOLF_SETUP.powerGroup}>
            <div className={GOLF_SETUP.powerGroupHead}>
              <h3
                className={cn(
                  GOLF_SETUP.powerGroupTitle,
                  isBonus ? GOLF_SETUP.powerKindBonus : GOLF_SETUP.powerKindMalus
                )}
                title={hint}
              >
                {title}
              </h3>
              <QuickActions
                actions={[
                  {
                    label: fillPlayMessage(GOLF_SETUP_COPY.allKind, { kind }),
                    onClick: () => setKind(isBonus, true),
                  },
                  {
                    label: fillPlayMessage(GOLF_SETUP_COPY.noneKind, { kind }),
                    onClick: () => setKind(isBonus, false),
                  },
                ]}
              />
            </div>
            <div className={GOLF_SETUP.powerList}>
              {powersOf(isBonus).map((power) => {
                const meta = GOLF_POWERS.get(power)
                const isOn = value.includes(power)
                const isMoot = !collisions && meta.needsCollisions

                return (
                  <button
                    key={power}
                    type="button"
                    aria-pressed={isOn}
                    disabled={isMoot}
                    className={cn(
                      GOLF_SETUP.power,
                      !isOn && GOLF_SETUP.powerOff,
                      isMoot && GOLF_SETUP.powerMoot
                    )}
                    style={{ '--power': powerPaint(power) } as CSSProperties}
                    onClick={() => pick((key) => (key === power ? !isOn : value.includes(key)))}
                  >
                    <GolfPowerOrb power={power} className={GOLF_SETUP.powerOrb} />
                    <span className={GOLF_SETUP.powerText}>
                      <span className={GOLF_SETUP.powerName}>{meta.label}</span>
                      <span className={GOLF_SETUP.powerEffect}>
                        {isMoot ? GOLF_SETUP_COPY.needsCollisions : meta.effect}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
