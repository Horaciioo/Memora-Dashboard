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

// The kind to raise next, ports first for a nation shut in
const nextKind = (context: ConcordatBotContext, owned: number): ConcordatBuildingKind => {
  const { profile, view, state } = context
  const isShutIn = !view.freeContact && !view.neighbours.length
  const hasPort = state.buildings.some(
    (b) => b.owner === view.me.id && b.kind === ConcordatBuildingKinds.Port
  )
  if (profile.sails && isShutIn && !hasPort) return ConcordatBuildingKinds.Port

  return profile.build[owned % profile.build.length]
}

// A new building, or an upgrade once the roster is full
const buildMove = (context: ConcordatBotContext): ConcordatIntent | null => {
  const { state, view, profile, isCaretaker } = context
  const playerId = view.me.id
  const mine = state.buildings.filter((building) => building.owner === playerId)
  const limit = isCaretaker ? bots.caretaker.maxBuildings : profile.maxBuildings

  if (mine.length < limit) {
    const kind = nextKind(context, mine.length)
    if (view.me.gold < buildCost(state, playerId, kind) * (1 + bots.gold.spareShare)) return null

    const tile = siteFor(state, playerId, kind)

    return tile === null ? null : { kind: 'build', playerId, building: kind, tile }
  }

  const target = mine
    .filter((building) => !upgradeRefusal(state, playerId, building.id))
    .sort((first, second) => upgradeCost(first) - upgradeCost(second))[0]
  const best = target ? buildingById(state, target.id) : null

  return best && view.me.gold >= upgradeCost(best) * (1 + bots.gold.spareShare)
    ? { kind: 'upgrade', playerId, id: best.id }
    : null
}

// Next tier of the favourite path, then the others
const researchMove = (context: ConcordatBotContext): ConcordatIntent | null => {
  const { state, view, profile, isCaretaker } = context
  if (isCaretaker || !profile.researches) return null

  const playerId = view.me.id
  const paths = [profile.techPath, ...CONCORDAT_TECH_ORDER.filter((p) => p !== profile.techPath)]
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
