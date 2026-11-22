import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LiveHub } from '@/composites/lives/hub/LiveHub'
import { readLiveHub } from '@/core/services/lives/LiveHubService'
import { listOpenLives, listPastLives, listRecentLives } from '@/core/services/lives/LiveService'
import { LIVE_HUB } from '@/declarations/lives/hub'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { LiveStatuses } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: LIVE_COPY.title }

/**
 * Lives announced or running in the member's perimeter
 * @return {Promise<JSX.Element>} - Live en cours page
 */

export default async function LivesPage({
  searchParams,
}: {
  searchParams: Promise<{ creator?: string }>
}) {
  const { creator } = await searchParams
  const { session, access, scope } = await requirePermission(Permissions.LiveRead)
  const perimeter = await scope()
  const canAnnounce = access.can(Permissions.LiveAnnounce)
  const canReadLogs = access.can(Permissions.LiveLogRead)

  const [hub, lives, recent, past] = await Promise.all([
    readLiveHub(perimeter, session.id),
    listOpenLives(perimeter, session.id, session.permissions),
    listRecentLives(perimeter, session.id, session.permissions),
    // Past lives shown on demand: all for the Bilan readers, the ones coordinated for the others
    listPastLives(perimeter, session.id, session.permissions, LIVE_HUB.recentCount, !canReadLogs),
  ])

  // A single live under way, or the one of the creator asked for, opens straight on its view
  const running = lives.filter(
    (live) => live.status === LiveStatuses.Live && (!creator || live.youtuber.id === creator)
  )
  if (running.length === 1) redirect(ROUTES.live(running[0].id))

  return (
    <div className={PAGE_STYLES.wrapper}>
      <LiveHub
        creators={hub}
        lives={lives}
        recent={recent}
        canAnnounce={canAnnounce}
        initialId={creator ?? perimeter.activeYoutuberId}
        past={past}
        canReport={canReadLogs}
        canDelete={access.isResponsable}
        canCreatorReport={access.can(Permissions.LiveCreatorReport)}
      />
    </div>
  )
}
