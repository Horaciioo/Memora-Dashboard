'use client'

import { useEffect } from 'react'

import { ConcordatGlyph } from '@/composites/play/concordat/hud/ConcordatGlyph'
import { ConcordatGold } from '@/composites/play/concordat/hud/ConcordatGold'
import {
  airOpenAt,
  builtCountOf,
  buildCostOf,
  clockText,
  compactFigure,
  mirvPrice,
  stockOf,
  weaponsOpenAt,
} from '@/core/lib/play/concordat'
import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import type { ConcordatTool } from '@/core/store/play/concordatView'
import {
  CONCORDAT_ARM_HINTS,
  CONCORDAT_BUILDING_TITLES,
  CONCORDAT_HUD_COPY,
} from '@/declarations/play/concordat/hudCopy'
import {
  CONCORDAT_BOMBS,
  CONCORDAT_WEAPONS,
  ConcordatBuildingKinds,
} from '@/utils/constants/concordat'
import type { ConcordatBombName, ConcordatWeaponName } from '@/utils/constants/concordat'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { CONCORDAT_BUILDING_ORDER } from '@/utils/constants/concordat'

const { weapons, air } = CONCORDAT

// Extra wait of a multi-warhead missile after the other weapons open
const mirvDelayTicks =
  ((weapons.mirv.unlockMinutes - weapons.unlockMinutes) * 60 * 1000) / CONCORDAT.tickMs

interface Slot {
  key: string
  glyph: Parameters<typeof ConcordatGlyph>[0]['kind']
  title: string
  note: string
  count?: number
  isOff: boolean
  tool: ConcordatTool
}

const isSame = (first: ConcordatTool | null, second: ConcordatTool): boolean =>
  JSON.stringify(first) === JSON.stringify(second)

// Gold a tool costs, zero for a building whose price is on the slot
const costOf = (tool: ConcordatTool): number => {
  if (tool.kind === 'sortie') return tool.air === 'heli' ? air.heli.cost : air.fighter.cost
  if (tool.kind === 'fleet') return CONCORDAT.navy.warCost
  if (tool.kind !== 'launch') return 0
  if (tool.weapon === 'shell') return air.battery.shellCost
  if (tool.weapon === 'rocket') return air.battery.rocketCost

  if (tool.weapon && tool.weapon in weapons.bombs)
    return weapons.bombs[tool.weapon as ConcordatBombName].cost

  return tool.isHeavy ? weapons.heavyCost : weapons.missileCost
}

// A working silo of this level or higher
const hasSiloOf = (client: ConcordatClientState, level: number): boolean =>
  client.systems.buildings.some(
    (building) =>
      building.owner === client.me &&
      building.kind === ConcordatBuildingKinds.Silo &&
      building.readyAt <= client.tick &&
      building.level >= level
  )

/**
 * Weapons side by side as pictograms: every building then both missiles, one click arms it on the map
 * @param {{ client: ConcordatClientState }} props - Game
 * @return {JSX.Element}
 */

export const ConcordatArsenal = ({ client }: { client: ConcordatClientState }) => {
  const tool = useConcordatViewStore((state) => state.tool)
  const setTool = useConcordatViewStore((state) => state.setTool)
  const gold = client.players[client.me - 1]?.gold ?? 0
  const stock = stockOf(client)
  const waitTicks = weaponsOpenAt(client) - client.tick
  const airWait = airOpenAt(client) - client.tick
  const lock = fillPlayMessage(CONCORDAT_HUD_COPY.weaponsLocked, {
    time: clockText(waitTicks / CONCORDAT_TICKS_PER_SECOND),
  })

  const allSlots: Slot[] = [
    ...CONCORDAT_BUILDING_ORDER.map((kind): Slot => {
      const cost = buildCostOf(client, kind)

      return {
        key: kind,
        glyph: kind,
        title: CONCORDAT_BUILDING_TITLES[kind],
        note: compactFigure(cost),
        count: builtCountOf(client, kind),
        isOff: gold < cost,
        tool: { kind: 'build', building: kind },
      }
    }),
    {
      key: 'missile',
      glyph: 'missile',
      title: CONCORDAT_HUD_COPY.missile,
      note: waitTicks > 0 ? '·' : String(stock.missiles),
      isOff: waitTicks > 0 || stock.missiles < 1 || gold < weapons.missileCost,
      tool: { kind: 'launch', isHeavy: false },
    },
    {
      key: 'heavy',
      glyph: 'heavy',
      title: CONCORDAT_HUD_COPY.heavy,
      note: waitTicks > 0 ? '·' : compactFigure(weapons.heavyCost),
      isOff: waitTicks > 0 || stock.heavy >= weapons.heavyMax || gold < weapons.heavyCost,
      tool: { kind: 'launch', isHeavy: true },
    },
    {
      key: 'mirv',
      glyph: 'mirv',
      title: CONCORDAT_HUD_COPY.mirv,
      note: waitTicks > 0 ? '·' : compactFigure(mirvPrice(client.systems.mirvs)),
      isOff:
        waitTicks > 0 ||
        client.tick < weaponsOpenAt(client) + mirvDelayTicks ||
        gold < mirvPrice(client.systems.mirvs),
      tool: { kind: 'launch', isHeavy: true, weapon: 'mirv' },
    },
    ...CONCORDAT_BOMBS.map((bomb): Slot => {
      const { cost, siloLevel } = weapons.bombs[bomb]

      return {
        key: bomb,
        glyph: bomb,
        title: CONCORDAT_HUD_COPY[bomb],
        note: waitTicks > 0 ? '·' : compactFigure(cost),
        isOff: waitTicks > 0 || gold < cost || !hasSiloOf(client, siloLevel),
        tool: { kind: 'launch', isHeavy: false, weapon: bomb },
      }
    }),
    ...(['shell', 'rocket'] as const).map((weapon): Slot => ({
      key: weapon,
      glyph: weapon,
      title: CONCORDAT_HUD_COPY[weapon],
      note: airWait > 0 ? '·' : compactFigure(costOf({ kind: 'launch', isHeavy: false, weapon })),
      isOff: airWait > 0 || gold < costOf({ kind: 'launch', isHeavy: false, weapon }),
      tool: { kind: 'launch', isHeavy: false, weapon },
    })),
    {
      key: 'warship',
      glyph: 'warship',
      title: CONCORDAT_HUD_COPY.warship,
      note: compactFigure(CONCORDAT.navy.warCost),
      isOff: gold < CONCORDAT.navy.warCost,
      tool: { kind: 'fleet' },
    },
    ...(['heli', 'fighter'] as const).map((kind): Slot => ({
      key: kind,
      glyph: kind,
      title: CONCORDAT_HUD_COPY[kind],
      note: airWait > 0 ? '·' : compactFigure(costOf({ kind: 'sortie', air: kind })),
      isOff: airWait > 0 || gold < costOf({ kind: 'sortie', air: kind }),
      tool: { kind: 'sortie', air: kind },
    })),
  ]

  // Buildings stay, a weapon the host banned goes
  const slots = allSlots.filter(
    (slot) =>
      !CONCORDAT_WEAPONS.some((weapon) => weapon === slot.key) ||
      client.weapons.includes(slot.key as ConcordatWeaponName)
  )

  // Digit keys arm a slot, the same key or Escape puts it back
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      // The physical key, so an AZERTY row works without Shift or Caps Lock
      const digit = /^(?:Digit|Numpad)([0-9])$/.exec(event.code)?.[1]
      if (event.metaKey || event.ctrlKey || event.altKey || digit === undefined) return
      if (target?.closest('input:not([type="range"]), textarea, [contenteditable="true"]')) return
      const slot = slots[(Number(digit) || 10) - 1]
      if (!slot) return
      const isArmed = isSame(tool, slot.tool)
      if (slot.isOff && !isArmed) return
      setTool(isArmed ? null : slot.tool)
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className={CONCORDAT_HUD.arms} role="toolbar" aria-label={CONCORDAT_HUD_COPY.arsenal}>
      {slots.map((slot, index) => {
        const isArmed = isSame(tool, slot.tool)
        const isGun =
          slot.tool.kind === 'sortie' || (slot.tool.kind === 'launch' && slot.tool.weapon)
        const isLocked = slot.tool.kind !== 'build' && (isGun ? airWait : waitTicks) > 0
        const cost =
          slot.tool.kind === 'build' ? buildCostOf(client, slot.tool.building) : costOf(slot.tool)
        const lockText = isGun
          ? fillPlayMessage(CONCORDAT_HUD_COPY.weaponsLocked, {
              time: clockText(airWait / CONCORDAT_TICKS_PER_SECOND),
            })
          : lock
        // Spoken label, the tip draws the cost as a glyph
        const title = isLocked
          ? `${slot.title}, ${lockText}`
          : `${slot.title}, ${fillPlayMessage(CONCORDAT_HUD_COPY.goldCost, { gold: compactFigure(cost) })}`

        return (
          <div key={slot.key} className="group/arm relative shrink-0">
            <button
              type="button"
              className={isArmed ? CONCORDAT_HUD.armOn : CONCORDAT_HUD.arm}
              disabled={slot.isOff && !isArmed}
              aria-pressed={isArmed}
              aria-label={title}
              onClick={() => setTool(isArmed ? null : slot.tool)}
            >
              <span className={CONCORDAT_HUD.armKey}>{index + 1}</span>
              {slot.count ? <span className={CONCORDAT_HUD.armCount}>{slot.count}</span> : null}
              <ConcordatGlyph kind={slot.glyph} />
              <span className={CONCORDAT_HUD.armNote}>{slot.note}</span>
            </button>
            <div role="tooltip" className={CONCORDAT_HUD.armTip}>
              <span className={CONCORDAT_HUD.armTipHead}>
                <span className={CONCORDAT_HUD.armTipTitle}>{slot.title}</span>
                {isLocked ? (
                  <span>{lockText}</span>
                ) : (
                  <ConcordatGold amount={cost} className={CONCORDAT_HUD.armTipCost} />
                )}
              </span>
              <span>{CONCORDAT_ARM_HINTS[slot.key]}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
