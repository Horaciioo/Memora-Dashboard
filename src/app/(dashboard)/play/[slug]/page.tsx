import type { Metadata } from 'next'
import type { ComponentType } from 'react'
import { notFound } from 'next/navigation'

import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { GolfPanorama } from '@/composites/play/golf/panorama/GolfPanorama'
import { PlayCallouts } from '@/composites/play/hub/PlayCallouts'
import { PlayHubMenu } from '@/composites/play/hub/PlayHubMenu'
import { PlayLeaderboard } from '@/composites/play/hub/PlayLeaderboard'
import { PlayLobbyList } from '@/composites/play/hub/PlayLobbyList'
import { PlayEmbers } from '@/composites/play/hub/PlayEmbers'
import { LudoHopField } from '@/composites/play/ludo/LudoHopField'
import { PlayPaperWords } from '@/composites/play/hub/PlayPaperWords'
import { PlaySignal } from '@/composites/play/hub/PlaySignal'
import { PlayPlayerCard } from '@/composites/play/member/stats/PlayPlayerCard'
import { PlayStatTiles } from '@/composites/play/member/stats/PlayStatTiles'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import {
  listLobbies,
  openGameOfSlug,
  readLeaderboards,
  readPlayPresence,
  readPlayProfile,
} from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { GOLF_TURF } from '@/declarations/play/golf/copy'
import { LUDO_FELT } from '@/declarations/play/ludo/copy'
import {
  BOMB_EMBERS,
  fillPlayMessage,
  PLAY_GAMES,
  PLAY_HUB_COPY,
  PLAY_PAPER,
  playKeysOf,
} from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { Permissions } from '@/utils/constants/permissions'

// Animated layer of each hub ground
const GROUND_LAYERS: Record<string, ComponentType> = {
  [PLAY_PAPER.ground]: PlayPaperWords,
  [BOMB_EMBERS.ground]: PlayEmbers,
  [GOLF_TURF.ground]: GolfPanorama,
  [LUDO_FELT.ground]: LudoHopField,
}

interface PlayGamePageProps {
  params: Promise<{ slug: string }>
}

/**
 * Tab title of a game hub
 * @param {PlayGamePageProps} props - Game segment
 * @return {Promise<Metadata>} - Title
 */

export async function generateMetadata({ params }: PlayGamePageProps): Promise<Metadata> {
  const game = openGameOfSlug((await params).slug)

  return { title: game ? PLAY_GAMES.label(game) : PLAY_HUB_COPY.pageTitle }
}

/**
 * Hub of one game: logo, divider and actions in the middle of its own ground
 * @param {PlayGamePageProps} props - Game segment
 * @return {Promise<JSX.Element>} - Hub page
 */

export default async function PlayGamePage({ params }: PlayGamePageProps) {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const game = openGameOfSlug((await params).slug)
  if (!game) notFound()

  const [profile, tables, presence, leaders] = await Promise.all([
    readPlayProfile(session.id),
    listLobbies(session.id, game),
    readPlayPresence(session.id),
    readLeaderboards(game),
  ])
  const meta = PLAY_GAMES.get(game)
  const totals = profile.games.find((entry) => entry.game === game)
  if (!totals) notFound()
  const isLocked = Boolean(presence || profile.ban)
  const player = { name: session.displayName, avatarUrl: session.avatarUrl }
  const GroundLayer = meta.ground ? GROUND_LAYERS[meta.ground] : undefined

  return (
    <div className={cn(PLAY_HUB.page, meta.ground)} style={playKeysOf(game)}>
      {GroundLayer && <GroundLayer />}
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayCallouts isBanned={Boolean(profile.ban)} />

      <PlayHubMenu
        game={game}
        player={player}
        canCreate={!isLocked}
        lockedReason={
          presence ? PLAY_HUB_COPY.alreadyInGame : profile.ban ? PLAY_HUB_COPY.banned : null
        }
        identity={
          <div className={PLAY_HUB.hubIdentity}>
            <h1 className={PLAY_HUB.srOnly}>{meta.label}</h1>
            <PlayGameLogo game={game} className={PLAY_HUB.hubLogoLarge} />
          </div>
        }
        titles={{ stats: fillPlayMessage(PLAY_HUB_COPY.hubStatsTitle, { game: meta.label }) }}
        panels={{
          lobbies: (
            <PlayLobbyList
              lobbies={tables.lobbies}
              presence={presence}
              isLocked={isLocked}
              empty={PLAY_HUB_COPY.noLobby}
            />
          ),
          running: (
            <PlayLobbyList
              lobbies={tables.running}
              isRunning
              isLocked={isLocked}
              empty={PLAY_HUB_COPY.noRunning}
            />
          ),
          leaders: <PlayLeaderboard leaders={leaders} meId={session.id} />,
          stats: (
            <>
              <PlayPlayerCard totals={totals} player={player} />
              <PlayStatTiles totals={totals} />
            </>
          ),
        }}
      />
    </div>
  )
}
