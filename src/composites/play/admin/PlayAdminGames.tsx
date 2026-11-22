'use client'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { usePlayAdminConfig } from '@/core/hooks/data/play/usePlayAdminConfig'
import { fillPlayMessage, PLAY_GAMES } from '@/declarations/play'
import { PLAY_CONFIG_COPY, PLAY_CONFIG_LIMITS } from '@/declarations/play/config'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import type { PlayConfigView } from '@/types/play'
import { cn } from '@/utils/classnames'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayAdminGamesProps {
  initial: PlayConfigView
  games: { game: PlayGameName; isOpen: boolean; playable: boolean }[]
}

/**
 * Every game: open or closed for all, on the banner or not
 * @param {PlayAdminGamesProps} props - Settings and games
 * @return {JSX.Element}
 */

export const PlayAdminGames = ({ initial, games }: PlayAdminGamesProps) => {
  const admin = usePlayAdminConfig(initial)
  const StarIcon = ICONS.playStar
  const featured = admin.config.featuredGames
  const isFull = featured.length >= PLAY_CONFIG_LIMITS.featuredMax

  const toggleFeatured = (game: PlayGameName) =>
    admin.save(
      {
        featuredGames: featured.includes(game)
          ? featured.filter((entry) => entry !== game)
          : [...featured, game],
      },
      PLAY_CONFIG_COPY.featuredDone
    )

  return (
    <PlayPageTitle
      aside={
        <span className={PLAY_ADMIN.counter}>
          {fillPlayMessage(PLAY_CONFIG_COPY.featureCount, {
            count: featured.length,
            max: PLAY_CONFIG_LIMITS.featuredMax,
          })}
        </span>
      }
      body={
        <div className={PLAY_ADMIN.list}>
          <p className={PLAY_ADMIN.note}>{PLAY_CONFIG_COPY.gamesIntro}</p>
          {games.map(({ game, isOpen, playable }) => {
            const meta = PLAY_GAMES.get(game)
            const isFeaturedGame = featured.includes(game)
            const status = !playable
              ? PLAY_CONFIG_COPY.gameSoon
              : isOpen
                ? PLAY_CONFIG_COPY.gameOn
                : PLAY_CONFIG_COPY.gameOff

            return (
              <div key={game} className={PLAY_ADMIN.control}>
                <PlayGameLogo game={game} className={PLAY_ADMIN.controlLogo} />
                <div className={PLAY_ADMIN.controlText}>
                  <span className={PLAY_ADMIN.controlName}>{meta.label}</span>
                  <span
                    className={cn(
                      PLAY_ADMIN.controlNote,
                      playable && (isOpen ? PLAY_ADMIN.controlOn : PLAY_ADMIN.controlOff)
                    )}
                  >
                    {status}
                  </span>
                </div>
                <div className={PLAY_ADMIN.controlTools}>
                  <button
                    type="button"
                    aria-pressed={isFeaturedGame}
                    aria-label={
                      isFeaturedGame ? PLAY_CONFIG_COPY.featureOn : PLAY_CONFIG_COPY.featureOff
                    }
                    title={
                      !isFeaturedGame && isFull
                        ? PLAY_CONFIG_COPY.featureFull
                        : isFeaturedGame
                          ? PLAY_CONFIG_COPY.featureOn
                          : PLAY_CONFIG_COPY.featureOff
                    }
                    disabled={admin.isSaving || !playable || (!isFeaturedGame && isFull)}
                    className={cn(PLAY_ADMIN.star, isFeaturedGame && PLAY_ADMIN.starOn)}
                    onClick={() => void toggleFeatured(game)}
                  >
                    <StarIcon className={PLAY_ADMIN.starIcon} aria-hidden="true" />
                  </button>
                  <Toggle
                    bare
                    binary
                    checked={isOpen}
                    disabled={admin.isSaving || !playable}
                    label={fillPlayMessage(PLAY_CONFIG_COPY.gameToggle, { game: meta.label })}
                    onChange={(next) =>
                      void admin.setGameOpen(
                        game,
                        next,
                        fillPlayMessage(
                          next ? PLAY_CONFIG_COPY.gameDone : PLAY_CONFIG_COPY.gameClosed,
                          { game: meta.label }
                        )
                      )
                    }
                  />
                </div>
              </div>
            )
          })}
        </div>
      }
    >
      {PLAY_CONFIG_COPY.titleGames}
    </PlayPageTitle>
  )
}
