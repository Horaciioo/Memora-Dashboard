import { writeVarint } from '@/core/lib/play/concordat/bytes'
import type { ByteReader } from '@/core/lib/play/concordat/bytes'
import type { ConcordatState } from '@/types/concordat'
import {
  CONCORDAT_BUILDING_ORDER,
  CONCORDAT_TIE_ORDER,
  ConcordatRouteKinds,
  ConcordatShipKinds,
  ConcordatStrikeKinds,
  ConcordatZoneKinds,
} from '@/utils/constants/concordat'
import type {
  ConcordatBuildingKind,
  ConcordatRouteKind,
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
  zones: ConcordatZoneRow[]
  arms: ConcordatArmsRow[]
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
  strikes: state.strikes.map(({ id, owner, kind, tile, from, launchedAt, impactAt }) => ({
    id,
    owner,
    kind,
    tile,
    from: from ?? -1,
    launchedAt,
    impactAt,
  })),
  zones: state.zones.map(({ id, kind, tile, radius, until }) => ({
    id,
    kind,
    tile,
    radius,
    until,
  })),
  arms: state.arms.map(({ missiles, heavy }) => ({ missiles, heavy })),
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
    bytes.push(ship.owner, ship.kind === ConcordatShipKinds.War ? 1 : 0)
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
    const kind = reader.byte() ? ConcordatShipKinds.War : ConcordatShipKinds.Transport
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
    bytes.push(strike.owner, strike.kind === ConcordatStrikeKinds.Heavy ? 1 : 0)
    writeVarint(bytes, strike.tile)
    writeVarint(bytes, strike.from + 1)
    writeVarint(bytes, strike.launchedAt)
    writeVarint(bytes, strike.impactAt)
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
    const kind = reader.byte() ? ConcordatStrikeKinds.Heavy : ConcordatStrikeKinds.Missile
    strikes.push({
      id,
      owner,
      kind,
      tile: reader.varint(),
      from: reader.varint() - 1,
      launchedAt: reader.varint(),
      impactAt: reader.varint(),
    })
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

  return { buildings, ties, trust, routes, coalitions, strikes, zones, arms }
}
