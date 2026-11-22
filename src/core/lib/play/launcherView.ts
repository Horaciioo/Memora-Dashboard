import { PLAY_GAMES } from '@/declarations/play/games'
import type { PlayLauncherFilter } from '@/declarations/play/launcher'
import type { PlayHubGame } from '@/core/lib/play/hubGames'
import type { PlayLobbyCard, PlayPerson } from '@/types/play'
import { PlayStatuses } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * What is happening at one game now
 * @typedef {Object} PlayGameLive
 */

export interface PlayGameLive {
  faces: PlayPerson[]
  tables: PlayLobbyCard[]
}

/**
 * Tables and players grouped by game
 * @param {PlayLobbyCard[]} tables - Lobbies and running games
 * @return {Partial<Record<PlayGameName, PlayGameLive>>} - Activity per game
 */

export const groupGameLive = (tables: PlayLobbyCard[]) => {
  const live: Partial<Record<PlayGameName, PlayGameLive>> = {}
  for (const table of tables) {
    const entry = (live[table.game] ??= { faces: [], tables: [] })
    entry.tables.push(table)
    for (const face of table.faces)
      if (!entry.faces.some((seen) => seen.id === face.id)) entry.faces.push(face)
  }

  return live
}

/**
 * Whether a game has a table anyone can still join
 * @param {PlayGameLive | undefined} live - Activity
 * @return {boolean}
 */

export const hasOpenTable = (live?: PlayGameLive) =>
  Boolean(live?.tables.some((table) => table.status === PlayStatuses.Lobby))

// Lower case without accents
const flat = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Games matching the search and the filter, favourites first
 * @param {PlayHubGame[]} games - Catalogue
 * @param {Object} view - Search, filter, favourites and activity
 * @return {PlayHubGame[]} - Visible games
 */

export const filterGames = (
  games: PlayHubGame[],
  view: {
    query: string
    filter: PlayLauncherFilter
    favorites: string[]
    live: Partial<Record<PlayGameName, PlayGameLive>>
  }
) => {
  const query = flat(view.query.trim())
  const keep = (entry: PlayHubGame) => {
    const meta = PLAY_GAMES.get(entry.game)
    if (query && !flat(`${meta.label} ${meta.tagline}`).includes(query)) return false
    if (view.filter === 'favorites') return view.favorites.includes(entry.game)
    if (view.filter === 'solo') return entry.playable && meta.minPlayers === 1
    if (view.filter === 'live') return Boolean(view.live[entry.game])

    return true
  }
  const rank = (entry: PlayHubGame) =>
    Number(view.favorites.includes(entry.game)) * 2 + Number(entry.playable)

  return games
    .filter(keep)
    .sort(
      (a, b) =>
        rank(b) - rank(a) ||
        PLAY_GAMES.get(a.game).label.localeCompare(PLAY_GAMES.get(b.game).label, 'fr')
    )
}
