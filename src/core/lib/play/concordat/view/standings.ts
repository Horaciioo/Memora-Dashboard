import type { ConcordatClientState } from '@/core/lib/play/concordat/wire/board'
import { ConcordatBuildingKinds, ConcordatPowers, ConcordatTies } from '@/utils/constants/concordat'

/**
 * Columns of the standings table, in display order
 * @type {readonly string[]}
 */

export const CONCORDAT_STANDING_COLUMNS = [
  'kind',
  'tiles',
  'gold',
  'income',
  'trade',
  'troops',
  'maxTroops',
  'zones',
  'stability',
  'allies',
  'betrayals',
  'markets',
  'barracks',
  'forts',
  'ports',
  'ships',
  'silos',
  'sams',
  'bases',
] as const

export type ConcordatStandingColumn = (typeof CONCORDAT_STANDING_COLUMNS)[number]

/**
 * Columns shown until the player picks others
 * @type {ConcordatStandingColumn[]}
 */

export const CONCORDAT_STANDING_DEFAULTS: ConcordatStandingColumn[] = [
  'tiles',
  'gold',
  'troops',
  'maxTroops',
]

/**
 * One nation of the standings with every figure a column may show
 * @typedef {Object} ConcordatStandingRow
 */

export interface ConcordatStandingRow {
  id: number
  isMine: boolean
  figures: Record<ConcordatStandingColumn, number>
}

// Buildings of some kinds held by a nation
const countOf = (client: ConcordatClientState, owner: number, ...kinds: string[]): number =>
  client.systems.buildings.filter(
    (building) => building.owner === owner && kinds.includes(building.kind)
  ).length

/**
 * Living countries and seats with their figures, sorted by a column
 * @param {ConcordatClientState} client - Game
 * @param {number} land - Land tiles of the map
 * @param {ConcordatStandingColumn} sort - Column sorted on
 * @param {boolean} isDesc - Biggest first
 * @return {ConcordatStandingRow[]} - Rows in order
 */

export const standingRowsOf = (
  client: ConcordatClientState,
  land: number,
  sort: ConcordatStandingColumn,
  isDesc: boolean
): ConcordatStandingRow[] => {
  const rows = client.players
    .filter((player) => player.alive && player.kind !== ConcordatPowers.Tribe)
    .map((player): ConcordatStandingRow => {
      const allies = client.systems.ties.filter(
        (tie) => tie.kind === ConcordatTies.Alliance && (tie.a === player.id || tie.b === player.id)
      ).length

      const figure = client.systems.figures[player.id - 1]
      const betrayals = client.log.filter(
        (event) => event.kind === 'betrayal' && event.actor === player.id
      ).length

      return {
        id: player.id,
        isMine: player.id === client.me,
        figures: {
          kind: player.kind === ConcordatPowers.Human ? 0 : 1,
          tiles: (player.tiles / Math.max(1, land)) * 100,
          gold: player.gold,
          income: figure?.income ?? 0,
          trade: figure?.trade ?? 0,
          troops: player.troops,
          maxTroops: figure?.maxTroops ?? 0,
          zones: player.provincesHeld,
          stability: Math.round(player.stability),
          allies,
          betrayals,
          markets: countOf(client, player.id, ConcordatBuildingKinds.Market),
          barracks: countOf(client, player.id, ConcordatBuildingKinds.Barracks),
          forts: countOf(
            client,
            player.id,
            ConcordatBuildingKinds.Fortress,
            ConcordatBuildingKinds.Post
          ),
          ports: countOf(client, player.id, ConcordatBuildingKinds.Port),
          ships: client.ships.filter((ship) => ship.owner === player.id && ship.kind === 'war')
            .length,
          silos: countOf(client, player.id, ConcordatBuildingKinds.Silo),
          sams: countOf(client, player.id, ConcordatBuildingKinds.Sam),
          bases: countOf(client, player.id, ConcordatBuildingKinds.Airbase),
        },
      }
    })

  const sign = isDesc ? -1 : 1

  return rows.sort(
    (left, right) =>
      sign * (left.figures[sort] - right.figures[sort]) ||
      right.figures.tiles - left.figures.tiles ||
      left.id - right.id
  )
}
