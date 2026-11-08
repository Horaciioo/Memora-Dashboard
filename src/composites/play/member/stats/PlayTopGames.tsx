import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayFold } from '@/composites/play/mobile/PlayFold'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_PROFILE_COPY } from '@/declarations/play'
import { PLAY_PROFILE } from '@/declarations/ui/variants'
import type { PlaySheetView } from '@/types/play'

/**
 * Games a player sat at most, each one opens its own figures
 * @param {Object} props - Games
 * @param {PlaySheetView['topGames']} props.games - Most played first
 * @param {string} [props.playerId] - Another player, none for the viewer
 * @return {JSX.Element | null}
 */

export const PlayTopGames = ({
  games,
  playerId,
}: {
  games: PlaySheetView['topGames']
  playerId?: string
}) => {
  if (games.length === 0) return null

  return (
    <PlayFold title={PLAY_PROFILE_COPY.topGames}>
      <ul className={PLAY_PROFILE.list}>
        {games.map(({ game, played }) => {
          const row = (
            <>
              <PlayGameLogo game={game} className={PLAY_PROFILE.logo} />
              <span className={PLAY_PROFILE.rowText}>
                <span className={PLAY_PROFILE.rowName}>{PLAY_GAMES.label(game)}</span>
                <span className={PLAY_PROFILE.rowNote}>
                  {fillPlayMessage(PLAY_PROFILE_COPY.topGamesPlayed, { count: played })}
                </span>
              </span>
            </>
          )
          const style = { '--game': `var(${PLAY_GAMES.get(game).tone})` } as CSSProperties

          return (
            <li key={game} style={style}>
              {playerId ? (
                <AppLink
                  href={ROUTES.playPlayerGame(playerId, PLAY_GAMES.get(game).slug)}
                  className={PLAY_PROFILE.row}
                >
                  {row}
                </AppLink>
              ) : (
                <div className={PLAY_PROFILE.row}>{row}</div>
              )}
            </li>
          )
        })}
      </ul>
    </PlayFold>
  )
}
