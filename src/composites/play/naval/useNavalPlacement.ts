'use client'

import { useState } from 'react'

import { canPlace, cellsOf, randomFleet } from '@/core/lib/play/naval/fleet'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import type { NavalSea } from '@/core/lib/play/naval/settings'
import { shipAt } from '@/core/lib/play/naval/sea'

/**
 * Fleet being laid out
 * @typedef {Object} NavalPlacement
 */

export interface NavalPlacement {
  ships: NavalShip[]
  heldId: number | null
  isHorizontal: boolean
  ghost: { cells: Array<{ x: number; y: number }>; isValid: boolean } | null
  isComplete: boolean
  // A tap that could not place
  isRefused: boolean
  select: (id: number) => void
  tap: (x: number, y: number) => void
  hover: (x: number, y: number) => void
  rotate: () => void
  shuffle: () => void
  clear: () => void
}

/**
 * Ship ready to drop, pushed back to fit the sea
 * @param {Object} drop - Drop
 * @param {number} drop.id - Ship
 * @param {number} drop.length - Squares
 * @param {boolean} drop.isHorizontal - Direction
 * @param {number} drop.size - Sea size
 * @param {{ x: number; y: number }} at - Square tapped
 * @return {NavalShip} - Ship
 */

const dropAt = (
  {
    id,
    length,
    isHorizontal,
    size,
  }: { id: number; length: number; isHorizontal: boolean; size: number },
  at: { x: number; y: number }
): NavalShip => ({
  id,
  length,
  isHorizontal,
  x: Math.min(at.x, size - (isHorizontal ? length : 1)),
  y: Math.min(at.y, size - (isHorizontal ? 1 : length)),
})

/**
 * Ship still to place after some are down
 * @param {number} count - Ships in the fleet
 * @param {NavalShip[]} ships - Ships placed
 * @return {number | null} - Ship id
 */

const nextFree = (count: number, ships: NavalShip[]): number | null =>
  Array.from({ length: count }, (_, id) => id).find((id) => !ships.some((s) => s.id === id)) ?? null

/**
 * Placement of a fleet by taps, and by the mouse with a preview
 * @param {NavalSea} sea - Sea
 * @param {NavalShip[]} start - Fleet to start from
 * @param {() => void} onDrop - Sound of a ship set down
 * @return {NavalPlacement} - Placement
 */

export const useNavalPlacement = (
  sea: NavalSea,
  start: NavalShip[],
  onDrop: () => void
): NavalPlacement => {
  const [ships, setShips] = useState<NavalShip[]>(start)
  const [heldId, setHeldId] = useState<number | null>(() => nextFree(sea.fleet.length, start))
  const [isHorizontal, setIsHorizontal] = useState(true)
  const [preview, setPreview] = useState<{ x: number; y: number } | null>(null)
  const [isRefused, setIsRefused] = useState(false)

  const candidate = (at: { x: number; y: number }) =>
    heldId === null
      ? null
      : dropAt({ id: heldId, length: sea.fleet[heldId], isHorizontal, size: sea.size }, at)
  const others = (id: number) => ships.filter((ship) => ship.id !== id)

  const ghostShip = preview ? candidate(preview) : null
  const ghost = ghostShip
    ? { cells: cellsOf(ghostShip), isValid: canPlace(ghostShip, others(ghostShip.id), sea) }
    : null

  const tap = (x: number, y: number) => {
    // Nothing in hand: pick up the ship under the finger
    if (heldId === null) {
      const found = shipAt(ships, x, y)
      if (!found) return
      setShips(others(found.id))
      setHeldId(found.id)
      setIsHorizontal(found.isHorizontal)

      return
    }
    const ship = candidate({ x, y })
    if (!ship || !canPlace(ship, others(ship.id), sea)) {
      setIsRefused(true)
      window.setTimeout(() => setIsRefused(false), 400)

      return
    }
    const placed = [...others(ship.id), ship]
    setShips(placed)
    setHeldId(nextFree(sea.fleet.length, placed))
    onDrop()
  }

  return {
    ships,
    heldId,
    isHorizontal,
    ghost,
    isComplete: ships.length === sea.fleet.length,
    isRefused,
    select: (id) => {
      const found = ships.find((ship) => ship.id === id)
      if (found) {
        setShips(others(id))
        setIsHorizontal(found.isHorizontal)
      }
      setHeldId(id)
    },
    tap,
    hover: (x, y) => setPreview({ x, y }),
    rotate: () => setIsHorizontal((current) => !current),
    shuffle: () => {
      setShips(randomFleet(sea))
      setHeldId(null)
    },
    clear: () => {
      setShips([])
      setHeldId(0)
    },
  }
}
