import { writeVarint } from '@/core/lib/play/concordat/bytes'
import type { ByteReader } from '@/core/lib/play/concordat/bytes'
import { calmFactor, grossOf, troopCap, upkeepOf } from '@/core/lib/play/concordat/sim/economy'
import type { ConcordatState } from '@/types/concordat'
import {
  CONCORDAT_BUILDING_ORDER,
  CONCORDAT_TIE_ORDER,
  ConcordatRouteKinds,
  ConcordatShipKinds,
  CONCORDAT_STRIKE_ORDER,
  ConcordatAirKinds,
  ConcordatScarKinds,
  ConcordatZoneKinds,
} from '@/utils/constants/concordat'
import type {
  ConcordatBuildingKind,
  ConcordatRouteKind,
  ConcordatAirKind,
  ConcordatScarKind,
  ConcordatStrikeKind,
  ConcordatZoneKind,
  ConcordatShipKind,
  ConcordatTieKind,
} from '@/utils/constants/concordat'

/**
 * Building as drawn
 * @typedef {Object} ConcordatBuildingRow
 */

export interface ConcordatBuildingRow {
  id: number
  owner: number
  kind: ConcordatBuildingKind
  level: number
  tile: number
  // Tick when it works
  readyAt: number
}

/**
 * Tie as drawn
 * @typedef {Object} ConcordatTieRow
 */

export interface ConcordatTieRow {
  a: number
  b: number
  kind: ConcordatTieKind
  // End of a peace, zero when open
  until: number
  // End of an announced break, zero when none
  breakAt: number
}

/**
 * Trade route as drawn
 * @typedef {Object} ConcordatRouteRow
 */

export interface ConcordatRouteRow {
  id: number
  a: number
  b: number
  kind: ConcordatRouteKind
  buildingA: number
  buildingB: number
  isCut: boolean
}

/**
 * Coalition as drawn
 * @typedef {Object} ConcordatCoalitionRow
 */

export interface ConcordatCoalitionRow {
  target: number
  members: number[]
}

/**
 * Missile in flight as drawn
 * @typedef {Object} ConcordatStrikeRow
 */

export interface ConcordatStrikeRow {
  id: number
  owner: number
  kind: ConcordatStrikeKind
  tile: number
  // Silo tile, minus one when unknown
  from: number
  launchedAt: number
  impactAt: number
  // Battery tile of the last interceptor, minus one when none
  by: number
  shotAt: number
  // Tick it is shot down, zero when it flies on
  killAt: number
}

/**
 * Aircraft as drawn
 * @typedef {Object} ConcordatAircraftRow
 */

export interface ConcordatAircraftRow {
  id: number
  owner: number
  kind: ConcordatAirKind
  base: number
  tile: number
  launchedAt: number
  until: number
  hp: number
  shotAt: number
  // Tile the last shot came from, minus one when none
  shotFrom: number
}

/**
 * Scar of the ground as drawn
 * @typedef {Object} ConcordatScarRow
 */

export interface ConcordatScarRow {
  tile: number
  radius: number
  at: number
  kind: ConcordatScarKind
}

/**
 * Economy figures of a nation, index is the id minus one
 * @typedef {Object} ConcordatFigureRow
 */

export interface ConcordatFigureRow {
  // Troop ceiling
  maxTroops: number
  // Net gold per minute, may be negative
  income: number
  // Part of the gold per minute that comes from trade
  trade: number
}

/**
 * Marked ground as drawn
 * @typedef {Object} ConcordatZoneRow
 */

export interface ConcordatZoneRow {
  id: number
  kind: ConcordatZoneKind
  tile: number
  radius: number
  until: number
}

/**
 * Stock of a nation, index is the id minus one
 * @typedef {Object} ConcordatArmsRow
 */

export interface ConcordatArmsRow {
  missiles: number
  heavy: number
}

// Scar kinds in wire order
const SCAR_ORDER: readonly ConcordatScarKind[] = Object.values(ConcordatScarKinds)

// Zone kinds in wire order
const ZONE_ORDER: readonly ConcordatZoneKind[] = Object.values(ConcordatZoneKinds)

/**
 * Slow parts of the game, sent whole when they change
 * @typedef {Object} ConcordatSystemsRows
 */

export interface ConcordatSystemsRows {
  buildings: ConcordatBuildingRow[]
  ties: ConcordatTieRow[]
  // Credit per nation, index is the id minus one
  trust: number[]
  routes: ConcordatRouteRow[]
  coalitions: ConcordatCoalitionRow[]
  strikes: ConcordatStrikeRow[]
  aircraft: ConcordatAircraftRow[]
  scars: ConcordatScarRow[]
  zones: ConcordatZoneRow[]
  arms: ConcordatArmsRow[]
  figures: ConcordatFigureRow[]
}

/**
 * Ship as drawn
 * @typedef {Object} ConcordatShipRow
 */

export interface ConcordatShipRow {
  id: number
  owner: number
  kind: ConcordatShipKind
  tile: number
  troops: number
  // Destination coast of a transport
  landing: number
}

/**
 * Offer as read by its two nations
 * @typedef {Object} ConcordatOfferRow
 */

export interface ConcordatOfferRow {
  id: number
  from: number
  to: number
  kind: string
  minutes: number
  ask: number
  about: number
  expiresAt: number
}

// Troop ceiling, net income and trade income of every nation
const figuresOf = (state: ConcordatState): ConcordatFigureRow[] =>
  state.players.map((player) => {
    if (!player.alive) return { maxTroops: 0, income: 0, trade: 0 }

    const effects = state.effects[player.id - 1]
    const calm = calmFactor(player)
    const factor = calm * Math.max(0, effects.income) * player.goldShare
    const earned = (grossOf(player) + effects.gold + effects.trade) * factor - effects.malus
    const spent = upkeepOf(player, effects.upkeepCut) + effects.upkeep
    const minute = 60 * state.speed

    return {
      maxTroops: Math.round(troopCap(player, effects.cap)),
      income: Math.round((earned - spent) * minute),
      trade: Math.round(effects.trade * factor * minute),
    }
  })

/**
 * Slow rows of a game
 * @param {ConcordatState} state - Game
 * @return {ConcordatSystemsRows} - Rows
 */

export const systemsOf = (state: ConcordatState): ConcordatSystemsRows => ({
  buildings: state.buildings.map(({ id, owner, kind, level, tile, readyAt }) => ({
    id,
    owner,
    kind,
    level,
    tile,
    readyAt,
  })),
  ties: state.relations.map(({ a, b, kind, until, breakAt }) => ({ a, b, kind, until, breakAt })),
  trust: state.trust.map(Math.round),
  routes: state.routes.map(({ id, a, b, kind, buildingA, buildingB, isCut }) => ({
    id,
    a,
    b,
    kind,
    buildingA,
    buildingB,
    isCut,
  })),
  coalitions: state.coalitions.map(({ target, members }) => ({ target, members: [...members] })),
  strikes: state.strikes.map(
    ({ id, owner, kind, tile, from, launchedAt, impactAt, by, shotAt, killAt }) => ({
      id,
      owner,
      kind,
      tile,
      from: from ?? -1,
      launchedAt,
      impactAt,
      by: by ?? -1,
      shotAt: shotAt ?? 0,
      killAt: killAt ?? 0,
    })
  ),
  aircraft: state.aircraft.map(
    ({ id, owner, kind, base, tile, launchedAt, until, hp, shotAt, shotFrom }) => ({
      id,
      owner,
      kind,
      base,
      tile,
      launchedAt,
      until,
      hp,
      shotAt,
      shotFrom,
    })
  ),
  scars: state.scars.map(({ tile, radius, at, kind }) => ({ tile, radius, at, kind })),
  zones: state.zones.map(({ id, kind, tile, radius, until }) => ({
    id,
    kind,
    tile,
    radius,
    until,
  })),
  arms: state.arms.map(({ missiles, heavy }) => ({ missiles, heavy })),
  figures: figuresOf(state),
})

/**
 * Ships of a game
 * @param {ConcordatState} state - Game
 * @return {ConcordatShipRow[]} - Rows
 */

export const shipsOf = (state: ConcordatState): ConcordatShipRow[] =>
  state.ships.map(({ id, owner, kind, tile, troops, landing }) => ({
    id,
    owner,
    kind,
    tile,
    troops: Math.round(troops),
    landing,
  }))

/**
 * Offers one nation is part of
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation, zero for a spectator
 * @return {ConcordatOfferRow[]} - Rows
 */

export const offersFor = (state: ConcordatState, playerId: number): ConcordatOfferRow[] =>
  playerId ? state.offers.filter((offer) => offer.from === playerId || offer.to === playerId) : []

// Byte of each ship kind
const SHIP_CODES: ConcordatShipKind[] = [
  ConcordatShipKinds.Transport,
  ConcordatShipKinds.War,
  ConcordatShipKinds.Trade,
]

/**
 * Bytes of the ships
 * @param {number[]} bytes - Output
 * @param {ConcordatShipRow[]} ships - Ships
 * @return {void}
 */

export const writeShips = (bytes: number[], ships: ConcordatShipRow[]): void => {
  writeVarint(bytes, ships.length)
  for (const ship of ships) {
    writeVarint(bytes, ship.id)
    bytes.push(ship.owner, SHIP_CODES.indexOf(ship.kind))
    writeVarint(bytes, ship.tile)
    writeVarint(bytes, ship.troops)
    writeVarint(bytes, ship.landing + 1)
  }
}

/**
 * Ships from their bytes
 * @param {ByteReader} reader - Reader
 * @return {ConcordatShipRow[]} - Ships
 */

export const readShips = (reader: ByteReader): ConcordatShipRow[] => {
  const ships: ConcordatShipRow[] = []
  for (let count = reader.varint(); count > 0; count--) {
    const id = reader.varint()
    const owner = reader.byte()
    const kind = SHIP_CODES[reader.byte()] ?? ConcordatShipKinds.Transport
    ships.push({
      id,
      owner,
      kind,
      tile: reader.varint(),
      troops: reader.varint(),
      landing: reader.varint() - 1,
    })
  }

  return ships
}

/**
 * Bytes of the slow rows
 * @param {number[]} bytes - Output
 * @param {ConcordatSystemsRows} rows - Rows
 * @return {void}
 */

export const writeSystems = (bytes: number[], rows: ConcordatSystemsRows): void => {
  writeVarint(bytes, rows.buildings.length)
  for (const building of rows.buildings) {
    writeVarint(bytes, building.id)
    bytes.push(building.owner, CONCORDAT_BUILDING_ORDER.indexOf(building.kind), building.level)
    writeVarint(bytes, building.tile)
    writeVarint(bytes, building.readyAt)
  }

  writeVarint(bytes, rows.ties.length)
  for (const tie of rows.ties) {
    bytes.push(tie.a, tie.b, CONCORDAT_TIE_ORDER.indexOf(tie.kind))
    writeVarint(bytes, tie.until)
    writeVarint(bytes, tie.breakAt)
  }

  bytes.push(rows.trust.length, ...rows.trust.map((value) => Math.min(255, value)))

  writeVarint(bytes, rows.routes.length)
  for (const route of rows.routes) {
    writeVarint(bytes, route.id)
    bytes.push(
      route.a,
      route.b,
      route.kind === ConcordatRouteKinds.Sea ? 1 : 0,
      route.isCut ? 1 : 0
    )
    writeVarint(bytes, route.buildingA)
    writeVarint(bytes, route.buildingB)
  }

  bytes.push(rows.coalitions.length)
  for (const coalition of rows.coalitions) {
    bytes.push(coalition.target, coalition.members.length, ...coalition.members)
  }

  writeVarint(bytes, rows.strikes.length)
  for (const strike of rows.strikes) {
    writeVarint(bytes, strike.id)
    bytes.push(strike.owner, CONCORDAT_STRIKE_ORDER.indexOf(strike.kind))
    writeVarint(bytes, strike.tile)
    writeVarint(bytes, strike.from + 1)
    writeVarint(bytes, strike.launchedAt)
    writeVarint(bytes, strike.impactAt)
    writeVarint(bytes, strike.by + 1)
    writeVarint(bytes, strike.shotAt)
    writeVarint(bytes, strike.killAt)
  }

  writeVarint(bytes, rows.aircraft.length)
  for (const aircraft of rows.aircraft) {
    writeVarint(bytes, aircraft.id)
    bytes.push(
      aircraft.owner,
      aircraft.kind === ConcordatAirKinds.Fighter ? 1 : 0,
      Math.max(0, aircraft.hp)
    )
    writeVarint(bytes, aircraft.base)
    writeVarint(bytes, aircraft.tile)
    writeVarint(bytes, aircraft.launchedAt)
    writeVarint(bytes, aircraft.until)
    writeVarint(bytes, aircraft.shotAt)
    writeVarint(bytes, aircraft.shotFrom + 1)
  }

  writeVarint(bytes, rows.scars.length)
  for (const scar of rows.scars) {
    bytes.push(SCAR_ORDER.indexOf(scar.kind), scar.radius)
    writeVarint(bytes, scar.tile)
    writeVarint(bytes, scar.at)
  }

  writeVarint(bytes, rows.zones.length)
  for (const zone of rows.zones) {
    writeVarint(bytes, zone.id)
    bytes.push(ZONE_ORDER.indexOf(zone.kind), zone.radius)
    writeVarint(bytes, zone.tile)
    writeVarint(bytes, zone.until)
  }

  bytes.push(rows.arms.length)
  for (const stock of rows.arms)
    bytes.push(Math.min(255, stock.missiles), Math.min(255, stock.heavy))

  // Income may be negative, folded to an unsigned number
  bytes.push(rows.figures.length)
  for (const figure of rows.figures) {
    writeVarint(bytes, figure.maxTroops)
    writeVarint(bytes, figure.income < 0 ? -figure.income * 2 - 1 : figure.income * 2)
    writeVarint(bytes, figure.trade)
  }
}

/**
 * Slow rows from their bytes
 * @param {ByteReader} reader - Reader
 * @return {ConcordatSystemsRows} - Rows
 */

export const readSystems = (reader: ByteReader): ConcordatSystemsRows => {
  const buildings: ConcordatBuildingRow[] = []
  for (let count = reader.varint(); count > 0; count--) {
    const id = reader.varint()
    const owner = reader.byte()
    const kind = CONCORDAT_BUILDING_ORDER[reader.byte()]
    buildings.push({
      id,
      owner,
      kind,
      level: reader.byte(),
      tile: reader.varint(),
      readyAt: reader.varint(),
    })
  }

  const ties: ConcordatTieRow[] = []
  for (let count = reader.varint(); count > 0; count--) {
    const a = reader.byte()
    const b = reader.byte()
    ties.push({
      a,
      b,
      kind: CONCORDAT_TIE_ORDER[reader.byte()],
      until: reader.varint(),
      breakAt: reader.varint(),
    })
  }

  const trust: number[] = []
  for (let count = reader.byte(); count > 0; count--) trust.push(reader.byte())

  const routes: ConcordatRouteRow[] = []
  for (let count = reader.varint(); count > 0; count--) {
    const id = reader.varint()
    const a = reader.byte()
    const b = reader.byte()
    const kind = reader.byte() ? ConcordatRouteKinds.Sea : ConcordatRouteKinds.Land
    const isCut = reader.byte() === 1
    routes.push({ id, a, b, kind, isCut, buildingA: reader.varint(), buildingB: reader.varint() })
  }

  const coalitions: ConcordatCoalitionRow[] = []
  for (let count = reader.byte(); count > 0; count--) {
    const target = reader.byte()
    const members: number[] = []
    for (let member = reader.byte(); member > 0; member--) members.push(reader.byte())
    coalitions.push({ target, members })
  }

  const strikes: ConcordatStrikeRow[] = []
  for (let count = reader.varint(); count > 0; count--) {
    const id = reader.varint()
    const owner = reader.byte()
    const kind = CONCORDAT_STRIKE_ORDER[reader.byte()]
    strikes.push({
      id,
      owner,
      kind,
      tile: reader.varint(),
      from: reader.varint() - 1,
      launchedAt: reader.varint(),
      impactAt: reader.varint(),
      by: reader.varint() - 1,
      shotAt: reader.varint(),
      killAt: reader.varint(),
    })
  }

  const aircraft: ConcordatAircraftRow[] = []
  for (let count = reader.varint(); count > 0; count--) {
    const id = reader.varint()
    const owner = reader.byte()
    const kind = reader.byte() ? ConcordatAirKinds.Fighter : ConcordatAirKinds.Heli
    const hp = reader.byte()
    aircraft.push({
      id,
      owner,
      kind,
      hp,
      base: reader.varint(),
      tile: reader.varint(),
      launchedAt: reader.varint(),
      until: reader.varint(),
      shotAt: reader.varint(),
      shotFrom: reader.varint() - 1,
    })
  }

  const scars: ConcordatScarRow[] = []
  for (let count = reader.varint(); count > 0; count--) {
    const kind = SCAR_ORDER[reader.byte()]
    const radius = reader.byte()
    scars.push({ kind, radius, tile: reader.varint(), at: reader.varint() })
  }

  const zones: ConcordatZoneRow[] = []
  for (let count = reader.varint(); count > 0; count--) {
    const id = reader.varint()
    const kind = ZONE_ORDER[reader.byte()]
    const radius = reader.byte()
    zones.push({ id, kind, radius, tile: reader.varint(), until: reader.varint() })
  }

  const arms: ConcordatArmsRow[] = []
  for (let count = reader.byte(); count > 0; count--) {
    arms.push({ missiles: reader.byte(), heavy: reader.byte() })
  }

  const figures: ConcordatFigureRow[] = []
  for (let count = reader.byte(); count > 0; count--) {
    const maxTroops = reader.varint()
    const folded = reader.varint()
    figures.push({
      maxTroops,
      income: folded % 2 ? -(folded + 1) / 2 : folded / 2,
      trade: reader.varint(),
    })
  }

  return {
    buildings,
    ties,
    trust,
    routes,
    coalitions,
    strikes,
    aircraft,
    scars,
    zones,
    arms,
    figures,
  }
}
