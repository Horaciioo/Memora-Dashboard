import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayFold } from '@/composites/play/mobile/PlayFold'
import { levelShare } from '@/core/lib/play'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_PROFILE_LEVELS } from '@/declarations/ui/variants'
import type { PlayProfileView } from '@/types/play'
import { cn } from '@/utils/classnames'

/**
 * Level of each game, small tiles in the colour of the game, unplayed ones dimmed
 * @param {Object} props - Games
 * @param {PlayProfileView['games']} props.games - Per game totals
 * @param {string} [props.playerId] - Another player, tiles open their figures
 * @return {JSX.Element | null}
 */

export const PlayGameLevels = ({
  games,
  playerId,
}: {
  games: PlayProfileView['games']
  playerId?: string
}) => {
  const shown = games
    .filter((entry) => PLAY_GAMES.has(entry.game) && PLAY_GAMES.get(entry.game).playable)
    .sort((left, right) => right.xp - left.xp)

  if (shown.length === 0) return null

  return (
    <PlayFold title={PLAY_HUB_COPY.sectionGamesLevels} isWide>
      <div className={PLAY_PROFILE_LEVELS.grid}>
        {shown.map((entry) => {
          const { tone, slug } = PLAY_GAMES.get(entry.game)
          const style = { '--game': `var(${tone})` } as CSSProperties
          const content = (
            <>
              <PlayGameLogo game={entry.game} className={PLAY_PROFILE_LEVELS.logo} />
              <span className={PLAY_PROFILE_LEVELS.body}>
                <span className={PLAY_PROFILE_LEVELS.head}>
                  <span className={PLAY_PROFILE_LEVELS.name}>{PLAY_GAMES.label(entry.game)}</span>
                  <span className={PLAY_PROFILE_LEVELS.level}>
                    {fillPlayMessage(PLAY_HUB_COPY.level, { level: entry.level.level })}
                  </span>
                </span>
                <span className={PLAY_PROFILE_LEVELS.track}>
                  <span
                    className={PLAY_PROFILE_LEVELS.fill}
                    style={{ width: `${levelShare(entry.level)}%` }}
                  />
                </span>
              </span>
            </>
          )

          return playerId ? (
            <AppLink
              key={entry.game}
              href={ROUTES.playPlayerGame(playerId, slug)}
              className={cn(
                PLAY_PROFILE_LEVELS.tile,
                entry.played === 0 && PLAY_PROFILE_LEVELS.idle
              )}
              style={style}
            >
              {content}
            </AppLink>
          ) : (
            <div
              key={entry.game}
              className={cn(
                PLAY_PROFILE_LEVELS.tile,
                entry.played === 0 && PLAY_PROFILE_LEVELS.idle
              )}
              style={style}
            >
              {content}
            </div>
          )
        })}
      </div>
    </PlayFold>
  )
}
