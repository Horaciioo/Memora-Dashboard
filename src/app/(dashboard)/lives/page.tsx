import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { LivesBoard } from '@/composites/lives/LivesBoard'
import { listOpenLives, listPastLives, liveFields } from '@/core/services/lives/LiveService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LIVE_COPY } from '@/declarations/lives/copy'
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

  const [lives, fields, past] = await Promise.all([
    listOpenLives(perimeter, session.id, session.permissions),
    canAnnounce ? liveFields(perimeter) : Promise.resolve([]),
    // Past lives, shown on demand
    canReadLogs
      ? listPastLives(perimeter, session.id, session.permissions, LIVE_SETTINGS.pastLives)
      : Promise.resolve([]),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={LIVE_COPY.title} />
      <LivesBoard
        initialLives={lives}
        fields={fields}
        canAnnounce={canAnnounce}
        past={past}
        canReport={canReadLogs}
        canCreatorReport={access.can(Permissions.LiveCreatorReport)}
      />
    </div>
  )
}
