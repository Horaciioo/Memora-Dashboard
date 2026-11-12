'use client'

import { turnsOf, weaponOf, zoneOf } from '@/core/lib/play/naval/weapons'
import { NAVAL_BOARD_COPY, NAVAL_WEAPON_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_ARSENAL } from '@/declarations/ui/variants/games/naval'
import { cn } from '@/utils/classnames'
import { NavalShapes } from '@/utils/constants/play'
import type { NavalWeaponName } from '@/utils/constants/play'

// Squares of the footprint drawn in the card
const GLYPH_SIZE = 5

/**
 * Footprint of the weapon drawn, on a small grid
 * @param {Object} props - Glyph
 * @param {NavalWeaponName} props.name - Weapon
 * @param {number} props.orientation - Orientation
 * @return {JSX.Element}
 */

const WeaponGlyph = ({ name, orientation }: { name: NavalWeaponName; orientation: number }) => {
  const weapon = weaponOf(name)
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
        <rect key={`${x}-${y}`} x={x + 0.1} y={y + 0.1} width="0.8" height="0.8" rx="0.2" />
      ))}
    </svg>
  )
}

export interface NavalArsenalProps {
  weapon: NavalWeaponName
  // Changes at each draw, replays the reveal
  drawKey: string
  orientation: number
  isMyTurn: boolean
  canFire: boolean
  waitCall: string
  onTurn: (orientation: number) => void
  onFire: () => void
}

/**
 * The weapon drawn and the one action key, same size whoever's turn it is
 * @param {NavalArsenalProps} props - Arsenal
 * @return {JSX.Element}
 */

export const NavalArsenal = ({
  weapon,
  drawKey,
  orientation,
  isMyTurn,
  canFire,
  waitCall,
  onTurn,
  onFire,
}: NavalArsenalProps) => {
  const turns = turnsOf(weaponOf(weapon))
  const copy = NAVAL_WEAPON_COPY[weapon]

  return (
    <div className={cn(NAVAL_ARSENAL.root, !isMyTurn && NAVAL_ARSENAL.idle)}>
      <button
        key={`${weapon}:${drawKey}`}
        type="button"
        className={cn(NAVAL_ARSENAL.card, (!isMyTurn || turns < 2) && NAVAL_ARSENAL.cardFixed)}
        aria-label={turns > 1 ? NAVAL_BOARD_COPY.turnWeapon : copy.label}
        disabled={!isMyTurn || turns < 2}
        aria-keyshortcuts="R"
        onClick={() => onTurn((orientation + 1) % turns)}
      >
        <span className={NAVAL_ARSENAL.glyphBox}>
          <WeaponGlyph name={weapon} orientation={orientation} />
        </span>
        <span className={NAVAL_ARSENAL.text}>
          <span className={NAVAL_ARSENAL.name}>{copy.label}</span>
          <span className={NAVAL_ARSENAL.note}>
            {turns > 1 ? NAVAL_BOARD_COPY.turnHint : copy.note}
          </span>
        </span>
      </button>
      <div className={NAVAL_ARSENAL.divider} role="separator" />
      {isMyTurn ? (
        <button type="button" className={NAVAL_ARSENAL.fire} disabled={!canFire} onClick={onFire}>
          {NAVAL_BOARD_COPY.fire}
        </button>
      ) : (
        <p className={NAVAL_ARSENAL.wait} aria-live="polite">
          {waitCall}
        </p>
      )}
    </div>
  )
}
