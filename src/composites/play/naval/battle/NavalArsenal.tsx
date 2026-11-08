'use client'

import { useRef } from 'react'
import type { PointerEvent } from 'react'

import { canWield, turnsOf, zoneOf } from '@/core/lib/play/naval/weapons'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY, NAVAL_WEAPON_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { NAVAL_VIEW } from '@/declarations/play/naval/view'
import { NAVAL_WEAPONS } from '@/declarations/play/naval/weapons'
import type { NavalWeapon } from '@/declarations/play/naval/weapons'
import { NAVAL_ARSENAL } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'
import { NavalShapes } from '@/utils/constants/play'
import type { NavalWeaponName } from '@/utils/constants/play'

// Squares of the footprint drawn in a key
const GLYPH_SIZE = 5

/**
 * Footprint of a weapon on a small grid
 * @param {Object} props - Glyph
 * @param {NavalWeapon} props.weapon - Weapon
 * @param {number} props.orientation - Orientation
 * @return {JSX.Element}
 */

const WeaponGlyph = ({ weapon, orientation }: { weapon: NavalWeapon; orientation: number }) => {
  const shown = {
    ...weapon,
    reach: Math.min(weapon.reach, weapon.shape === NavalShapes.Line ? GLYPH_SIZE : 2),
  }
  const middle = Math.floor(GLYPH_SIZE / 2)
  const cells = zoneOf(shown, { x: middle, y: middle }, orientation, GLYPH_SIZE)

  return (
    <svg
      viewBox={`0 0 ${GLYPH_SIZE} ${GLYPH_SIZE}`}
      className={NAVAL_ARSENAL.glyph}
      aria-hidden="true"
    >
      {cells.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x + 0.12} y={y + 0.12} width="0.76" height="0.76" rx="0.2" />
      ))}
    </svg>
  )
}

/**
 * Direction of a swipe on the weapon held
 * @param {{ x: number; y: number }} delta - Finger travel
 * @param {number} turns - Orientations of the weapon
 * @return {number | null} - Orientation, none for a tap
 */

const swipeOf = (delta: { x: number; y: number }, turns: number): number | null => {
  if (Math.hypot(delta.x, delta.y) < NAVAL_VIEW.swipePx) return null
  const isAcross = Math.abs(delta.x) >= Math.abs(delta.y)
  if (turns === 2) return isAcross ? 0 : 1
  if (isAcross) return delta.x > 0 ? 0 : 2

  return delta.y > 0 ? 1 : 3
}

export interface NavalArsenalProps {
  weapon: NavalWeaponName
  orientation: number
  arms: { ammo: number; offer: string[] }
  isMyTurn: boolean
  canFire: boolean
  waitCall: string
  onPick: (name: NavalWeaponName) => void
  onTurn: (orientation: number) => void
  onFire: () => void
}

/**
 * Weapon row, ammo line and the one action key, shown only on the viewer's turn
 * @param {NavalArsenalProps} props - Arsenal
 * @return {JSX.Element}
 */

export const NavalArsenal = ({
  weapon,
  orientation,
  arms,
  isMyTurn,
  canFire,
  waitCall,
  onPick,
  onTurn,
  onFire,
}: NavalArsenalProps) => {
  const start = useRef<{ x: number; y: number } | null>(null)
  const max = NAVAL_SETTINGS.ammo.max

  const onUp = (event: PointerEvent<HTMLButtonElement>, entry: NavalWeapon) => {
    const from = start.current
    start.current = null
    const swipe = from
      ? swipeOf({ x: event.clientX - from.x, y: event.clientY - from.y }, turnsOf(entry))
      : null
    if (swipe !== null && entry.name === weapon) return onTurn(swipe)
    onPick(entry.name)
  }

  return (
    <div className={cn(NAVAL_ARSENAL.root, !isMyTurn && NAVAL_ARSENAL.idle)}>
      <div className={NAVAL_ARSENAL.row} role="radiogroup" aria-label={NAVAL_BOARD_COPY.ammo}>
        {NAVAL_WEAPONS.map((entry, index) => {
          const isOn = entry.name === weapon
          const isUsable = isMyTurn && canWield(entry.name, arms)

          return (
            <button
              key={entry.name}
              type="button"
              role="radio"
              aria-checked={isOn}
              aria-keyshortcuts={String(index + 1)}
              aria-label={`${NAVAL_WEAPON_COPY[entry.name].label}, ${NAVAL_WEAPON_COPY[entry.name].note}`}
              title={NAVAL_WEAPON_COPY[entry.name].label}
              disabled={!isUsable}
              className={cn(NAVAL_ARSENAL.key, isOn && NAVAL_ARSENAL.keyOn)}
              onPointerDown={(event) => (start.current = { x: event.clientX, y: event.clientY })}
              onPointerUp={(event) => onUp(event, entry)}
              onKeyDown={(event) => event.key === 'Enter' && onPick(entry.name)}
            >
              <WeaponGlyph weapon={entry} orientation={isOn ? orientation : 0} />
              {entry.cost > 0 && <span className={NAVAL_ARSENAL.cost}>{entry.cost}</span>}
            </button>
          )
        })}
      </div>
      <div
        className={NAVAL_ARSENAL.ammo}
        aria-label={`${NAVAL_BOARD_COPY.ammo} ${arms.ammo}/${max}`}
      >
        {Array.from({ length: max }, (_, index) => (
          <i
            key={index}
            className={cn(NAVAL_ARSENAL.pip, index < arms.ammo && NAVAL_ARSENAL.pipOn)}
          />
        ))}
      </div>
      {isMyTurn ? (
        <button type="button" className={NAVAL_ARSENAL.fire} disabled={!canFire} onClick={onFire}>
          {canFire
            ? fillPlayMessage(NAVAL_BOARD_COPY.fireKey, { weapon: NAVAL_WEAPON_COPY[weapon].label })
            : NAVAL_BOARD_COPY.aimFirst}
        </button>
      ) : (
        <p className={NAVAL_ARSENAL.wait} aria-live="polite">
          {waitCall}
        </p>
      )}
    </div>
  )
}
