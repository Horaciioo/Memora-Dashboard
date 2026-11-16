import { readerOf, writeVarint } from '@/core/lib/play/concordat/bytes'
import { decodeMap, encodeMap } from '@/core/lib/play/concordat/map'
import { rowOf } from '@/core/lib/play/concordat/wire/diff'
import type {
  ConcordatCorpsRow,
  ConcordatDiff,
  ConcordatPlayerRow,
} from '@/core/lib/play/concordat/wire/diff'
import { offersFor, shipsOf, systemsOf } from '@/core/lib/play/concordat/wire/systems'
import type {
  ConcordatOfferRow,
  ConcordatShipRow,
  ConcordatSystemsRows,
} from '@/core/lib/play/concordat/wire/systems'
import { fromBase64, toBase64 } from '@/core/lib/realtime/codec'
import type {
  ConcordatEvent,
  ConcordatMap,
  ConcordatSample,
  ConcordatState,
} from '@/types/concordat'
import type { ConcordatPhaseName, ConcordatPowerName } from '@/utils/constants/concordat'

// Protocol version of a board
export const BOARD_VERSION = 2

/**
 * Nation as the board first shows it
 * @typedef {Object} ConcordatBoardPlayer
 */

export interface ConcordatBoardPlayer extends ConcordatPlayerRow {
  accountId: string | null
  kind: ConcordatPowerName
  // Country or tribe name, empty for a seat
  name: string
  // Packed RGB, zero for the palette
  color: number
}

/**
 * Full picture sent on arrival and on reconnection
 * @typedef {Object} ConcordatBoard
 */

export interface ConcordatBoard {
  v: number
  rev: number
  tick: number
  phase: ConcordatPhaseName
  endTick: number
  pickEnd: number
  speed: number
  // Nation of the reader, zero for a spectator
  me: number
  // Base64 of the encoded map
  map: string
  // Base64 of the run-length coded owner layer
  owner: string
  players: ConcordatBoardPlayer[]
  corps: ConcordatCorpsRow[]
  ships: ConcordatShipRow[]
  systems: ConcordatSystemsRows
  // Offers of the reader only
  offers: ConcordatOfferRow[]
  // Territory over time and every journal line, for the timeline
  history: ConcordatSample[]
  log: ConcordatEvent[]
}

/**
 * Run-length coded owner layer
 * @param {Uint8Array} owner - Owner layer
 * @return {Uint8Array} - Bytes
 */

export const encodeOwner = (owner: Uint8Array): Uint8Array => {
  const bytes: number[] = []
  let run = 1

  // One owner byte then its run length
  for (let tile = 1; tile <= owner.length; tile++) {
    if (tile < owner.length && owner[tile] === owner[tile - 1]) {
      run++
      continue
    }
    bytes.push(owner[tile - 1])
    writeVarint(bytes, run)
    run = 1
  }

  return Uint8Array.from(bytes)
}

/**
 * Owner layer back from its bytes
 * @param {Uint8Array} bytes - Bytes
 * @param {number} length - Tile count
 * @return {Uint8Array} - Owner layer
 */

export const decodeOwner = (bytes: Uint8Array, length: number): Uint8Array => {
  const owner = new Uint8Array(length)
  const reader = readerOf(bytes)
  let tile = 0

  while (tile < length && !reader.isDone()) {
    const holder = reader.byte()
    const size = reader.varint()
    owner.fill(holder, tile, tile + size)
    tile += size
  }

  return owner
}

// The map never changes, encode it once
const mapTexts = new WeakMap<ConcordatMap, string>()

/**
 * Parts of a board shared by every reader
 * @param {ConcordatState} state - Game
 * @param {number} rev - Revision
 * @return {Omit<ConcordatBoard, 'me' | 'offers'>} - Shared part
 */

export const sharedBoardOf = (
  state: ConcordatState,
  rev: number
): Omit<ConcordatBoard, 'me' | 'offers'> => {
  const known = mapTexts.get(state.map)
  const map = known ?? toBase64(encodeMap(state.map))
  mapTexts.set(state.map, map)

  return {
    v: BOARD_VERSION,
    rev,
    tick: state.tick,
    phase: state.phase,
    endTick: state.endTick,
    pickEnd: state.pickEnd,
    speed: state.speed,
    map,
    owner: toBase64(encodeOwner(state.owner)),
    players: state.players.map((player) => ({
      ...rowOf(player),
      accountId: player.accountId,
      kind: player.kind,
      name: player.name,
      color: player.color,
    })),
    corps: state.corps.map((corps) => ({
      owner: corps.owner,
      target: corps.target,
      troops: Math.round(corps.troops),
    })),
    ships: shipsOf(state),
    systems: systemsOf(state),
    history: state.history,
    log: state.log,
  }
}

/**
 * Board of one reader from the shared part
 * @param {ConcordatState} state - Game
 * @param {Omit<ConcordatBoard, 'me' | 'offers'>} shared - Shared part
 * @param {number} playerId - Nation of the reader, zero for a spectator
 * @return {ConcordatBoard} - Board
 */

export const boardFor = (
  state: ConcordatState,
  shared: Omit<ConcordatBoard, 'me' | 'offers'>,
  playerId: number
): ConcordatBoard => ({ ...shared, me: playerId, offers: offersFor(state, playerId) })

/**
 * What a client keeps and redraws from
 * @typedef {Object} ConcordatClientState
 */

export interface ConcordatClientState {
  rev: number
  tick: number
  phase: ConcordatPhaseName
  endTick: number
  pickEnd: number
  speed: number
  me: number
  map: ConcordatMap
  owner: Uint8Array
  players: ConcordatBoardPlayer[]
  corps: ConcordatCorpsRow[]
  ships: ConcordatShipRow[]
  systems: ConcordatSystemsRows
  offers: ConcordatOfferRow[]
  history: ConcordatSample[]
  log: ConcordatEvent[]
  feed: ConcordatEvent[]
  // Tiles changed since a screen last painted
  touched: number[]
}

// Last map decoded, the map never changes so a new board of the same game reuses it
let lastMap: { text: string; map: ConcordatMap } | null = null

const mapOf = (text: string): ConcordatMap => {
  if (lastMap?.text === text) return lastMap.map

  lastMap = { text, map: decodeMap(fromBase64(text)) }

  return lastMap.map
}

/**
 * Client state from a board
 * @param {ConcordatBoard} board - Board
 * @return {ConcordatClientState} - State
 */

export const clientFromBoard = (board: ConcordatBoard): ConcordatClientState => {
  if (board.v !== BOARD_VERSION) throw new Error('Unknown protocol version')
  const map = mapOf(board.map)

  return {
    rev: board.rev,
    tick: board.tick,
    phase: board.phase,
    endTick: board.endTick,
    pickEnd: board.pickEnd,
    speed: board.speed,
    me: board.me,
    map,
    owner: decodeOwner(fromBase64(board.owner), map.terrain.length),
    players: board.players,
    corps: board.corps,
    ships: board.ships,
    systems: board.systems,
    offers: board.offers,
    history: board.history,
    log: board.log,
    feed: [],
    touched: [],
  }
}

/**
 * Apply a diff, a missed one asks for a new board
 * @param {ConcordatClientState} client - State, changed in place
 * @param {ConcordatDiff} diff - Diff
 * @return {'ok' | 'gap'} - Outcome
 */

export const applyDiff = (client: ConcordatClientState, diff: ConcordatDiff): 'ok' | 'gap' => {
  if (diff.rev <= client.rev) return 'ok'
  if (diff.baseRev !== client.rev) return 'gap'

  // Tiles, kept until a screen has painted them
  for (const run of diff.runs) {
    client.owner.fill(run.owner, run.start, run.start + run.length)
    for (let tile = run.start; tile < run.start + run.length; tile++) client.touched.push(tile)
  }

  // Figures
  const rows = new Map(diff.players.map((row) => [row.id, row]))
  client.players = client.players.map((player) => ({ ...player, ...rows.get(player.id) }))
  client.corps = diff.corps
  client.ships = diff.ships
  if (diff.systems) client.systems = diff.systems
  if (diff.events.length) {
    client.log = [...client.log, ...diff.events]
    client.feed = [...client.feed, ...diff.events].slice(-60)
  }
  client.rev = diff.rev
  client.tick = diff.tick
  client.phase = diff.phase

  return 'ok'
}

/**
 * Tiles changed since the last call, handed to the screen once
 * @param {ConcordatClientState} client - State, emptied of its touched tiles
 * @return {number[]} - Tiles
 */

export const drainTouched = (client: ConcordatClientState): number[] => {
  const tiles = client.touched
  client.touched = []

  return tiles
}
