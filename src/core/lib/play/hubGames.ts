import { PLAY_GAMES } from '@/declarations/play'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayHubGame {
  game: PlayGameName
  playable: boolean
}

/**
 * Games of the hub split in featured and the rest, playable first then by name
 * @param {PlayHubGame[]} games - Catalogue
 * @param {PlayGameName[]} chosen - Games the admins put on the banner
 * @return {{ featured: PlayGameName[], rest: PlayHubGame[] }} - Banner games and cards
 */

export const splitPlayGames = (games: PlayHubGame[], chosen: PlayGameName[]) => {
  // Banner follows the order the admins chose
  const featured = chosen.filter((game) =>
    games.some((entry) => entry.game === game && entry.playable)
  )
  const rest = games
    .filter((entry) => !featured.includes(entry.game))
    .sort(
      (a, b) =>
        Number(b.playable) - Number(a.playable) ||
        PLAY_GAMES.get(a.game).label.localeCompare(PLAY_GAMES.get(b.game).label, 'fr')
    )

  return { featured, rest }
}
