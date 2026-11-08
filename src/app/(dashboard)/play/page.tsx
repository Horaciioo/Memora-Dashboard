import type { Metadata } from 'next'

import { PlayCallouts } from '@/composites/play/hub/PlayCallouts'
import { PlayGameGrid } from '@/composites/play/hub/PlayGameGrid'
import { PlayLiveTables } from '@/composites/play/hub/PlayLiveTables'
import { PlayTopBar } from '@/composites/play/mobile/PlayTopBar'
import { PlaySignal } from '@/composites/play/hub/PlaySignal'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { listLobbies, readCatalog, readPlayProfile } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_CROSS } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.pageTitle }

/**
 * Games page: posters three by three
 * @return {Promise<JSX.Element>} - Play page
 */

export default async function PlayPage() {
  const { session, access } = await requirePermission(Permissions.PlayAccess)
  const [profile, tables] = await Promise.all([
    readPlayProfile(session.id),
    listLobbies(session.id, null, access.can(Permissions.PlayManage)),
  ])
  const { games } = readCatalog()
  const everyTable = [...tables.running, ...tables.lobbies]
  const live = (className?: string) => (
    <PlayLiveTables
      title={PLAY_HUB_COPY.liveTitle}
      empty={PLAY_HUB_COPY.liveEmpty}
      tables={everyTable}
      mineId={tables.currentId}
      isLocked={Boolean(profile.ban)}
      hasGame
      className={className}
    />
  )

  return (
    <>
      <PlayTopBar
        back={{ href: ROUTES.dashboard, label: PLAY_HUB_COPY.backToDashboard, icon: 'playLeave' }}
        tables={everyTable}
        live={live()}
      />
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayCallouts isBanned={Boolean(profile.ban)} />

      <div className={PLAY_CROSS.stage}>
        <section className={PLAY_CROSS.games} aria-labelledby="play-games">
          <h1 id="play-games" className={PLAY_CROSS.heading}>
            {PLAY_HUB_COPY.sectionGames}
          </h1>
          <PlayGameGrid games={games} />
        </section>
      </div>
    </>
  )
}
