'use client'

import { useEffect, useRef, useState } from 'react'

import { playNaval } from '@/composites/play/naval/sound'
import type { OceanZone } from '@/composites/play/naval/ocean/paint/zone'
import type { OceanCell } from '@/composites/play/naval/ocean/useOceanGestures'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { canWield, turnsOf, weaponOf, zoneOf } from '@/core/lib/play/naval/weapons'
import { NAVAL_WEAPONS } from '@/declarations/play/naval/weapons'
import { NavalWeapons } from '@/utils/constants/play'
import type { NavalWeaponName } from '@/utils/constants/play'

// Longest wait for the board pushed after a strike, in milliseconds
const PUSH_WAIT_MS = 3000

/**
 * Aim inputs
 * @typedef {Object} NavalAimInput
 */

interface NavalAimInput {
  sessionId: string
  rev: number
  size: number
  // Target account, none when nothing can be fired at
  target: string | null
  canFire: boolean
  arms: { ammo: number; offer: string[] }
  // Changes when the aim must clear
  resetKey: string
}

/**
 * Pointer that hovers: a click fires at once
 * @return {boolean} - Mouse-like
 */

const isHoverPointer = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

/**
 * Weapon, orientation and aim of the viewer, with the keys and the fire
 * @param {NavalAimInput} input - Table state
 * @return {Object} - Aim and its handlers
 */

export const useNavalAim = ({
  sessionId,
  rev,
  size,
  target,
  canFire,
  arms,
  resetKey,
}: NavalAimInput) => {
  const { act, isSaving } = usePlayAct(sessionId)
  const [picked, setPicked] = useState<NavalWeaponName>(NavalWeapons.Cannon)
  const [orientation, setOrientation] = useState(0)
  const [held, setHeld] = useState<(OceanCell & { key: string }) | null>(null)
  const [hover, setHover] = useState<OceanCell | null>(null)
  const [sentRev, setSentRev] = useState<number | null>(null)
  const weapon = canWield(picked, arms) ? picked : NavalWeapons.Cannon
  const aim = held?.key === resetKey ? held : null
  const isSending = isSaving || sentRev === rev
  const isOpen = canFire && !isSending

  const pick = (name: NavalWeaponName) => {
    if (!canWield(name, arms)) return
    playNaval('tick', 0.6)
    setOrientation((current) => (name === weapon ? (current + 1) % turnsOf(weaponOf(name)) : 0))
    setPicked(name)
  }

  const fire = async (cell: OceanCell | null = aim) => {
    if (!cell || !target || !isOpen) return
    setSentRev(rev)
    const done = await act({ type: 'fire', target, x: cell.x, y: cell.y, weapon, orientation })
    if (done) window.setTimeout(() => setSentRev(null), PUSH_WAIT_MS)
    else setSentRev(null)
    setHeld(null)
    setPicked(NavalWeapons.Cannon)
  }

  // Number keys pick, R turns
  const keys = useRef({ pick, weapon, isOpen })
  useEffect(() => {
    keys.current = { pick, weapon, isOpen }
  })
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const { pick: choose, weapon: current, isOpen: open } = keys.current
      if (!open || event.target instanceof HTMLInputElement) return
      const slot = NAVAL_WEAPONS[Number(event.key) - 1]
      if (slot) choose(slot.name)
      if (event.key.toLowerCase() === 'r')
        setOrientation((value) => (value + 1) % turnsOf(weaponOf(current)))
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const focus = aim ?? hover
  const zone: OceanZone | null =
    isOpen && focus
      ? { cells: zoneOf(weaponOf(weapon), focus, orientation, size), tone: 'aim' }
      : null

  return {
    weapon,
    orientation,
    aim,
    hover,
    zone,
    isOpen,
    isSending,
    pick,
    turn: (next: number) => setOrientation(next % turnsOf(weaponOf(weapon))),
    fire: () => void fire(),
    onHover: (cell: OceanCell | null) => setHover(cell),
    onTap: (cell: OceanCell) => {
      if (!isOpen) return
      // Mouse fires on click, a finger aims then confirms on the same square
      if (isHoverPointer() || (aim?.x === cell.x && aim.y === cell.y)) return void fire(cell)
      playNaval('tick', 0.5)
      setHeld({ ...cell, key: resetKey })
    },
  }
}
