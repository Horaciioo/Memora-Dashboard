import type { ConcordatBoardPlayer } from '@/core/lib/play/concordat/wire/board'

/**
 * Display name of every nation, a fallback for the unnamed
 * @param {ConcordatBoardPlayer[]} players - Nations
 * @param {{ id: string; name: string }[]} faces - Seated people
 * @param {(id: number) => string} fallback - Name of an unnamed nation
 * @return {string[]} - Index is the nation id, zero is empty
 */

export const nationNamesOf = (
  players: ConcordatBoardPlayer[],
  faces: { id: string; name: string }[],
  fallback: (id: number) => string
): string[] => {
  const names = ['']
  for (const player of players) {
    names[player.id] =
      faces.find((face) => face.id === player.accountId)?.name || player.name || fallback(player.id)
  }

  return names
}
