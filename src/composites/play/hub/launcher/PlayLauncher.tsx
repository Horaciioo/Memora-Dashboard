'use client'

import { useState } from 'react'

import { PlayLauncherDetail } from '@/composites/play/hub/launcher/PlayLauncherDetail'
import { PlayLauncherHero } from '@/composites/play/hub/launcher/PlayLauncherHero'
import { PlayLauncherLibrary } from '@/composites/play/hub/launcher/PlayLauncherLibrary'
import { usePlayShelf } from '@/core/hooks/interaction/state/play/usePlayShelf'
import { splitPlayGames } from '@/core/lib/play/hubGames'
import type { PlayHubGame } from '@/core/lib/play/hubGames'
import { groupGameLive } from '@/core/lib/play/launcherView'
import { PLAY_LAUNCH } from '@/declarations/ui/variants'
import type { PlayConfigView, PlayLobbyCard } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayLauncherProps {
  games: PlayHubGame[]
  config: PlayConfigView
  tables: PlayLobbyCard[]
  isBanned: boolean
}

/**
 * Launcher home: hero, library, game sheet
 * @param {PlayLauncherProps} props - Catalogue and tables
 * @return {JSX.Element}
 */

export const PlayLauncher = ({ games, config, tables }: PlayLauncherProps) => {
  const shelf = usePlayShelf()
  const [opened, setOpened] = useState<PlayGameName | null>(null)
  const live = groupGameLive(tables)
  const { featured } = splitPlayGames(games, config.featuredGames)

  return (
    <div className={PLAY_LAUNCH.root}>
      <div className={PLAY_LAUNCH.stage}>
        <PlayLauncherHero
          games={featured}
          config={config}
          live={live}
          onDetails={setOpened}
          onPlay={shelf.pushRecent}
        />
        <PlayLauncherLibrary
          games={games}
          config={config}
          live={live}
          favorites={shelf.favorites}
          onOpen={setOpened}
          onPlay={shelf.pushRecent}
          onFavorite={shelf.toggleFavorite}
        />
      </div>
      {opened && (
        <PlayLauncherDetail
          game={opened}
          live={live[opened]}
          isFavorite={shelf.favorites.includes(opened)}
          onClose={() => setOpened(null)}
          onPlay={() => shelf.pushRecent(opened)}
          onFavorite={() => shelf.toggleFavorite(opened)}
        />
      )}
    </div>
  )
}
