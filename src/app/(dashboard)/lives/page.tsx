import type { Metadata } from 'next'
import { LiveHub } from '@/composites/lives/hub/LiveHub'
import { LivesBoard } from '@/composites/lives/LivesBoard'
import { readLiveHub } from '@/core/services/lives/LiveHubService'
import { listOpenLives, listPastLives, listRecentLives } from '@/core/services/lives/LiveService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { TWITCH_MOCK_ORIGIN } from '@/declarations/platforms/twitch'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: LIVE_COPY.title }

/**
 * Lives announced or running in the member's perimeter
 * @return {Promise<JSX.Element>} - Live en cours page
 */

export default async function LivesPage() {
  const { session, access, scope } = await requirePermission(Permissions.LiveRead)
  const perimeter = await scope()
  const canAnnounce = access.can(Permissions.LiveAnnounce)
  const canReadLogs = access.can(Permissions.LiveLogRead)

  const [hub, lives, recent, past] = await Promise.all([
    readLiveHub(perimeter, session.id),
    listOpenLives(perimeter, session.id, session.permissions),
    listRecentLives(perimeter, session.id, session.permissions),
    // Past lives shown on demand: all for the Bilan readers, the ones coordinated for the others
    listPastLives(
      perimeter,
      session.id,
      session.permissions,
      LIVE_SETTINGS.pastLives,
      !canReadLogs
    ),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <LiveHub creators={hub} initialId={perimeter.activeYoutuberId} />
      <LivesBoard
        isEmbedded
        initialLives={lives}
        initialRecent={recent}
        canAnnounce={canAnnounce}
        past={past}
        canReport={canReadLogs}
        canDelete={access.isResponsable}
        canCreatorReport={access.can(Permissions.LiveCreatorReport)}
        showFakeLive={TWITCH_MOCK_ORIGIN !== null && access.isAdmin}
      />
    </div>
  )
}
