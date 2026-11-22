import {
  buildCost,
  buildingById,
  placeRefusal,
  upgradeCost,
  upgradeRefusal,
} from '@/core/lib/play/concordat/buildings'
import { tileNoise } from '@/core/lib/play/concordat/sim/rng'
import { levelOf, researchCost, researchRefusal, tiersOf } from '@/core/lib/play/concordat/tech'
import type { ConcordatBotContext } from '@/core/lib/play/concordat/bots/view'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import {
  CONCORDAT_TECH_ORDER,
  ConcordatBuildingKinds,
  ConcordatTerrains,
} from '@/utils/constants/concordat'
import type { ConcordatBuildingKind } from '@/utils/constants/concordat'

const { bots } = CONCORDAT

// Tile of the nation's land that takes the building, null when none was found
const siteFor = (
  state: ConcordatState,
  playerId: number,
  kind: ConcordatBuildingKind
): number | null => {
  const me = state.players[playerId - 1]
  const { width, height, terrain } = state.map
  const radius = Math.max(6, Math.round(Math.sqrt(me.tiles) * 1.3))
  const cx = me.start % width
  const cy = Math.floor(me.start / width)

  for (let sample = 0; sample < bots.samples; sample++) {
    const seed = playerId * 7919 + sample
    const x = Math.min(
      width - 1,
      Math.max(0, cx + Math.round((tileNoise(seed, state.tick) - 0.5) * 2 * radius))
    )
    const y = Math.min(
      height - 1,
      Math.max(0, cy + Math.round((tileNoise(seed + 313, state.tick) - 0.5) * 2 * radius))
    )
    const tile = y * width + x
    if (terrain[tile] === ConcordatTerrains.Sea || state.owner[tile] !== playerId) continue
    if (!placeRefusal(state, playerId, kind, tile)) return tile
  }

  return null
}

// The kind to raise next, ports first while the nation has fewer than it wants
const nextKind = (context: ConcordatBotContext, owned: number): ConcordatBuildingKind => {
  const { profile, state, view } = context
  const ports = state.buildings.filter(
    (b) => b.owner === view.me.id && b.kind === ConcordatBuildingKinds.Port
  ).length
  // Income first: a market, then a second one, before anything else
  const markets = state.buildings.filter(
    (b) => b.owner === view.me.id && b.kind === ConcordatBuildingKinds.Market
  ).length
  if (markets < Math.min(2, 1 + owned)) return ConcordatBuildingKinds.Market
  if (profile.sails && ports < profile.ports) return ConcordatBuildingKinds.Port
  if (!profile.sails && ports < Math.min(profile.ports, 2) && owned >= 2) {
    return ConcordatBuildingKinds.Port
  }

  return profile.build[owned % profile.build.length]
}

// Buildings that pay gold, upgraded first
const isIncome = (kind: ConcordatBuildingKind): boolean =>
  kind === ConcordatBuildingKinds.Market || kind === ConcordatBuildingKinds.Port

// Best upgrade within reach, null when none
const upgradeMove = (context: ConcordatBotContext): ConcordatIntent | null => {
  const { state, view } = context
  const playerId = view.me.id
  const target = state.buildings
    .filter(
      (building) => building.owner === playerId && !upgradeRefusal(state, playerId, building.id)
    )
    .sort(
      (first, second) =>
        Number(!isIncome(first.kind)) - Number(!isIncome(second.kind)) ||
        upgradeCost(state, first) - upgradeCost(state, second)
    )[0]
  const best = target ? buildingById(state, target.id) : null

  return best && view.me.gold >= upgradeCost(state, best) * (1 + bots.gold.spareShare)
    ? { kind: 'upgrade', playerId, id: best.id }
    : null
}

// A new building: a silo first once rich, then the personality list
const raiseMove = (
  context: ConcordatBotContext,
  owned: number,
  isRich: boolean
): ConcordatIntent | null => {
  const { state, view, profile } = context
  const playerId = view.me.id
  const hasSilo = state.buildings.some(
    (building) => building.owner === playerId && building.kind === ConcordatBuildingKinds.Silo
  )
  const wantsSilo = (isRich || context.pressure > 0.3) && !hasSilo
  const kinds = [
    ...(wantsSilo ? [ConcordatBuildingKinds.Silo] : []),
    nextKind(context, owned),
    profile.build[owned % profile.build.length],
  ]

  for (const kind of kinds) {
    if (view.me.gold < buildCost(state, playerId, kind) * (1 + bots.gold.spareShare)) continue

    const tile = siteFor(state, playerId, kind)
    if (tile !== null) return { kind: 'build', playerId, building: kind, tile }
  }

  return null
}

// A new building, or an upgrade once the roster is full, a rich bot keeps raising more
const buildMove = (context: ConcordatBotContext): ConcordatIntent | null => {
  const { state, view, profile, isCaretaker, roll } = context
  const playerId = view.me.id
  const owned = state.buildings.filter((building) => building.owner === playerId).length
  const base = isCaretaker ? bots.caretaker.maxBuildings : profile.maxBuildings
  const extra = isCaretaker
    ? 0
    : Math.min(bots.rich.maxExtra, Math.floor(view.me.gold / bots.rich.step))
  const isRich = extra > 0

  // The rich alternate between raising and upgrading, the others fill their roster first
  if (isRich && roll(3) < bots.rich.upgradeChance) {
    const upgrade = upgradeMove(context)
    if (upgrade) return upgrade
  }
  if (owned < base + extra) return raiseMove(context, owned, isRich)

  return upgradeMove(context)
}

// Next tier of the favourite path, then the others
const researchMove = (context: ConcordatBotContext): ConcordatIntent | null => {
  const { state, view, profile, isCaretaker } = context
  if (isCaretaker || !profile.researches) return null

  const playerId = view.me.id
  // Two economy tiers first, they pay for everything after
  const lead = levelOf(state, playerId, 'economy') < 2 ? 'economy' : profile.techPath
  const paths = [lead, ...CONCORDAT_TECH_ORDER.filter((p) => p !== lead)]
  const path = paths.find(
    (candidate) => levelOf(state, playerId, candidate) < tiersOf(candidate).length
  )
  if (!path || researchRefusal(state, playerId, path) === 'researching') return null

  const price = researchCost(state, playerId, path) + bots.gold.techSpare

  return view.me.gold >= price && !researchRefusal(state, playerId, path)
    ? { kind: 'research', playerId, path }
    : null
}

/**
 * Spending of one decision: one building, one research
 * @param {ConcordatBotContext} context - Decision
 * @return {ConcordatIntent[]} - Commands
 */

export const economyMoves = (context: ConcordatBotContext): ConcordatIntent[] =>
  [researchMove(context), buildMove(context)].filter(
    (move): move is ConcordatIntent => move !== null
  )
