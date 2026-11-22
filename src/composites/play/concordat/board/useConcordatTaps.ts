'use client'

import { useRef, useState } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { tieOfRows } from '@/core/lib/play/concordat'
import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { reachOf } from '@/core/lib/play/concordat/sim/area'
import { baseFor, batteryFor } from '@/core/lib/play/concordat/view/arsenal'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import { ConcordatBuildingKinds } from '@/utils/constants/concordat'
import type { ConcordatBombName, ConcordatLaunchWeapon } from '@/utils/constants/concordat'
import {
  ConcordatIntents,
  ConcordatShipKinds,
  ConcordatPhases,
  ConcordatTerrains,
  ConcordatTies,
} from '@/utils/constants/concordat'

export interface ConcordatStrike {
  tile: number
  silo: number
  isHeavy: boolean
  weapon?: ConcordatLaunchWeapon
  air?: 'heli' | 'fighter'
  x: number
  y: number
}

// Silo level a launch tool asks for
const siloLevelOf = (tool: { isHeavy: boolean; weapon?: ConcordatLaunchWeapon }): number => {
  if (tool.weapon === 'mirv') return CONCORDAT.weapons.mirv.siloLevel
  if (tool.weapon && tool.weapon in CONCORDAT.weapons.bombs)
    return CONCORDAT.weapons.bombs[tool.weapon as ConcordatBombName].siloLevel

  return tool.isHeavy ? CONCORDAT.weapons.heavyLevel : 0
}

// Pointer travel that moves the tooltip within one nation
const TIP_TRAVEL = 18
// Tiles within which a tap picks an own warship
const SHIP_PICK = 2
// Two taps closer than this in time and space make a double tap
const DOUBLE_MS = 380
const DOUBLE_TRAVEL = 28

export interface ConcordatHover {
  tile: number
  holder: number
  x: number
  y: number
}

export interface ConcordatTapsProps {
  client: ConcordatClientState
  act: (body: Record<string, unknown>) => Promise<boolean>
  isSeated: boolean
  percent: number
  hoverTileRef: RefObject<number>
  washNation: (holder: number) => void
  invalidate: () => void
  setMenu: Dispatch<SetStateAction<{ holder: number; tile: number; x: number; y: number } | null>>
  setStrike: Dispatch<SetStateAction<ConcordatStrike | null>>
}

/**
 * Hover and tap on the map: tooltip, wash, start picking, expansion and target menu
 * @param {ConcordatTapsProps} props - Game and setters
 * @return {Object} - Hover state and the two handlers
 */

export const useConcordatTaps = ({
  client,
  act,
  isSeated,
  percent,
  hoverTileRef,
  washNation,
  invalidate,
  setMenu,
  setStrike,
}: ConcordatTapsProps) => {
  const mark = useConcordatViewStore((state) => state.mark)
  const setTool = useConcordatViewStore((state) => state.setTool)
  const [hover, setHover] = useState<ConcordatHover | null>(null)
  const last = useRef<ConcordatHover | null>(null)
  const isMobile = useIsMobileShell()
  const lastTap = useRef<{ holder: number; at: number; x: number; y: number } | null>(null)
  const { terrain } = client.map

  const onHover = (tile: number, x: number, y: number) => {
    hoverTileRef.current = tile
    const holder = tile >= 0 ? client.owner[tile] : 0
    const isSea = tile < 0 || terrain[tile] === ConcordatTerrains.Sea
    washNation(client.phase === ConcordatPhases.Playing ? holder : 0)
    invalidate()
    const before = last.current
    const isNear = before && Math.hypot(before.x - x, before.y - y) < TIP_TRAVEL
    if (isSea) {
      last.current = null
      setHover(null)

      return
    }
    if (before?.holder === holder && isNear) return
    last.current = { tile, holder, x, y }
    setHover(last.current)
  }

  // Armed tool on a tile: a building goes down at once, a strike asks to be confirmed
  const applyTool = (tile: number, x: number, y: number) => {
    const { tool } = useConcordatViewStore.getState()
    if (!tool) return
    if (tool.kind === 'build') {
      if (client.owner[tile] !== client.me) return mark(tile, 'refused')
      void act({ type: ConcordatIntents.Build, building: tool.building, tile }).then((isDone) => {
        mark(tile, isDone ? 'build' : 'refused')
        if (isDone) setTool(null)
      })

      return
    }
    if (tool.kind === 'fleet') return
    if (tool.kind === 'sortie') {
      const base = baseFor(client, tile)
      const isMine = client.owner[tile] === client.me
      if (!base || (tool.air === 'heli' && !isMine)) return mark(tile, 'refused')

      return setStrike({ tile, silo: base.id, isHeavy: false, air: tool.air, x, y })
    }
    if (tool.weapon === 'shell' || tool.weapon === 'rocket') {
      const battery = batteryFor(client, tile)
      if (!battery || client.owner[tile] === client.me) return mark(tile, 'refused')

      return setStrike({ tile, silo: battery.id, isHeavy: false, weapon: tool.weapon, x, y })
    }
    const silo = client.systems.buildings
      .filter(
        (building) =>
          building.owner === client.me &&
          building.kind === ConcordatBuildingKinds.Silo &&
          building.readyAt <= client.tick &&
          building.level >= siloLevelOf(tool) &&
          reachOf(building.tile, tile, client.map.width) <= CONCORDAT.weapons.range
      )
      .sort(
        (first, second) =>
          reachOf(first.tile, tile, client.map.width) - reachOf(second.tile, tile, client.map.width)
      )[0]
    if (!silo || client.owner[tile] === client.me) return mark(tile, 'refused')
    setStrike({
      tile,
      silo: silo.id,
      isHeavy: tool.isHeavy,
      weapon: tool.weapon,
      x,
      y,
    })
  }

  // Own warship close to a tile
  const shipNear = (tile: number) =>
    client.ships.find(
      (ship) =>
        ship.owner === client.me &&
        ship.kind === ConcordatShipKinds.War &&
        reachOf(ship.tile, tile, client.map.width) <= SHIP_PICK
    )

  // Fleet tool: pick a warship, send the picked one, or buy a new one at the aimed sea tile
  const applyFleet = (tile: number) => {
    const { fleetShip, setFleetShip } = useConcordatViewStore.getState()
    const near = shipNear(tile)
    if (near) return setFleetShip(near.id)
    if (terrain[tile] !== ConcordatTerrains.Sea) return mark(tile, 'refused')

    const body =
      fleetShip === null
        ? { type: ConcordatIntents.BuildShip, tile }
        : { type: ConcordatIntents.MoveShip, ship: fleetShip, tile }
    void act(body).then((isDone) => {
      mark(tile, isDone ? 'build' : 'refused')
      if (isDone) {
        setFleetShip(null)
        if (fleetShip === null) setTool(null)
      }
    })
  }

  const onTap = (tile: number, x: number, y: number) => {
    setMenu(null)
    setStrike(null)
    if (tile >= 0 && isSeated && client.me && client.phase === ConcordatPhases.Playing) {
      const { tool } = useConcordatViewStore.getState()
      const near = shipNear(tile)
      if (tool?.kind === 'fleet') return applyFleet(tile)
      if (!tool && near) {
        useConcordatViewStore.getState().setFleetShip(near.id)

        return setTool({ kind: 'fleet' })
      }
    }
    if (tile < 0 || !isSeated || !client.me || terrain[tile] === ConcordatTerrains.Sea) return
    if (client.phase === ConcordatPhases.Picking) {
      void act({ type: ConcordatIntents.PlaceStart, tile })

      return
    }
    if (client.phase !== ConcordatPhases.Playing) return
    if (useConcordatViewStore.getState().tool) return applyTool(tile, x, y)
    const holder = client.owner[tile]
    if (holder === client.me) return
    if (holder === 0) {
      mark(tile, 'expand')
      void act({ type: ConcordatIntents.Engage, target: 0, percent, tile }).then((isDone) => {
        if (!isDone) mark(tile, 'refused')
      })

      return
    }
    const attack = (): void => {
      mark(tile, 'expand')
      void act({ type: ConcordatIntents.Engage, target: holder, percent, tile }).then((isDone) => {
        if (!isDone) mark(tile, 'refused')
      })
    }
    // On a phone a tap opens the choices, a double tap attacks
    if (isMobile) {
      const now = Date.now()
      const before = lastTap.current
      const isDouble =
        !!before &&
        before.holder === holder &&
        now - before.at < DOUBLE_MS &&
        Math.hypot(before.x - x, before.y - y) < DOUBLE_TRAVEL
      lastTap.current = isDouble ? null : { holder, at: now, x, y }
      if (isDouble) return attack()

      return setMenu({ holder, tile, x, y })
    }
    // Hostile land is hit at once, each tap sends the share again
    if (tieOfRows(client.systems.ties, client.me, holder) === ConcordatTies.Hostile) return attack()
    setMenu({ holder, tile, x, y })
  }

  // Right click opens the gestures of a nation
  const onMenu = (tile: number, x: number, y: number) => {
    const holder = tile < 0 ? 0 : client.owner[tile]
    if (!isSeated || !holder || holder === client.me) return
    if (client.phase !== ConcordatPhases.Playing) return
    setStrike(null)
    setMenu({ holder, tile, x, y })
  }

  return { hover, onHover, onTap, onMenu }
}
