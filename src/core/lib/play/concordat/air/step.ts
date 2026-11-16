import { airPoint, isCircling, legTicks } from '@/core/lib/play/concordat/air/path'
import { areHostile } from '@/core/lib/play/concordat/air/rules'
import { addScar } from '@/core/lib/play/concordat/air/scars'
import { isWorking } from '@/core/lib/play/concordat/buildings/rules'
import { forEachInDisc } from '@/core/lib/play/concordat/sim/area'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { nextRandom } from '@/core/lib/play/concordat/sim/rng'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { weaponsOn } from '@/core/lib/play/concordat/weapons/rules'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import type { ConcordatAircraft, ConcordatState } from '@/types/concordat'
import {
  ConcordatBuildingKinds,
  ConcordatScarKinds,
  ConcordatTerrains,
} from '@/utils/constants/concordat'

const { air, weapons } = CONCORDAT

const widthOf = (state: ConcordatState): number => state.map.width

// Tile under a point of the sky, clamped to the map
const tileUnder = (state: ConcordatState, x: number, y: number): number => {
  const { width, height } = state.map
  const column = Math.min(width - 1, Math.max(0, Math.floor(x)))
  const row = Math.min(height - 1, Math.max(0, Math.floor(y)))

  return row * width + column
}

// Hit one point of life, the shooter and the shot are noted for the screens
const hurt = (state: ConcordatState, target: ConcordatAircraft, from: number): void => {
  target.shotAt = state.tick
  target.shotFrom = from
  target.hp--
}

// Ground fire of the batteries and the defense posts on hostile aircraft
const fireFromGround = (state: ConcordatState, flying: Map<number, [number, number]>): void => {
  const guns = state.buildings.filter(
    (building) =>
      (building.kind === ConcordatBuildingKinds.Sam ||
        building.kind === ConcordatBuildingKinds.Post) &&
      isWorking(building, state.tick) &&
      (building.coolAt ?? 0) <= state.tick
  )

  for (const gun of guns) {
    const isSam = gun.kind === ConcordatBuildingKinds.Sam
    const range = isSam
      ? CONCORDAT.buildings.kinds.sam.levels[gun.level - 1].radius
      : air.post.range
    const gx = (gun.tile % widthOf(state)) + 0.5
    const gy = Math.floor(gun.tile / widthOf(state)) + 0.5

    let best: ConcordatAircraft | null = null
    let bestReach = Infinity
    for (const aircraft of state.aircraft) {
      const point = flying.get(aircraft.id)
      if (!point || aircraft.hp <= 0 || !areHostile(state, gun.owner, aircraft.owner)) continue
      const reach = Math.hypot(point[0] - gx, point[1] - gy)
      if (reach <= range && reach < bestReach) {
        best = aircraft
        bestReach = reach
      }
    }
    if (!best) continue

    const chance = isSam
      ? air.samAircraft[Math.min(gun.level, air.samAircraft.length) - 1]
      : air.post.chance
    const cooldown = isSam
      ? air.samCooldown[Math.min(gun.level, air.samCooldown.length) - 1]
      : air.post.cooldown
    gun.coolAt = state.tick + ticksOf(cooldown)
    best.shotAt = state.tick
    best.shotFrom = gun.tile
    if (nextRandom(state) < chance) best.hp--
    if (best.hp <= 0) wreck(state, best, gun.owner, flying)
  }
}

// Odds that a shot of one kind of aircraft lands on another
const dogfightChance = (shooter: ConcordatAircraft, target: ConcordatAircraft): number => {
  if (shooter.kind === 'fighter') {
    return target.kind === 'fighter' ? air.dogfight.fighterVsFighter : air.dogfight.fighterVsHeli
  }

  return target.kind === 'fighter' ? air.dogfight.heliVsFighter : air.dogfight.heliVsHeli
}

// Every pair of hostile aircraft close enough trades fire
const dogfight = (state: ConcordatState, flying: Map<number, [number, number]>): void => {
  const radius = air.dogfight.radius
  const list = state.aircraft

  for (let first = 0; first < list.length; first++) {
    for (let second = first + 1; second < list.length; second++) {
      const a = list[first]
      const b = list[second]
      const pa = flying.get(a.id)
      const pb = flying.get(b.id)
      if (!pa || !pb || a.hp <= 0 || b.hp <= 0 || !areHostile(state, a.owner, b.owner)) continue
      if (Math.hypot(pa[0] - pb[0], pa[1] - pb[1]) > radius) continue

      const hitB = nextRandom(state) < dogfightChance(a, b)
      const hitA = nextRandom(state) < dogfightChance(b, a)
      if (hitB) hurt(state, b, tileUnder(state, pa[0], pa[1]))
      if (hitA) hurt(state, a, tileUnder(state, pb[0], pb[1]))
      if (!hitA && !hitB) {
        a.shotAt = b.shotAt = state.tick
        a.shotFrom = tileUnder(state, pb[0], pb[1])
        b.shotFrom = tileUnder(state, pa[0], pa[1])
      }
      if (b.hp <= 0) wreck(state, b, a.owner, flying)
      if (a.hp <= 0) wreck(state, a, b.owner, flying)
    }
  }
}

// An aircraft that fell: a wreck on the ground and a line in the journal
const wreck = (
  state: ConcordatState,
  aircraft: ConcordatAircraft,
  shooter: number,
  flying: Map<number, [number, number]>
): void => {
  const point = flying.get(aircraft.id) ?? [0, 0]
  const tile = tileUnder(state, point[0], point[1])
  if (state.map.terrain[tile] !== ConcordatTerrains.Sea)
    addScar(state, tile, air.scars.wreck, ConcordatScarKinds.Wreck)
  emit(state, { tick: state.tick, kind: 'shotDown', actor: shooter, victim: aircraft.owner, tile })
}

// Fighters rake the ground under them, a little each second
const strafe = (state: ConcordatState, aircraft: ConcordatAircraft, isArrival: boolean): void => {
  const holder = state.owner[aircraft.tile]
  if (!holder || !areHostile(state, aircraft.owner, holder)) return

  const { width, height, terrain } = state.map
  let count = 0
  forEachInDisc({ width, height, tile: aircraft.tile, radius: air.fighter.strafe }, (tile) => {
    if (state.owner[tile] === holder && terrain[tile] !== ConcordatTerrains.Sea) count++
  })
  const nation = state.players[holder - 1]
  const loss = Math.min(
    weapons.maxLoss,
    (count / Math.max(1, nation.tiles)) * weapons.troopLoss * air.fighter.loss
  )
  nation.troops *= 1 - loss
  nation.stability = Math.max(0, nation.stability - air.fighter.stability)
  if (isArrival) addScar(state, aircraft.tile, air.scars.strafe, ConcordatScarKinds.Strafe)
}

/**
 * Add the helicopters on guard to the defenses of their nation
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const applyAirGuards = (state: ConcordatState): void => {
  for (const aircraft of state.aircraft) {
    if (aircraft.kind !== 'heli' || !isCircling(aircraft, state.tick, widthOf(state))) continue

    state.effects[aircraft.owner - 1].fortresses.push({
      tile: aircraft.tile,
      radius: air.heli.guard,
      defense: air.heli.slow,
    })
  }
}

/**
 * Air phase of a tick: landings, strafing, ground fire and dogfights
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runAir = (state: ConcordatState): void => {
  if (!state.aircraft.length || !weaponsOn(state)) return

  const width = widthOf(state)
  const isSecond = state.tick % CONCORDAT_TICKS_PER_SECOND === 0
  const flying = new Map<number, [number, number]>()
  for (const aircraft of state.aircraft) {
    const point = airPoint(aircraft, state.tick, width)
    flying.set(aircraft.id, [point.x, point.y])
  }

  for (const aircraft of state.aircraft) {
    if (aircraft.kind !== 'fighter' || !isCircling(aircraft, state.tick, width)) continue
    const arrival = aircraft.launchedAt + legTicks('fighter', aircraft.base, aircraft.tile, width)
    if (!aircraft.isDone && state.tick >= arrival) {
      aircraft.isDone = true
      strafe(state, aircraft, true)
    } else if (isSecond) strafe(state, aircraft, false)
  }

  if (isSecond) {
    fireFromGround(state, flying)
    dogfight(state, flying)
  }

  const kept = state.aircraft.filter((aircraft) => aircraft.hp > 0 && aircraft.until > state.tick)
  if (kept.length !== state.aircraft.length) {
    state.aircraft = kept
    state.isSystemsDirty = true
  }
  if (isSecond && kept.length) state.isSystemsDirty = true
}
