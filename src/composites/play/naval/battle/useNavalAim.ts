'use client'

import { useEffect, useRef, useState } from 'react'

import { playNaval } from '@/composites/play/naval/sound'
import type { OceanZone } from '@/composites/play/naval/ocean/paint/zone'
import type { OceanCell } from '@/composites/play/naval/ocean/useOceanGestures'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { turnsOf, weaponOf, zoneOf } from '@/core/lib/play/naval/weapons'
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
  // Weapon drawn for this turn
  weapon: NavalWeaponName
  // Theatre weapon reach multiplier
  reachScale: number
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
  weapon,
  reachScale,
  resetKey,
}: NavalAimInput) => {
  const { act, isSaving } = usePlayAct(sessionId)
  const [turned, setTurned] = useState<{ key: string; value: number } | null>(null)
  const [held, setHeld] = useState<(OceanCell & { key: string }) | null>(null)
  const [hover, setHover] = useState<OceanCell | null>(null)
  const [sentRev, setSentRev] = useState<number | null>(null)
  const turnKey = `${resetKey}:${weapon}`
  const orientation = turned?.key === turnKey ? turned.value : 0
  const aim = held?.key === resetKey ? held : null
  const isSending = isSaving || sentRev === rev
  const isOpen = canFire && !isSending
  const turns = turnsOf(weaponOf(weapon))
  const turn = (next: number) => setTurned({ key: turnKey, value: next % turns })

  const fire = async (cell: OceanCell | null = aim) => {
    if (!cell || !target || !isOpen) return
    setSentRev(rev)
    const done = await act({ type: 'fire', target, x: cell.x, y: cell.y, weapon, orientation })
    if (done) window.setTimeout(() => setSentRev(null), PUSH_WAIT_MS)
    else setSentRev(null)
    setHeld(null)
  }

  // R turns the weapon
  const keys = useRef({ orientation, turn, isOpen })
  useEffect(() => {
    keys.current = { orientation, turn, isOpen }
  })
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const current = keys.current
      if (!current.isOpen || event.target instanceof HTMLInputElement) return
      if (event.key.toLowerCase() === 'r') current.turn(current.orientation + 1)
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const focus = aim ?? hover
  const zone: OceanZone | null =
    isOpen && focus
      ? { cells: zoneOf(weaponOf(weapon, reachScale), focus, orientation, size), tone: 'aim' }
      : null

  return {
    weapon,
    orientation,
    turnKey,
    aim,
    hover,
    zone,
    isOpen,
    isSending,
    turn,
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
