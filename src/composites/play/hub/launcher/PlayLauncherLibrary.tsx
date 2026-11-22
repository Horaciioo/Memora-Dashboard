'use client'

import { PlayLauncherTile } from '@/composites/play/hub/launcher/PlayLauncherTile'
import { PlayNote } from '@/composites/play/hub/notices/PlayNote'
import { usePlayNote } from '@/core/hooks/interaction/state/play/usePlayNote'
import type { PlayHubGame } from '@/core/lib/play/hubGames'
import { boostPercentOf, isFeatured } from '@/core/lib/play/boost'
import { filterGames } from '@/core/lib/play/launcherView'
import type { PlayGameLive } from '@/core/lib/play/launcherView'
import { PLAY_HUB_COPY, PLAY_LAUNCHER_COPY } from '@/declarations/play'
import { PLAY_LAUNCH } from '@/declarations/ui/variants'
import type { PlayConfigView } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayLauncherLibraryProps {
  games: PlayHubGame[]
  config: PlayConfigView
  live: Partial<Record<PlayGameName, PlayGameLive>>
  favorites: string[]
  onOpen: (game: PlayGameName) => void
  onPlay: (game: PlayGameName) => void
  onFavorite: (game: PlayGameName) => void
}

/**
 * Every game as a tile
 * @param {PlayLauncherLibraryProps} props - Catalogue and actions
 * @return {JSX.Element}
 */

export const PlayLauncherLibrary = ({
  games,
  config,
  live,
  favorites,
  onOpen,
  onPlay,
  onFavorite,
}: PlayLauncherLibraryProps) => {
  const { note, show } = usePlayNote()
  const shown = filterGames(games, { query: '', filter: 'all', favorites, live })

  return (
    <section className={PLAY_LAUNCH.section} aria-labelledby="play-library">
      <div className={PLAY_LAUNCH.head}>
        <h2 id="play-library" className={PLAY_LAUNCH.title}>
          {PLAY_LAUNCHER_COPY.library}
        </h2>
      </div>

      {shown.length === 0 ? (
        <p className={PLAY_LAUNCH.empty}>{PLAY_LAUNCHER_COPY.empty}</p>
      ) : (
        <div className={PLAY_LAUNCH.tiles}>
          {shown.map((entry) => (
            <PlayLauncherTile
              key={entry.game}
              {...entry}
              live={live[entry.game]}
              boost={isFeatured(config, entry.game) ? boostPercentOf(config, entry.game) : null}
              isFavorite={favorites.includes(entry.game)}
              onOpen={() => (entry.playable ? onOpen(entry.game) : show(PLAY_HUB_COPY.mysterySoon))}
              onPlay={() => onPlay(entry.game)}
              onFavorite={() => onFavorite(entry.game)}
            />
          ))}
        </div>
      )}
      <PlayNote text={note} />
    </section>
  )
}
