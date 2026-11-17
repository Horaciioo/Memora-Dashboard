import { PLAY_FEATURED_GAMES, PLAY_GAMES } from '@/declarations/play'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayHubGame {
  game: PlayGameName
  playable: boolean
}

/**
 * Games of the hub split in featured and the rest, playable first then by name
 * @param {PlayHubGame[]} games - Catalogue
 * @return {{ featured: PlayGameName[], rest: PlayHubGame[] }} - Banner games and cards
 */

export const splitPlayGames = (games: PlayHubGame[]) => {
  const featured = games
    .filter((entry) => entry.playable && PLAY_FEATURED_GAMES.includes(entry.game))
    .map((entry) => entry.game)
  const rest = games
    .filter((entry) => !featured.includes(entry.game))
    .sort(
      (a, b) =>
        Number(b.playable) - Number(a.playable) ||
        PLAY_GAMES.get(a.game).label.localeCompare(PLAY_GAMES.get(b.game).label, 'fr')
    )

  return { featured, rest }
}
