import { readerOf, writeVarint } from '@/core/lib/play/concordat/bytes'
import {
  readShips,
  readSystems,
  shipsOf,
  systemsOf,
  writeShips,
  writeSystems,
} from '@/core/lib/play/concordat/wire/systems'
import type { ConcordatShipRow, ConcordatSystemsRows } from '@/core/lib/play/concordat/wire/systems'
import type { ConcordatEvent, ConcordatState } from '@/types/concordat'
import { ConcordatEventKinds, ConcordatPhases } from '@/utils/constants/concordat'
import type { ConcordatPhaseName } from '@/utils/constants/concordat'

// Protocol version, first byte of a diff
export const DIFF_VERSION = 2

const PHASES: ConcordatPhaseName[] = [
  ConcordatPhases.Picking,
  ConcordatPhases.Playing,
  ConcordatPhases.Ended,
]

const EVENT_KINDS: readonly ConcordatEvent['kind'][] = ConcordatEventKinds

/**
 * Public figures of a nation
 * @typedef {Object} ConcordatPlayerRow
 */

export interface ConcordatPlayerRow {
  id: number
  alive: boolean
  tiles: number
  troops: number
  gold: number
  stability: number
  provincesHeld: number
  // Tile, minus one when lost
  capital: number
  // Chosen start tile
  start: number
}

/**
 * Troops pushing, as drawn
 * @typedef {Object} ConcordatCorpsRow
 */

export interface ConcordatCorpsRow {
  owner: number
  target: number
  troops: number
}

/**
 * Run of tiles handed to one owner
 * @typedef {Object} ConcordatRun
 */

export interface ConcordatRun {
  start: number
  length: number
  owner: number
}

/**
 * What changed since the previous diff
 * @typedef {Object} ConcordatDiff
 */

export interface ConcordatDiff {
  // This diff, then the one it follows
  rev: number
  baseRev: number
  tick: number
  phase: ConcordatPhaseName
  runs: ConcordatRun[]
  players: ConcordatPlayerRow[]
  corps: ConcordatCorpsRow[]
  ships: ConcordatShipRow[]
  // Slow parts, only when they changed
  systems: ConcordatSystemsRows | null
  events: ConcordatEvent[]
}

/**
 * Rounded public row of a nation
 * @param {ConcordatState['players'][number]} player - Nation
 * @return {ConcordatPlayerRow} - Row
 */

export const rowOf = (player: ConcordatState['players'][number]): ConcordatPlayerRow => ({
  id: player.id,
  alive: player.alive,
  tiles: player.tiles,
  troops: Math.round(player.troops),
  gold: Math.round(player.gold),
  stability: Math.round(player.stability),
  provincesHeld: player.provincesHeld,
  capital: player.capital,
  start: player.start,
})

/**
 * Runs of consecutive tiles with the same current owner
 * @param {Uint8Array} owner - Owner layer
 * @param {number[]} tiles - Changed tiles, repeats allowed
 * @return {ConcordatRun[]} - Runs, ascending
 */

export const runsOf = (owner: Uint8Array, tiles: number[]): ConcordatRun[] => {
  const runs: ConcordatRun[] = []

  // Sorted unique tiles merge into runs
  for (const tile of [...new Set(tiles)].sort((first, second) => first - second)) {
    const last = runs[runs.length - 1]
    if (last && last.owner === owner[tile] && last.start + last.length === tile) last.length++
    else runs.push({ start: tile, length: 1, owner: owner[tile] })
  }

  return runs
}

/**
 * Diff of a game since the last one
 * @param {Object} input - Diff input
 * @param {ConcordatState} input.state - Game
 * @param {number[]} input.tiles - Changed tiles
 * @param {ConcordatEvent[]} input.events - New journal lines
 * @param {number} input.rev - New revision
 * @param {number} input.baseRev - Previous revision
 * @param {boolean} [input.withSystems] - Slow parts changed
 * @return {ConcordatDiff} - Diff
 */

export const diffOf = (input: {
  state: ConcordatState
  tiles: number[]
  events: ConcordatEvent[]
  rev: number
  baseRev: number
  withSystems?: boolean
}): ConcordatDiff => ({
  rev: input.rev,
  baseRev: input.baseRev,
  tick: input.state.tick,
  phase: input.state.phase,
  runs: runsOf(input.state.owner, input.tiles),
  players: input.state.players.map(rowOf),
  corps: input.state.corps.map((corps) => ({
    owner: corps.owner,
    target: corps.target,
    troops: Math.round(corps.troops),
  })),
  ships: shipsOf(input.state),
  systems: input.withSystems ? systemsOf(input.state) : null,
  events: input.events,
})

/**
 * Binary form of a diff
 * @param {ConcordatDiff} diff - Diff
 * @return {Uint8Array} - Bytes
 */

export const encodeDiff = (diff: ConcordatDiff): Uint8Array => {
  const bytes: number[] = [DIFF_VERSION, PHASES.indexOf(diff.phase)]
  writeVarint(bytes, diff.rev)
  writeVarint(bytes, diff.baseRev)
  writeVarint(bytes, diff.tick)

  // Runs as gaps from the previous end
  writeVarint(bytes, diff.runs.length)
  let cursor = 0
  for (const run of diff.runs) {
    writeVarint(bytes, run.start - cursor)
    writeVarint(bytes, run.length)
    bytes.push(run.owner)
    cursor = run.start + run.length
  }

  // Nations
  writeVarint(bytes, diff.players.length)
  for (const row of diff.players) {
    bytes.push(row.id, row.alive ? 1 : 0, Math.min(100, row.stability))
    writeVarint(bytes, row.tiles)
    writeVarint(bytes, row.troops)
    writeVarint(bytes, row.gold)
    writeVarint(bytes, row.provincesHeld)
    writeVarint(bytes, row.capital + 1)
    writeVarint(bytes, row.start)
  }

  // Corps
  writeVarint(bytes, diff.corps.length)
  for (const corps of diff.corps) {
    bytes.push(corps.owner, corps.target)
    writeVarint(bytes, corps.troops)
  }

  // Ships, then the slow parts when present
  writeShips(bytes, diff.ships)
  bytes.push(diff.systems ? 1 : 0)
  if (diff.systems) writeSystems(bytes, diff.systems)

  // Journal lines
  writeVarint(bytes, diff.events.length)
  for (const event of diff.events) {
    bytes.push(EVENT_KINDS.indexOf(event.kind), event.actor, event.victim)
    writeVarint(bytes, event.tile + 1)
  }

  return Uint8Array.from(bytes)
}

/**
 * Diff back from its bytes
 * @param {Uint8Array} bytes - Bytes
 * @return {ConcordatDiff} - Diff
 */

export const decodeDiff = (bytes: Uint8Array): ConcordatDiff => {
  const reader = readerOf(bytes)
  if (reader.byte() !== DIFF_VERSION) throw new Error('Unknown protocol version')

  const phase = PHASES[reader.byte()]
  const rev = reader.varint()
  const baseRev = reader.varint()
  const tick = reader.varint()

  // Runs
  const runs: ConcordatRun[] = []
  let cursor = 0
  for (let count = reader.varint(); count > 0; count--) {
    const start = cursor + reader.varint()
    const length = reader.varint()
    runs.push({ start, length, owner: reader.byte() })
    cursor = start + length
  }

  // Nations
  const players: ConcordatPlayerRow[] = []
  for (let count = reader.varint(); count > 0; count--) {
    const id = reader.byte()
    const alive = reader.byte() === 1
    const stability = reader.byte()
    players.push({
      id,
      alive,
      stability,
      tiles: reader.varint(),
      troops: reader.varint(),
      gold: reader.varint(),
      provincesHeld: reader.varint(),
      capital: reader.varint() - 1,
      start: reader.varint(),
    })
  }

  // Corps
  const corps: ConcordatCorpsRow[] = []
  for (let count = reader.varint(); count > 0; count--) {
    corps.push({ owner: reader.byte(), target: reader.byte(), troops: reader.varint() })
  }

  // Ships and slow parts
  const ships = readShips(reader)
  const systems = reader.byte() ? readSystems(reader) : null

  // Journal lines
  const events: ConcordatEvent[] = []
  for (let count = reader.varint(); count > 0; count--) {
    const kind = EVENT_KINDS[reader.byte()]
    const actor = reader.byte()
    const victim = reader.byte()
    events.push({ tick, kind, actor, victim, tile: reader.varint() - 1 })
  }

  return { rev, baseRev, tick, phase, runs, players, corps, ships, systems, events }
}
