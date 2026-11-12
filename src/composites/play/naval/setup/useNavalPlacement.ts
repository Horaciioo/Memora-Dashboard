'use client'

import { useState } from 'react'

import { playNaval } from '@/composites/play/naval/sound'
import type { OceanZone } from '@/composites/play/naval/ocean/paint/zone'
import type { OceanCell } from '@/composites/play/naval/ocean/useOceanGestures'
import { canPlace, cellsOf, randomFleet } from '@/core/lib/play/naval/fleet'
import type { NavalLayoutSea, NavalShip } from '@/core/lib/play/naval/fleet'
import { shipAt } from '@/core/lib/play/naval/sea'

/**
 * Ship in hand while dragging
 * @typedef {Object} NavalDrag
 */

interface NavalDrag {
  id: number
  length: number
  isHorizontal: boolean
  // Square under the finger, and the ship square it holds
  cell: OceanCell | null
  grip: number
  // Where it was, to put it back or turn it on a tap
  from: NavalShip | null
  start: OceanCell | null
}

/**
 * Ship laid from a drag, pushed back inside the sea
 * @param {NavalDrag} drag - Drag
 * @param {number} size - Sea size
 * @return {NavalShip | null} - Ship, none off the sea
 */

const shipOf = (drag: NavalDrag, size: number): NavalShip | null => {
  if (!drag.cell) return null
  const x = drag.cell.x - (drag.isHorizontal ? drag.grip : 0)
  const y = drag.cell.y - (drag.isHorizontal ? 0 : drag.grip)

  return {
    id: drag.id,
    length: drag.length,
    isHorizontal: drag.isHorizontal,
    x: Math.max(0, Math.min(x, size - (drag.isHorizontal ? drag.length : 1))),
    y: Math.max(0, Math.min(y, size - (drag.isHorizontal ? 1 : drag.length))),
  }
}

/**
 * Placement by drag: from the dock or from the sea, a tap turns, R turns the ship in hand
 * @param {NavalLayoutSea} sea - Sea
 * @param {NavalShip[]} start - Fleet to start from
 * @return {Object} - Placement and handlers
 */

export const useNavalPlacement = (sea: NavalLayoutSea, start: NavalShip[]) => {
  const [ships, setShips] = useState<NavalShip[]>(() => (start.length ? start : randomFleet(sea)))
  const [drag, setDrag] = useState<NavalDrag | null>(null)
  const others = (id: number) => ships.filter((ship) => ship.id !== id)
  const held = drag ? shipOf(drag, sea.size) : null
  const isHeldValid = Boolean(held && canPlace(held, others(held.id), sea))

  const place = (ship: NavalShip) => {
    setShips([...others(ship.id), ship])
    playNaval('place', 0.8)
  }

  const turnInPlace = (ship: NavalShip) => {
    const turned = { ...ship, isHorizontal: !ship.isHorizontal }
    if (canPlace(turned, others(ship.id), sea)) place(turned)
  }

  const drop = (cell: OceanCell | null) => {
    if (!drag) return
    setDrag(null)
    const isTap = drag.from && cell && drag.start?.x === cell.x && drag.start.y === cell.y
    if (isTap && drag.from) return turnInPlace(drag.from)
    const ship = shipOf({ ...drag, cell }, sea.size)
    if (ship && canPlace(ship, others(ship.id), sea)) place(ship)
  }

  const zone: OceanZone | null = held
    ? { cells: cellsOf(held), tone: isHeldValid ? 'good' : 'bad' }
    : null

  return {
    ships: ships.filter((ship) => ship.id !== drag?.id || !drag.cell),
    heldId: drag?.id ?? null,
    zone,
    isComplete: ships.length === sea.fleet.length,
    grabFromDock: (id: number) =>
      setDrag({
        id,
        length: sea.fleet[id],
        isHorizontal: true,
        cell: null,
        grip: 0,
        from: ships.find((s) => s.id === id) ?? null,
        start: null,
      }),
    onGrab: (cell: OceanCell): boolean => {
      const found = shipAt(ships, cell.x, cell.y)
      if (!found) return false
      const grip = found.isHorizontal ? cell.x - found.x : cell.y - found.y
      setDrag({
        id: found.id,
        length: found.length,
        isHorizontal: found.isHorizontal,
        cell,
        grip,
        from: found,
        start: cell,
      })

      return true
    },
    onDrag: (cell: OceanCell | null) =>
      setDrag((current) => (current ? { ...current, cell } : null)),
    onDrop: drop,
    rotate: () =>
      setDrag((current) =>
        current ? { ...current, isHorizontal: !current.isHorizontal, grip: 0 } : null
      ),
    shuffle: () => {
      setShips(randomFleet(sea))
      playNaval('place', 0.8)
    },
    clear: () => setShips([]),
  }
}
