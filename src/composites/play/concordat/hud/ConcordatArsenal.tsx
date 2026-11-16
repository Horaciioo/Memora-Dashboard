'use client'

import { useEffect } from 'react'

import { ConcordatGlyph } from '@/composites/play/concordat/hud/ConcordatGlyph'
import { buildCostOf, clockText, stockOf, weaponsOpenAt } from '@/core/lib/play/concordat'
import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import type { ConcordatTool } from '@/core/store/play/concordatView'
import {
  CONCORDAT_ARM_HINTS,
  CONCORDAT_BUILDING_TITLES,
  CONCORDAT_HUD_COPY,
} from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { CONCORDAT_BUILDING_ORDER } from '@/utils/constants/concordat'

const { weapons } = CONCORDAT

interface Slot {
  key: string
  glyph: Parameters<typeof ConcordatGlyph>[0]['kind']
  title: string
  note: string
  isOff: boolean
  tool: ConcordatTool
}

const isSame = (first: ConcordatTool | null, second: ConcordatTool): boolean =>
  first?.kind === second.kind &&
  (first.kind === 'build'
    ? second.kind === 'build' && first.building === second.building
    : second.kind === 'launch' && first.isHeavy === second.isHeavy)

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
  const lock = fillPlayMessage(CONCORDAT_HUD_COPY.weaponsLocked, {
    time: clockText(waitTicks / CONCORDAT_TICKS_PER_SECOND),
  })

  const slots: Slot[] = [
    ...CONCORDAT_BUILDING_ORDER.map((kind): Slot => {
      const cost = buildCostOf(client, kind)

      return {
        key: kind,
        glyph: kind,
        title: CONCORDAT_BUILDING_TITLES[kind],
        note: String(cost),
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
      note: waitTicks > 0 ? '·' : String(weapons.heavyCost),
      isOff: waitTicks > 0 || stock.heavy >= weapons.heavyMax || gold < weapons.heavyCost,
      tool: { kind: 'launch', isHeavy: true },
    },
  ]

  // Digit keys arm a slot, the same key or Escape puts it back
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.metaKey || event.ctrlKey || event.altKey || !/^[1-9]$/.test(event.key)) return
      if (target?.closest('input:not([type="range"]), textarea, [contenteditable="true"]')) return
      const slot = slots[Number(event.key) - 1]
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
        const isLocked = slot.tool.kind === 'launch' && waitTicks > 0
        const cost =
          slot.tool.kind === 'build'
            ? Number(slot.note)
            : slot.tool.isHeavy
              ? weapons.heavyCost
              : weapons.missileCost
        const title = isLocked
          ? `${slot.title} · ${lock}`
          : `${slot.title} · ${fillPlayMessage(CONCORDAT_HUD_COPY.goldCost, { gold: cost })}`

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
              <ConcordatGlyph kind={slot.glyph} />
              <span className={CONCORDAT_HUD.armNote}>{slot.note}</span>
            </button>
            <div role="tooltip" className={CONCORDAT_HUD.armTip}>
              <span className={CONCORDAT_HUD.armTipTitle}>{title}</span>
              <span>{CONCORDAT_ARM_HINTS[slot.key]}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
