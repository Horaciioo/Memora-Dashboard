import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { LivesBoard } from '@/composites/lives/LivesBoard'
import { listOpenLives, liveFields } from '@/core/services/lives/LiveService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: LIVE_COPY.title }

/**
 * Lives announced or running in the member's perimeter
 * @return {Promise<JSX.Element>} - Livecon page
 */

export default async function LiveconPage() {
  const { session, access, scope } = await requirePermission(Permissions.LiveRead)
  const perimeter = await scope()
  const canAnnounce = access.can(Permissions.LiveAnnounce)

  const [lives, fields] = await Promise.all([
    listOpenLives(perimeter, session.id, session.permissions),
    canAnnounce ? liveFields(perimeter) : Promise.resolve([]),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={LIVE_COPY.title} />
      <LivesBoard
        initialLives={lives}
        fields={fields}
        canAnnounce={canAnnounce}
        viewerId={session.id}
      />
    </div>
  )
}
