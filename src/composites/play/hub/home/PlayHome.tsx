'use client'

import { PlayLauncher } from '@/composites/play/hub/launcher/PlayLauncher'
import type { PlayHubGame } from '@/core/lib/play/hubGames'
import type { PlayConfigView, PlayLobbyCard } from '@/types/play'

export interface PlayHomeProps {
  games: PlayHubGame[]
  config: PlayConfigView
  tables: PlayLobbyCard[]
  isBanned: boolean
}

/**
 * Launcher home
 * @param {PlayHomeProps} props - Catalogue and tables
 * @return {JSX.Element}
 */

export const PlayHome = (props: PlayHomeProps) => <PlayLauncher {...props} />
