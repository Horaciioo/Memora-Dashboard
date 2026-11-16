import type { ConcordatBoardPlayer } from '@/core/lib/play/concordat/wire/board'
import { ConcordatPowers } from '@/utils/constants/concordat'

/**
 * Nations, living first then by land then by id
 * @param {ConcordatBoardPlayer[]} players - Nations
 * @return {ConcordatBoardPlayer[]} - Best first
 */

export const rankPlayers = (players: ConcordatBoardPlayer[]): ConcordatBoardPlayer[] =>
  players.toSorted(
    (left, right) =>
      Number(right.alive) - Number(left.alive) || right.tiles - left.tiles || left.id - right.id
  )

/**
 * Seats and the best countries, tribes left out of the lists
 * @param {ConcordatBoardPlayer[]} players - Nations
 * @param {number} limit - Nations shown at most, seats always
 * @return {ConcordatBoardPlayer[]} - Best first
 */

export const featuredPlayers = (
  players: ConcordatBoardPlayer[],
  limit: number
): ConcordatBoardPlayer[] => {
  const ranked = rankPlayers(players)
  const seats = ranked.filter((player) => player.kind === ConcordatPowers.Human)
  const others = ranked
    .filter((player) => player.kind !== ConcordatPowers.Human)
    .slice(0, Math.max(0, limit - seats.length))

  return rankPlayers([...seats, ...others])
}

/**
 * Share of the map as text, finer while it is small
 * @param {number} tiles - Tiles held
 * @param {number} land - Land tiles of the map
 * @return {string} - Percent without its sign
 */

export const landShareText = (tiles: number, land: number): string => {
  const share = (tiles / Math.max(1, land)) * 100
  const digits = share < 1 ? 2 : share < 10 ? 1 : 0

  return share.toLocaleString('fr-FR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/**
 * Land tiles of a map
 * @param {Uint8Array} terrain - Terrain layer
 * @param {number} seaId - Sea terrain id
 * @return {number} - Land count
 */

export const landTilesOf = (terrain: Uint8Array, seaId: number): number => {
  let count = 0
  for (const kind of terrain) if (kind !== seaId) count++

  return count
}

/**
 * Big figure in K, one decimal under 100 K
 * @param {number} value - Figure
 * @return {string} - Text such as 37,5 K
 */

export const compactFigure = (value: number): string => {
  if (value < 1000) return String(Math.round(value))
  const thousands = value / 1000
  const digits = thousands < 100 ? 1 : 0

  return `${thousands.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: digits })} K`
}
