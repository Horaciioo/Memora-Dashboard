import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/structures/page/PageHeader'
import { Section } from '@/components/structures/page/Section'
import { PlayLobby } from '@/composites/play/hub/PlayLobby'
import { PlaySignal } from '@/composites/play/hub/PlaySignal'
import { API_ROUTES } from '@/core/lib/api/routes'
import { readSession } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PAGE_STYLES, PLAY_HUB } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'
import { PlayStatuses } from '@/utils/constants/play'

export const metadata: Metadata = { title: PLAY_HUB_COPY.pageTitle }

interface PlaySessionPageProps {
  params: Promise<{ id: string }>
}

// Heading under the title, by stage
const STAGE_COPY: Record<string, string> = {
  [PlayStatuses.Lobby]: PLAY_HUB_COPY.lobbyWaiting,
  [PlayStatuses.Running]: PLAY_HUB_COPY.lobbyRunning,
}

/**
 * One game: its table, then its board
 * @param {PlaySessionPageProps} props - Game id
 * @return {Promise<JSX.Element>} - Game page
 */

export default async function PlaySessionPage({ params }: PlaySessionPageProps) {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const { id } = await params
  const game = await readSession(id, session.id).catch(() => null)
  if (!game) notFound()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={PLAY_GAMES.label(game.game)}
        heroDescription={STAGE_COPY[game.status] ?? PLAY_HUB_COPY.lobbyFinished}
      />
      <PlaySignal url={API_ROUTES.playSessionStream(id)} />

      <div className={PLAY_HUB.stack}>
        <Section raised>
          <PlayLobby
            id={game.id}
            status={game.status}
            minPlayers={game.minPlayers}
            seats={game.seats}
            me={game.me}
          />
        </Section>
        {game.status !== PlayStatuses.Lobby && (
          <p className={PLAY_HUB.callout}>{PLAY_HUB_COPY.boardSoon}</p>
        )}
      </div>
    </div>
  )
}
