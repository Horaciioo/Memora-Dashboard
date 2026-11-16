import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { GolfFlyButton } from '@/composites/play/golf/fly/GolfFlyButton'
import { GROUND_LAYERS } from '@/composites/play/hub/groundLayers'
import { PlayCallouts } from '@/composites/play/hub/notices/PlayCallouts'
import { PlayConcept } from '@/composites/play/hub/concept/PlayConcept'
import { PlayCreateButton } from '@/composites/play/hub/lobby/PlayCreateButton'
import { PlaySoloButton } from '@/composites/play/hub/lobby/PlaySoloButton'
import { PlayJoinCode } from '@/composites/play/hub/lobby/PlayJoinCode'
import { PlayHubMenu } from '@/composites/play/hub/PlayHubMenu'
import { PlayLeaderboard } from '@/composites/play/hub/leaderboard/PlayLeaderboard'
import { PlayLiveTables } from '@/composites/play/hub/lobby/PlayLiveTables'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PlayHubTabs } from '@/composites/play/mobile/PlayHubTabs'
import { PlayTopBar } from '@/composites/play/mobile/PlayTopBar'
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
import { ROUTES } from '@/declarations/navigation'
import { PLAY_CONCEPT_COPY } from '@/declarations/play/concept'
import {
  fillPlayMessage,
  PLAY_MOBILE_COPY,
  PLAY_GAMES,
  PLAY_HUB_COPY,
  playKeysOf,
} from '@/declarations/play'
import { PLAY_HUB, PLAY_HUB_TABS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { Permissions } from '@/utils/constants/permissions'
import { PlayGames } from '@/utils/constants/play'

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
 * Hub of one game
 * @param {PlayGamePageProps} props - Game segment
 * @return {Promise<JSX.Element>} - Hub page
 */

export default async function PlayGamePage({ params }: PlayGamePageProps) {
  const { session, access } = await requirePermission(Permissions.PlayAccess)
  const game = openGameOfSlug((await params).slug)
  if (!game) notFound()

  const [profile, tables, presence, leaders] = await Promise.all([
    readPlayProfile(session.id),
    listLobbies(session.id, game, access.can(Permissions.PlayManage)),
    readPlayPresence(session.id, game),
    readLeaderboards(game),
  ])
  const meta = PLAY_GAMES.get(game)
  const totals = profile.games.find((entry) => entry.game === game)
  if (!totals) notFound()
  const isLocked = Boolean(profile.ban)
  const player = { name: session.displayName, avatarUrl: session.avatarUrl }
  const GroundLayer = meta.ground ? GROUND_LAYERS[meta.ground] : undefined

  return (
    <div className={cn(PLAY_HUB.page, meta.ground)} style={playKeysOf(game)}>
      {GroundLayer && <GroundLayer />}
      <PlayTopBar
        back={{ href: ROUTES.play, label: PLAY_MOBILE_COPY.hubBack, icon: 'playPrevious' }}
        tables={[...tables.running, ...tables.lobbies]}
        live={
          <PlayLiveTables
            title={PLAY_HUB_COPY.inGameTitle}
            empty={PLAY_HUB_COPY.inGameEmpty}
            tables={[...tables.running, ...tables.lobbies]}
            mineId={presence?.sessionId}
            isLocked={isLocked}
          />
        }
      />
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      {game === PlayGames.Golf && access.can(Permissions.PlayManage) && <GolfFlyButton />}
      <PlayCallouts isBanned={Boolean(profile.ban)} />

      <div className={PLAY_HUB_TABS.desktop}>
        <PlayHubMenu
          game={game}
          canCreate={!isLocked}
          lockedReason={profile.ban ? PLAY_HUB_COPY.banned : null}
          identity={
            <div className={PLAY_HUB.hubIdentity}>
              <h1 className={PLAY_HUB.srOnly}>{meta.label}</h1>
              <PlayGameLogo game={game} className={PLAY_HUB.hubLogoLarge} />
            </div>
          }
          titles={{
            stats: fillPlayMessage(PLAY_HUB_COPY.hubStatsTitle, { game: meta.label }),
            concept: fillPlayMessage(PLAY_CONCEPT_COPY.title, { game: meta.label }),
          }}
          live={
            <PlayLiveTables
              title={PLAY_HUB_COPY.inGameTitle}
              empty={PLAY_HUB_COPY.inGameEmpty}
              tables={[...tables.running, ...tables.lobbies]}
              mineId={presence?.sessionId}
              isLocked={isLocked}
              className={PLAY_HUB.hubLive}
            />
          }
          panels={{
            concept: <PlayConcept game={game} />,
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

      <PlayHubTabs
        play={
          <div className={PLAY_HUB_TABS.play}>
            <h1 className={PLAY_HUB.srOnly}>{meta.label}</h1>
            <PlayGameLogo game={game} className={PLAY_HUB_TABS.logo} />
          </div>
        }
        action={
          <>
            <PlayCreateButton
              game={game}
              disabled={isLocked}
              lockedReason={profile.ban ? PLAY_HUB_COPY.banned : null}
              label={PLAY_MOBILE_COPY.hubPlay}
              className={PLAY_HUB_TABS.playButton}
            />
            <PlaySoloButton
              game={game}
              disabled={isLocked}
              lockedReason={profile.ban ? PLAY_HUB_COPY.banned : null}
              className={PLAY_HUB_TABS.playButton}
            />
            {!isLocked && <PlayJoinCode className={PLAY_HUB_TABS.playButton} />}
          </>
        }
        panels={{
          stats: (
            <>
              <PlayPlayerCard totals={totals} player={player} />
              <PlayStatTiles totals={totals} />
              <section className={PLAY_HUB_TABS.section}>
                <h2 className={PLAY_HUB_TABS.sectionTitle}>{PLAY_MOBILE_COPY.hubRanking}</h2>
                <PlayLeaderboard leaders={leaders} meId={session.id} />
              </section>
            </>
          ),
          concept: <PlayConcept game={game} />,
          sessions: (
            <PlayLiveTables
              title={PLAY_HUB_COPY.inGameTitle}
              empty={PLAY_HUB_COPY.inGameEmpty}
              tables={[...tables.running, ...tables.lobbies]}
              mineId={presence?.sessionId}
              isLocked={isLocked}
            />
          ),
        }}
      />
    </div>
  )
}
